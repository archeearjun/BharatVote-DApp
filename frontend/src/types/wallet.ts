import type { BrowserProvider } from "ethers";
import type { BharatVote } from "@typechain/contracts/BharatVote";

export interface WalletState {
  provider: BrowserProvider | null;
  account: string | null;
  contract: BharatVote | null;
  error: string | null;
  isConnected: boolean;
  isLoading: boolean;
  chainId: number | null;

  // Optional UI extensions
  // networkName?: string;
  // isAdmin?: boolean;
}
