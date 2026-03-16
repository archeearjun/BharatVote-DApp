import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from './i18n';
import { 
  CheckCircle,
  Lock,
  Unlock,
  Vote,
  Shield,
  CheckSquare,
  AlertTriangle,
  X,
  Shuffle,
  Download,
  Loader2,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { ethers } from 'ethers';
import { BACKEND_URL } from './constants';
import DemoTimerBanner from './components/DemoTimerBanner';

interface VoterProps {
  contract: any;
  phase: number;
  setPhase: (phase: number) => void;
  account: string;
  voterId: string;
  isDemoElection?: boolean;
  electionAddress?: string;
  refreshSignal?: number;
  onRevealSuccess: () => void;
  candidates?: any[];
  onCommitSuccess?: () => void;
  onStatusChange?: (status: { committed: boolean; revealed: boolean }) => void;
}

const Voter: React.FC<VoterProps> = ({
  contract,
  phase,
  account,
  voterId,
  isDemoElection,
  electionAddress,
  refreshSignal = 0,
  onRevealSuccess,
  candidates = [],
  onCommitSuccess,
  onStatusChange,
}) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [hasVoted, setHasVoted] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [voteHash, setVoteHash] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [salt, setSalt] = useState('');
  const [isSaltVisible, setIsSaltVisible] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const previousPhaseRef = useRef<number | null>(null);
  const previousRefreshSignalRef = useRef(refreshSignal);

  const [isEligible, setIsEligible] = useState(false);
  const [isFetchingProof, setIsFetchingProof] = useState(false);
  const [hasRecoverySnapshot, setHasRecoverySnapshot] = useState(false);
  const recoveryStorageKey = useMemo(() => {
    const scope = electionAddress ? String(electionAddress).toLowerCase() : 'default';
    return `bv_vote_recovery_${scope}_${String(account).toLowerCase()}`;
  }, [account, electionAddress]);

  const phases = [
    { id: 0, label: t('voter.commit'), description: t('voter.submitEncryptedVote'), icon: Lock },
    { id: 1, label: t('voter.reveal'), description: t('voter.revealActualVote'), icon: Unlock },
    { id: 2, label: t('voter.finished'), description: t('voter.electionCompleted'), icon: CheckSquare }
  ];

  const persistRecoverySnapshot = useCallback((candidateId: number, nextSalt: string, commitHash?: string | null) => {
    try {
      // Use localStorage (not sessionStorage) so the snapshot survives tab close.
      // The voter needs their salt to reveal — losing it means they can't reveal.
      localStorage.setItem(
        recoveryStorageKey,
        JSON.stringify({
          candidateId,
          salt: nextSalt,
          commitHash: commitHash || null,
        })
      );
      setHasRecoverySnapshot(true);
    } catch {}
  }, [recoveryStorageKey]);

  const clearRecoverySnapshot = useCallback(() => {
    try {
      localStorage.removeItem(recoveryStorageKey);
    } catch {}
    setHasRecoverySnapshot(false);
  }, [recoveryStorageKey]);

  const returnToVerification = useCallback(() => {
    if (electionAddress) {
      window.location.assign(`/election/${electionAddress}`);
      return;
    }
    navigate('/');
  }, [electionAddress, navigate]);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!account) {
        setIsEligible(false);
        return;
      }
      try {
        // Demo mode: auto-register strangers via backend so they are included in the Merkle root.
        if (isDemoElection) {
          await fetch(`${BACKEND_URL}/api/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: account }),
          });
        }
        const proofUrl = new URL(`${BACKEND_URL}/api/merkle-proof/${encodeURIComponent(account)}`);
        if (electionAddress) {
          proofUrl.searchParams.set('electionAddress', electionAddress);
        }
        const resp = await fetch(proofUrl.toString());
        if (resp.ok) {
          setIsEligible(true);
        } else {
          setIsEligible(false);
      }
    } catch (err) {
      console.warn('Failed to check voter eligibility', err);
      setIsEligible(false);
    }
    };

    checkEligibility();
    checkVoteStatus();
  }, [contract, account, electionAddress, isDemoElection]);

  const checkVoteStatus = async () => {
    if (!contract || !account) {
      return;
    }
    try {
      const [committed, revealed] = await contract.getVoterStatus(account);
      
      setHasVoted(committed);
      setHasRevealed(revealed);
      onStatusChange?.({ committed, revealed });

      if (!committed || revealed) {
        clearRecoverySnapshot();
      }

      try {
        const onchainCommit: string = await contract.commits(account);
        if (onchainCommit && onchainCommit !== '0x' && onchainCommit !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          setVoteHash(onchainCommit);
        } else if (!committed) {
          setVoteHash(null);
        }
      } catch (innerErr) {
        console.warn('Failed to read on-chain commit hash', innerErr);
      }
    } catch (err) {
      console.warn('Failed to refresh vote status', err);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(recoveryStorageKey);
      if (!raw) {
        setHasRecoverySnapshot(false);
        return;
      }

      const parsed = JSON.parse(raw) as {
        candidateId?: number;
        salt?: string;
        commitHash?: string | null;
      };

      if (typeof parsed.candidateId === 'number' && selectedCandidateId === null) {
        setSelectedCandidateId(parsed.candidateId);
      }
      if (typeof parsed.salt === 'string' && !salt) {
        setSalt(parsed.salt);
      }
      if (typeof parsed.commitHash === 'string' && !voteHash) {
        setVoteHash(parsed.commitHash);
      }

      setHasRecoverySnapshot(true);
    } catch {
      setHasRecoverySnapshot(false);
    }
  }, [recoveryStorageKey]);

  const generateSalt = () => {
    return ethers.hexlify(ethers.randomBytes(16)).slice(2);
  };

  const hashVote = async (candidateIdNumber: number, plainSalt: string) => {
    // Ensure a valid candidate id
    if (candidateIdNumber === null || candidateIdNumber === undefined) {
      throw new Error('Candidate not selected');
    }
    const candidateId = BigInt(candidateIdNumber);
    // Convert user-provided salt string to bytes32 deterministically so they can remember any word
    const saltBytes32 = ethers.keccak256(ethers.toUtf8Bytes(plainSalt));
    // Hash as contract does: keccak256(abi.encodePacked(_choice, _salt)) with _salt bytes32
    // Use ethers.solidityPackedKeccak256 to match Solidity's abi.encodePacked exactly
    const commitHash = ethers.solidityPackedKeccak256(['uint256', 'bytes32'], [candidateId, saltBytes32]);
    return { commitHash, saltBytes32 };
  };

  const computeMerkleRootFromProof = (addr: string, proof: string[]) => {
    const normalized = ethers.getAddress(addr);
    let hash = ethers.solidityPackedKeccak256(['address'], [normalized]);
    for (const siblingRaw of proof) {
      const sibling = String(siblingRaw).startsWith('0x') ? String(siblingRaw) : `0x${siblingRaw}`;
      const [a, b] = BigInt(hash) < BigInt(sibling) ? [hash, sibling] : [sibling, hash];
      hash = ethers.keccak256(ethers.concat([a, b]));
    }
    return hash;
  };

  const handleCommitVote = async () => {
    if (selectedCandidateId === null || !salt.trim()) {
      setError('Select a candidate and enter a salt (secret phrase) before committing.');
      return;
    }
    if (!contract) {
      setError('Wallet not connected or contract unavailable');
      return;
    }
      if (!account) {
        setError('Wallet not connected. Please connect your wallet.');
        return;
      }

    setIsCommitting(true);
    setIsFetchingProof(true);
    setError(null);

    try {
      const { commitHash } = await hashVote(selectedCandidateId, salt.trim());

      // Demo mode: ensure the backend has registered this voter (so they become eligible on-chain).
      if (isDemoElection) {
        try {
          await fetch(`${BACKEND_URL}/api/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: account }),
          });
        } catch {}
      }

      const proofUrl = new URL(`${BACKEND_URL}/api/merkle-proof/${encodeURIComponent(account)}`);
      if (electionAddress) {
        proofUrl.searchParams.set('electionAddress', electionAddress);
      }
      let resp = await fetch(proofUrl.toString());
      // If this is demo mode and the voter wasn't eligible yet, retry once after a join call.
      if (isDemoElection && !resp.ok) {
        try {
          await fetch(`${BACKEND_URL}/api/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: account }),
          });
          resp = await fetch(proofUrl.toString());
        } catch {}
      }
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Failed to get Merkle proof: ${errText || resp.statusText}`);
      }
      const proofData = await resp.json();
      const proof = Array.isArray(proofData) ? proofData : proofData.proof;
      // Note: an empty proof is valid for a single-leaf Merkle tree.
      if (!Array.isArray(proof)) {
        throw new Error('Invalid Merkle proof payload from backend.');
      }

      // Preflight eligibility check: verify the backend proof matches the contract's merkleRoot.
      try {
        const onChainRoot = await contract.merkleRoot();
        const computedRoot = computeMerkleRootFromProof(account, proof);
        if (String(computedRoot).toLowerCase() !== String(onChainRoot).toLowerCase()) {
          throw new Error(
            'Eligibility sync is out of date (your Merkle proof does not match the contract). Please re-join the demo or ask the admin to sync the Merkle root.'
          );
        }
      } catch (e) {
        if (e instanceof Error) throw e;
      }

      const tx = await contract.commitVote(commitHash, proof);
      await tx.wait();

      persistRecoverySnapshot(selectedCandidateId, salt.trim(), commitHash);
      setVoteHash(commitHash);
      setHasVoted(true);
      onCommitSuccess?.();
      setSuccess('Vote committed successfully. A temporary recovery copy is saved in this browser until reveal completes.');
      setShowCommitModal(true);

      // Do not store any candidate/salt locally to preserve privacy

      // Update vote status from contract
      await checkVoteStatus();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      let msg = err?.reason || err?.message || 'Failed to commit vote';
      
      // Better error messages for common issues
      if (msg.includes('missing revert data') || msg.includes('estimateGas')) {
        msg = 'Transaction failed during gas estimation. This usually means you are not eligible (Merkle root not synced) or you already committed in this round.';
      } else if (msg.includes('execution reverted')) {
        msg = 'Transaction failed: Please check if you are eligible to vote and haven\'t already voted in this phase.';
      } else if (msg.includes('user rejected')) {
        msg = 'Transaction cancelled by user.';
      }

      if (isDemoElection && msg.includes('Failed to get Merkle proof') && msg.includes('Not eligible')) {
        msg =
          'Demo setup is incomplete on the backend (you were not auto-registered). Ensure the backend has DEMO_ELECTION_ADDRESS, RPC_URL, and PRIVATE_KEY (demo admin) configured, then try again.';
      }
       
      setError(msg);
    } finally {
      setIsCommitting(false);
      setIsFetchingProof(false);
    }
  };

  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    const refreshChanged = previousRefreshSignalRef.current !== refreshSignal;
    const enteredReveal = phase === 1 && previousPhase !== 1;
    const resetOrReopenedCommit = phase === 0 && (refreshChanged || (previousPhase !== null && previousPhase !== 0));

    if (enteredReveal) {
      setIsSaltVisible(false);
      setShowCommitModal(false);
      setError(null);
      setSuccess(null);
    }

    if (resetOrReopenedCommit) {
      setSelectedCandidateId(null);
      setSalt('');
      setIsSaltVisible(false);
      setShowCommitModal(false);
      setVoteHash(null);
      setHasVoted(false);
      setHasRevealed(false);
      setError(null);
      setSuccess(null);
      clearRecoverySnapshot();
    }

    if (phase !== 1) {
      setIsSaltVisible(false);
    }

    checkVoteStatus();
    previousPhaseRef.current = phase;
    previousRefreshSignalRef.current = refreshSignal;
  }, [clearRecoverySnapshot, phase, refreshSignal]);

  const handleRevealVote = async () => {
    if (selectedCandidateId === null || !salt.trim()) {
      setError('Select the same candidate and enter the exact salt you used when committing.');
      return;
    }

    setIsRevealing(true);
    setError(null);

    try {
      if (!hasVoted) {
        throw new Error('You must commit a vote before revealing. Please go back to the commit phase and commit your vote first.');
      }

      // Check if user has already revealed their vote
      if (hasRevealed) {
        throw new Error('You have already revealed your vote. You cannot reveal again.');
      }

      let storedHash = voteHash;
      try {
        const onchainCommit: string = await contract.commits(account);
        if (onchainCommit) storedHash = onchainCommit;
      } catch (readErr) {
        console.warn('Failed to read on-chain commit hash before reveal', readErr);
      }

      const { commitHash: expectedCommitHash } = await hashVote(selectedCandidateId, salt.trim());
      
      if (!storedHash || expectedCommitHash.toLowerCase() !== storedHash.toLowerCase()) {
        throw new Error('Hash mismatch! The candidate and salt combination does not match your committed vote. Please ensure you are using the same candidate and salt from the commit phase.');
      }

      const candidateId = BigInt(selectedCandidateId);
      const bytes32Salt = ethers.keccak256(ethers.toUtf8Bytes(salt.trim()));

      const tx = await contract.revealVote(candidateId, bytes32Salt);
      await tx.wait();
      
      clearRecoverySnapshot();
      setSuccess('Vote revealed successfully! Your vote has been counted.');
      onRevealSuccess();
      
      // Update vote status from contract
      await checkVoteStatus();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      const msg = err?.reason || err?.message || 'Failed to reveal vote';
      setError(msg);
    } finally {
      setIsRevealing(false);
    }
  };

  useEffect(() => {
    if (hasRevealed) {
      clearRecoverySnapshot();
    }
  }, [clearRecoverySnapshot, hasRevealed]);

  const handleNewSalt = () => {
    setSalt(generateSalt());
  };

  const handleDownloadRecoveryFile = useCallback(() => {
    if (selectedCandidateId === null || !salt.trim()) {
      setError('Select a candidate and enter your password before downloading recovery details.');
      return;
    }

    const safeElectionLabel = electionAddress
      ? electionAddress.toLowerCase().replace(/[^a-z0-9]/g, '').slice(-8)
      : 'election';
    const filename = `bharatvote-recovery-${safeElectionLabel}.txt`;
    const fileContents = [
      'BharatVote Recovery File',
      `Exported: ${new Date().toISOString()}`,
      `Election: ${electionAddress || 'N/A'}`,
      `Wallet: ${account}`,
      `Candidate ID: ${selectedCandidateId}`,
      `Password: ${salt.trim()}`,
      `Commit Hash: ${voteHash || 'Pending until commit transaction confirms'}`,
      '',
      'Keep this file private. You need the exact same password and candidate ID during reveal.',
    ].join('\n');

    const blob = new Blob([fileContents], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
    setSuccess('Recovery file downloaded. Keep it private until you complete reveal.');
  }, [account, electionAddress, salt, selectedCandidateId, voteHash]);

  const toggleSaltVisibility = () => {
    setIsSaltVisible((prev) => !prev);
  };

  const preventSaltClipboard = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (phase !== 0) return;
    e.preventDefault();
  };

  const preventSaltDragDrop = (e: React.DragEvent<HTMLInputElement>) => {
    if (phase !== 0) return;
    e.preventDefault();
  };

  const preventSaltContextMenu = (e: React.MouseEvent<HTMLInputElement>) => {
    if (phase !== 0) return;
    e.preventDefault();
  };

  const moveCandidateSelection = (currentId: number, direction: 1 | -1) => {
    const ids = candidates.map((candidate: any) => Number(candidate.id)).filter((id: number) => Number.isFinite(id));
    if (!ids.length) return;
    const currentIndex = ids.indexOf(currentId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + direction + ids.length) % ids.length;
    setSelectedCandidateId(ids[nextIndex]);
  };

  const handleCandidateKeyDown = (e: React.KeyboardEvent, candidateId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedCandidateId(candidateId);
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      moveCandidateSelection(candidateId, 1);
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      moveCandidateSelection(candidateId, -1);
    }
  };
  
  // Make the action buttons clickable as soon as inputs are present; we surface errors if prerequisites are missing
  const canCommit =
    selectedCandidateId !== null &&
    !!salt.trim() &&
    !isCommitting &&
    !hasVoted &&
    phase === 0 &&
    (isDemoElection || isEligible);
  const canReveal = selectedCandidateId !== null && !!salt.trim() && !isRevealing && hasVoted && !hasRevealed && phase === 1;

  const commitDisabledReason = (() => {
    if (phase !== 0) return 'Commit is only available during the commit phase';
    if (!voterId) return 'Complete KYC to commit a vote';
    if (hasVoted) return 'You have already committed a vote';
    if (!salt.trim()) return 'Enter a password/salt to secure your vote';
    if (selectedCandidateId === null) return 'Select a candidate to commit';
    if (!isDemoElection && !isEligible) return 'You are not in the eligible voter list';
    return null;
  })();

  const revealDisabledReason = (() => {
    if (phase !== 1) return 'Reveal is only available during the reveal phase';
    if (!hasVoted) return 'Commit your vote before revealing';
    if (hasRevealed) return 'You have already revealed your vote';
    if (!salt.trim()) return 'Enter the exact password/salt you used to commit';
    if (selectedCandidateId === null) return 'Select the candidate you committed';
    return null;
  })();

  const handleCommitClick = () => {
    if (!canCommit) return;
    handleCommitVote();
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Not Connected</h3>
          <p className="text-sm text-gray-600 mb-4">Please connect your wallet to continue.</p>
        </div>
      </div>
    );
  }

  // Error boundary - if there's a critical error, show it
  if (!voterId) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="card-premium max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Voter ID Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">Please complete KYC verification first.</p>
          <button type="button" onClick={returnToVerification} className="btn-secondary">
            Return to Verification
          </button>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">Please connect your wallet and ensure the contract is deployed.</p>
        </div>
      </div>
    );
  }

  const getCurrentPhase = () => phases.find(p => p.id === phase) || phases[0];
  const currentPhase = getCurrentPhase();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Phase Status */}
      <div className="card-premium p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Voter Dashboard</h1>
              <p className="text-sm text-slate-600">Participate in the democratic process</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDemoElection ? (
              <div className="badge badge-info">
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Open Demo</span>
                <span className="sm:hidden">Demo</span>
              </div>
            ) : (
              <div className={`badge ${isEligible ? 'badge-success' : 'badge-error'}`}>
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">{isEligible ? t('voter.eligible') : t('voter.notEligible')}</span>
                <span className="sm:hidden">{isEligible ? 'Eligible' : 'Not Eligible'}</span>
              </div>
            )}
            <div className="badge badge-info">
              <currentPhase.icon className="w-3 h-3" />
              <span className="hidden sm:inline">{currentPhase.label}</span>
              <span className="sm:hidden">{currentPhase.label.substring(0, 6)}</span>
            </div>
          </div>
        </div>

        {/* Phase Description */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <currentPhase.icon className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="font-medium text-slate-900">{currentPhase.label} Phase</h3>
              <p className="text-sm text-slate-600">{currentPhase.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="card p-4 bg-error-50 border-error-200" role="alert" aria-live="assertive">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-error-800 font-medium">Error</p>
              <p className="text-sm text-error-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-error-600 hover:text-error-700"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="card p-4 bg-success-50 border-success-200" role="status" aria-live="polite">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-success-800 font-medium">Success</p>
              <p className="text-sm text-success-700 mt-1">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-success-600 hover:text-success-700"
              aria-label="Dismiss success message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Phase-specific content */}
      {phase === 0 && (
        /* Commit Phase - Show voting options */
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Cast Your Encrypted Vote</h2>
              <p className="text-sm text-slate-600">Select your candidate and create a secure commitment</p>
            </div>
          </div>

          {isDemoElection && (
            <div className="mb-4">
              <DemoTimerBanner enabled={true} variant="inline" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Candidate Selection */}
            <div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 mb-4">
                  Select Candidate
                </label>
                
                {/* Candidate Grid - Mobile: 1 col, Desktop: 2 cols */}
                <div 
                  role="radiogroup" 
                  aria-label="Select candidate"
                  className="grid grid-cols-1 gap-3"
                >
                  {candidates.map((c:any) => {
                    const candidateId = Number(c.id);
                    const isSelected = selectedCandidateId === candidateId;
                    
                    // Get initials for avatar
                    const initials = c.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    
                    const handleSelect = (e: React.MouseEvent | React.KeyboardEvent) => {
                      e.preventDefault();
                      setSelectedCandidateId(candidateId);
                    };
                    
                    const handleKeyDown = (e: React.KeyboardEvent) => {
                      handleCandidateKeyDown(e, candidateId);
                    };

                    const isFocusable =
                      selectedCandidateId === null
                        ? candidateId === Number(candidates[0]?.id)
                        : isSelected;
                    
                    return (
                      <div
                        key={String(c.id)}
                        role="radio"
                        aria-checked={isSelected}
                        aria-labelledby={`candidate-commit-${candidateId}-name`}
                        tabIndex={isFocusable ? 0 : -1}
                        onClick={handleSelect}
                        onKeyDown={handleKeyDown}
                        className={`
                          relative group
                          min-h-[56px] p-4 rounded-2xl
                          cursor-pointer
                          transition-all duration-150 ease-out
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500
                          ${isSelected 
                            ? 'bg-slate-50 ring-2 ring-slate-900 shadow-sm' 
                            : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98]'
                          }
                        `}
                        style={{
                          transform: isSelected ? 'scale(1)' : undefined,
                          userSelect: 'none',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar with initials */}
                          <div className={`
                            flex-shrink-0 w-10 h-10 rounded-full 
                            flex items-center justify-center
                            font-semibold text-sm
                            transition-colors duration-150
                            ${isSelected 
                              ? 'bg-slate-900 text-white' 
                              : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                            }
                          `}>
                            {initials}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 
                              id={`candidate-commit-${candidateId}-name`}
                              className="text-base font-semibold text-slate-900 truncate"
                            >
                              {c.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Candidate ID: {String(c.id)}
                            </p>
                          </div>
                          
                          {/* Selection indicator */}
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">
                                  Selected
                                </span>
                                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center animate-in fade-in zoom-in duration-150">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-slate-400 transition-colors" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Salt Input */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-4">Security Password</label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={isSaltVisible ? "text" : "password"}
                    placeholder="Enter a memorable phrase for vote security"
                    value={salt}
                    onChange={(e) => setSalt(e.target.value)}
                    onCopy={preventSaltClipboard}
                    onPaste={preventSaltClipboard}
                    onCut={preventSaltClipboard}
                    onDrop={preventSaltDragDrop}
                    onContextMenu={preventSaltContextMenu}
                    autoComplete="new-password"
                    spellCheck={false}
                    className="input-base pr-11"
                  />
                  <button
                    type="button"
                    onClick={toggleSaltVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    aria-label={isSaltVisible ? "Hide password" : "Show password"}
                    title={isSaltVisible ? "Hide password" : "Show password"}
                  >
                    {isSaltVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Any phrase works. You must use the exact same one during reveal.
                </p>
                <p className="text-xs text-slate-500">
                  After commit, BharatVote keeps a temporary recovery copy in this browser until reveal completes.
                </p>
                <button
                  onClick={handleNewSalt}
                  className="btn-ghost text-sm"
                  title="Generate a random salt (you can still change it)"
                >
                  <Shuffle className="w-4 h-4" />
                  Generate Random Password
                </button>
                <button
                  type="button"
                  onClick={handleDownloadRecoveryFile}
                  disabled={selectedCandidateId === null || !salt.trim()}
                  className="btn-secondary text-sm"
                  title="Download a private recovery file for reveal"
                >
                  <Download className="w-4 h-4" />
                  Download Recovery File
                </button>
              </div>
              <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning-800 mb-1">Important</p>
                    <p className="text-sm text-warning-700">
                      Remember this exact password - you'll need to enter it again during the reveal phase. 
                      Write it down or use something memorable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            {hasVoted && (
              <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-success-900 mb-1">
                      Vote Already Committed
                    </p>
                    <p className="text-sm text-success-800">
                      Your vote has been committed successfully. Please wait for the Reveal phase to reveal your vote.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <button
              disabled={!canCommit}
              onClick={handleCommitClick}
              title={canCommit ? undefined : commitDisabledReason || undefined}
              className={`btn-primary w-full sm:w-auto ${!canCommit ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              <span className="inline-flex items-center gap-2">
                {isFetchingProof && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCommitting ? 'Submitting...' : t('voter.commitVote')}
              </span>
            </button>
            {!canCommit && commitDisabledReason && (
              <p className="mt-2 text-sm text-slate-500">{commitDisabledReason}</p>
            )}
          </div>
        </div>
      )}

      {phase === 1 && (
        /* Reveal Phase - Show candidate selection and salt input */
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
              <Unlock className="w-5 h-5 text-warning-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('voter.revealYourVote')}</h2>
              <p className="text-sm text-slate-600">Reveal your encrypted vote to be counted</p>
            </div>
          </div>

          {isDemoElection && (
            <div className="mb-4">
              <DemoTimerBanner enabled={true} variant="inline" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Salt Input */}
            <div className="order-1 lg:order-2">
              <label className="block text-sm font-medium text-slate-900 mb-4">{t('voter.yourSalt')}</label>
              <div className="relative">
                <input
                  type={isSaltVisible ? "text" : "password"}
                  placeholder={t('voter.enterExactSalt')}
                  value={salt}
                  onChange={(e) => setSalt(e.target.value)}
                  onCopy={preventSaltClipboard}
                  onPaste={preventSaltClipboard}
                  onCut={preventSaltClipboard}
                  onDrop={preventSaltDragDrop}
                  onContextMenu={preventSaltContextMenu}
                  autoComplete="new-password"
                  spellCheck={false}
                  className="input-base pr-11"
                />
                <button
                  type="button"
                  onClick={toggleSaltVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={isSaltVisible ? "Hide password" : "Show password"}
                  title={isSaltVisible ? "Hide password" : "Show password"}
                >
                  {isSaltVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Enter the exact same password you used during the commit phase.
              </p>
              {hasRecoverySnapshot && (
                <p className="mt-2 text-xs text-slate-500">
                  Your commit recovery details are available in this browser for this election.
                </p>
              )}
              <button
                type="button"
                onClick={handleDownloadRecoveryFile}
                disabled={selectedCandidateId === null || !salt.trim()}
                className="btn-secondary mt-3 text-sm"
                title="Download your recovery details"
              >
                <Download className="w-4 h-4" />
                Download Recovery File
              </button>
            </div>

            {/* Candidate Selection */}
            <div className="order-2 lg:order-1">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 mb-4">
                  {t('voter.selectCandidateVotedFor')}
                </label>
                
                {/* Candidate Grid - Mobile: 1 col, Desktop: 2 cols */}
                <div 
                  role="radiogroup" 
                  aria-label="Select candidate"
                  className="grid grid-cols-1 gap-3"
                >
                  {candidates.map((c:any) => {
                    const candidateId = Number(c.id);
                    const isSelected = selectedCandidateId === candidateId;
                    
                    // Get initials for avatar
                    const initials = c.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    
                    const handleSelect = (e: React.MouseEvent | React.KeyboardEvent) => {
                      e.preventDefault();
                      setSelectedCandidateId(candidateId);
                    };
                    
                    const handleKeyDown = (e: React.KeyboardEvent) => {
                      handleCandidateKeyDown(e, candidateId);
                    };

                    const isFocusable =
                      selectedCandidateId === null
                        ? candidateId === Number(candidates[0]?.id)
                        : isSelected;
                    
                    return (
                      <div
                        key={String(c.id)}
                        role="radio"
                        aria-checked={isSelected}
                        aria-labelledby={`candidate-${candidateId}-name`}
                        tabIndex={isFocusable ? 0 : -1}
                        onClick={handleSelect}
                        onKeyDown={handleKeyDown}
                        className={`
                          relative group
                          min-h-[56px] p-4 rounded-2xl
                          cursor-pointer
                          transition-all duration-150 ease-out
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500
                          ${isSelected 
                            ? 'bg-slate-50 ring-2 ring-slate-900 shadow-sm' 
                            : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98]'
                          }
                        `}
                        style={{
                          transform: isSelected ? 'scale(1)' : undefined,
                          userSelect: 'none',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar with initials */}
                          <div className={`
                            flex-shrink-0 w-10 h-10 rounded-full 
                            flex items-center justify-center
                            font-semibold text-sm
                            transition-colors duration-150
                            ${isSelected 
                              ? 'bg-slate-900 text-white' 
                              : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                            }
                          `}>
                            {initials}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 
                              id={`candidate-${candidateId}-name`}
                              className="text-base font-semibold text-slate-900 truncate"
                            >
                              {c.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Candidate ID: {String(c.id)}
                            </p>
                          </div>
                          
                          {/* Selection indicator */}
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">
                                  Selected
                                </span>
                                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center animate-in fade-in zoom-in duration-150">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-slate-400 transition-colors" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Helper text */}
                <p className="text-xs text-slate-500 mt-4 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{t('voter.selectSameCandidate')}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            {!hasVoted && (
              <div className="mb-4 p-4 bg-warning-50 border border-warning-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                  <p className="text-sm text-warning-800">
                    You must commit a vote during the Commit phase before you can reveal it.
                  </p>
                </div>
              </div>
            )}
            {hasRevealed && (
              <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                  <p className="text-sm text-success-800">
                    You have already revealed your vote. Thank you for participating!
                  </p>
                </div>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">{t('voter.readyToReveal')}</p>
              <button
                disabled={!canReveal}
                title={canReveal ? undefined : revealDisabledReason || undefined}
                onClick={() => {
                  if (canReveal) {
                    handleRevealVote();
                  }
                }}
                className="btn-warning w-full sm:w-auto px-8"
              >
              <span className="inline-flex items-center gap-2">
                {isRevealing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isRevealing ? 'Revealing...' : t('voter.revealVote')}
              </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 2 && (
        /* Finished Phase - Show completion message */
        <div className="card-premium p-8 text-center">
          <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            {t('voter.electionComplete')}
          </h2>
          <p className="text-slate-600 max-w-md mx-auto">
            {t('voter.electionFinished')}
          </p>
        </div>
      )}

      {/* Commit Confirmation Modal */}
      {showCommitModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="card-premium p-8 w-full max-w-md mx-auto">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Vote Committed Successfully!
                </h3>
                <div className="space-y-3 text-left">
                  <p className="text-sm text-slate-700">
                    Your vote has been committed to the blockchain and is now encrypted and secure.
                  </p>
                  <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-warning-900 mb-2">
                          Important: Remember Your Password
                        </p>
                        <p className="text-sm text-warning-800">
                          Please wait for the phase to change to <strong>Reveal</strong>. 
                          You will need to enter the <strong>exact same password</strong> you used 
                          during commit to reveal your vote.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowCommitModal(false)}
                className="btn-primary w-full"
              >
                <CheckCircle className="w-4 h-4" />
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voter;
