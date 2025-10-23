import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { BharatVote__factory } from "@typechain/factories/BharatVote.sol/BharatVote__factory";
import type { WalletState } from "./types/wallet";
import { WALLET_ERRORS, CONTRACT_ERRORS } from "./constants";
import contractJson from "./contracts/BharatVote.json";

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
    if (isConnecting.current) {
      console.log('DEBUG useWallet: Connection already in progress');
      return;
    }

    if (!window.ethereum) {
      handleError(new Error(WALLET_ERRORS.NO_WALLET), WALLET_ERRORS.NO_WALLET);
      return;
    }

    try {
      isConnecting.current = true;
      setState((prev: WalletState) => ({ ...prev, isLoading: true, error: null }));
      console.log('DEBUG useWallet: Requesting Ethereum accounts...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log('DEBUG useWallet: Provider created.', provider);

      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts.length) {
        handleError(new Error(WALLET_ERRORS.NO_ACCOUNTS), WALLET_ERRORS.NO_ACCOUNTS);
        return;
      }
      console.log('DEBUG useWallet: Accounts obtained:', accounts);

      const network = await provider.getNetwork();
      console.log('DEBUG useWallet: Network obtained:', network);
      const requiredChainId = parseInt(import.meta.env.VITE_CHAIN_ID || "31337", 10);

      if (Number(network.chainId) !== requiredChainId) {
        console.log('DEBUG useWallet: Switching network...');
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${requiredChainId.toString(16)}` }],
          });
          return;
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            handleError(switchError, WALLET_ERRORS.WRONG_NETWORK);
            return;
          }
          throw switchError;
        }
      }
      console.log('DEBUG useWallet: Network is correct.');

      const signer = await provider.getSigner();
      console.log('DEBUG useWallet: Signer obtained.', signer);
      const contractAddress = contractJson.address;
      
      if (!contractAddress) {
        handleError(new Error(CONTRACT_ERRORS.NO_CONTRACT_FOUND), CONTRACT_ERRORS.NO_CONTRACT_FOUND);
        return;
      }
      console.log('DEBUG useWallet: Contract address:', contractAddress);

      // Verify bytecode exists at the address to avoid BAD_DATA from calls
      try {
        const code = await provider.getCode(contractAddress);
        console.log('DEBUG useWallet: Code length at address:', code?.length);
        if (!code || code === '0x') {
          handleError(new Error('No contract code at address. Ensure Hardhat node is running and contract is deployed.'), CONTRACT_ERRORS.NO_CONTRACT_FOUND);
          return;
        }
      } catch (codeErr) {
        console.error('DEBUG useWallet: Error fetching contract code:', codeErr);
      }

      const contract = BharatVote__factory.connect(
        contractAddress,
        signer
      );
      console.log('DEBUG useWallet: Contract instance created.', contract);

      setState({
        provider,
        account: accounts[0],
        contract,
        error: null,
        isConnected: true,
        isLoading: false,
        chainId: Number(network.chainId),
      });
      console.log('DEBUG useWallet: Wallet state updated.');

    } catch (err) {
      handleError(err, WALLET_ERRORS.CONNECT_FAILED);
    } finally {
      isConnecting.current = false;
    }
  }, [handleError]);

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
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      window.ethereum.on?.('chainChanged', handleChainChanged);
    }

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