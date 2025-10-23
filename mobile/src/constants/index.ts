// Backend API URL for Merkle proof
import Config from 'react-native-config';
import { Platform } from 'react-native';

// Resolve localhost for Android emulator automatically
const rawUrl = Config.BACKEND_URL || "http://localhost:3001";
let resolvedUrl = rawUrl;
if (Platform.OS === 'android') {
  resolvedUrl = rawUrl
    .replace('http://127.0.0.1', 'http://10.0.2.2')
    .replace('http://localhost', 'http://10.0.2.2');
}
export const BACKEND_URL = resolvedUrl; // Android emulator uses 10.0.2.2

// Phase constants - using numbers instead of enum for consistency with contract
export const COMMIT_PHASE = 0;
export const REVEAL_PHASE = 1;
export const FINISH_PHASE = 2;

export const PHASE_LABELS = {
  [COMMIT_PHASE]: "Commit Phase",
  [REVEAL_PHASE]: "Reveal Phase",
  [FINISH_PHASE]: "Election Finished",
} as const;

// MetaMask mobile deep link URLs
export const METAMASK_DEEPLINKS = {
  UNIVERSAL_LINK: "https://metamask.app.link",
  DEEPLINK_BASE: "metamask://",
  PLAY_STORE: "https://play.google.com/store/apps/details?id=io.metamask",
  APP_STORE: "https://apps.apple.com/us/app/metamask/id1438144202"
} as const;

// Wallet and connection errors
export const WALLET_ERRORS = {
  NO_WALLET: "MetaMask mobile app not installed. Please install from Play Store.",
  NO_ACCOUNTS: "No accounts found in MetaMask.",
  WRONG_NETWORK: "Please switch to the configured network in MetaMask.",
  CONNECT_FAILED: "Failed to connect to MetaMask.",
  CONNECTION_REJECTED: "Connection request was rejected.",
  METAMASK_NOT_INSTALLED: "MetaMask mobile app is not installed.",
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
  CONNECT_WALLET: "Connect MetaMask",
  CONNECTING: "Connecting...",
  LOADING: "Loading...",
  PROCESSING: "Processing...",
  UNKNOWN_PHASE: "Unknown Phase",
  NO_CANDIDATES: "No candidates available",
  NO_VOTES: "No votes cast yet",
  ELECTION_FINISHED: "Election is finished"
} as const;

export const SUCCESS_MESSAGES = {
  VOTE_COMMITTED: "Your vote has been committed successfully",
  VOTE_REVEALED: "Your vote has been revealed successfully",
  WALLET_CONNECTED: "MetaMask connected successfully",
  WALLET_DISCONNECTED: "MetaMask disconnected successfully",
  CANDIDATE_ADDED: "Candidate added successfully",
  ELECTION_RESET: "Election has been reset successfully",
  PHASE_ADVANCED: "Phase advanced successfully",
  CANDIDATES_CLEARED: "All candidates cleared successfully"
} as const;

export const ERROR_MESSAGES = {
  WALLET_CONNECTION_FAILED: "Failed to connect MetaMask",
  WALLET_NOT_CONNECTED: "Please connect your MetaMask wallet",
  NO_WALLET: "MetaMask mobile app not detected. Please install from Play Store.",
  CONNECT_FAILED: "Failed to connect to MetaMask.",
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