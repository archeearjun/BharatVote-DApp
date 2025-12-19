// src/abi.ts

// Vite + TS can import JSON directly if "resolveJsonModule": true
// in tsconfig.json (usually already set in Vite templates)
import BharatVoteJson from "./contracts/BharatVote.json";

export const contractABI = BharatVoteJson.abi;
export const contractAddress = BharatVoteJson.address as string;
