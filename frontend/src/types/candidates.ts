import type { BharatVoteContract } from "./contracts";

/**
 * Props for the Candidates component
 */
export interface CandidatesProps {
  /** Smart contract instance or null if not connected */
  contract: BharatVoteContract | null;
  /** Whether the current user has admin privileges */
  isAdmin?: boolean;
  /** Callback for error handling */
  onError?: (message: string) => void;
}

/**
 * Represents a single candidate in the election
 */
export interface Candidate {
  /** Unique identifier for the candidate */
  id: number;
  /** Name of the candidate */
  name: string;
  /** Whether the candidate is currently active in the election */
  isActive: boolean;
}

/**
 * State management for the Candidates component
 */
export interface CandidateState {
  /** List of all candidates */
  candidates: Candidate[];
  /** Whether data is being loaded */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Name input for adding new candidates */
  newCandidateName: string;
  /** Whether a submission is in progress */
  isSubmitting: boolean;
}