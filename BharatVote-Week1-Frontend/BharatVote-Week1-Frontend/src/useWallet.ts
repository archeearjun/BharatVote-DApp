import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import type { WalletState } from "./types/wallet";
import { WALLET_ERRORS } from "./constants";

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
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    console.error(defaultMessage, error);
    setState((prev: WalletState) => ({
      ...prev,
      error: errorMessage,
      isLoading: false,
      isConnected: false,
    }));
  }, []);

  const disconnect = useCallback(() => {
    setState(initialState);
  }, []);

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting.current) {
      console.log('DEBUG useWallet: Connection already in progress');
      return;
    }

    // Check if MetaMask is installed
    if (!window.ethereum) {
      handleError(new Error(WALLET_ERRORS.NO_WALLET), WALLET_ERRORS.NO_WALLET);
      return;
    }

    try {
      isConnecting.current = true;
      setState((prev: WalletState) => ({ ...prev, isLoading: true, error: null }));
      console.log('DEBUG useWallet: Requesting Ethereum accounts...');

      // Create provider from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log('DEBUG useWallet: Provider created.', provider);

      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts.length) {
        handleError(new Error(WALLET_ERRORS.NO_ACCOUNTS), WALLET_ERRORS.NO_ACCOUNTS);
        return;
      }
      console.log('DEBUG useWallet: Accounts obtained:', accounts);

      // Get network information
      const network = await provider.getNetwork();
      console.log('DEBUG useWallet: Network obtained:', network);
      
      // For Week 1, we accept any network (localhost, testnet, mainnet)
      // In future weeks, we'll add network validation here
      const requiredChainId = parseInt(import.meta.env.VITE_CHAIN_ID || "31337", 10);

      if (Number(network.chainId) !== requiredChainId) {
        console.log(`DEBUG useWallet: Connected to chainId ${network.chainId}, expected ${requiredChainId}`);
        console.log('DEBUG useWallet: Network validation will be added in Week 2');
      }

      // Get signer (account that can sign transactions)
      const signer = await provider.getSigner();
      console.log('DEBUG useWallet: Signer obtained.', signer);

      // Update state with connection information
      setState({
        provider,
        account: accounts[0],
        contract: null, // Will be added in Week 2
        error: null,
        isConnected: true,
        isLoading: false,
        chainId: Number(network.chainId),
      });
      console.log('DEBUG useWallet: Wallet state updated. Connection successful!');

    } catch (err) {
      handleError(err, WALLET_ERRORS.CONNECT_FAILED);
    } finally {
      isConnecting.current = false;
    }
  }, [handleError]);

  // Listen for account changes (user switches account in MetaMask)
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('DEBUG useWallet: accountsChanged event:', accounts);
      if (accounts.length > 0) {
        setState((prev: WalletState) => ({
          ...prev,
          account: accounts[0],
          error: null,
        }));
      } else {
        // User disconnected
        setState((prev: WalletState) => ({
          ...prev,
          account: null,
          isConnected: false,
          error: WALLET_ERRORS.NO_ACCOUNTS,
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('DEBUG useWallet: chainChanged event:', chainId);
      // Reload page on network change (safest approach)
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      window.ethereum.on?.('chainChanged', handleChainChanged);
    }

    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener?.('chainChanged', handleChainChanged);
      }
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

