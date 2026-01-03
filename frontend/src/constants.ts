// Contract address is loaded from deployment artifacts; remove hard-coded default
//export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// Backend API URL for Merkle proof
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Phase constants - using numbers instead of enum for consistency with contract
export type Phase = 0 | 1 | 2;
export const COMMIT_PHASE = 0;
export const REVEAL_PHASE = 1;
export const FINISH_PHASE = 2;

export const PHASE_LABELS = {
  [COMMIT_PHASE]: "Commit Phase",
  [REVEAL_PHASE]: "Reveal Phase",
  [FINISH_PHASE]: "Election Finished",
} as const;

// Wallet and connection errors
export const WALLET_ERRORS = {
  NO_WALLET: "No Ethereum wallet detected. Please install MetaMask.",
  NO_ACCOUNTS: "No accounts found in wallet.",
  WRONG_NETWORK: "Please switch to the configured network in MetaMask.",
  CONNECT_FAILED: "Failed to connect to wallet.",
} as const;

// Contract-related errors
export const CONTRACT_ERRORS = {
  NO_CONTRACT: "Contract not available",
  NO_CONTRACT_FOUND: "Contract instance not found.",
  ADMIN_CHECK_FAILED: "Failed to verify admin status.",
  PHASE_ERROR: "Unable to determine phase. Please refresh.",
  PHASE_ADVANCE_FAILED: "Failed to advance election phase.",
  INVALID_PHASE: "Invalid phase transition.",
} as const;

// Candidate-related messages
export const CANDIDATE_MESSAGES = {
  ERRORS: {
    FETCH_FAILED: "Failed to fetch candidates",
    ADD_FAILED: "Failed to add candidate",
    REMOVE_FAILED: "Failed to remove candidate",
    INVALID_NAME: "Invalid candidate name"
  },
  UI: {
    LOADING: "Loading candidates...",
    PROCESSING: "Processing...",
    NO_CANDIDATES: "No candidates registered yet",
    ADD_PLACEHOLDER: "Enter candidate name",
    CONFIRM_REMOVE: "Are you sure you want to remove this candidate?"
  },
  SUCCESS: {
    ADDED: "Candidate added successfully",
    REMOVED: "Candidate removed successfully",
    UPDATED: "Candidate list updated"
  }
} as const;

// Voting-related messages
export const VOTING_MESSAGES = {
  ERRORS: {
    INVALID_CANDIDATE: "Please enter a valid candidate ID.",
    VOTE_NOT_FOUND: "No committed vote found for this address.",
    VOTE_REVEAL_FAILED: "Failed to reveal vote.",
  },
  UI: {
    COMMIT_PHASE_INFO: "Commit your vote by generating a hash first, then submitting.",
    REVEAL_PHASE_INFO: "Reveal your vote by providing the same choice and salt.",
    NO_VOTES: "No votes have been revealed yet.",
  },
  SUCCESS: {
    VOTE_COMMITTED: "Your vote has been successfully committed.",
    VOTE_REVEALED: "Your vote has been successfully revealed.",
  }
} as const;

// General UI messages
export const UI_MESSAGES = {
  CONNECT_WALLET: "Connect Wallet",
  CONNECTING: "Connecting...",
  LOADING: "Loading...",
  PROCESSING: "Processing...",
  UNKNOWN_PHASE: "Unknown Phase",
  NO_CANDIDATES: "No candidates available",
  NO_VOTES: "No votes cast yet",
  ELECTION_FINISHED: "Election is finished"
} as const;

export const ERRORS = {
  NO_WALLET: "No wallet detected",
  NO_ACCOUNTS: "No accounts found",
  WRONG_NETWORK: "Wrong network",
  CONNECT_FAILED: "Failed to connect",
};

export const SUCCESS_MESSAGES = {
  VOTE_COMMITTED: "Your vote has been committed successfully",
  VOTE_REVEALED: "Your vote has been revealed successfully",
  WALLET_CONNECTED: "Wallet connected successfully",
  WALLET_DISCONNECTED: "Wallet disconnected successfully",
  CANDIDATE_ADDED: "Candidate added successfully",
  ELECTION_RESET: "Election has been reset successfully",
  PHASE_ADVANCED: "Phase advanced successfully",
  CANDIDATES_CLEARED: "All candidates cleared successfully"
} as const;

export const ERROR_MESSAGES = {
  WALLET_CONNECTION_FAILED: "Failed to connect wallet",
  WALLET_NOT_CONNECTED: "Please connect your wallet",
  NO_WALLET: "No Ethereum wallet detected. Please install MetaMask.",
  CONNECT_FAILED: "Failed to connect to wallet.",
  NOT_ADMIN: "You are not authorized to perform this action",
  WRONG_PHASE: "This action is not allowed in the current phase",
  INVALID_CANDIDATE: "Invalid candidate name",
  INVALID_VOTE: "Invalid vote choice",
  ALREADY_VOTED: "You have already voted",
  NOT_VOTED: "You have not voted yet",
  INVALID_COMMIT: "Invalid commit",
  INVALID_REVEAL: "Invalid reveal",
  TRANSACTION_FAILED: "Transaction failed",
  UNKNOWN_ERROR: "An unknown error occurred"
} as const;
