// If you're using BigNumber (recommended):
// import type { BigNumber } from "ethers";

export interface PhaseChangedEvent {
  /** Phase enum value: 0 = Commit, 1 = Reveal, 2 = Finished */
  newPhase: bigint; // or BigNumber if preferred
}

export interface VoteCommittedEvent {
  /** Voter address */
  voter: string;
  /** Keccak256 hash of vote + salt */
  commitHash: string;
}

export interface VoteRevealedEvent {
  /** Voter address */
  voter: string;
  /** Candidate ID voted for */
  candidate: bigint; // or BigNumber
}

export interface CandidateAddedEvent {
  /** Unique candidate ID */
  id: bigint; // or BigNumber
  /** Candidate display name */
  name: string;
}
