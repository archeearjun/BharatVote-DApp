import type { BrowserProvider } from "ethers";
import type { BharatVoteContract } from "./contracts";

export interface WalletState {
  provider: BrowserProvider | null;
  account: string | null;
  contract: BharatVoteContract | null;
  error: string | null;
  isConnected: boolean;
  isLoading: boolean;
  chainId: number | null;
}

