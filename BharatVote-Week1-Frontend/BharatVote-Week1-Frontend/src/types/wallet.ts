import type { BrowserProvider } from "ethers";

export interface WalletState {
  provider: BrowserProvider | null;
  account: string | null;
  contract: any | null;
  error: string | null;
  isConnected: boolean;
  isLoading: boolean;
  chainId: number | null;
}

