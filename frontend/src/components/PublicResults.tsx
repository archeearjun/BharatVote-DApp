import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';
import contractJson from '../contracts/BharatVote.json';
import { RefreshCcw, Clock, AlertTriangle, Users, BarChart3 } from 'lucide-react';
import { decodeVoteRevealedChoiceFromLogData } from '../utils/publicResultsEvents';

interface Candidate {
  id: number;
  name: string;
  voteCount: number;
}

interface PublicResultsProps {
  contractAddress?: string;
  isDemoElection?: boolean;
}

const POLL_INTERVAL_MS = 15000;
type ResultsMode = 'current' | 'allTime';

const PublicResults: React.FC<PublicResultsProps> = ({ contractAddress, isDemoElection }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [votesCommittedAllTime, setVotesCommittedAllTime] = useState<number | null>(null);
  const [votesRevealedAllTime, setVotesRevealedAllTime] = useState<number | null>(null);
  const [allTimeCandidateVotes, setAllTimeCandidateVotes] = useState<Map<number, number>>(new Map());
  const [allTimeScanError, setAllTimeScanError] = useState<string | null>(null);
  const [allTimeScannedToBlock, setAllTimeScannedToBlock] = useState<number | null>(null);
  const [phase, setPhase] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mode, setMode] = useState<ResultsMode>(() => (isDemoElection ? 'allTime' : 'current'));

  const committedVotersRef = useRef<Set<string>>(new Set());
  const revealedVotersRef = useRef<Set<string>>(new Set());
  const allTimeVotesByCandidateRef = useRef<Map<number, number>>(new Map());
  const lastScannedBlockRef = useRef<number | null>(null);
  const deploymentBlockRef = useRef<number | null>(null);
  const scanInProgressRef = useRef(false);
  const batchSpanRef = useRef<number | null>(null); // inclusive span: toBlock = fromBlock + span
  const effectiveStartBlockRef = useRef<number | null>(null);
  const rescanBackoffCountRef = useRef(0);
  const pendingRestartRef = useRef(false);

  const rpcUrl = import.meta.env.VITE_PUBLIC_RPC_URL;
  const publicContractAddress = import.meta.env.VITE_PUBLIC_CONTRACT_ADDRESS;
  const eventsFromBlock = Number(import.meta.env.VITE_PUBLIC_EVENTS_FROM_BLOCK ?? 0);
  const maxRequestsPerPoll = Number(import.meta.env.VITE_PUBLIC_EVENTS_MAX_REQUESTS_PER_POLL ?? 6);

  const provider = useMemo(() => {
    try {
      if (rpcUrl) return new ethers.JsonRpcProvider(rpcUrl);
    } catch (err) {
      console.warn('PublicResults: failed to create provider', err);
    }
    return null;
  }, [rpcUrl]);

  const contract = useMemo(() => {
    if (!provider) return null;
    const address = contractAddress || publicContractAddress || (contractJson as any).address;
    if (!address) return null;
    return new ethers.Contract(address, (contractJson as any).abi, provider);
  }, [provider, publicContractAddress, contractAddress]);

  useEffect(() => {
    setMode(isDemoElection ? 'allTime' : 'current');
  }, [isDemoElection]);

  useEffect(() => {
    committedVotersRef.current = new Set();
    revealedVotersRef.current = new Set();
    allTimeVotesByCandidateRef.current = new Map();
    lastScannedBlockRef.current = null;
    deploymentBlockRef.current = null;
    batchSpanRef.current = null;
    effectiveStartBlockRef.current = null;
    rescanBackoffCountRef.current = 0;
    pendingRestartRef.current = false;
    setVotesCommittedAllTime(null);
    setVotesRevealedAllTime(null);
    setAllTimeCandidateVotes(new Map());
    setAllTimeScanError(null);
    setAllTimeScannedToBlock(null);
  }, [contractAddress]);

  const parseIndexedAddress = (topic: string | undefined) => {
    if (!topic || !topic.startsWith('0x') || topic.length !== 66) return null;
    // topic is 32 bytes, address is last 20 bytes
    const addr = `0x${topic.slice(26)}`;
    try {
      return ethers.getAddress(addr).toLowerCase();
    } catch {
      return null;
    }
  };

  const abiCoder = useMemo(() => ethers.AbiCoder.defaultAbiCoder(), []);

  // Support both contract variants:
  // - VoteRevealed(address,uint256)
  // - VoteRevealed(address,uint256,uint256) (with timestamp)
  // Support both contract variants:
  // - VoteCommitted(address,bytes32)
  // - VoteCommitted(address,bytes32,uint256) (with timestamp)
  const TOPIC_VOTE_COMMITTED_V1 = useMemo(() => ethers.id('VoteCommitted(address,bytes32)'), []);
  const TOPIC_VOTE_COMMITTED_V2 = useMemo(() => ethers.id('VoteCommitted(address,bytes32,uint256)'), []);
  const TOPIC_VOTE_REVEALED_V1 = useMemo(() => ethers.id('VoteRevealed(address,uint256)'), []);
  const TOPIC_VOTE_REVEALED_V2 = useMemo(() => ethers.id('VoteRevealed(address,uint256,uint256)'), []);
  // Back-compat: some deployments use uint8 for choice in the event signature.
  const TOPIC_VOTE_REVEALED_V1_UINT8 = useMemo(() => ethers.id('VoteRevealed(address,uint8)'), []);
  const TOPIC_VOTE_REVEALED_V2_UINT8 = useMemo(() => ethers.id('VoteRevealed(address,uint8,uint256)'), []);

  const parseLogRangeLimitFromError = (err: any): number | null => {
    const message = String(err?.info?.error?.message || err?.error?.message || err?.message || '');
    const m = message.match(/up to a\s+(\d+)\s+block range/i);
    if (m) {
      const blocks = Number(m[1]);
      return Number.isFinite(blocks) && blocks > 0 ? blocks : null;
    }
    const m2 = message.match(/block range should work:\s*\[\s*0x([0-9a-fA-F]+)\s*,\s*0x([0-9a-fA-F]+)\s*\]/i);
    if (m2) {
      const from = Number.parseInt(m2[1], 16);
      const to = Number.parseInt(m2[2], 16);
      const blocks = Number.isFinite(from) && Number.isFinite(to) ? (to - from + 1) : NaN;
      return Number.isFinite(blocks) && blocks > 0 ? blocks : null;
    }
    return null;
  };

  const getDeploymentBlock = async (): Promise<number> => {
    if (deploymentBlockRef.current !== null) return deploymentBlockRef.current;
    if (!provider || !contract) return 0;

    try {
      const latest = await provider.getBlockNumber();
      let low = 0;
      let high = latest;
      const address = await contract.getAddress();

      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const code = await provider.getCode(address, mid);
        if (code && code !== '0x') {
          high = mid;
        } else {
          low = mid + 1;
        }
      }

      deploymentBlockRef.current = low;
      return low;
    } catch (e) {
      console.warn('PublicResults: failed to detect deployment block', e);
      deploymentBlockRef.current = Math.max(0, Number.isFinite(eventsFromBlock) ? eventsFromBlock : 0);
      return deploymentBlockRef.current;
    }
  };

  const fetchResults = async () => {
    if (!contract) {
      setError('Public provider or contract address missing. Set VITE_PUBLIC_RPC_URL and VITE_PUBLIC_CONTRACT_ADDRESS.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const phaseVal = await contract.phase();
      const fetched = await contract.getCandidates();
      const withVotes: Candidate[] = [];
      for (const c of fetched) {
        const idNum = Number(c.id ?? c[0] ?? 0);
        const name = c.name ?? c[1] ?? `Candidate ${idNum}`;
        let votes = 0;
        try {
          const votesRaw = await contract.getVotes(idNum);
          votes = Number(votesRaw);
        } catch {
          votes = 0;
        }
        withVotes.push({ id: idNum, name, voteCount: votes });
      }
      setCandidates(withVotes);
      setTotalVotes(withVotes.reduce((s, c) => s + c.voteCount, 0));
      setPhase(Number(phaseVal));
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('PublicResults fetch failed', err);
      setError(err?.message || 'Failed to fetch public results');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTimeFromEvents = async () => {
    if (!contract || !provider) return;
    if (scanInProgressRef.current) return;
    scanInProgressRef.current = true;
    pendingRestartRef.current = false;

    try {
      setAllTimeScanError(null);
      const latestBlock = await provider.getBlockNumber();
      const deploymentBlock = await getDeploymentBlock();
      const configuredStart = Math.max(0, Number.isFinite(eventsFromBlock) ? eventsFromBlock : 0);
      const computedStart = Math.max(configuredStart, deploymentBlock);
      if (effectiveStartBlockRef.current === null) {
        effectiveStartBlockRef.current = computedStart;
      }
      const startBlock = effectiveStartBlockRef.current;

      let fromBlock = lastScannedBlockRef.current === null ? startBlock : lastScannedBlockRef.current + 1;

      if (fromBlock > latestBlock) {
        setVotesCommittedAllTime(committedVotersRef.current.size);
        setVotesRevealedAllTime(revealedVotersRef.current.size);
        setAllTimeCandidateVotes(new Map(allTimeVotesByCandidateRef.current));

        if (
          committedVotersRef.current.size === 0 &&
          revealedVotersRef.current.size === 0 &&
          startBlock > configuredStart &&
          rescanBackoffCountRef.current < 5
        ) {
          rescanBackoffCountRef.current += 1;
          const step = Math.max(250_000, 250_000 * rescanBackoffCountRef.current);
          const newStart = Math.max(configuredStart, startBlock - step);

          committedVotersRef.current = new Set();
          revealedVotersRef.current = new Set();
          allTimeVotesByCandidateRef.current = new Map();
          lastScannedBlockRef.current = null;
          effectiveStartBlockRef.current = newStart;
          setAllTimeScannedToBlock(null);
          setAllTimeScanError(
            `No vote events found yet in scanned history; expanding scan window earlier (from block ${newStart}).`
          );
          pendingRestartRef.current = true;
        }
        return;
      }

      let batchSpan =
        batchSpanRef.current ?? Math.max(0, Number(import.meta.env.VITE_PUBLIC_EVENTS_MAX_BLOCK_RANGE ?? 2000) - 1);
      if (!Number.isFinite(batchSpan) || batchSpan < 0) batchSpan = 1999;

      let requests = 0;
      while (fromBlock <= latestBlock && requests < Math.max(1, maxRequestsPerPoll)) {
        const toBlock = Math.min(latestBlock, fromBlock + batchSpan);

        try {
          const address = await contract.getAddress();

          // Commit logs
          if (requests < Math.max(1, maxRequestsPerPoll)) {
            const commitLogs = await provider.getLogs({
              address,
              fromBlock,
              toBlock,
              topics: [[TOPIC_VOTE_COMMITTED_V1, TOPIC_VOTE_COMMITTED_V2]],
            });
            requests += 1;
            for (const log of commitLogs) {
              const voter = parseIndexedAddress(log.topics?.[1]);
              if (voter) committedVotersRef.current.add(voter);
            }
          }

          // Reveal logs (support both signatures with OR topic)
          if (requests < Math.max(1, maxRequestsPerPoll)) {
            const revealLogs = await provider.getLogs({
              address,
              fromBlock,
              toBlock,
              topics: [[TOPIC_VOTE_REVEALED_V1, TOPIC_VOTE_REVEALED_V2, TOPIC_VOTE_REVEALED_V1_UINT8, TOPIC_VOTE_REVEALED_V2_UINT8]],
            });
            requests += 1;

            for (const log of revealLogs) {
              const voter = parseIndexedAddress(log.topics?.[1]);
              if (voter) revealedVotersRef.current.add(voter);

              const choice = decodeVoteRevealedChoiceFromLogData(log.data, abiCoder);
              if (choice !== null) {
                allTimeVotesByCandidateRef.current.set(
                  choice,
                  (allTimeVotesByCandidateRef.current.get(choice) ?? 0) + 1
                );
              }
            }
          }

          lastScannedBlockRef.current = toBlock;
          batchSpanRef.current = batchSpan;
          fromBlock = toBlock + 1;
          setAllTimeScannedToBlock(toBlock);
        } catch (e: any) {
          const maxBlocks = parseLogRangeLimitFromError(e);
          if (maxBlocks && maxBlocks > 0) {
            const newSpan = Math.max(0, maxBlocks - 1);
            if (newSpan < batchSpan) {
              batchSpan = newSpan;
              batchSpanRef.current = newSpan;
              continue;
            }
          }
          throw e;
        }
      }

      setVotesCommittedAllTime(committedVotersRef.current.size);
      setVotesRevealedAllTime(revealedVotersRef.current.size);
      setAllTimeCandidateVotes(new Map(allTimeVotesByCandidateRef.current));

      // If we reached the latest block but found no vote events, the most common cause is
      // a start block that's too recent (often due to non-archive RPCs returning `0x` for historical `getCode`),
      // so expand the scan window earlier and retry a few times.
      if (
        lastScannedBlockRef.current === latestBlock &&
        committedVotersRef.current.size === 0 &&
        revealedVotersRef.current.size === 0 &&
        startBlock > configuredStart &&
        rescanBackoffCountRef.current < 5
      ) {
        rescanBackoffCountRef.current += 1;
        const step = Math.max(250_000, 250_000 * rescanBackoffCountRef.current);
        const newStart = Math.max(configuredStart, startBlock - step);

        committedVotersRef.current = new Set();
        revealedVotersRef.current = new Set();
        allTimeVotesByCandidateRef.current = new Map();
        lastScannedBlockRef.current = null;
        effectiveStartBlockRef.current = newStart;
        setAllTimeScannedToBlock(null);
        setAllTimeScanError(
          `No vote events found yet in scanned history; expanding scan window earlier (from block ${newStart}).`
        );
        pendingRestartRef.current = true;
      }
    } catch (e: any) {
      const message = String(e?.info?.error?.message || e?.error?.message || e?.message || 'Failed to scan on-chain events');
      setAllTimeScanError(message);
    } finally {
      scanInProgressRef.current = false;
      if (pendingRestartRef.current) {
        pendingRestartRef.current = false;
        setTimeout(() => {
          fetchAllTimeFromEvents().catch((err) => console.warn('PublicResults: event scan failed', err));
        }, 0);
      }
    }
  };

  useEffect(() => {
    fetchResults();
    if (isDemoElection && mode === 'allTime') {
      fetchAllTimeFromEvents().catch((err) => console.warn('PublicResults: event scan failed', err));
    }
    const id = setInterval(() => {
      fetchResults();
      if (isDemoElection && mode === 'allTime') {
        fetchAllTimeFromEvents().catch((err) => console.warn('PublicResults: event scan failed', err));
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, isDemoElection, mode]);

  const allTimeTotalRevealedVotes = useMemo(() => {
    return Array.from(allTimeCandidateVotes.values()).reduce((sum, value) => sum + value, 0);
  }, [allTimeCandidateVotes]);

  return (
    <div className="card-premium p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Public Live Results</h2>
          <p className="text-sm text-slate-600">
            Read-only view, no wallet required. Auto-refresh every 15s.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDemoElection && (
            <div className="inline-flex rounded-lg border border-slate-200 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setMode('allTime')}
                className={`px-3 py-2 text-sm ${mode === 'allTime' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                Live Tally (All-Time)
              </button>
              <button
                type="button"
                onClick={() => setMode('current')}
                className={`px-3 py-2 text-sm ${mode === 'current' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                Tally (Current Run)
              </button>
            </div>
          )}
          <button
            onClick={() => {
              fetchResults();
              if (isDemoElection && mode === 'allTime') {
                fetchAllTimeFromEvents().catch((err) => console.warn('PublicResults: event scan failed', err));
              }
            }}
            disabled={isLoading}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs uppercase tracking-wide text-blue-600">Candidates</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{candidates.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
          <p className="text-xs uppercase tracking-wide text-green-600">{mode === 'allTime' ? 'Votes Cast (All-Time)' : 'Votes Revealed (Current)'}</p>
          <p className="text-3xl font-bold text-green-700 mt-1">
            {mode === 'allTime' ? (votesCommittedAllTime ?? '-') : totalVotes}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
          <p className="text-xs uppercase tracking-wide text-purple-600">Phase</p>
          <p className="text-3xl font-bold text-purple-700 mt-1">
            {phase === null ? '-' : phase === 0 ? 'Commit' : phase === 1 ? 'Reveal' : 'Finished'}
          </p>
        </div>
      </div>

      {isDemoElection && mode === 'allTime' && (
        <div className="p-4 rounded-lg border border-slate-100 bg-white text-sm text-slate-700 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-900">All-time demo participation</div>
            <div className="text-slate-600">Counts are computed from on-chain events (persists across resets).</div>
            {allTimeScanError && (
              <div className="mt-1 text-xs text-amber-800">
                Event scan issue: <span className="font-mono">{allTimeScanError}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div><span className="font-semibold">{votesCommittedAllTime ?? '-'}</span> committed</div>
            <div><span className="font-semibold">{votesRevealedAllTime ?? '-'}</span> revealed</div>
            <div className="text-xs text-slate-500 mt-1">
              Scanned to block {allTimeScannedToBlock ?? '-'}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-lg border border-slate-100 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">
            {mode === 'allTime' ? 'Live Tally (All-Time Reveals)' : 'Live Vote Counts'}
          </span>
          {lastUpdated && (
            <span className="text-xs text-slate-500 inline-flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="text-sm text-slate-500">Loading results...</div>
        )}

        {!isLoading && candidates.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            No candidates yet.
          </div>
        )}

        {!isLoading && candidates.length > 0 && (
          <div className="space-y-4">
            {candidates.map((c) => {
              const voteCount = mode === 'allTime'
                ? (allTimeCandidateVotes.get(c.id) ?? 0)
                : c.voteCount;
              const pctBase = mode === 'allTime' ? allTimeTotalRevealedVotes : totalVotes;
              const pct = pctBase === 0 ? '0%' : `${((voteCount / pctBase) * 100).toFixed(1)}%`;

              return (
              <div key={c.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">#{c.id}</span>
                    <span className="text-sm font-medium text-slate-900">{c.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">{voteCount}</div>
                    <div className="text-xs text-slate-500">{pct}</div>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-2 bg-blue-500 transition-all"
                    style={{ width: pctBase > 0 ? `${(voteCount / pctBase) * 100}%` : '0%' }}
                  />
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicResults;

