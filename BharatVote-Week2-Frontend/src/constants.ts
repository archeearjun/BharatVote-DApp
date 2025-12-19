// src/constants.ts

// ---- Environment & network ----
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

export const RPC_URL =
  import.meta.env.VITE_RPC_URL ?? "http://127.0.0.1:8545";

export const EXPECTED_CHAIN_ID: number = Number(
  import.meta.env.VITE_CHAIN_ID ?? 31337
);
export const EXPECTED_CHAIN_NAME =
  import.meta.env.VITE_CHAIN_NAME ?? "localhost";

// ---- Phases (keep in sync with Solidity: 0,1,2) ----
export type Phase = 0 | 1 | 2;
export const COMMIT_PHASE: Phase = 0;
export const REVEAL_PHASE: Phase = 1;
export const FINISH_PHASE: Phase = 2;

// Strongly-typed labels so you can index with `phase` without a cast
export const PHASE_LABELS: Record<Phase, string> = {
  0: "Commit Phase",
  1: "Reveal Phase",
  2: "Election Finished",
};

// Optional: helpful UI hints per phase
export const PHASE_HINTS: Record<Phase, string> = {
  0: "Admin can add candidates; voters can commit votes",
  1: "Voters can reveal their votes",
  2: "Election is complete; view results",
};

// Narrow guards & helpers (no more `as 0|1|2` in components)
export const isPhase = (v: unknown): v is Phase => v === 0 || v === 1 || v === 2;
export const getPhaseLabel = (v: number) =>
  isPhase(v) ? PHASE_LABELS[v] : `Unknown (${v})`;
export const getPhaseHint = (v: number) =>
  isPhase(v) ? PHASE_HINTS[v] : "";

// ---- Wallet & contract messages ----
export const WALLET_ERRORS = {
  NO_WALLET: "No Ethereum wallet detected. Please install MetaMask.",
  NO_ACCOUNTS: "No accounts found in wallet.",
  WRONG_NETWORK: "Please switch to the configured network in MetaMask.",
  CONNECT_FAILED: "Failed to connect to wallet.",
} as const;

export const CONTRACT_ERRORS = {
  NO_CONTRACT: "Contract not available",
  NO_CONTRACT_FOUND: "Contract instance not found.",
  ADMIN_CHECK_FAILED: "Failed to verify admin status.",
  PHASE_ERROR: "Unable to determine phase. Please refresh.",
  PHASE_ADVANCE_FAILED: "Failed to advance election phase.",
  INVALID_PHASE: "Invalid phase transition.",
} as const;

export const UI_MESSAGES = {
  CONNECT_WALLET: "Connect Wallet",
  CONNECTING: "Connecting...",
  LOADING: "Loading...",
} as const;

// ---- Retry policy used in App.tsx (single source of truth) ----
export const RETRY = {
  ATTEMPTS: 4,
  INITIAL_DELAY_MS: 800,
  FACTOR: 1.5,
} as const;
