import type { BharatVoteContract } from "./contracts";
import type { Phase } from "../constants";

// Props passed into VotingPanel
export interface VotingPanelProps {
  contract: BharatVoteContract;
}

// Props passed into each phase‐rendering component (Commit/Reveal/etc.)
export interface PhaseContentProps {
  contract: BharatVoteContract;
  phase: Phase;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}
