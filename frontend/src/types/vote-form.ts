import type { Phase } from "../constants";
import type { BharatVoteContract } from "./contracts";

export interface VoteFormProps {
  contract: BharatVoteContract | null;
  phase: Phase;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export interface VoteFormState {
  choice: number;         // was string; now more precise
  salt: string;
  commit: string;
  loading: boolean;
  error: string | null;
  success: string | null;
  hasVoted: boolean;
  proof?: string[];       // optional, if Merkle proof is passed here
}
