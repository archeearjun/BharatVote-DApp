import { useState, useEffect, useCallback } from "react";
import { PHASE_LABELS, COMMIT_PHASE, REVEAL_PHASE, FINISH_PHASE } from "./constants";
import { useI18n } from './i18n';
import { 
  Plus,
  Play,
  SkipForward,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Users,
  Settings,
  Clock,
  Eye,
  CheckSquare,
  User,
  CheckCircle,
  X
} from 'lucide-react';

interface AdminProps {
  contract: any;
  phase: number;
  onError?: (error: string) => void;
  onPhaseChange?: () => void;
  onCandidateAdded?: () => void;
}

interface AdminState {
  candidateName: string;
  candidates: any[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: AdminState = {
  candidateName: "",
  candidates: [],
  loading: false,
  error: null,
  success: null,
};

export default function Admin({ contract, phase, onError, onPhaseChange, onCandidateAdded }: AdminProps) {
  const [state, setState] = useState<AdminState>(initialState);
  const { t } = useI18n();

  const fetchCandidates = useCallback(async () => {
    if (!contract) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      const fetchedCandidates = await contract.getCandidates();
      const mappedCandidates = Array.isArray(fetchedCandidates) ? 
        fetchedCandidates.map((c: any) => ({
          id: Number(c.id),
          name: c.name,
          isActive: c.isActive
        })) : [];
        
      setState(prev => ({
        ...prev,
        candidates: mappedCandidates,
        loading: false,
        error: null
      }));
    } catch (err: any) {
      console.error('Error fetching candidates:', err);
      setState(prev => ({ ...prev, error: 'Failed to fetch candidates', loading: false }));
      onError?.('Failed to fetch candidates');
    }
  }, [contract, onError]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleAddCandidate = async () => {
    if (!contract || !state.candidateName.trim() || phase !== COMMIT_PHASE) {
      setState(prev => ({ ...prev, error: 'Can only add candidates during Commit Phase' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, success: null }));
    try {
      const tx = await contract.addCandidate(state.candidateName.trim());
      await tx.wait();
      setState(prev => ({
        ...prev,
        candidateName: "",
        success: 'Candidate added successfully!',
      }));
      await fetchCandidates();
      onCandidateAdded?.();
      setTimeout(() => setState(prev => ({ ...prev, success: null })), 3000);
    } catch (err: any) {
      const message = err?.reason || err?.message || 'Failed to add candidate';
      setState(prev => ({ ...prev, error: message }));
      onError?.(message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const getNextPhaseButtonLabel = (currentPhase: number): string => {
    switch (currentPhase) {
      case COMMIT_PHASE:
        return 'Start Reveal Phase';
      case REVEAL_PHASE:
        return 'Finish Election';
      case FINISH_PHASE:
        return 'Election Finished';
      default:
        return "Advance Phase";
    }
  };

  const handlePhaseAdvance = async () => {
    if (!contract || phase === FINISH_PHASE) return;
    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      let tx;
      switch (phase) {
        case COMMIT_PHASE:
          tx = await contract.startReveal();
          break;
        case REVEAL_PHASE:
          tx = await contract.finishElection();
          break;
        default:
          throw new Error('Invalid phase transition');
      }
      if (tx) {
        await tx.wait();
        setState(prev => ({
          ...prev,
          success: `Advanced to ${getNextPhaseButtonLabel(phase).replace("Advance to ", "")}`,
        }));
        onPhaseChange?.();
        setTimeout(() => setState(prev => ({ ...prev, success: null })), 3000);
      }
    } catch (err: any) {
      const message = err?.reason || err?.message || 'Failed to advance phase';
      setState(prev => ({ ...prev, error: message }));
      onError?.(message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const getPhaseIcon = (phaseNum: number) => {
    switch (phaseNum) {
      case COMMIT_PHASE: return Clock;
      case REVEAL_PHASE: return Eye;
      case FINISH_PHASE: return CheckSquare;
      default: return Clock;
    }
  };

  const getPhaseColor = (phaseNum: number) => {
    switch (phaseNum) {
      case COMMIT_PHASE: return 'bg-slate-100 text-slate-700 border-slate-200';
      case REVEAL_PHASE: return 'bg-warning-100 text-warning-700 border-warning-200';
      case FINISH_PHASE: return 'bg-success-100 text-success-700 border-success-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const PhaseIcon = getPhaseIcon(phase);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="card-premium p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Manage election phases and candidates</p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${getPhaseColor(phase)} self-start sm:self-auto`}>
            <PhaseIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {state.error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-error-800 font-medium">Error</p>
                <p className="text-sm text-error-700 mt-1">{state.error}</p>
              </div>
              <button
                onClick={() => setState(p => ({ ...p, error: null }))}
                className="text-error-600 hover:text-error-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {state.success && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-success-800 font-medium">Success</p>
                <p className="text-sm text-success-700 mt-1">{state.success}</p>
              </div>
              <button
                onClick={() => setState(p => ({ ...p, success: null }))}
                className="text-success-600 hover:text-success-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Candidate */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add Candidate</h2>
            <p className="text-sm text-slate-600">Add new candidates to the election</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={state.candidateName}
              onChange={e => setState(prev => ({ ...prev, candidateName: e.target.value }))}
              placeholder="Enter candidate name"
              disabled={state.loading || phase !== COMMIT_PHASE}
              className="input-base"
            />
            {phase !== COMMIT_PHASE && (
              <p className="text-xs text-slate-500 mt-2">Candidates can only be added during Commit Phase</p>
            )}
          </div>
          <button
            onClick={handleAddCandidate}
            disabled={state.loading || !state.candidateName.trim() || phase !== COMMIT_PHASE}
            className="btn-primary px-6"
          >
            {state.loading ? (
              <div className="spinner" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Phase Control */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Play className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Phase Control</h2>
            <p className="text-sm text-slate-600">Control election phase transitions</p>
          </div>
        </div>

        <button
          onClick={handlePhaseAdvance}
          disabled={state.loading || phase === FINISH_PHASE}
          className="btn-primary"
        >
          {state.loading && phase !== FINISH_PHASE ? (
            <div className="spinner" />
          ) : (
            <>
              <SkipForward className="w-4 h-4" />
              {getNextPhaseButtonLabel(phase)}
            </>
          )}
        </button>
      </div>

      {/* Registered Candidates */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Registered Candidates</h2>
            <p className="text-sm text-slate-600">
              {state.candidates.length} candidate{state.candidates.length !== 1 ? 's' : ''} registered
            </p>
          </div>
        </div>

        {state.loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner w-6 h-6" />
          </div>
        ) : state.candidates.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">No candidates registered yet</p>
            <p className="text-sm text-slate-500">Use the form above to add your first candidate</p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{candidate.name}</p>
                    <p className="text-sm text-slate-600">ID: {candidate.id}</p>
                  </div>
                </div>
                <div className={`badge ${candidate.isActive ? 'badge-success' : 'badge-error'}`}>
                  {candidate.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

