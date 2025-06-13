import { BaseContract } from 'ethers';
import type { ContractTransaction } from 'ethers';

export interface BharatVoteContract extends BaseContract {
  addCandidate(name: string): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  admin(): Promise<string>;
  candidateCount(): Promise<bigint>;
  candidates(id: bigint): Promise<{ id: bigint; name: string; isActive: boolean }>;
  commitVote(commit: string, proof: string[]): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  commits(voterId: string): Promise<string>;
  finishElection(): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  getCandidates(): Promise<Array<{ id: bigint; name: string; isActive: boolean }>>;
  getTally(): Promise<bigint[]>;
  getVoterStatus(voter: string): Promise<{ committed: boolean; revealed: boolean }>;
  getVotes(id: bigint): Promise<bigint>;
  hasCommitted(address: string): Promise<boolean>;
  hasRevealed(address: string): Promise<boolean>;
  merkleRoot(): Promise<string>;
  phase(): Promise<number>;
  removeCandidate(id: bigint): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  resetElection(): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  revealVote(choice: bigint, salt: string): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  setMerkleRoot(root: string): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  startReveal(): Promise<ContractTransaction & { wait: () => Promise<any> }>;
  tally(id: bigint): Promise<bigint>;
}

export interface ContractFactory {
  getBharatVoteContract(): Promise<BharatVoteContract>;
}

export interface ContractProps {
  contract: BharatVoteContract;
}