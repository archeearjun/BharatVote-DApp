import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { PHASE_LABELS, ERROR_MESSAGES, COMMIT_PHASE, REVEAL_PHASE, FINISH_PHASE, CANDIDATE_MESSAGES, SUCCESS_MESSAGES, BACKEND_URL } from "./constants";
import { useI18n } from './i18n';
import type { BharatVote } from "@typechain/contracts/BharatVote";
import { clearCandidateLabels, getCandidateDisplayName, setCandidateLabels } from './utils/candidateLabels';
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
import { getNameLengthError, getUtf8ByteLength, MAX_NAME_BYTES } from "./utils/nameValidation";
import { buildAllowlistUploadMessage, normalizeAllowlistAddresses } from "./utils/allowlistAuth";

interface AdminProps {
  contract: BharatVote | null;
  phase: number;
  backendMerkleRoot?: string | null;
  contractMerkleRoot?: string | null;
  electionAddress?: string;
  isDemoElection?: boolean;
  onAllowlistUpdated?: (info: { count: number; merkleRoot: string }) => void;
  onMerkleRootUpdated?: (root: string) => void;
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

type DestructiveAction = 'reset' | 'clear' | 'emergency' | null;

const initialState: AdminState = {
  candidateName: "",
  candidates: [],
  loading: false,
  error: null,
  success: null,
  merkleRoot: null,
  merkleLoading: false,
};

export default function Admin({
  contract,
  phase,
  backendMerkleRoot,
  contractMerkleRoot,
  electionAddress,
  isDemoElection,
  onAllowlistUpdated,
  onMerkleRootUpdated,
  onError,
  onPhaseChange,
}: AdminProps) {
  const [state, setState] = useState<AdminState>(initialState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [allowlistInput, setAllowlistInput] = useState('');
  const [allowlistCount, setAllowlistCount] = useState<number | null>(null);
  const [allowlistRoot, setAllowlistRoot] = useState<string | null>(null);
  const [allowlistLoading, setAllowlistLoading] = useState(false);
  const [allowlistError, setAllowlistError] = useState<string | null>(null);
  const [allowlistSuccess, setAllowlistSuccess] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<DestructiveAction>(null);
  const [confirmText, setConfirmText] = useState('');
  const { t, lang } = useI18n();
  const backendRootReady =
    Boolean(backendMerkleRoot) &&
    ethers.isHexString(backendMerkleRoot!, 32) &&
    backendMerkleRoot!.toLowerCase() !== ethers.ZeroHash.toLowerCase();
  const contractRootReady =
    Boolean(contractMerkleRoot) &&
    ethers.isHexString(contractMerkleRoot!, 32) &&
    contractMerkleRoot!.toLowerCase() !== ethers.ZeroHash.toLowerCase();
  const rootsAligned =
    Boolean(contract) &&
    backendRootReady &&
    contractRootReady &&
    backendMerkleRoot!.toLowerCase() === contractMerkleRoot!.toLowerCase();
  const rootsMismatch =
    Boolean(contract) &&
    ((backendRootReady !== contractRootReady) ||
      (backendRootReady &&
        contractRootReady &&
        backendMerkleRoot!.toLowerCase() !== contractMerkleRoot!.toLowerCase()));

  const fetchCandidates = useCallback(async () => {
    if (!contract) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      const fetchedCandidates = await contract.getCandidates();
      const mappedCandidates = Array.isArray(fetchedCandidates) ? 
        fetchedCandidates.map((c: { id: BigInt; name: string; isActive: boolean }) => ({
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
      let errorMessage: string = CANDIDATE_MESSAGES.ERRORS.FETCH_FAILED;
      
      if (err.code === 'CALL_EXCEPTION') {
        errorMessage = "Contract call failed - check if the contract is properly deployed and the network is correct";
      } else if (err.message?.includes('revert')) {
        errorMessage = "Contract reverted - this may be expected if no candidates exist yet";
      } else if (err.message?.includes('network')) {
        errorMessage = "Network error - ensure Hardhat node is running on localhost:8545";
      }
      
      try {
        const count = await contract.candidateCount();
        if (Number(count) === 0) {
          setState(prev => ({
            ...prev,
            candidates: [],
            loading: false,
            error: null
          }));
          return;
        }
      } catch {}
      
      const message = err instanceof Error ? errorMessage : CANDIDATE_MESSAGES.ERRORS.FETCH_FAILED;
      setState(prev => ({ ...prev, error: message, loading: false }));
      onError?.(message);
    }
  }, [contract, onError]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleAddCandidate = async () => {
    if (!contract) {
      setState(prev => ({
        ...prev,
        error: "Contract not available"
      }));
      return;
    }

    if (phase !== COMMIT_PHASE) {
      setState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.WRONG_PHASE
      }));
      return;
    }

    if (!trimmedCandidateName) {
      setState(prev => ({
        ...prev,
        error: "Enter a candidate name before adding it."
      }));
      return;
    }

    if (candidateNameError) {
      setState(prev => ({
        ...prev,
        error: candidateNameError
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, success: null }));
    try {
      const tx = await contract.addCandidate(trimmedCandidateName);
      await tx.wait();
      try {
        const count = await (contract as any).candidateCount?.();
        const newId = Number(count ?? 0) - 1 >= 0 ? Number(count ?? 0) - 1 : 0;
        const address = ((contract as any)?.target as string) || ((contract as any)?.address as string) || '';
        setCandidateLabels(address, newId, { en: trimmedCandidateName });
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
    if (err.errorName) {
      const args = err.errorArgs || [];
      return `${err.errorName}(${args.join(',')})`;
    }
    if (err.reason) {
      return err.reason;
    }
    if (err.code === 'UNKNOWN_ERROR' && err.error?.message?.includes('Internal JSON-RPC error')) {
      return "Network error: Please ensure your local Hardhat node is running and the contract is deployed";
    }
    if (err.code === -32603) {
      return "JSON-RPC error: Check network connection and contract deployment";
    }
    if (err.message?.includes('gas')) {
      return `Gas error: ${err.message}`;
    }
    if (err.message?.includes('call revert exception')) {
      return "Contract call failed: Check if you're in the correct phase and have admin privileges";
    }
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
    if (!isDemoElection && !rootsAligned) {
      const message = 'Sync the prepared voter list to the contract before advancing the election phase.';
      setState(prev => ({ ...prev, error: message, success: null }));
      onError?.(message);
      return;
    }
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
      let gasEstimate;
      try {
        gasEstimate = await contract.resetElection.estimateGas();
      } catch (gasError: any) {
        throw new Error(`Gas estimation failed: ${gasError.reason || gasError.message}`);
      }

      const tx = await contract.resetElection({
        gasLimit: Math.floor(Number(gasEstimate) * 1.2)
      });
      await tx.wait();
      
      setState(prev => ({
        ...prev,
        success: SUCCESS_MESSAGES.ELECTION_RESET,
      }));
      await fetchCandidates();
      onPhaseChange?.();
    } catch (err: any) {
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
      let gasEstimate;
      try {
        gasEstimate = await contract.emergencyReset.estimateGas();
      } catch (gasError: any) {
        throw new Error(`Gas estimation failed: ${gasError.reason || gasError.message}`);
      }

      const tx = await contract.emergencyReset({
        gasLimit: Math.floor(Number(gasEstimate) * 1.2)
      });
      await tx.wait();
      
      setState(prev => ({
        ...prev,
        success: 'Emergency reset successful! Election back to Commit Phase.',
      }));
      await fetchCandidates();
      onPhaseChange?.();
    } catch (err: any) {
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
      const contractAddress = ((contract as any)?.target as string) || ((contract as any)?.address as string) || '';
      if (contractAddress) {
        clearCandidateLabels(contractAddress);
      }
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

  const openDestructiveConfirm = (action: Exclude<DestructiveAction, null>) => {
    setConfirmAction(action);
    setConfirmText('');
  };

  const closeDestructiveConfirm = () => {
    setConfirmAction(null);
    setConfirmText('');
  };

  const handleConfirmDestructiveAction = async () => {
    if (!confirmAction || !confirmationConfig || confirmText.trim().toUpperCase() !== confirmationConfig.phrase) {
      return;
    }

    try {
      if (confirmAction === 'reset') {
        await handleResetElection();
      } else if (confirmAction === 'clear') {
        await handleClearAllCandidates();
      } else if (confirmAction === 'emergency') {
        await handleEmergencyReset();
      }
    } finally {
      closeDestructiveConfirm();
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
  const trimmedCandidateName = state.candidateName.trim();
  const candidateNameByteLength = getUtf8ByteLength(trimmedCandidateName);
  const candidateNameError = trimmedCandidateName
    ? getNameLengthError(trimmedCandidateName, "Candidate name")
    : null;
  const confirmationConfig = confirmAction
    ? {
        reset: {
          title: 'Reset election',
          description: 'This starts a new round and clears the current round status for voters.',
          phrase: 'RESET',
          buttonClass: 'btn-secondary',
          buttonText: 'Confirm Reset',
        },
        clear: {
          title: 'Clear candidates',
          description: 'This removes all candidates from the finished election so you can prepare a new run.',
          phrase: 'CLEAR',
          buttonClass: 'btn-error',
          buttonText: 'Confirm Clear',
        },
        emergency: {
          title: 'Emergency reset',
          description: 'This immediately forces the election back to commit mode. Use it only for recovery.',
          phrase: 'EMERGENCY',
          buttonClass: 'btn-warning',
          buttonText: 'Confirm Emergency Reset',
        },
      }[confirmAction]
    : null;

  const parseAllowlistEntries = useCallback((raw: string): { valid: string[]; invalid: string[] } => {
    if (!raw) return { valid: [], invalid: [] };
    let list: string[] = [];
    try {
      const maybeJson = JSON.parse(raw);
      if (Array.isArray(maybeJson)) {
        list = maybeJson.map((entry) => String(entry));
      } else if (Array.isArray(maybeJson?.addresses)) {
        list = maybeJson.addresses.map((entry: any) => String(entry));
      }
    } catch {
      list = raw.split(/[\s,;]+/).map((entry) => entry.trim()).filter(Boolean);
    }
    const uniqueValid: string[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();

    list.forEach((entry) => {
      if (!ethers.isAddress(entry)) {
        invalid.push(entry);
        return;
      }
      const normalized = ethers.getAddress(entry);
      if (seen.has(normalized)) {
        return;
      }
      seen.add(normalized);
      uniqueValid.push(normalized);
    });

    return { valid: uniqueValid, invalid };
  }, []);

  const allowlistPreview = useMemo(() => parseAllowlistEntries(allowlistInput), [allowlistInput, parseAllowlistEntries]);

  const fetchAllowlistSummary = useCallback(async () => {
    if (!electionAddress || !ethers.isAddress(electionAddress)) return;
    try {
      const resp = await fetch(`${BACKEND_URL}/api/admin/voter-list/${encodeURIComponent(electionAddress)}`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (typeof data?.count === 'number') setAllowlistCount(data.count);
      if (data?.merkleRoot) setAllowlistRoot(data.merkleRoot);
    } catch (err) {
      console.warn('Failed to fetch allowlist summary', err);
    }
  }, [electionAddress]);

  useEffect(() => {
    if (isDemoElection) return;
    fetchAllowlistSummary();
  }, [fetchAllowlistSummary, isDemoElection]);

  const fetchMerkleRoot = useCallback(async () => {
    setState(prev => ({ ...prev, merkleLoading: true, error: null, success: null }));
    try {
      const url = new URL(`${BACKEND_URL}/api/merkle-root`);
      if (electionAddress) {
        url.searchParams.set('electionAddress', electionAddress);
      }
      const resp = await fetch(url.toString());
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
      setState(prev => ({ ...prev, merkleRoot: root }));
      onMerkleRootUpdated?.(root);
    } catch (err: any) {
      const message = extractErrorMessage(err);
      setState(prev => ({ ...prev, error: message, loading: false }));
      onError?.(message);
    }
  }, [contract, fetchMerkleRoot, onError, extractErrorMessage, onMerkleRootUpdated]);

  const handleAllowlistUpload = useCallback(async () => {
    if (!electionAddress || !ethers.isAddress(electionAddress)) {
      setAllowlistError('No valid election address found.');
      return;
    }
    if (isDemoElection) {
      setAllowlistError('Demo election uses open enrollment. No allowlist needed.');
      return;
    }
    if (phase !== COMMIT_PHASE) {
      setAllowlistError('The voter list can only be changed during the commit phase before the active on-chain root is finalized.');
      return;
    }
    if (rootsAligned) {
      setAllowlistError('An eligibility root is already active on-chain for this round. Start a new round before replacing the voter list.');
      return;
    }

    const parsed = parseAllowlistEntries(allowlistInput);
    if (!parsed.valid.length) {
      setAllowlistError('Paste a list of valid wallet addresses first.');
      return;
    }

    const signer = contract?.runner as ethers.Signer | undefined;
    if (!signer || typeof (signer as any).signMessage !== 'function') {
      setAllowlistError('Connect the admin wallet before uploading the voter list.');
      return;
    }

    setAllowlistLoading(true);
    setAllowlistError(null);
    setAllowlistSuccess(null);
    try {
      const normalizedAddresses = normalizeAllowlistAddresses(parsed.valid);
      const issuedAt = Date.now();
      const signature = await (signer as any).signMessage(
        buildAllowlistUploadMessage(electionAddress, normalizedAddresses, issuedAt)
      );

      const resp = await fetch(`${BACKEND_URL}/api/admin/voter-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionAddress,
          addresses: normalizedAddresses,
          auth: {
            issuedAt,
            signature,
          },
        }),
      });
      if (!resp.ok) {
        let message = `Upload failed (${resp.status})`;
        try {
          const data = await resp.json();
          message = data?.error || message;
        } catch {
          const text = await resp.text();
          if (text) message = text;
        }
        throw new Error(message);
      }
      const data = await resp.json();
      setAllowlistCount(data?.count ?? normalizedAddresses.length);
      setAllowlistRoot(data?.merkleRoot || null);
      setAllowlistSuccess(`Prepared ${data?.count ?? normalizedAddresses.length} eligible voter${(data?.count ?? normalizedAddresses.length) === 1 ? '' : 's'}.`);
      onAllowlistUpdated?.({ count: data?.count ?? normalizedAddresses.length, merkleRoot: data?.merkleRoot });
      await fetchAllowlistSummary();
    } catch (err: any) {
      setAllowlistError(err?.message || 'Failed to upload allowlist');
    } finally {
      setAllowlistLoading(false);
    }
  }, [allowlistInput, contract?.runner, electionAddress, fetchAllowlistSummary, isDemoElection, onAllowlistUpdated, parseAllowlistEntries, phase, rootsAligned]);

  const handleAllowlistFile = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      setAllowlistInput(text);
    } catch (err) {
      console.warn('Failed to read allowlist file', err);
    }
  };

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
              <p className="text-sm text-slate-600">{t('admin.subtitle')}</p>
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
          <div className="mb-6 rounded-xl border border-error-200 bg-error-50 p-4" role="alert" aria-live="assertive">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-error-800 font-medium">Error</p>
                <p className="text-sm text-error-700 mt-1">{state.error}</p>
              </div>
              <button
                onClick={() => setState(p => ({ ...p, error: null }))}
                className="text-error-600 hover:text-error-700"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {state.success && (
          <div className="mb-6 rounded-xl border border-success-200 bg-success-50 p-4" role="status" aria-live="polite">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-success-800 font-medium">Success</p>
                <p className="text-sm text-success-700 mt-1">{state.success}</p>
              </div>
              <button
                onClick={() => setState(p => ({ ...p, success: null }))}
                className="text-success-600 hover:text-success-700"
                aria-label="Dismiss success message"
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
                <p className="text-sm font-semibold text-warning-900">Eligibility list changed</p>
                <p className="text-sm text-warning-800 mt-1">Sync the latest voter list to the contract before voting continues.</p>
              </div>
            </div>
            <button
              onClick={handleUpdateMerkleRoot}
              disabled={state.loading || state.merkleLoading}
              className="btn-warning w-full sm:w-auto"
              title="Sync the prepared voter list to the election contract"
            >
              {state.loading || state.merkleLoading ? <div className="spinner" /> : 'Sync to Contract'}
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

      {!isDemoElection && (
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Prepare Voter List</h2>
              <p className="text-sm text-slate-600">Upload, review, and prepare the wallet addresses allowed to vote in this election.</p>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Accepted formats: one address per line, comma-separated text, `.txt`, `.csv`, or `.json`. Uploading prepares the list on the backend; syncing writes the active eligibility root on-chain.
          </div>

          {allowlistError && (
            <div className="mb-4 p-3 rounded-xl border border-error-200 bg-error-50 text-sm text-error-700">
              {allowlistError}
            </div>
          )}
          {allowlistSuccess && (
            <div className="mb-4 p-3 rounded-xl border border-success-200 bg-success-50 text-sm text-success-700">
              {allowlistSuccess}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              <textarea
                value={allowlistInput}
                onChange={(e) => setAllowlistInput(e.target.value)}
                className="input-base min-h-[180px]"
                placeholder="Paste wallet addresses here (one per line or comma-separated)."
              />
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>
                  Ready to upload: {allowlistPreview.valid.length} valid address{allowlistPreview.valid.length === 1 ? '' : 'es'}
                </span>
                {allowlistPreview.invalid.length > 0 && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                    {allowlistPreview.invalid.length} invalid entr{allowlistPreview.invalid.length === 1 ? 'y' : 'ies'} ignored
                  </span>
                )}
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800">
                  <input
                    type="file"
                    accept=".txt,.csv,.json"
                    className="hidden"
                    onChange={(e) => handleAllowlistFile(e.target.files?.[0] || null)}
                  />
                  Upload file
                </label>
              </div>
              {allowlistPreview.invalid.length > 0 && (
                <p className="text-sm text-amber-700">
                  Check formatting before upload. Example invalid input: <span className="font-mono">{allowlistPreview.invalid[0]}</span>
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Prepared voters</p>
                <p className="text-lg font-semibold text-slate-900">{allowlistCount ?? '—'}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Prepared eligibility root</p>
                <p className="text-xs text-slate-700 break-all">{allowlistRoot || backendMerkleRoot || '—'}</p>
              </div>
              <button
                type="button"
                onClick={handleAllowlistUpload}
                disabled={allowlistLoading || allowlistPreview.valid.length === 0}
                className="btn-primary w-full"
              >
                {allowlistLoading ? <div className="spinner" /> : 'Upload and Prepare List'}
              </button>
            </div>
          </div>
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
              <h2 className="text-lg font-semibold text-slate-900">Election Controls</h2>
              <p className="text-sm text-slate-600">Advance the election phase and manage maintenance actions.</p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(v => !v)}
            className="btn-ghost text-sm"
            type="button"
          >
            <Settings className="w-4 h-4" />
            Maintenance
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
        <p className="mt-2 text-sm text-slate-500">
          Use the primary action above for normal phase changes. Open maintenance only for resets or recovery actions.
        </p>

        {settingsOpen && (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Maintenance tools</div>
              <p className="mt-1 text-sm text-slate-500">These actions are for recovery, cleanup, or the start of a new run.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openDestructiveConfirm('reset')}
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
                onClick={() => openDestructiveConfirm('clear')}
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
                onClick={() => openDestructiveConfirm('emergency')}
                disabled={state.loading}
                className="btn-warning w-full sm:w-auto"
              >
                <AlertTriangle className="w-4 h-4" />
                Emergency Reset
              </button>
            </div>

            {import.meta.env.DEV && (
              <button
                onClick={runDiagnostics}
                className="btn-ghost text-sm"
                type="button"
              >
                <Settings className="w-4 h-4" />
                Run Diagnostics
              </button>
            )}
          </div>
        )}
      </div>

      {confirmationConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="card-premium w-full max-w-md p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <AlertTriangle className="h-5 w-5 text-slate-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{confirmationConfig.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{confirmationConfig.description}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-700">
                Type <span className="font-mono font-semibold text-slate-900">{confirmationConfig.phrase}</span> to continue.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value.toUpperCase())}
                className="input-base mt-3"
                placeholder={confirmationConfig.phrase}
                autoFocus
              />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeDestructiveConfirm} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDestructiveAction}
                disabled={confirmText.trim().toUpperCase() !== confirmationConfig.phrase || state.loading}
                className={confirmationConfig.buttonClass}
              >
                {confirmationConfig.buttonText}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Registered Candidates */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{t('admin.registered')}</h2>
                {state.loading && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    <span className="spinner h-3.5 w-3.5" />
                    Refreshing
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">
                {state.candidates.length} candidate{state.candidates.length !== 1 ? 's' : ''} registered
              </p>
            </div>
          </div>

          {state.loading && state.candidates.length === 0 ? (
            <div className="space-y-3" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-slate-200" />
                      <div className="h-3 w-16 rounded bg-slate-200" />
                    </div>
                  </div>
                  <div className="h-6 w-16 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          ) : state.candidates.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 mb-2">{CANDIDATE_MESSAGES.UI.NO_CANDIDATES}</p>
              <p className="text-sm text-slate-500">{t('admin.useAddCandidateForm')}</p>
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
                        {getCandidateDisplayName(
                          (contract as any)?.target || (contract as any)?.address || '',
                          candidate.id,
                          lang,
                          candidate.name
                        )}
                      </p>
                      <p className="text-sm text-slate-600">ID: {candidate.id}</p>
                    </div>
                  </div>
                  <div className={`badge ${candidate.isActive ? 'badge-success' : 'badge-error'}`}>
                    {candidate.isActive ? t('common.active') : t('common.inactive')}
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
              <p className="text-sm text-slate-600">{t('admin.addCandidateSubtitle')}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                value={state.candidateName}
                onChange={e => setState(prev => ({
                  ...prev,
                  candidateName: e.target.value,
                  error: null,
                }))}
                placeholder={t('admin.input.placeholder')}
                disabled={state.loading || phase !== COMMIT_PHASE}
                className="input-base"
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <span className={candidateNameError ? "text-red-600" : "text-slate-500"}>
                  {t('admin.byteLimitHint')}
                </span>
                <span className={candidateNameError ? "text-red-600" : "text-slate-500"}>
                  {candidateNameByteLength}/{MAX_NAME_BYTES} bytes
                </span>
              </div>
              {candidateNameError && (
                <p className="mt-2 text-sm text-red-600">{candidateNameError}</p>
              )}
              {phase !== COMMIT_PHASE && (
                <p className="mt-2 text-sm text-slate-500">{t('admin.commitOnlyAdd')}</p>
              )}
            </div>
            <button
              onClick={handleAddCandidate}
              disabled={state.loading || !trimmedCandidateName || Boolean(candidateNameError) || phase !== COMMIT_PHASE}
              className="btn-primary px-6 sm:self-start"
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
            <h3 className="text-sm font-medium text-slate-900 mb-1">{t('admin.troubleshooting')}</h3>
            <p className="text-sm text-slate-600">
              {t('admin.troubleshootingBody')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
