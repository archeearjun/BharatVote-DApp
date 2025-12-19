import { BaseContract } from 'ethers';
import type { ContractTransaction } from 'ethers';

export interface BharatVoteContract extends BaseContract {
  // Admin functions
  admin(): Promise<string>;
  addCandidate(name: string): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  removeCandidate(id: bigint): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  setMerkleRoot(root: string): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  startReveal(): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  finishElection(): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  resetElection(): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  
  // View functions
  phase(): Promise<number>;
  candidateCount(): Promise<bigint>;
  getCandidates(): Promise<Array<{ id: bigint; name: string; isActive: boolean }>>;
  getTally(): Promise<bigint[]>;
  getVotes(id: bigint): Promise<bigint>;
  candidates(id: bigint): Promise<{ id: bigint; name: string; isActive: boolean }>;
  
  // Voting functions (Week 3)
  commitVote(commit: string, proof: string[]): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  revealVote(choice: bigint, salt: string): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  
  // Status checks
  getVoterStatus(voter: string): Promise<{ committed: boolean; revealed: boolean }>;
  hasCommitted(address: string): Promise<boolean>;
  hasRevealed(address: string): Promise<boolean>;
  merkleRoot(): Promise<string>;
  commits(voterId: string): Promise<string>;
  tally(id: bigint): Promise<bigint>;
  
  // Event filters
  filters: {
    PhaseChanged: () => any;
    CandidateAdded: () => any;
    CandidateRemoved: () => any;
    AllCandidatesCleared?: () => any;
    ElectionReset?: () => any;
  };
  
  // Event listeners
  on(event: any, listener: (...args: any[]) => void): this;
}

