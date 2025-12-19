import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import type { WalletState } from "./types/wallet";
import type { BharatVoteContract } from "./types/contracts";
import { WALLET_ERRORS } from "./constants";
import BharatVote from "./contracts/BharatVote.json";

// declare MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

const initialState: WalletState = {
  provider: null,
  account: null,
  contract: null,
  error: null,
  isConnected: false,
  isLoading: false,
  chainId: null,
};

export default function useWallet() {
  const [state, setState] = useState<WalletState>(initialState);
  const isConnecting = useRef(false);

  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : defaultMessage;
    console.error("[useWallet] ERROR:", message, error);
    setState((prev) => ({
      ...prev,
      error: message,
      isLoading: false,
      isConnected: false,
    }));
  }, []);

  const disconnect = useCallback(() => {
    setState(initialState);
  }, []);

  const connect = useCallback(async () => {
    // avoid double clicks
    if (isConnecting.current) {
      console.log("[useWallet] connect() ignored: already connecting");
      return;
    }

    if (!window.ethereum) {
      handleError(new Error(WALLET_ERRORS.NO_WALLET), WALLET_ERRORS.NO_WALLET);
      return;
    }

    // IMPORTANT: check we actually have contract json
    if (!BharatVote?.address || !BharatVote?.abi) {
      handleError(
        new Error("Contract JSON missing"),
        "Contract info not found. Run backend deploy script first."
      );
      return;
    }

    try {
      isConnecting.current = true;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // 1) make provider from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum!);

      // 2) request accounts
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        handleError(new Error(WALLET_ERRORS.NO_ACCOUNTS), WALLET_ERRORS.NO_ACCOUNTS);
        return;
      }

      // 3) network
      const network = await provider.getNetwork();
      const numericChainId = Number(network.chainId);

      // Week-3 safety: must be localhost
      if (numericChainId !== 31337) {
        console.warn(
          `[useWallet] Expected chainId 31337 (Hardhat localhost) but got ${numericChainId}`
        );
      }

      // 4) signer
      const signer = await provider.getSigner();

      // 5) contract (with signer)
      const contract = new ethers.Contract(
        BharatVote.address,
        BharatVote.abi,
        signer
      ) as unknown as BharatVoteContract;

      // 6) update state
      setState({
        provider,
        account: accounts[0],
        contract,
        error: null,
        isConnected: true,
        isLoading: false,
        chainId: numericChainId,
      });

      console.log("[useWallet] Connected:", {
        account: accounts[0],
        chainId: numericChainId,
        contract: BharatVote.address,
      });
    } catch (err) {
      handleError(err, WALLET_ERRORS.CONNECT_FAILED);
    } finally {
      isConnecting.current = false;
    }
  }, [handleError]);

  // listen for metamask events
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log("[useWallet] accountsChanged:", accounts);

      if (!accounts || accounts.length === 0) {
        // user disconnected all accounts
        setState((prev) => ({
          ...prev,
          account: null,
          contract: null,
          isConnected: false,
          error: WALLET_ERRORS.NO_ACCOUNTS,
        }));
        return;
      }

      // we DO have an account → we must also re-bind the contract to the new signer
      try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          BharatVote.address,
          BharatVote.abi,
          signer
        ) as unknown as BharatVoteContract;

        setState((prev) => ({
          ...prev,
          provider,
          account: accounts[0],
          contract,
          isConnected: true,
          error: null,
        }));
      } catch (err) {
        console.warn("[useWallet] failed to rebind after accountsChanged:", err);
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log("[useWallet] chainChanged:", chainId);
      // safest: full reload
      window.location.reload();
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  return {
    connect,
    disconnect,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    account: state.account,
    contract: state.contract,
    provider: state.provider,
    chainId: state.chainId,
    error: state.error,
  };
}

