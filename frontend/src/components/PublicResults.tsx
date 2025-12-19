import React, { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import contractJson from '../contracts/BharatVote.json';
import { RefreshCcw, Clock, AlertTriangle, Users, BarChart3 } from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  voteCount: number;
}

const POLL_INTERVAL_MS = 15000;

const PublicResults: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [phase, setPhase] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const rpcUrl = import.meta.env.VITE_PUBLIC_RPC_URL;
  const publicContractAddress = import.meta.env.VITE_PUBLIC_CONTRACT_ADDRESS;

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
    const address = publicContractAddress || (contractJson as any).address;
    if (!address) return null;
    return new ethers.Contract(address, (contractJson as any).abi, provider);
  }, [provider, publicContractAddress]);

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
        const votesRaw = await contract.getVotes(idNum);
        const votes = Number(votesRaw);
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

  useEffect(() => {
    fetchResults();
    const id = setInterval(fetchResults, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  const formatPct = (votes: number) => {
    if (totalVotes === 0) return '0%';
    return `${((votes / totalVotes) * 100).toFixed(1)}%`;
  };

  return (
    <div className="card-premium p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Public Live Results</h2>
          <p className="text-sm text-slate-600">
            Read-only view, no wallet required. Auto-refresh every 15s.
          </p>
        </div>
        <button
          onClick={fetchResults}
          disabled={isLoading}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
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
          <p className="text-xs uppercase tracking-wide text-green-600">Total Votes</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{totalVotes}</p>
        </div>
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
          <p className="text-xs uppercase tracking-wide text-purple-600">Phase</p>
          <p className="text-3xl font-bold text-purple-700 mt-1">
            {phase === null ? '—' : phase === 0 ? 'Commit' : phase === 1 ? 'Reveal' : 'Finished'}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-slate-100 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">Live Vote Counts</span>
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
            {candidates.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">#{c.id}</span>
                    <span className="text-sm font-medium text-slate-900">{c.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">{c.voteCount}</div>
                    <div className="text-xs text-slate-500">{formatPct(c.voteCount)}</div>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-2 bg-blue-500 transition-all"
                    style={{ width: totalVotes > 0 ? `${(c.voteCount / totalVotes) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicResults;

