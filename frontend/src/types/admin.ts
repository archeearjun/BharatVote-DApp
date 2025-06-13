import type { BharatVoteContract } from "./contracts";

export interface AdminProps {
  contract: BharatVoteContract | null;
  phase: number | null;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void; // optional but recommended
}

export interface AdminState {
  candidateName: string;
  loading: boolean;
  error: string | null;
  success: string | null;
}
