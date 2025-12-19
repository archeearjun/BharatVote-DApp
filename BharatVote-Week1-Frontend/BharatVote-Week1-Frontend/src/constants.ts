// Wallet and connection errors
export const WALLET_ERRORS = {
  NO_WALLET: "No Ethereum wallet detected. Please install MetaMask.",
  NO_ACCOUNTS: "No accounts found in wallet.",
  WRONG_NETWORK: "Please switch to the configured network in MetaMask.",
  CONNECT_FAILED: "Failed to connect to wallet.",
} as const;

// Contract-related errors
export const CONTRACT_ERRORS = {
  NO_CONTRACT_FOUND: "Contract instance not found.",
  NO_CONTRACT: "Contract not available",
} as const;

// UI messages
export const UI_MESSAGES = {
  CONNECT_WALLET: "Connect Wallet",
  CONNECTING: "Connecting...",
  LOADING: "Loading...",
} as const;

