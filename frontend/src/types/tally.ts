import type { BharatVoteContract } from "./contracts";

export interface TallyProps {
  contract: BharatVoteContract | null;
  phase: number | null;
}

export type VoteCount = {
  candidateId: number;
  candidateName: string;
  votes: number;
  percentage: number;
};