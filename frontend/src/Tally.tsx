import React, { useState, useEffect } from 'react';
import { useI18n } from './i18n';
import { 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress, 
  Chip,
  Stepper,
  Step,
  StepLabel,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  BarChart as ChartIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

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
  const hasData = candidates.length > 0;

  const phases = [
    { id: 0, label: t('tally.commit'), description: t('tally.votesBeingCollected'), status: 'active' },
    { id: 1, label: t('tally.reveal'), description: t('tally.votesBeingCounted'), status: 'active' },
    { id: 2, label: t('tally.finished'), description: t('tally.resultsFinalized'), status: 'active' }
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
          // Contract exposes getVotes(uint256) -> uint256
          const raw = await contract.getVotes(candidate.id);
          const voteCount = typeof raw === 'bigint' ? Number(raw) : Number(raw || 0);
          return {
            id: Number(candidate.id),
            name: candidate.name,
            voteCount
          };
        })
      );
      
      setCandidates(candidatesWithVotes);
      setTotalVotes(candidatesWithVotes.reduce((sum, c) => sum + c.voteCount, 0));
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || t('tally.failedToFetch'));
    } finally {
      setIsLoading(false);
    }
  };

  const getWinner = () => {
    if (candidates.length === 0 || totalVotes === 0) return null;
    return candidates.reduce((winner, current) => 
      current.voteCount > winner.voteCount ? current : winner
    );
  };

  const getTopCandidates = () => {
    if (candidates.length === 0 || totalVotes === 0) return [] as Candidate[];
    const maxVotes = Math.max(...candidates.map((candidate) => candidate.voteCount));
    return candidates.filter((candidate) => candidate.voteCount === maxVotes);
  };

  const topCandidates = getTopCandidates();
  const winner = topCandidates.length === 1 ? topCandidates[0] : null;
  const isDraw = phase === 2 && topCandidates.length > 1;
  const topVoteCount = topCandidates.length > 0 ? topCandidates[0].voteCount : 0;

  const getPhaseStatus = (phaseId: number) => {
    if (phaseId < phase) return 'completed';
    if (phaseId === phase) return 'active';
    return 'pending';
  };

  const getPhaseIcon = (phaseId: number) => {
    const status = getPhaseStatus(phaseId);
    if (status === 'completed') return <CheckIcon sx={{ color: '#1e293b' }} />;
    if (status === 'active') return <TrendingIcon sx={{ color: '#1e293b' }} />;
    return <InfoIcon color="disabled" />;
  };

  const formatPercentage = (votes: number) => {
    if (totalVotes === 0) return '0%';
    return `${((votes / totalVotes) * 100).toFixed(1)}%`;
  };

  const completionPct = eligibleCount && eligibleCount > 0
    ? `${Math.min(100, (totalVotes / eligibleCount) * 100).toFixed(1)}%`
    : '—';

  const showEligibility = !isDemoElection;
  const headerLabel = isDemoElection ? 'Demo Results' : t('tally.electionResults');
  const phaseLabel = phase === 0 ? t('tally.commit') : phase === 1 ? t('tally.reveal') : t('tally.finished');

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography variant="h5" className="font-semibold text-gray-800">
            {headerLabel}
          </Typography>
          {isDemoElection && (
            <Chip label="Demo" size="small" color="default" variant="outlined" />
          )}
        </div>
        <Tooltip title={t('tally.refreshResults')}>
          <IconButton 
            onClick={fetchResults} 
            disabled={isLoading}
            className="text-slate-700 hover:bg-slate-100"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      {/* High-level participation stats */}
      <div className={`grid grid-cols-1 ${showEligibility ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
        {showEligibility && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-600">Eligible Voters</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{eligibleCount ?? '—'}</p>
          </div>
        )}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-xs uppercase tracking-wide text-slate-600">Votes Cast</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{totalVotes}</p>
        </div>
        {showEligibility ? (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-600">Completion</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{completionPct}</p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-600">Phase</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{phaseLabel}</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Phase-specific messages */}
      {phase === 0 && (
        <Alert severity="info" className="mb-4">
          <Typography variant="body2">
            <strong>{t('tally.commitPhase')}:</strong> {t('tally.votesBeingCollected')}
          </Typography>
        </Alert>
      )}

      {phase === 1 && (
        <Alert severity="warning" className="mb-4">
          <Typography variant="body2">
            <strong>{t('tally.revealPhase')}:</strong> {t('tally.votesBeingRevealed')}
          </Typography>
        </Alert>
      )}

      {phase === 2 && (
        <Alert severity="success" className="mb-4">
          <Typography variant="body2">
            <strong>{t('tally.electionComplete')}:</strong> {t('tally.allVotesCounted')}
          </Typography>
        </Alert>
      )}

      {/* Election Progress */}
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
            {t('tally.electionProgress')}
          </Typography>
          
          <Stepper activeStep={phase} orientation="horizontal" className="mb-4">
            {phases.map((phaseItem) => (
              <Step key={phaseItem.id} completed={phase > phaseItem.id}>
                <StepLabel
                  StepIconComponent={() => getPhaseIcon(phaseItem.id)}
                  className={phase === phaseItem.id ? 'text-slate-900' : ''}
                >
                  <div className="text-center">
                    <Typography 
                      variant="body2" 
                      className={`font-medium ${phase === phaseItem.id ? 'text-slate-900' : 'text-gray-500'}`}
                    >
                      {phaseItem.label}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      className="text-gray-400 block mt-1 max-w-24"
                    >
                      {phaseItem.description}
                    </Typography>
                  </div>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {lastUpdated && (
            <Typography variant="caption" className="text-gray-500 text-center block">
              {t('tally.lastUpdated')}: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Results Summary - Show during reveal and finished phases */}
      {(phase === 1 || phase === 2) && hasData && (
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <Typography variant="h5" className="text-center mb-4 font-semibold text-gray-800">
              {phase === 1 ? t('tally.liveResults') : t('tally.finalResults')}
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <Typography variant="h4" className="text-slate-900 font-bold">
                  {candidates.length}
                </Typography>
                <Typography variant="body2" className="text-slate-600">
                  {t('tally.candidates')}
                </Typography>
              </div>
              
              <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <Typography variant="h4" className="text-slate-900 font-bold">
                  {totalVotes}
                </Typography>
                <Typography variant="body2" className="text-slate-600">
                  {t('tally.totalVotes')}
                </Typography>
              </div>
              
              <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <Typography variant="h4" className="text-slate-900 font-bold">
                  {phase === 2 ? t('tally.final') : t('tally.live')}
                </Typography>
                <Typography variant="body2" className="text-slate-600">
                  {t('tally.status')}
                </Typography>
              </div>
            </div>

            {/* Winner Highlight */}
            {phase === 2 && winner && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-center space-x-3">
                  <CheckIcon className="w-8 h-8 text-slate-700" />
                  <div className="text-center">
                    <Typography variant="h6" className="text-slate-900 font-semibold">
                      {t('tally.electionWinner')}
                    </Typography>
                    <Typography variant="h5" className="text-slate-900 font-bold">
                      {winner.name}
                    </Typography>
                    <Typography variant="body2" className="text-slate-600">
                      {t('tally.withVotes')}: {winner.voteCount} ({formatPercentage(winner.voteCount)})
                    </Typography>
                  </div>
                </div>
              </div>
            )}

            {isDraw && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-center space-x-3">
                  <InfoIcon className="w-8 h-8 text-slate-700" />
                  <div className="text-center">
                    <Typography variant="h6" className="text-slate-900 font-semibold">
                      {t('tally.electionDraw')}
                    </Typography>
                    <Typography variant="h5" className="text-slate-900 font-bold">
                      {topCandidates.map((candidate) => candidate.name).join(' & ')}
                    </Typography>
                    <Typography variant="body2" className="text-slate-600">
                      {t('tally.tiedAt')}: {topVoteCount} ({formatPercentage(topVoteCount)})
                    </Typography>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty states */}
      {(phase === 1 || phase === 2) && !isLoading && candidates.length === 0 && (
        <Alert severity="info">
          {t('tally.noCandidates') || 'No candidates have been registered yet.'}
        </Alert>
      )}
      {(phase === 1 || phase === 2) && !isLoading && candidates.length > 0 && totalVotes === 0 && (
        <Alert severity="info">
          {t('tally.noVotesYet') || 'No votes have been revealed yet. Results will appear once votes are revealed.'}
        </Alert>
      )}

      {/* Detailed Results - Show during reveal and finished phases */}
      {(phase === 1 || phase === 2) && hasData && (
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
              {phase === 1 ? t('tally.liveVoteCounts') : t('tally.finalVoteCounts')}
            </Typography>
            
            <div className="space-y-4">
              {candidates.map((candidate) => {
                const percentage = formatPercentage(candidate.voteCount);
                const isWinner = phase === 2 && !isDraw && winner?.id === candidate.id;
                const isDrawLeader = phase === 2 && isDraw && candidate.voteCount === topVoteCount;
                
                return (
                  <div key={candidate.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Chip 
                          label={`#${candidate.id}`} 
                          size="small" 
                          variant="outlined"
                          sx={{
                            borderColor: '#cbd5e1',
                            color: '#334155',
                            backgroundColor: '#f8fafc',
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="body1" className="font-medium">
                          {candidate.name}
                          {isWinner && (
                            <Chip 
                              label={t('tally.winner')} 
                              size="small" 
                              variant="outlined"
                              className="ml-2"
                              sx={{
                                borderColor: '#cbd5e1',
                                color: '#0f172a',
                                backgroundColor: '#f8fafc',
                                fontWeight: 700,
                              }}
                            />
                          )}
                          {isDrawLeader && (
                            <Chip
                              label={t('tally.draw')}
                              size="small"
                              variant="outlined"
                              className="ml-2"
                              sx={{
                                borderColor: '#cbd5e1',
                                color: '#0f172a',
                                backgroundColor: '#f8fafc',
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Typography>
                      </div>
                      <div className="text-right">
                        <Typography variant="h6" className="font-semibold text-gray-800">
                          {candidate.voteCount}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {percentage}
                        </Typography>
                      </div>
                    </div>
                    
                    <LinearProgress
                      variant="determinate"
                      value={totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0}
                      className="h-2"
                      sx={{
                        backgroundColor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#1e293b',
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results State - Show appropriate message for each phase */}
      {candidates.length === 0 && (
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <ChartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <Typography variant="h6" className="text-gray-600 mb-2">
                {phase === 0 ? t('tally.electionNotStarted') : t('tally.noResultsAvailable')}
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                {phase === 0 
                  ? t('tally.addCandidates')
                  : phase === 1 
                  ? t('tally.votesRevealed')
                  : t('tally.electionComplete')
                }
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commit Phase Message - Show when no results yet */}
      {phase === 0 && candidates.length > 0 && (
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <InfoIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <Typography variant="h6" className="text-slate-900 mb-2">
                {t('tally.votingInProgress')}
              </Typography>
              <Typography variant="body2" className="text-slate-600">
                {t('tally.commitPhaseActive')}
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tally;
