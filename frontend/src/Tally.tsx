import React, { useEffect, useState } from 'react';
import { useI18n } from './i18n';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Info,
  RefreshCw,
  Trophy,
  TrendingUp,
} from 'lucide-react';

interface TallyProps {
  contract: any;
  phase: number;
  refreshTrigger: number;
  eligibleCount?: number;
  isDemoElection?: boolean;
}

interface Candidate {
  id: number;
  name: string;
  voteCount: number;
}

const Tally: React.FC<TallyProps> = ({ contract, phase, refreshTrigger, eligibleCount, isDemoElection }) => {
  const { t } = useI18n();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const phases = [
    { id: 0, label: t('tally.commit'), description: t('tally.votesBeingCollected') },
    { id: 1, label: t('tally.reveal'), description: t('tally.votesBeingCounted') },
    { id: 2, label: t('tally.finished'), description: t('tally.resultsFinalized') },
  ];

  useEffect(() => {
    fetchResults();
  }, [contract, phase, refreshTrigger]);

  const fetchResults = async () => {
    if (!contract) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedCandidates = await contract.getCandidates();
      const activeCandidates = fetchedCandidates.filter((candidate: any) => Boolean(candidate.isActive));
      const candidatesWithVotes = await Promise.all(
        activeCandidates.map(async (candidate: any) => {
          const raw = await contract.getVotes(candidate.id);
          const voteCount = typeof raw === 'bigint' ? Number(raw) : Number(raw || 0);
          return {
            id: Number(candidate.id),
            name: candidate.name,
            voteCount,
          };
        })
      );

      setCandidates(candidatesWithVotes);
      setTotalVotes(candidatesWithVotes.reduce((sum, candidate) => sum + candidate.voteCount, 0));
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || t('tally.failedToFetch'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTopCandidates = () => {
    if (candidates.length === 0 || totalVotes === 0) return [] as Candidate[];
    const maxVotes = Math.max(...candidates.map((candidate) => candidate.voteCount));
    return candidates.filter((candidate) => candidate.voteCount === maxVotes);
  };

  const formatPercentage = (votes: number) => {
    if (totalVotes === 0) return '0%';
    return `${((votes / totalVotes) * 100).toFixed(1)}%`;
  };

  const topCandidates = getTopCandidates();
  const winner = topCandidates.length === 1 ? topCandidates[0] : null;
  const isDraw = phase === 2 && topCandidates.length > 1;
  const topVoteCount = topCandidates.length > 0 ? topCandidates[0].voteCount : 0;
  const completionPct =
    eligibleCount && eligibleCount > 0 ? `${Math.min(100, (totalVotes / eligibleCount) * 100).toFixed(1)}%` : '—';
  const showEligibility = !isDemoElection;
  const headerLabel = isDemoElection ? 'Demo Results' : t('tally.electionResults');
  const phaseLabel = phase === 0 ? t('tally.commit') : phase === 1 ? t('tally.reveal') : t('tally.finished');

  const phaseMessage =
    phase === 0
      ? { label: t('tally.commitPhase'), detail: t('tally.votesBeingCollected'), tone: 'info' as const }
      : phase === 1
        ? { label: t('tally.revealPhase'), detail: t('tally.votesBeingRevealed'), tone: 'warning' as const }
        : { label: t('tally.electionComplete'), detail: t('tally.allVotesCounted'), tone: 'success' as const };

  const toneClass =
    phaseMessage.tone === 'success'
      ? 'border-green-200 bg-green-50 text-green-800'
      : phaseMessage.tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-slate-200 bg-slate-50 text-slate-800';

  return (
    <div className="space-y-6">
      <div className="card-premium p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900">{headerLabel}</h2>
              {isDemoElection && <span className="badge badge-info">Demo</span>}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Review live vote totals, current phase, and participation progress from the election contract.
            </p>
            {lastUpdated && (
              <p className="mt-2 text-xs text-slate-500">Last updated {lastUpdated.toLocaleTimeString()}</p>
            )}
          </div>
          <button onClick={fetchResults} disabled={isLoading} className="btn-secondary inline-flex items-center gap-2 self-start">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className={`grid grid-cols-1 gap-3 ${showEligibility ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {showEligibility && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Eligible voters</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{eligibleCount ?? '—'}</p>
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Votes cast</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{totalVotes}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{showEligibility ? 'Completion' : 'Phase'}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{showEligibility ? completionPct : phaseLabel}</p>
          </div>
        </div>

        <div className={`rounded-xl border p-4 ${toneClass}`}>
          <div className="flex items-start gap-3">
            {phaseMessage.tone === 'success' ? (
              <CheckCircle className="mt-0.5 h-5 w-5" />
            ) : phaseMessage.tone === 'warning' ? (
              <AlertTriangle className="mt-0.5 h-5 w-5" />
            ) : (
              <Info className="mt-0.5 h-5 w-5" />
            )}
            <div>
              <p className="text-sm font-semibold">{phaseMessage.label}</p>
              <p className="mt-1 text-sm">{phaseMessage.detail}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <p className="text-sm font-semibold text-slate-800">{t('tally.electionProgress')}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {phases.map((phaseItem) => {
              const status =
                phase > phaseItem.id ? 'complete' : phase === phaseItem.id ? 'current' : 'upcoming';

              return (
                <div
                  key={phaseItem.id}
                  className={`rounded-xl border p-4 ${
                    status === 'complete'
                      ? 'border-green-200 bg-green-50'
                      : status === 'current'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        status === 'complete'
                          ? 'bg-green-600 text-white'
                          : status === 'current'
                            ? 'bg-white text-slate-900'
                            : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {status === 'complete' ? <CheckCircle className="h-4 w-4" /> : phaseItem.id + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${status === 'current' ? 'text-white' : 'text-slate-900'}`}>{phaseItem.label}</p>
                      <p className={`text-xs ${status === 'current' ? 'text-slate-300' : 'text-slate-500'}`}>{phaseItem.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {(phase === 1 || phase === 2) && candidates.length === 0 && !isLoading && (
        <div className="card-premium p-6 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            {t('tally.noCandidates') || 'No candidates have been registered yet.'}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Results will appear once the election has active candidates and revealed votes.
          </p>
        </div>
      )}

      {(phase === 1 || phase === 2) && candidates.length > 0 && totalVotes === 0 && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {t('tally.noVotesYet') || 'No votes have been revealed yet. Results will appear once votes are revealed.'}
        </div>
      )}

      {(phase === 1 || phase === 2) && candidates.length > 0 && (
        <div className="card-premium p-6 space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-900">
              {phase === 1 ? t('tally.liveResults') : t('tally.finalResults')}
            </h3>
          </div>

          {phase === 2 && winner && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center justify-center gap-3 text-center">
                <Trophy className="h-7 w-7 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-800">{t('tally.electionWinner')}</p>
                  <p className="text-xl font-semibold text-slate-900">{winner.name}</p>
                  <p className="text-sm text-green-800">
                    {winner.voteCount} votes ({formatPercentage(winner.voteCount)})
                  </p>
                </div>
              </div>
            </div>
          )}

          {isDraw && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-sm font-semibold text-slate-800">{t('tally.electionDraw')}</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {topCandidates.map((candidate) => candidate.name).join(' & ')}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {topVoteCount} votes each ({formatPercentage(topVoteCount)})
              </p>
            </div>
          )}

          <div className="space-y-4">
            {candidates.map((candidate) => {
              const percentage = formatPercentage(candidate.voteCount);
              const isWinnerCard = phase === 2 && !isDraw && winner?.id === candidate.id;
              const isDrawLeader = phase === 2 && isDraw && candidate.voteCount === topVoteCount;

              return (
                <div key={candidate.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="badge badge-info">#{candidate.id}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{candidate.name}</p>
                        {(isWinnerCard || isDrawLeader) && (
                          <p className="mt-1 text-xs text-slate-500">
                            {isWinnerCard ? t('tally.winner') : t('tally.draw')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">{candidate.voteCount}</p>
                      <p className="text-xs text-slate-500">{percentage}</p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-900 transition-all"
                      style={{ width: totalVotes > 0 ? `${(candidate.voteCount / totalVotes) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === 0 && candidates.length > 0 && (
        <div className="card-premium p-6 text-center">
          <Info className="mx-auto h-10 w-10 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">{t('tally.votingInProgress')}</h3>
          <p className="mt-2 text-sm text-slate-500">{t('tally.commitPhaseActive')}</p>
        </div>
      )}
    </div>
  );
};

export default Tally;
