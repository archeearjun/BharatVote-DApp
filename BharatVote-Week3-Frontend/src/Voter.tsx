import React, { useState, useEffect } from 'react';
import { useI18n } from './i18n';
import type { Buffer } from 'buffer';
import {
  CheckCircle,
  Lock,
  Unlock,
  Vote,
  Users,
  Shield,
  CheckSquare,
  User,
  AlertTriangle,
  X,
  Shuffle
} from 'lucide-react';
import { MerkleTree } from 'merkletreejs';
import { ethers } from 'ethers';

// Rely on global polyfills (see src/polyfills.ts) for Buffer/window globals

// sanity logs (non-fatal)
if (typeof MerkleTree === 'undefined') console.error('CRITICAL: MerkleTree is not available!');
if (typeof ethers === 'undefined') console.error('CRITICAL: ethers is not available!');
// Buffer provided via global polyfills

interface VoterProps {
  contract: any;
  phase: number;
  setPhase: (phase: number) => void;
  voterId: string;
  onRevealSuccess: () => void;
  candidates?: any[];
}

const Voter: React.FC<VoterProps> = ({
  contract,
  phase,
  setPhase,
  voterId,
  onRevealSuccess,
  candidates = [],
}) => {
  const { t } = useI18n();

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

  // Merkle tree setup for voter verification
  const [merkleTree, setMerkleTree] = useState<MerkleTree | null>(null);
  const [isEligible, setIsEligible] = useState(false);

  // Rely on global polyfill; no component-scoped Buffer manipulation
  useEffect(() => {
    // noop
  }, []);

  // Critical dependency early exits
  if (typeof (window as any).Buffer === 'undefined') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Critical Error: Buffer Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">The application cannot function without Buffer support. Please refresh the page.</p>
        </div>
      </div>
    );
  }
  if (typeof MerkleTree === 'undefined') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Critical Error: MerkleTree Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">The application cannot function without MerkleTree support. Please refresh the page.</p>
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
    const initializeMerkleTree = async () => {
      try {
        if (!voterId || !contract) return;

        // TEMP Week-3 allowlist (replace with contract-provided list in Week-4)
        const eligibleVoters = [
          "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
          "0x0000000000000000000000000000000000000002",
          "0x0000000000000000000000000000000000000003",
          "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
        ];

        const keccak256Hasher = (data: string | Buffer) => {
          if (typeof data === 'string') {
            const result = ethers.solidityPackedKeccak256(['address'], [data.toLowerCase()]);
            return (window as any).Buffer.from(result.slice(2), 'hex');
          } else if ((window as any).Buffer?.isBuffer?.(data)) {
            const result = ethers.keccak256(data);
            return (window as any).Buffer.from(result.slice(2), 'hex');
          }
          throw new Error('Invalid data for keccak256Hasher');
        };

        const leaves = eligibleVoters.map(addr => keccak256Hasher(addr.toLowerCase()));
        const tree = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
        setMerkleTree(tree);

        const hashedAddress = ethers.solidityPackedKeccak256(['address'], [voterId.toLowerCase()]);
        const hashedBuffer = (window as any).Buffer.from(hashedAddress.slice(2), 'hex');
        const proof = tree.getProof(hashedBuffer);
        const eligible = tree.verify(proof, hashedBuffer, tree.getRoot());
        setIsEligible(eligible);
      } catch (error) {
        console.error('DEBUG: Error initializing Merkle tree:', error);
        setIsEligible(false);
      }
    };

    initializeMerkleTree();
    checkVoteStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, voterId]);

  const checkVoteStatus = async () => {
    if (!contract || !voterId) return;
    try {
      if (typeof contract.getVoterStatus !== 'function') {
        throw new Error('getVoterStatus not found on current ABI/address');
      }

      const res = await contract.getVoterStatus(voterId);
      // Resilient to both tuple array returns and named object returns
      const committed = Boolean(res?.[0] ?? res?.committed);
      const revealed = Boolean(res?.[1] ?? res?.revealed);

      setHasVoted(committed);
      setHasRevealed(revealed);

      // Try to refresh phase from chain (optional)
      try {
        if (typeof contract.getPhase === 'function') {
          const onchainPhase = Number(await contract.getPhase());
          if (!Number.isNaN(onchainPhase)) setPhase(onchainPhase);
        } else if (typeof contract.phase === 'function') {
          const onchainPhase = Number(await contract.phase());
          if (!Number.isNaN(onchainPhase)) setPhase(onchainPhase);
        }
      } catch (e) {
        console.warn('DEBUG: could not fetch phase:', e);
      }

      // Hydrate commit hash (for local verify before reveal)
      try {
        const onchainCommit: string = await contract.commits(voterId);
        if (onchainCommit && onchainCommit !== '0x' && onchainCommit !== '0x'.padEnd(66, '0')) {
          setVoteHash(onchainCommit);
        }
      } catch (innerErr) {
        console.warn('DEBUG: Failed to read on-chain commit hash:', innerErr);
      }
    } catch (err: any) {
      const msg = err?.shortMessage || err?.reason || err?.message || String(err);
      console.error('Error checking vote status:', msg, err);
      if (msg.includes('decode result') || msg.includes('CALL_EXCEPTION')) {
        console.warn('Hint: ABI/address mismatch or wrong return shape. Ensure frontend uses the freshly written BharatVote.json.');
      }
    }
  };

  const generateSalt = () =>
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const hashVote = async (candidateIdNumber: number, plainSalt: string) => {
    if (candidateIdNumber === null || candidateIdNumber === undefined) {
      throw new Error('Candidate not selected');
    }
    const candidateId = BigInt(candidateIdNumber);
    const saltBytes32 = ethers.keccak256(ethers.toUtf8Bytes(plainSalt));
    const commitHash = ethers.solidityPackedKeccak256(['uint256', 'bytes32'], [candidateId, saltBytes32]);
    return { commitHash, saltBytes32 };
  };

  const handleCommitVote = async () => {
    if (selectedCandidateId === null || !salt.trim()) return;
    if (!contract) {
      setError('Wallet not connected or contract unavailable');
      return;
    }
    if (!merkleTree) {
      setError('Preparing voter eligibility… please try again in a moment');
      return;
    }

    setIsCommitting(true);
    setError(null);

    try {
      const { commitHash } = await hashVote(selectedCandidateId, salt.trim());

      // Generate Merkle proof
      const hashedAddress = ethers.solidityPackedKeccak256(['address'], [voterId.toLowerCase()]);
      const hashedBuffer = (window as any).Buffer.from(hashedAddress.slice(2), 'hex');
      const proof = merkleTree.getProof(hashedBuffer).map((x: any) => '0x' + x.data.toString('hex'));

      const tx = await contract.commitVote(commitHash, proof);
      await tx.wait();

      setVoteHash(commitHash);
      setHasVoted(true);
      setSuccess('Vote committed successfully! Your vote is now encrypted and secure.');
      setShowCommitModal(true);

      await checkVoteStatus();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('DEBUG: Vote commitment error:', err);
      let msg = err?.reason || err?.message || 'Failed to commit vote';
      if (msg.includes('missing revert data') || msg.includes('gas')) {
        msg = 'Network error: Please ensure you are on the correct network and have sufficient ETH for gas.';
      } else if (msg.includes('execution reverted')) {
        msg = 'Transaction failed: Check your eligibility or whether you already committed.';
      } else if (msg.includes('user rejected')) {
        msg = 'Transaction cancelled by user.';
      }
      setError(msg);
    } finally {
      setIsCommitting(false);
    }
  };

  // On entering Reveal phase, clear inputs and re-sync status
  useEffect(() => {
    if (phase === 1) {
      setSelectedCandidateId(null);
      setSalt('');
      setShowCommitModal(false);
      checkVoteStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleRevealVote = async () => {
    if (selectedCandidateId === null || !salt.trim()) return;

    setIsRevealing(true);
    setError(null);

    try {
      if (!hasVoted) throw new Error('You must commit a vote before revealing.');
      if (hasRevealed) throw new Error('You have already revealed your vote.');

      // Always fetch latest commit hash
      let storedHash = voteHash;
      try {
        const onchainCommit: string = await contract.commits(voterId);
        if (onchainCommit) storedHash = onchainCommit;
      } catch (readErr) {
        console.warn('DEBUG handleRevealVote: Failed to read on-chain commit hash:', readErr);
      }

      const { commitHash: expectedCommitHash } = await hashVote(selectedCandidateId, salt.trim());
      if (!storedHash || expectedCommitHash.toLowerCase() !== storedHash.toLowerCase()) {
        throw new Error('Hash mismatch! Use the same candidate and password you used during commit.');
      }

      const candidateId = BigInt(selectedCandidateId);
      const bytes32Salt = ethers.keccak256(ethers.toUtf8Bytes(salt.trim()));
      const tx = await contract.revealVote(candidateId, bytes32Salt);
      await tx.wait();

      setSuccess('Vote revealed successfully! Your vote has been counted.');
      onRevealSuccess();
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

  const handleNewSalt = () => setSalt(generateSalt());

  const canCommit = selectedCandidateId !== null && !!salt.trim() && !isCommitting && !hasVoted && phase === 0;
  const canReveal = selectedCandidateId !== null && !!salt.trim() && !isRevealing && hasVoted && !hasRevealed && phase === 1;

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
        </div>
      </div>
    );
  }

  const currentPhase = phases.find(p => p.id === phase) || phases[0];

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
            <div className={`badge ${isEligible ? 'badge-success' : 'badge-error'}`}>
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">{isEligible ? t('voter.eligible') : t('voter.notEligible')}</span>
              <span className="sm:hidden">{isEligible ? 'Eligible' : 'Not Eligible'}</span>
            </div>
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
            <button onClick={() => setError(null)} className="text-error-600 hover:text-error-700">
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
            <button onClick={() => setSuccess(null)} className="text-success-600 hover:text-success-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Commit Phase */}
      {phase === 0 && (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Candidate Selection */}
            <div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 mb-4">
                  Select Candidate
                </label>
                <div role="radiogroup" aria-label="Select candidate" className="grid grid-cols-1 gap-3">
                  {candidates.map((c: any) => {
                    const candidateId = Number(c.id);
                    const isSelected = selectedCandidateId === candidateId;
                    const initials = c.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                    const handleSelect = (e: React.MouseEvent | React.KeyboardEvent) => {
                      e.preventDefault();
                      setSelectedCandidateId(candidateId);
                    };

                    const handleKeyDown = (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelect(e);
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
                          ${isSelected ? 'bg-slate-50 ring-2 ring-slate-900 shadow-sm' : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98]'}
                        `}
                        style={{ userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'} flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm`}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 id={`candidate-commit-${candidateId}-name`} className="text-base font-semibold text-slate-900 truncate">
                              {c.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Candidate ID: {String(c.id)}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">Selected</span>
                                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
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
                <button onClick={handleNewSalt} className="btn-ghost text-sm" title="Generate a random salt (you can still change it)">
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
                      Remember this exact password — you’ll need it during the reveal phase.
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
                    <p className="text-sm font-semibold text-success-900 mb-1">Vote Already Committed</p>
                    <p className="text-sm text-success-800">
                      Your vote has been committed. Please wait for the Reveal phase to reveal your vote.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <button
              disabled={!canCommit}
              onClick={handleCommitVote}
              className="btn-primary w-full sm:w-auto"
            >
              {isCommitting ? (<><div className="spinner" />{t('voter.committing')}</>) : (<><Lock className="w-4 h-4" />{t('voter.commitVote')}</>)}
            </button>
          </div>
        </div>
      )}

      {/* Reveal Phase */}
      {phase === 1 && (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Candidate Selection */}
            <div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 mb-4">
                  {t('voter.selectCandidateVotedFor')}
                </label>
                <div role="radiogroup" aria-label="Select candidate" className="grid grid-cols-1 gap-3">
                  {candidates.map((c: any) => {
                    const candidateId = Number(c.id);
                    const isSelected = selectedCandidateId === candidateId;
                    const initials = c.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                    const handleSelect = (e: React.MouseEvent | React.KeyboardEvent) => {
                      e.preventDefault();
                      setSelectedCandidateId(candidateId);
                    };
                    const handleKeyDown = (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelect(e);
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
                          ${isSelected ? 'bg-blue-50/70 ring-2 ring-blue-500 shadow-sm' : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98]'}
                        `}
                        style={{ userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'} flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm`}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 id={`candidate-${candidateId}-name`} className="text-base font-semibold text-slate-900 truncate">
                              {c.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Candidate ID: {String(c.id)}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Selected</span>
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
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

                <p className="text-xs text-slate-500 mt-4 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{t('voter.selectSameCandidate')}</span>
                </p>
              </div>
            </div>

            {/* Salt Input */}
            <div>
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
                onClick={handleRevealVote}
                className="btn-warning w-full sm:w-auto px-8"
              >
                {isRevealing ? (<><div className="spinner" />{t('voter.revealing')}</>) : (<><Unlock className="w-4 h-4" />{t('voter.revealVote')}</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finished Phase */}
      {phase === 2 && (
        <div className="card-premium p-8 text-center">
          <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            {t('voter.electionComplete')}
          </h2>
          <p className="text-slate-600 max-w-md mx-auto">
            {t('voter.electionFinished')}
          </p>
        </div>
      )}

      {/* Candidates List */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t('voter.candidates')}</h2>
            <p className="text-sm text-slate-600">
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} registered
            </p>
          </div>
        </div>

        {candidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                  <div className="badge badge-success">{t('common.active')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{candidate.name}</h3>
                    <p className="text-sm text-slate-600">ID: {candidate.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">{t('voter.noCandidatesAvailable')}</p>
            <p className="text-sm text-slate-500">{t('voter.candidatesNeedAdmin')}</p>
          </div>
        )}
      </div>

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
              <button onClick={() => setShowCommitModal(false)} className="btn-primary w-full">
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
