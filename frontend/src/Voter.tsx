import React, { useState, useEffect } from 'react';
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
  Loader2,
  Sparkles
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
  onRevealSuccess,
  candidates = [],
  onCommitSuccess,
  onStatusChange,
}) => {
  const { t } = useI18n();
  console.log('DEBUG Voter: Component rendered with props:');
  console.log('DEBUG Voter: voterId:', voterId);
  console.log('DEBUG Voter: contract available:', !!contract);
  console.log('DEBUG Voter: phase:', phase);
  console.log('DEBUG Voter: Received candidates:', candidates);
  console.log('DEBUG Voter: Candidates length:', candidates.length);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [voteHash, setVoteHash] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [salt, setSalt] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCommitModal, setShowCommitModal] = useState(false);

  const [isEligible, setIsEligible] = useState(false);
  const [isFetchingProof, setIsFetchingProof] = useState(false);

  // Validate wallet/account presence early
  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  const phases = [
    { id: 0, label: t('voter.commit'), description: t('voter.submitEncryptedVote'), icon: Lock },
    { id: 1, label: t('voter.reveal'), description: t('voter.revealActualVote'), icon: Unlock },
    { id: 2, label: t('voter.finished'), description: t('voter.electionCompleted'), icon: CheckSquare }
  ];

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
        console.error('DEBUG Voter: eligibility check failed', err);
        setIsEligible(false);
      }
    };

    checkEligibility();
    checkVoteStatus();
  }, [contract, account, electionAddress, isDemoElection]);

  const checkVoteStatus = async () => {
    if (!contract || !account) {
      console.log('DEBUG checkVoteStatus: Early return - contract:', !!contract, 'account:', !!account);
      return;
    }
    try {
      console.log('DEBUG checkVoteStatus: Checking status for voter:', account);
      console.log('DEBUG checkVoteStatus: Contract available:', !!contract);
      console.log('DEBUG checkVoteStatus: Account:', account);
      console.log('DEBUG checkVoteStatus: Contract methods available:', Object.keys(contract));
      console.log('DEBUG checkVoteStatus: getVoterStatus method available:', typeof contract.getVoterStatus);
      
      const [committed, revealed] = await contract.getVoterStatus(account);
      console.log('DEBUG checkVoteStatus: Contract returned - committed:', committed, 'revealed:', revealed);
      console.log('DEBUG checkVoteStatus: Types - committed:', typeof committed, 'revealed:', typeof revealed);
      
      setHasVoted(committed);
      setHasRevealed(revealed);
      console.log('DEBUG checkVoteStatus: State updated - hasVoted:', committed, 'hasRevealed:', revealed);
      onStatusChange?.({ committed, revealed });

      // Privacy: no local persistence used

      // Hydrate locally stored commit hash from chain so reveal comparisons are accurate even after refresh
      try {
        const onchainCommit: string = await contract.commits(account);
        console.log('DEBUG checkVoteStatus: On-chain commit hash:', onchainCommit);
        if (onchainCommit && onchainCommit !== '0x' && onchainCommit !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          setVoteHash(onchainCommit);
        }
      } catch (innerErr) {
        console.warn('DEBUG checkVoteStatus: Failed to read on-chain commit hash:', innerErr);
      }
    } catch (err) {
      console.error('Error checking vote status:', err);
      console.error('Error details:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    }
  };

  const generateSalt = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
    console.log('DEBUG handleCommitVote: Starting vote commitment');
    console.log('DEBUG handleCommitVote: selectedCandidateId:', selectedCandidateId);
    console.log('DEBUG handleCommitVote: salt:', salt);
    console.log('DEBUG handleCommitVote: contract available:', !!contract);
    console.log('DEBUG handleCommitVote: voterId:', voterId);
    console.log('DEBUG handleCommitVote: account:', account);
    
    if (selectedCandidateId === null || !salt.trim()) {
      setError('Select a candidate and enter a salt (secret phrase) before committing.');
      return;
    }
    if (!contract) {
      console.log('DEBUG handleCommitVote: No contract available');
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
      console.log('DEBUG handleCommitVote: Calling hashVote...');
      const { commitHash } = await hashVote(selectedCandidateId, salt.trim());
      console.log('DEBUG handleCommitVote: hashVote completed, commitHash:', commitHash);

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

      // Fetch Merkle proof from backend using verified voterId
      console.log('DEBUG handleCommitVote: Fetching Merkle proof from backend...');
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
      if (!proof || !Array.isArray(proof) || proof.length === 0) {
        throw new Error('Empty Merkle proof from backend.');
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

      console.log('DEBUG: Committing vote with hash:', commitHash);
      console.log('DEBUG: Merkle proof:', proof);
      console.log('DEBUG: Voter Address:', account);

      console.log('DEBUG handleCommitVote: Calling contract.commitVote...');
      const tx = await contract.commitVote(commitHash, proof);
      console.log('DEBUG handleCommitVote: Transaction sent, waiting for confirmation...');
      await tx.wait();
      console.log('DEBUG handleCommitVote: Transaction confirmed!');

      setVoteHash(commitHash);
      setHasVoted(true);
      onCommitSuccess?.();
      setSuccess('Vote committed successfully! Your vote is now encrypted and secure.');
      setShowCommitModal(true);

      // Do not store any candidate/salt locally to preserve privacy

      // Update vote status from contract
      await checkVoteStatus();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('DEBUG: Vote commitment error:', err);
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

  // Privacy: when entering reveal phase, ensure nothing is prefilled
  // Also check vote status to update hasVoted state
  useEffect(() => {
    if (phase === 1) {
      setSelectedCandidateId(null);
      setSalt('');
      // Close commit modal if it's still open
      setShowCommitModal(false);
      // Check vote status when entering reveal phase
      checkVoteStatus();
    }
  }, [phase]);

  const handleRevealVote = async () => {
    if (selectedCandidateId === null || !salt.trim()) {
      setError('Select the same candidate and enter the exact salt you used when committing.');
      return;
    }

    setIsRevealing(true);
    setError(null);

    try {
      console.log('DEBUG handleRevealVote: Starting vote reveal');
      console.log('DEBUG handleRevealVote: selectedCandidateId:', selectedCandidateId);
      console.log('DEBUG handleRevealVote: salt:', salt);
      console.log('DEBUG handleRevealVote: contract available:', !!contract);
      
      // Check if user has committed a vote
      if (!hasVoted) {
        throw new Error('You must commit a vote before revealing. Please go back to the commit phase and commit your vote first.');
      }

      // Check if user has already revealed their vote
      if (hasRevealed) {
        throw new Error('You have already revealed your vote. You cannot reveal again.');
      }

      // Always fetch latest on-chain committed hash for this voter to avoid stale local state
      let storedHash = voteHash;
      try {
        const onchainCommit: string = await contract.commits(account);
        console.log('DEBUG handleRevealVote: On-chain stored commit hash:', onchainCommit);
        if (onchainCommit) storedHash = onchainCommit;
      } catch (readErr) {
        console.warn('DEBUG handleRevealVote: Failed to read on-chain commit hash:', readErr);
      }

      // Verify the commit hash matches what we're trying to reveal
      const { commitHash: expectedCommitHash } = await hashVote(selectedCandidateId, salt.trim());
      console.log('DEBUG handleRevealVote: Expected commit hash:', expectedCommitHash);
      console.log('DEBUG handleRevealVote: Stored vote hash (local/on-chain):', storedHash);
      
      if (!storedHash || expectedCommitHash.toLowerCase() !== storedHash.toLowerCase()) {
        throw new Error('Hash mismatch! The candidate and salt combination does not match your committed vote. Please ensure you are using the same candidate and salt from the commit phase.');
      }

      // Reveal for the selected candidate id
      const candidateId = BigInt(selectedCandidateId);
      const bytes32Salt = ethers.keccak256(ethers.toUtf8Bytes(salt.trim()));
      
      console.log('DEBUG handleRevealVote: Calling contract.revealVote with:');
      console.log('DEBUG handleRevealVote: - candidateId:', candidateId.toString());
      console.log('DEBUG handleRevealVote: - bytes32Salt:', bytes32Salt);
      
      const tx = await contract.revealVote(candidateId, bytes32Salt);
      console.log('DEBUG handleRevealVote: Transaction sent, waiting for confirmation...');
      await tx.wait();
      console.log('DEBUG handleRevealVote: Transaction confirmed!');
      
      setSuccess('Vote revealed successfully! Your vote has been counted.');
      onRevealSuccess();
      
      // Update vote status from contract
      await checkVoteStatus();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('DEBUG: Vote reveal error:', err);
      const msg = err?.reason || err?.message || 'Failed to reveal vote';
      setError(msg);
    } finally {
      setIsRevealing(false);
    }
  };

  const handleNewSalt = () => {
    setSalt(generateSalt());
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

  // Debug logging for canReveal calculation
  console.log('DEBUG canReveal calculation:', {
    selectedCandidateId,
    saltTrimmed: !!salt.trim(),
    saltValue: salt,
    isRevealing,
    hasVoted,
    hasRevealed,
    phase,
    phaseCheck: phase === 1,
    canReveal
  });

  // Debug logging for render
  console.log('DEBUG Voter Render:', {
    voterId,
    phase,
    hasVoted,
    isEligible,
    candidates: candidates.length,
    selectedCandidateId,
    salt: salt.trim(),
    saltLength: salt.trim().length,
    canCommit,
    canReveal,
    isCommitting,
    contract: !!contract,
    contractMethods: contract ? Object.keys(contract) : 'No contract',
    revealVoteMethod: contract?.revealVote ? 'Available' : 'Not available'
  });

  // Add useEffect to log state changes
  useEffect(() => {
    console.log('DEBUG State change detected:', {
      hasVoted,
      hasRevealed,
      phase,
      selectedCandidateId,
      salt: salt.trim(),
      canReveal
    });
  }, [hasVoted, hasRevealed, phase, selectedCandidateId, salt, canReveal]);

  // Add click handler debugging
  const handleCommitClick = () => {
    console.log('DEBUG: Commit button clicked!');
    if (!canCommit) {
      console.log('DEBUG: Button disabled, cannot commit');
      return;
    }
    handleCommitVote();
  };

  // Error boundary - if there's a critical error, show it
  if (!voterId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Voter ID Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">Please complete KYC verification first.</p>
          <div className="text-xs text-gray-500">
            Debug: voterId = {JSON.stringify(voterId)}
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">Please connect your wallet and ensure the contract is deployed.</p>
          <div className="text-xs text-gray-500">
            Debug: contract = {JSON.stringify(contract)}
          </div>
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
        <div className="card p-4 bg-error-50 border-error-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-error-800 font-medium">Error</p>
              <p className="text-sm text-error-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-error-600 hover:text-error-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="card p-4 bg-success-50 border-success-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-success-800 font-medium">Success</p>
              <p className="text-sm text-success-700 mt-1">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-success-600 hover:text-success-700"
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
                      console.log('DEBUG Commit: Candidate selected:', c.name, 'ID:', candidateId);
                      setSelectedCandidateId(candidateId);
                    };
                    
                    const handleKeyDown = (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSelect(e);
                      }
                    };
                    
                    return (
                      <div
                        key={String(c.id)}
                        role="radio"
                        aria-checked={isSelected}
                        aria-labelledby={`candidate-commit-${candidateId}-name`}
                        tabIndex={0}
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
                <input
                  type="text"
                  placeholder="Enter a memorable phrase for vote security"
                  value={salt}
                  onChange={(e) => setSalt(e.target.value)}
                  className="input-base"
                />
                <p className="text-xs text-slate-500">
                  Any phrase works. You must use the exact same one during reveal.
                </p>
                <button
                  onClick={handleNewSalt}
                  className="btn-ghost text-sm"
                  title="Generate a random salt (you can still change it)"
                >
                  <Shuffle className="w-4 h-4" />
                  Generate Random Password
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
              <p className="mt-2 text-xs text-slate-500">{commitDisabledReason}</p>
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
              <input
                type="text"
                placeholder={t('voter.enterExactSalt')}
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                className="input-base"
              />
              <p className="text-xs text-slate-500 mt-3">
                Enter the exact same password you used during the commit phase.
              </p>
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
                      console.log('DEBUG Reveal: Candidate selected:', c.name, 'ID:', candidateId);
                      setSelectedCandidateId(candidateId);
                    };
                    
                    const handleKeyDown = (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSelect(e);
                      }
                    };
                    
                    return (
                      <div
                        key={String(c.id)}
                        role="radio"
                        aria-checked={isSelected}
                        aria-labelledby={`candidate-${candidateId}-name`}
                        tabIndex={0}
                        onClick={handleSelect}
                        onKeyDown={handleKeyDown}
                        className={`
                          relative group
                          min-h-[56px] p-4 rounded-2xl
                          cursor-pointer
                          transition-all duration-150 ease-out
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
                          ${isSelected 
                            ? 'bg-blue-50/70 ring-2 ring-blue-500 shadow-sm' 
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
                              ? 'bg-blue-500 text-white' 
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
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  Selected
                                </span>
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-in fade-in zoom-in duration-150">
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
                  console.log('DEBUG: Reveal button clicked!');
                  console.log('DEBUG: selectedCandidateId:', selectedCandidateId);
                  console.log('DEBUG: salt:', salt);
                  console.log('DEBUG: canReveal:', canReveal);
                  console.log('DEBUG: contract available:', !!contract);
                  console.log('DEBUG: phase:', phase);
                  console.log('DEBUG: hasVoted:', hasVoted);
                  console.log('DEBUG: hasRevealed:', hasRevealed);
                  console.log('DEBUG: isRevealing:', isRevealing);
                  if (canReveal) {
                    console.log('DEBUG: Reveal button enabled, calling handleRevealVote');
                    handleRevealVote();
                  } else {
                    console.log('DEBUG: Reveal button disabled, cannot reveal');
                    console.log('DEBUG: Breaking down canReveal conditions:');
                    console.log('DEBUG: - selectedCandidateId !== null:', selectedCandidateId !== null);
                    console.log('DEBUG: - !!salt.trim():', !!salt.trim());
                    console.log('DEBUG: - !isRevealing:', !isRevealing);
                    console.log('DEBUG: - hasVoted:', hasVoted);
                    console.log('DEBUG: - !hasRevealed:', !hasRevealed);
                    console.log('DEBUG: - phase === 1:', phase === 1);
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
