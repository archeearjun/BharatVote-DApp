import type { Contract } from "ethers";

// Week 4: Contract type with Merkle proof support
export type BharatVoteContract = Contract & {
  admin: () => Promise<string>;
  commitVote: (commitHash: string, proof: string[]) => Promise<any>;
  revealVote: (candidateId: bigint, salt: string) => Promise<any>;
  getVoterStatus: (voter: string) => Promise<[boolean, boolean]>;
  commits: (voter: string) => Promise<string>;
  phase: () => Promise<number>;
  [key: string]: any;
}

export interface Candidate {
  id: number;
  name: string;
  isActive: boolean;
}

