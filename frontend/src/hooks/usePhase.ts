// src/useWallet.ts
import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import type { BharatVoteContract } from "../types/contracts";
import type { WalletState } from "../types/wallet";
import { ERRORS } from "../constants";
import contractJson from "../contracts/BharatVote.json";

declare global {
  interface Window {
    ethereum?: any;
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

  const handleError = useCallback((error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : fallback;
    console.error(fallback, error);
    setState(prev => ({ ...prev, error: message, isLoading: false }));
    // Re-throw so callers know something went wrong if needed
    throw new Error(message);
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      handleError(new Error(ERRORS.NO_WALLET), ERRORS.NO_WALLET);
      return;
    }
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const requiredChainId = Number(import.meta.env.VITE_CHAIN_ID || "31337");

      if (Number(network.chainId) !== requiredChainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${requiredChainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            handleError(switchError, ERRORS.WRONG_NETWORK);
            return;
          }
          throw switchError;
        }
      }

      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      if (!accounts.length) {
        handleError(new Error(ERRORS.NO_ACCOUNTS), ERRORS.NO_ACCOUNTS);
        return;
      }

      const signer = await provider.getSigner();
      const contractAddress = contractJson.address;
      const contract = new Contract(
        contractAddress,
        contractJson.abi,
        signer
      ) as unknown as BharatVoteContract;

      setState({
        provider,
        account: accounts[0],
        contract,
        error: null,
        isConnected: true,
        isLoading: false,
        chainId: Number(network.chainId),
      });

      console.log("Wallet connected:", accounts[0], contract);
    } catch (err) {
      handleError(err, ERRORS.CONNECT_FAILED);
    }
  }, [handleError]);

  const disconnect = useCallback(() => {
    setState(initialState);
  }, []);

  useEffect(() => {
    if (!window.ethereum?.isMetaMask) return;

    const onAccountsChanged = (accounts: string[]) => {
      if (!accounts.length) {
        disconnect();
      } else {
        setState(prev => ({ ...prev, account: accounts[0], error: null }));
      }
    };

    const onChainChanged = (chainIdHex: string) => {
      setState(prev => ({
        ...prev,
        chainId: parseInt(chainIdHex, 16),
        error: null,
      }));
      connect().catch(console.error);
    };

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: any) => {
        if (Array.isArray(accounts) && accounts.length > 0) {
          connect().catch(console.error);
        }
      })
      .catch(err => console.error("Failed to fetch accounts:", err));

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);
    window.ethereum.on("disconnect", disconnect);

    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
      window.ethereum.removeListener("disconnect", disconnect);
    };
  }, [connect, disconnect]);

  return { ...state, connect, disconnect };
}
