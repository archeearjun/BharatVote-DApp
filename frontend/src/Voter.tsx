import React, { useState, useEffect } from 'react';
import { useI18n } from './i18n';
import { Buffer } from 'buffer';
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
// KYC components removed as they're handled in App.tsx

// Create a safe Buffer utility that ensures Buffer is available
const getSafeBuffer = () => {
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    return Buffer;
  }
  if (typeof (window as any).Buffer !== 'undefined' && typeof (window as any).Buffer.from === 'function') {
    return (window as any).Buffer;
  }
  if (typeof (globalThis as any).Buffer !== 'undefined' && typeof (globalThis as any).Buffer.from === 'function') {
    return (globalThis as any).Buffer;
  }
  throw new Error('Buffer is not available anywhere. Cannot proceed.');
};

// Ensure Buffer is available globally for merkletreejs AFTER imports
if (typeof window !== 'undefined') {
  try {
    const safeBuffer = getSafeBuffer();
    if (!(window as any).Buffer) {
      (window as any).Buffer = safeBuffer;
      console.log('Voter: Buffer successfully polyfilled to window.Buffer');
    }
  } catch (error) {
    console.error('Voter: Failed to polyfill Buffer:', error);
  }
}

// Verify critical dependencies are available
if (typeof MerkleTree === 'undefined') {
  console.error('CRITICAL: MerkleTree is not available!');
}
if (typeof ethers === 'undefined') {
  console.error('CRITICAL: ethers is not available!');
}
if (typeof Buffer === 'undefined') {
  console.error('CRITICAL: Buffer is not available!');
}

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
  voterId,
  onRevealSuccess,
  candidates = [],
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

  // Merkle tree setup for voter verification
  const [merkleTree, setMerkleTree] = useState<MerkleTree | null>(null);
  const [isEligible, setIsEligible] = useState(false);

  // Immediate check for Buffer availability
  useEffect(() => {
    console.log('DEBUG Voter: Immediate Buffer check:');
    console.log('DEBUG Voter: typeof Buffer:', typeof Buffer);
    console.log('DEBUG Voter: typeof window.Buffer:', typeof (window as any).Buffer);
    console.log('DEBUG Voter: typeof globalThis.Buffer:', typeof (globalThis as any).Buffer);
    console.log('DEBUG Voter: Buffer.from available:', typeof Buffer?.from);
    console.log('DEBUG Voter: window.Buffer.from available:', typeof (window as any).Buffer?.from);
    console.log('DEBUG Voter: MerkleTree available:', typeof MerkleTree);
    console.log('DEBUG Voter: ethers available:', typeof ethers);
    
    // Test Buffer functionality
    try {
      if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
        const testBuffer = Buffer.from('test', 'utf8');
        console.log('DEBUG Voter: Buffer.from test successful:', testBuffer);
      } else {
        console.error('DEBUG Voter: Buffer.from test failed - Buffer.from not available');
      }
      
      if (typeof (window as any).Buffer !== 'undefined' && typeof (window as any).Buffer.from === 'function') {
        const testWindowBuffer = (window as any).Buffer.from('test', 'utf8');
        console.log('DEBUG Voter: window.Buffer.from test successful:', testWindowBuffer);
      } else {
        console.error('DEBUG Voter: window.Buffer.from test failed - window.Buffer.from not available');
      }
    } catch (error) {
      console.error('DEBUG Voter: Buffer functionality test failed:', error);
    }
    
    // Ensure Buffer is available globally if it wasn't before
    if (typeof Buffer !== 'undefined' && typeof (window as any).Buffer === 'undefined') {
      (window as any).Buffer = Buffer;
      console.log('DEBUG Voter: Buffer polyfilled to window.Buffer');
    }
  }, []);

  // Check if critical dependencies are available
  if (typeof Buffer === 'undefined' && typeof (window as any).Buffer === 'undefined') {
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
          <div className="text-xs text-gray-500">
            Debug: Buffer = {typeof Buffer}, window.Buffer = {typeof (window as any).Buffer}
          </div>
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
          <div className="text-xs text-gray-500">
            Debug: MerkleTree = {typeof MerkleTree}
          </div>
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
    console.log('DEBUG Voter useEffect: voterId changed to:', voterId);
    console.log('DEBUG Voter useEffect: contract available:', !!contract);
    console.log('DEBUG Voter useEffect: Buffer available:', typeof Buffer);
    console.log('DEBUG Voter useEffect: window.Buffer available:', typeof (window as any).Buffer);
    
    const initializeMerkleTree = async () => {
      try {
        console.log('DEBUG: Starting Merkle tree initialization');
        console.log('DEBUG: voterId:', voterId);
        console.log('DEBUG: contract:', contract);
        console.log('DEBUG: Buffer type:', typeof Buffer);
        console.log('DEBUG: Buffer.from available:', typeof Buffer.from);
        console.log('DEBUG: window.Buffer type:', typeof (window as any).Buffer);
        console.log('DEBUG: window.Buffer.from available:', typeof (window as any).Buffer?.from);
        
        // Critical Buffer availability check
        if (typeof Buffer === 'undefined' && typeof (window as any).Buffer === 'undefined') {
          throw new Error('Buffer is not available anywhere. Cannot proceed with Merkle tree initialization.');
        }
        const BufferToUse = getSafeBuffer();
        console.log('DEBUG: Using Buffer in initializeMerkleTree:', BufferToUse === Buffer ? 'imported Buffer' : 'window.Buffer');
        
        if (!voterId || voterId === '') {
          console.log('DEBUG: No voterId or empty voterId, skipping initialization');
          console.log('DEBUG: voterId type:', typeof voterId);
          console.log('DEBUG: voterId value:', JSON.stringify(voterId));
          return;
        }
        
        if (!contract) {
          console.log('DEBUG: No contract, skipping initialization');
          return;
        }

        // Get eligible voters from the contract's merkle root instead of hardcoded list
        // For now, we'll use the eligibleVoters.json file, but this should ideally come from the contract
        const eligibleVoters = [
          "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
          "0x0000000000000000000000000000000000000002",
          "0x0000000000000000000000000000000000000003",
          "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
        ];

        console.log('DEBUG: Eligible voters:', eligibleVoters);
        console.log('DEBUG: Current voter address:', voterId);
        console.log('DEBUG: Is voterId a valid address?', ethers.isAddress(voterId));
        console.log('DEBUG: voterId length:', voterId.length);
        console.log('DEBUG: voterId starts with 0x?', voterId.startsWith('0x'));

        // Log whether the voter appears in the list, but do not early-return.
        const isInEligibleList = eligibleVoters.some(addr => addr.toLowerCase().trim() === voterId.toLowerCase().trim());
        console.log('DEBUG: Is voter in eligible list?', isInEligibleList);

        // Create keccak256 hasher function
        const keccak256Hasher = (data: string | Buffer) => {
          try {
            // Get safe Buffer
            const safeBuffer = getSafeBuffer();
            console.log('DEBUG: keccak256Hasher called with:', typeof data, data);
            console.log('DEBUG: Using safe Buffer:', safeBuffer === Buffer ? 'imported Buffer' : 'window.Buffer');
            
            if (typeof data === 'string') {
              // For leaves (addresses), hash them using solidityPackedKeccak256
              const result = ethers.solidityPackedKeccak256(['address'], [data.toLowerCase()]);
              console.log('DEBUG: String hash result:', result);
              const buffer = safeBuffer.from(result.substring(2), 'hex');
              console.log('DEBUG: Created buffer:', buffer);
              return buffer;
            } else if (safeBuffer.isBuffer(data)) {
              // If data is a Buffer (from MerkleTree internal operations), hash it using keccak256
              const result = ethers.keccak256(data);
              console.log('DEBUG: Buffer hash result:', result);
              const buffer = safeBuffer.from(result.substring(2), 'hex');
              console.log('DEBUG: Created buffer from buffer:', buffer);
              return buffer;
            } else {
              throw new Error("Invalid data type for keccak256Hasher: Expected string or Buffer");
            }
          } catch (error) {
            console.error('DEBUG: Error in keccak256Hasher:', error);
            throw error;
          }
        };

        console.log('DEBUG: Creating Merkle tree...');
        const leaves = eligibleVoters.map(addr => keccak256Hasher(addr.toLowerCase()));
        console.log('DEBUG: Leaves created:', leaves.length);
        
        const tree = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
        console.log('DEBUG: Merkle tree created');
        
        setMerkleTree(tree);
        
        // Check if current voter is eligible
        console.log('DEBUG: Checking voter eligibility for:', voterId);
        const hashedAddress = ethers.solidityPackedKeccak256(['address'], [voterId.toLowerCase()]);
        const hashedBuffer = BufferToUse.from(hashedAddress.substring(2), 'hex');
        console.log('DEBUG: Hashed address:', hashedAddress);
        
        const proof = tree.getProof(hashedBuffer);
        console.log('DEBUG: Proof generated:', proof.length, 'elements');
        
        const isVoterEligible = tree.verify(proof, hashedBuffer, tree.getRoot());
        console.log('DEBUG: Voter eligibility result:', isVoterEligible);
        
        setIsEligible(isVoterEligible);
        
        console.log('DEBUG: Merkle tree initialization completed successfully');
      } catch (error) {
        console.error('DEBUG: Error initializing Merkle tree:', error);
        // Set a fallback state to prevent the component from being completely broken
        setIsEligible(false);
      }
    };

    initializeMerkleTree();
    checkVoteStatus();
  }, [contract, voterId]);

  const checkVoteStatus = async () => {
    if (!contract || !voterId) {
      console.log('DEBUG checkVoteStatus: Early return - contract:', !!contract, 'voterId:', !!voterId);
      return;
    }
    try {
      console.log('DEBUG checkVoteStatus: Checking status for voter:', voterId);
      console.log('DEBUG checkVoteStatus: Contract available:', !!contract);
      console.log('DEBUG checkVoteStatus: VoterId:', voterId);
      console.log('DEBUG checkVoteStatus: Contract methods available:', Object.keys(contract));
      console.log('DEBUG checkVoteStatus: getVoterStatus method available:', typeof contract.getVoterStatus);
      
      const [committed, revealed] = await contract.getVoterStatus(voterId);
      console.log('DEBUG checkVoteStatus: Contract returned - committed:', committed, 'revealed:', revealed);
      console.log('DEBUG checkVoteStatus: Types - committed:', typeof committed, 'revealed:', typeof revealed);
      
      setHasVoted(committed);
      setHasRevealed(revealed);
      console.log('DEBUG checkVoteStatus: State updated - hasVoted:', committed, 'hasRevealed:', revealed);

      // Privacy: no local persistence used

      // Hydrate locally stored commit hash from chain so reveal comparisons are accurate even after refresh
      try {
        const onchainCommit: string = await contract.commits(voterId);
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

  const handleCommitVote = async () => {
    console.log('DEBUG handleCommitVote: Starting vote commitment');
    console.log('DEBUG handleCommitVote: selectedCandidateId:', selectedCandidateId);
    console.log('DEBUG handleCommitVote: salt:', salt);
    console.log('DEBUG handleCommitVote: contract available:', !!contract);
    console.log('DEBUG handleCommitVote: merkleTree available:', !!merkleTree);
    console.log('DEBUG handleCommitVote: Buffer available:', typeof Buffer);
    console.log('DEBUG handleCommitVote: window.Buffer available:', typeof (window as any).Buffer);
    
    if (selectedCandidateId === null || !salt.trim()) {
      console.log('DEBUG handleCommitVote: Missing candidate or salt');
      return;
    }
    if (!contract) {
      console.log('DEBUG handleCommitVote: No contract available');
      setError('Wallet not connected or contract unavailable');
      return;
    }
    if (!merkleTree) {
      console.log('DEBUG handleCommitVote: No merkleTree available');
      setError('Preparing voter eligibility… please try again in a moment');
      return;
    }

    setIsCommitting(true);
    setError(null);

    try {
      console.log('DEBUG handleCommitVote: Calling hashVote...');
      const { commitHash } = await hashVote(selectedCandidateId, salt.trim());
      console.log('DEBUG handleCommitVote: hashVote completed, commitHash:', commitHash);
      
      // Generate Merkle proof using the initialized tree
      console.log('DEBUG handleCommitVote: Generating Merkle proof...');
      const hashedAddress = ethers.solidityPackedKeccak256(['address'], [voterId.toLowerCase()]);
      console.log('DEBUG handleCommitVote: Hashed address:', hashedAddress);
      
      // Use the most available Buffer
      const BufferToUse = getSafeBuffer();
      if (!BufferToUse || typeof BufferToUse.from !== 'function') {
        throw new Error('Buffer.from is not available. Cannot generate Merkle proof.');
      }
      
      const hashedBuffer = BufferToUse.from(hashedAddress.substring(2), 'hex');
      console.log('DEBUG handleCommitVote: Hashed buffer created:', hashedBuffer);
      const proof = merkleTree.getProof(hashedBuffer).map(x => '0x' + x.data.toString('hex'));
      console.log('DEBUG handleCommitVote: Merkle proof generated:', proof);

      console.log('DEBUG: Committing vote with hash:', commitHash);
      console.log('DEBUG: Merkle proof:', proof);
      console.log('DEBUG: Voter ID:', voterId);

      console.log('DEBUG handleCommitVote: Calling contract.commitVote...');
      const tx = await contract.commitVote(commitHash, proof);
      console.log('DEBUG handleCommitVote: Transaction sent, waiting for confirmation...');
      await tx.wait();
      console.log('DEBUG handleCommitVote: Transaction confirmed!');

      setVoteHash(commitHash);
      setHasVoted(true);
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
      if (msg.includes('missing revert data') || msg.includes('gas')) {
        msg = 'Network error: Please ensure you are connected to the correct blockchain network and have sufficient ETH for gas fees.';
      } else if (msg.includes('execution reverted')) {
        msg = 'Transaction failed: Please check if you are eligible to vote and haven\'t already voted in this phase.';
      } else if (msg.includes('user rejected')) {
        msg = 'Transaction cancelled by user.';
      }
      
      setError(msg);
    } finally {
      setIsCommitting(false);
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
    if (selectedCandidateId === null || !salt.trim()) return;

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
        const onchainCommit: string = await contract.commits(voterId);
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
  const canCommit = selectedCandidateId !== null && !!salt.trim() && !isCommitting && !hasVoted && phase === 0;
  const canReveal = selectedCandidateId !== null && !!salt.trim() && !isRevealing && hasVoted && !hasRevealed && phase === 1;

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
    merkleTree: !!merkleTree,
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
    console.log('DEBUG: selectedCandidateId:', selectedCandidateId);
    console.log('DEBUG: salt:', salt);
    console.log('DEBUG: salt.trim():', salt.trim());
    console.log('DEBUG: salt.trim().length:', salt.trim().length);
    console.log('DEBUG: canCommit:', canCommit);
    console.log('DEBUG: contract available:', !!contract);
    console.log('DEBUG: merkleTree available:', !!merkleTree);
    
    if (!canCommit) {
      console.log('DEBUG: Button disabled, cannot commit');
      return;
    }
    
    handleCommitVote();
  };

  // Critical dependency checks
  if (typeof MerkleTree === 'undefined') {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-error-600 mb-3">
            Critical Error: MerkleTree Not Available
          </h2>
          <p className="text-slate-700">
            The MerkleTree library is not loaded. Please refresh the page or check your internet connection.
          </p>
        </div>
      </div>
    );
  }

  try {
    getSafeBuffer(); // This will throw if Buffer is not available
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-error-600 mb-3">
            Critical Error: Buffer Not Available
          </h2>
          <p className="text-slate-700 mb-4">
            The Buffer polyfill is not loaded. Please refresh the page or check your internet connection.
          </p>
          <p className="text-sm text-slate-500">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

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
              className="btn-primary w-full sm:w-auto"
            >
              {isCommitting ? (
                <>
                  <div className="spinner" />
                  {t('voter.committing')}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {t('voter.commitVote')}
                </>
              )}
            </button>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Candidate Selection */}
            <div>
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
                {isRevealing ? (
                  <>
                    <div className="spinner" />
                    {t('voter.revealing')}
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    {t('voter.revealVote')}
                  </>
                )}
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
                  <div className="badge badge-success">
                    {t('common.active')}
                  </div>
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
