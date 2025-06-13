import type { BharatVoteContract } from "./types/contracts";

export interface CandidatesProps {
  contract: BharatVoteContract | null;
  isAdmin?: boolean;
  onError?: (error: string) => void;
}

export interface Candidate {
  id: number;
  name: string;
  active: boolean;
}

export interface CandidateState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  newCandidateName: string;
  isSubmitting: boolean;
}