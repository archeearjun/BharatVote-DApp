import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { PHASE_LABELS, ERROR_MESSAGES, COMMIT_PHASE, REVEAL_PHASE, FINISH_PHASE, CANDIDATE_MESSAGES, SUCCESS_MESSAGES, BACKEND_URL } from "./constants";
import { useI18n } from './i18n';
import type { BharatVote } from "@typechain/BharatVote.sol/BharatVote";
import { getCandidateLabel, setCandidateLabels } from './utils/candidateLabels';
import type { Candidate } from "./types/candidates";
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
  contract: BharatVote | null;
  phase: number;
  backendMerkleRoot?: string | null;
  contractMerkleRoot?: string | null;
  onError?: (error: string) => void;
  onPhaseChange?: () => void;
}

interface AdminState {
  candidateName: string;
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  success: string | null;
  merkleRoot: string | null;
  merkleLoading: boolean;
}

const initialState: AdminState = {
  candidateName: "",
  candidates: [],
  loading: false,
  error: null,
  success: null,
  merkleRoot: null,
  merkleLoading: false,
};

export default function Admin({ contract, phase, backendMerkleRoot, contractMerkleRoot, onError, onPhaseChange }: AdminProps) {
  const [state, setState] = useState<AdminState>(initialState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useI18n();
  const rootsAligned =
    Boolean(contract) &&
    Boolean(contractMerkleRoot) &&
    Boolean(backendMerkleRoot) &&
    backendMerkleRoot!.toLowerCase() === contractMerkleRoot!.toLowerCase();
  const rootsMismatch =
    Boolean(contract) &&
    Boolean(contractMerkleRoot) &&
    Boolean(backendMerkleRoot) &&
    backendMerkleRoot!.toLowerCase() !== contractMerkleRoot!.toLowerCase();

  const fetchCandidates = useCallback(async () => {
    if (!contract) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Add extra debugging and retry logic for getCandidates
      console.log('DEBUG: Attempting to fetch candidates...');
      console.log('DEBUG: Contract address:', (contract as any)?.target || (contract as any)?.address);
      
      // Try with explicit gas limit to avoid estimation issues
      const fetchedCandidates = await contract.getCandidates();
      console.log('DEBUG: Raw candidates from contract:', fetchedCandidates);
      
      // Handle case where candidates might be empty array
      const mappedCandidates = Array.isArray(fetchedCandidates) ? 
        fetchedCandidates.map((c: { id: BigInt; name: string; isActive: boolean }) => ({
          id: Number(c.id),
          name: c.name,
          isActive: c.isActive
        })) : [];
        
      console.log('DEBUG: Mapped candidates:', mappedCandidates);
      
      setState(prev => ({
        ...prev,
        candidates: mappedCandidates,
        loading: false,
        error: null
      }));
    } catch (err: any) {
      console.error('DEBUG: Error fetching candidates:', err);
      
      // Enhanced error handling for CALL_EXCEPTION
      let errorMessage: string = CANDIDATE_MESSAGES.ERRORS.FETCH_FAILED;
      
      if (err.code === 'CALL_EXCEPTION') {
        errorMessage = "Contract call failed - check if the contract is properly deployed and the network is correct";
      } else if (err.message?.includes('revert')) {
        errorMessage = "Contract reverted - this may be expected if no candidates exist yet";
      } else if (err.message?.includes('network')) {
        errorMessage = "Network error - ensure Hardhat node is running on localhost:8545";
      }
      
      // Try to get candidate count as fallback to verify contract is working
      try {
        console.log('DEBUG: Trying candidateCount as fallback...');
        const count = await contract.candidateCount();
        console.log('DEBUG: Candidate count:', count);
        if (Number(count) === 0) {
          // No candidates is not an error state, just empty
          setState(prev => ({
            ...prev,
            candidates: [],
            loading: false,
            error: null
          }));
          return;
        }
      } catch (countErr) {
        console.error('DEBUG: Candidate count also failed:', countErr);
      }
      
      const message = err instanceof Error ? errorMessage : CANDIDATE_MESSAGES.ERRORS.FETCH_FAILED;
      setState(prev => ({ ...prev, error: message, loading: false }));
      onError?.(message);
    }
  }, [contract, onError]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleAddCandidate = async () => {
    if (!contract || !state.candidateName.trim() || phase !== COMMIT_PHASE) {
      setState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.WRONG_PHASE
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, success: null }));
    try {
      const tx = await contract.addCandidate(state.candidateName.trim());
      await tx.wait();
      try {
        const count = await (contract as any).candidateCount?.();
        const newId = Number(count ?? 0) - 1 >= 0 ? Number(count ?? 0) - 1 : 0;
        const address = ((contract as any)?.target as string) || ((contract as any)?.address as string) || '';
        setCandidateLabels(address, newId, { en: state.candidateName.trim() });
      } catch {}
      setState(prev => ({
        ...prev,
        candidateName: "",
        success: SUCCESS_MESSAGES.CANDIDATE_ADDED,
      }));
      await fetchCandidates();
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.TRANSACTION_FAILED;
      setState(prev => ({ ...prev, error: message }));
      onError?.(message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const getNextPhaseButtonLabel = useCallback((currentPhase: number): string => {
    switch (currentPhase) {
      case COMMIT_PHASE:
        return 'End Voting (Reveal Phase)';
      case REVEAL_PHASE:
        return 'End Election (Tally Phase)';
      case FINISH_PHASE:
        return `Election Complete`; // Button should be disabled, but provide a label
      default:
        return "Start Election (Commit Phase)";
    }
  }, []);

  // Helper to extract meaningful revert messages (custom errors, revert reasons)
  const extractErrorMessage = (err: any): string => {
    console.error('Full error object:', err);
    
    // Ethers v6 custom error fields
    if (err.errorName) {
      const args = err.errorArgs || [];
      return `${err.errorName}(${args.join(',')})`;
    }
    // Standard revert string
    if (err.reason) {
      return err.reason;
    }
    // Check for specific JSON-RPC errors
    if (err.code === 'UNKNOWN_ERROR' && err.error?.message?.includes('Internal JSON-RPC error')) {
      return "Network error: Please ensure your local Hardhat node is running and the contract is deployed";
    }
    if (err.code === -32603) {
      return "JSON-RPC error: Check network connection and contract deployment";
    }
    // Check for gas-related errors
    if (err.message?.includes('gas')) {
      return `Gas error: ${err.message}`;
    }
    // Check for contract call errors
    if (err.message?.includes('call revert exception')) {
      return "Contract call failed: Check if you're in the correct phase and have admin privileges";
    }
    // Fallback to generic message
    return err.message || ERROR_MESSAGES.TRANSACTION_FAILED;
  };

  // Diagnostic function to help debug contract issues
  const runDiagnostics = async () => {
    if (!contract) {
      console.error('DIAGNOSTIC: No contract available');
      return;
    }

    try {
      console.log('=== DIAGNOSTIC REPORT ===');
      console.log('Contract address:', (contract as any)?.target || (contract as any)?.address);
      console.log('Current phase:', phase);
      console.log('Phase labels:', PHASE_LABELS);
      
      // Check admin status
      try {
        const admin = await contract.admin();
        console.log('Contract admin:', admin);
        console.log('Current account:', (contract as any).runner?.address);
        console.log('Is admin:', admin.toLowerCase() === (contract as any).runner?.address?.toLowerCase());
      } catch (adminErr) {
        console.error('DIAGNOSTIC: Failed to get admin:', adminErr);
      }

      // Check current phase from contract
      try {
        const contractPhase = await contract.phase();
        console.log('Contract phase:', contractPhase);
        console.log('UI phase:', phase);
        console.log('Phase sync:', Number(contractPhase) === phase);
      } catch (phaseErr) {
        console.error('DIAGNOSTIC: Failed to get phase:', phaseErr);
      }

      // Check candidate count
      try {
        const count = await contract.candidateCount();
        console.log('Candidate count:', count);
      } catch (countErr) {
        console.error('DIAGNOSTIC: Failed to get candidate count:', countErr);
      }

      // Test getCandidates specifically
      try {
        console.log('DIAGNOSTIC: Testing getCandidates...');
        const candidates = await contract.getCandidates();
        console.log('DIAGNOSTIC: getCandidates success:', candidates);
      } catch (getCandidatesErr: any) {
        console.error('DIAGNOSTIC: getCandidates failed:', getCandidatesErr);
        console.error('DIAGNOSTIC: Error code:', getCandidatesErr.code);
        console.error('DIAGNOSTIC: Error data:', getCandidatesErr.data);
        console.error('DIAGNOSTIC: Error reason:', getCandidatesErr.reason);
      }

      // Check if resetElection function exists
      try {
        console.log('resetElection function available:', typeof contract.resetElection === 'function');
        console.log('emergencyReset function available:', typeof contract.emergencyReset === 'function');
        console.log('getCandidates function available:', typeof contract.getCandidates === 'function');
      } catch (funcErr) {
        console.error('DIAGNOSTIC: Function check failed:', funcErr);
      }

      // Check merkle root
      try {
        const merkleRoot = await contract.merkleRoot();
        console.log('Merkle root:', merkleRoot);
      } catch (merkleErr) {
        console.error('DIAGNOSTIC: Failed to get merkle root:', merkleErr);
      }

      console.log('=== END DIAGNOSTIC ===');
    } catch (err) {
      console.error('DIAGNOSTIC: General diagnostic failed:', err);
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
          throw new Error(ERROR_MESSAGES.WRONG_PHASE);
      }
      if (tx) {
        await tx.wait();
        try {
          const updated = await contract.phase();
          const updatedPhase = Number(updated);
          setState(prev => ({
            ...prev,
            success: `Now in ${PHASE_LABELS[updatedPhase as keyof typeof PHASE_LABELS]}`,
          }));
        } catch {
          setState(prev => ({
            ...prev,
            success: `Phase updated`,
          }));
        }
        // Force a re-fetch of phase immediately after tx confirmation so UI reflects changes without extra refresh
        try {
          await contract.phase();
          (window as any).dispatchEvent(new Event('bv-phase-updated'));
          onPhaseChange?.();
        } catch {}
      }
    } catch (err: any) {
      const message = extractErrorMessage(err);
      setState(prev => ({ ...prev, error: message }));
      onError?.(message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleResetElection = async () => {
    if (!contract) {
      setState(prev => ({ ...prev, error: "Contract not available" }));
      return;
    }
    
    if (phase !== FINISH_PHASE) {
      setState(prev => ({ ...prev, error: `Reset can only be performed in Finish Phase. Current phase: ${PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}` }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      // Add gas estimation and better error handling
      console.log('DEBUG: Starting election reset...');
      console.log('DEBUG: Current phase:', phase);
      console.log('DEBUG: Contract address:', (contract as any)?.target || (contract as any)?.address);
      
      // Estimate gas first to catch early errors
      let gasEstimate;
      try {
        gasEstimate = await contract.resetElection.estimateGas();
        console.log('DEBUG: Gas estimate for resetElection:', gasEstimate.toString());
      } catch (gasError: any) {
        console.error('DEBUG: Gas estimation failed:', gasError);
        throw new Error(`Gas estimation failed: ${gasError.reason || gasError.message}`);
      }

      // Execute the transaction with explicit gas limit
      const tx = await contract.resetElection({
        gasLimit: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
      });
      
      console.log('DEBUG: Transaction submitted:', tx.hash);
      const receipt = await tx.wait();
      console.log('DEBUG: Transaction confirmed:', receipt?.hash || 'No hash available');
      
      setState(prev => ({
        ...prev,
        success: SUCCESS_MESSAGES.ELECTION_RESET,
      }));
      await fetchCandidates();
      onPhaseChange?.();
    } catch (err: any) {
      console.error('DEBUG: Reset election error:', err);
      const message = extractErrorMessage(err);
      setState(prev => ({ ...prev, error: message }));
      onError?.(message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEmergencyReset = async () => {
    if (!contract) {
      setState(prev => ({ ...prev, error: "Contract not available" }));
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      console.log('DEBUG: Starting emergency reset...');
      console.log('DEBUG: Current phase:', phase);
      
      // Estimate gas first to catch early errors
      let gasEstimate;
      try {
        gasEstimate = await contract.emergencyReset.estimateGas();
        console.log('DEBUG: Gas estimate for emergencyReset:', gasEstimate.toString());
      } catch (gasError: any) {
        console.error('DEBUG: Gas estimation failed:', gasError);
        throw new Error(`Gas estimation failed: ${gasError.reason || gasError.message}`);
      }

      // Execute the transaction with explicit gas limit
      const tx = await contract.emergencyReset({
        gasLimit: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
      });
      
      console.log('DEBUG: Emergency reset transaction submitted:', tx.hash);
      const receipt = await tx.wait();
      console.log('DEBUG: Emergency reset transaction confirmed:', receipt?.hash || 'No hash available');
      
      setState(prev => ({
        ...prev,
        success: 'Emergency reset successful! Election back to Commit Phase.',
      }));
      await fetchCandidates();
      onPhaseChange?.();
    } catch (err: any) {
      console.error('DEBUG: Emergency reset error:', err);
      const message = extractErrorMessage(err);
      setState(prev => ({ ...prev, error: message }));
      onError?.(message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleClearAllCandidates = async () => {
    if (!contract || phase !== FINISH_PHASE) return;
    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const tx = await contract.clearAllCandidates();
      await tx.wait();
      setState(prev => ({
        ...prev,
        success: SUCCESS_MESSAGES.CANDIDATES_CLEARED,
      }));
      await fetchCandidates();
    } catch (err: any) {
      const message = extractErrorMessage(err);
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

  const fetchMerkleRoot = useCallback(async () => {
    setState(prev => ({ ...prev, merkleLoading: true, error: null, success: null }));
    try {
      const resp = await fetch(`${BACKEND_URL}/api/merkle-root`);
      if (!resp.ok) {
        throw new Error(`Backend returned ${resp.status}`);
      }
      const data = await resp.json();
      if (!data?.merkleRoot) {
        throw new Error('No merkleRoot returned from backend');
      }
      setState(prev => ({ ...prev, merkleRoot: data.merkleRoot, merkleLoading: false }));
      return data.merkleRoot as string;
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch Merkle root from backend';
      setState(prev => ({ ...prev, error: message, merkleLoading: false }));
      onError?.(message);
      return null;
    }
  }, [onError]);

  const handleUpdateMerkleRoot = useCallback(async () => {
    if (!contract) {
      setState(prev => ({ ...prev, error: "Contract not available" }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, success: null }));
    try {
      const root = await fetchMerkleRoot();
      if (!root) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
      if (!ethers.isHexString(root, 32)) {
        throw new Error("Invalid merkle root format (expected 32-byte hex string)");
      }

      const tx = await contract.setMerkleRoot(root);
      await tx.wait();

      setState(prev => ({ ...prev, success: "Merkle root updated on-chain", loading: false }));
      setTimeout(() => window.location.reload(), 600);
    } catch (err: any) {
      const message = extractErrorMessage(err);
      setState(prev => ({ ...prev, error: message, loading: false }));
      onError?.(message);
    }
  }, [contract, fetchMerkleRoot, onError, extractErrorMessage]);

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
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{t('admin.title')}</h1>
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

      {/* Eligibility sync */}
      {rootsMismatch && (
        <div className="p-4 rounded-xl border border-warning-200 bg-warning-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-700 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-warning-900">Voter list updated</p>
                <p className="text-sm text-warning-800 mt-1">Sync now to update eligibility on-chain.</p>
              </div>
            </div>
            <button
              onClick={handleUpdateMerkleRoot}
              disabled={state.loading || state.merkleLoading}
              className="btn-warning w-full sm:w-auto"
              title="Sync backend voter list to chain"
            >
              {state.loading || state.merkleLoading ? <div className="spinner" /> : 'Sync Now'}
            </button>
          </div>
        </div>
      )}
      {rootsAligned && (
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-success-50 border border-success-200 text-success-800 w-fit">
          <CheckCircle className="w-4 h-4 text-success-600" />
          <span className="text-sm font-medium">Voter list synced</span>
        </div>
      )}

      {/* Action Center */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Action Center</h2>
              <p className="text-sm text-slate-600">Move the election forward</p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(v => !v)}
            className="btn-ghost text-xs"
            type="button"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        <button
          onClick={handlePhaseAdvance}
          disabled={state.loading || phase === FINISH_PHASE}
          className={`w-full ${phase === FINISH_PHASE ? 'btn-secondary' : 'btn-success'} py-3.5 text-base`}
        >
          {state.loading && phase !== FINISH_PHASE ? (
            <div className="spinner" />
          ) : (
            <>
              <SkipForward className="w-5 h-5" />
              {getNextPhaseButtonLabel(phase)}
            </>
          )}
        </button>

        <div className="mt-3 text-sm text-slate-600">
          Current status: <span className="font-medium text-slate-900">{PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}</span>
        </div>

        {settingsOpen && (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="text-xs font-semibold text-slate-700">Danger zone</div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleResetElection}
                disabled={state.loading || phase !== FINISH_PHASE}
                className="btn-secondary w-full sm:w-auto"
                title={phase !== FINISH_PHASE ? `Reset only available in Finish Phase. Current: ${PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}` : ""}
              >
                {state.loading && phase === FINISH_PHASE ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    {t('admin.reset')}
                  </>
                )}
              </button>

              <button
                onClick={handleClearAllCandidates}
                disabled={state.loading || phase !== FINISH_PHASE}
                className="btn-error w-full sm:w-auto"
              >
                {state.loading && phase === FINISH_PHASE ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t('admin.clear')}
                  </>
                )}
              </button>

              <button
                onClick={handleEmergencyReset}
                disabled={state.loading}
                className="btn-warning w-full sm:w-auto"
              >
                <AlertTriangle className="w-4 h-4" />
                Emergency Reset
              </button>
            </div>

            <button
              onClick={runDiagnostics}
              className="btn-ghost text-xs"
              type="button"
            >
              <Settings className="w-3 h-3" />
              Run Diagnostics (Check Console)
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Registered Candidates */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('admin.registered')}</h2>
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
              <p className="text-slate-600 mb-2">{CANDIDATE_MESSAGES.UI.NO_CANDIDATES}</p>
              <p className="text-sm text-slate-500">Use the form to add your first candidate</p>
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
                      <p className="font-medium text-slate-900">
                        {getCandidateLabel((contract as any)?.target || (contract as any)?.address || '', candidate.id, (localStorage.getItem('lang') as any) || 'en') || candidate.name}
                      </p>
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

        {/* Add Candidate */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('admin.addCandidate')}</h2>
              <p className="text-sm text-slate-600">Add new candidates to the election</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={state.candidateName}
                onChange={e => setState(prev => ({ ...prev, candidateName: e.target.value }))}
                placeholder={t('admin.input.placeholder')}
                disabled={state.loading || phase !== COMMIT_PHASE}
                className="input-base"
              />
              {phase !== COMMIT_PHASE && (
                <p className="text-xs text-slate-500 mt-2">{t('admin.commitOnlyAdd')}</p>
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
                  {t('common.add')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="card p-4 bg-slate-50 border-slate-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-slate-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">Troubleshooting</h3>
            <p className="text-sm text-slate-600">
              If something fails, check the console and verify your wallet network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
