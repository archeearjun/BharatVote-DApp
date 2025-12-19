import type { Contract } from "ethers";

// Week 3: Basic contract type - using any for simplicity to avoid TypeScript conflicts
export type BharatVoteContract = Contract & {
  admin: () => Promise<string>;
  [key: string]: any;
}

export interface Candidate {
  id: number;
  name: string;
  isActive: boolean;
}

