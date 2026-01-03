import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import type { WalletState } from "./types/wallet";
import { WALLET_ERRORS, CONTRACT_ERRORS } from "./constants";
import { getElectionContract } from "@/utils/contract";
import { getExpectedChainId } from "@/utils/chain";

function normalizeChainId(chainId: unknown): number | null {
  if (typeof chainId === "bigint") return Number(chainId);
  if (typeof chainId === "number") return Number.isFinite(chainId) ? chainId : null;
  if (typeof chainId === "string") {
    const trimmed = chainId.trim();
    if (!trimmed) return null;
    const cleaned =
      (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))
        ? trimmed.slice(1, -1)
        : trimmed;
    const parsed = cleaned.startsWith("0x") || cleaned.startsWith("0X")
      ? Number.parseInt(cleaned, 16)
      : Number.parseInt(cleaned, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

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

export default function useWallet(electionAddress?: string) {
  const [state, setState] = useState<WalletState>(initialState);
  const isConnecting = useRef(false);
  const requiredChainId = getExpectedChainId();

  const checkNetwork = useCallback((currentChainId: unknown) => {
    const current = normalizeChainId(currentChainId);
    const expected = normalizeChainId(requiredChainId);
    if (current === null || expected === null) return false;

    if (current === expected) {
      setState((prev) => ({ ...prev, error: null, chainId: current }));
      return true;
    }

    setState((prev) => ({ ...prev, error: WALLET_ERRORS.WRONG_NETWORK, chainId: current }));
    return false;
  }, [requiredChainId]);

  const attachElectionContract = useCallback(async (provider: ethers.BrowserProvider, electionAddress: string) => {
    // Verify bytecode exists at the address to avoid BAD_DATA from calls
    const code = await provider.getCode(electionAddress);
    console.log('DEBUG useWallet: Code length at address:', code?.length);
    if (!code || code === '0x') {
      throw new Error(CONTRACT_ERRORS.NO_CONTRACT_FOUND);
    }

    const signer = await provider.getSigner();
    return getElectionContract(electionAddress, signer);
  }, []);

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

  const connect = useCallback(async (targetElectionAddress?: string) => {
    if (isConnecting.current) {
      console.log('DEBUG useWallet: Connection already in progress');
      return null;
    }

    if (!window.ethereum) {
      handleError(new Error(WALLET_ERRORS.NO_WALLET), WALLET_ERRORS.NO_WALLET);
      return null;
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
        return null;
      }
      console.log('DEBUG useWallet: Accounts obtained:', accounts);

      const network = await provider.getNetwork();
      console.log('DEBUG useWallet: Network obtained:', network);

      if (!checkNetwork(network.chainId)) {
        console.log('DEBUG useWallet: Switching network...');
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${requiredChainId.toString(16)}` }],
          });
          setState((prev: WalletState) => ({ ...prev, isLoading: false }));
          return null;
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            handleError(switchError, WALLET_ERRORS.WRONG_NETWORK);
            return null;
          }
          throw switchError;
        }
      }
      console.log('DEBUG useWallet: Network is correct.');

      const signer = await provider.getSigner();
      console.log('DEBUG useWallet: Signer obtained.', signer);

      const addressToAttach = targetElectionAddress || electionAddress;
      let contract: WalletState["contract"] = null;
      if (addressToAttach) {
        console.log('DEBUG useWallet: Election address:', addressToAttach);
        try {
          contract = await attachElectionContract(provider, addressToAttach);
          console.log('DEBUG useWallet: Election contract instance created.', contract);
        } catch (contractErr) {
          handleError(contractErr, CONTRACT_ERRORS.NO_CONTRACT_FOUND);
          return null;
        }
      }

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

      return { provider, account: accounts[0], chainId: Number(network.chainId) };

    } catch (err) {
      handleError(err, WALLET_ERRORS.CONNECT_FAILED);
      return null;
    } finally {
      isConnecting.current = false;
    }
  }, [attachElectionContract, electionAddress, handleError, requiredChainId]);

  useEffect(() => {
    if (!window.ethereum) return;

    (async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (!accounts.length) return;

      const network = await provider.getNetwork();
        const chainId = normalizeChainId(network.chainId);
        const wrongNetwork = chainId === null ? true : !checkNetwork(chainId);

        let contract: WalletState["contract"] = null;
        if (!wrongNetwork && chainId !== null && electionAddress) {
          try {
            contract = await attachElectionContract(provider, electionAddress);
          } catch (contractErr) {
            console.error("DEBUG useWallet: Auto-attach failed:", contractErr);
          }
        }

        setState((prev) => ({
          ...prev,
          provider,
          account: accounts[0],
          chainId: chainId ?? prev.chainId,
          contract,
          isConnected: true,
          isLoading: false,
          error: wrongNetwork ? WALLET_ERRORS.WRONG_NETWORK : null,
        }));
      } catch (err) {
        console.error("DEBUG useWallet: Auto-connect failed:", err);
      }
    })();
  }, [attachElectionContract, checkNetwork, electionAddress, requiredChainId]);

  useEffect(() => {
    const desired = (electionAddress || "").toLowerCase();
    const current = (state.contract?.target as string | undefined)?.toLowerCase();
    if (!state.provider || !state.isConnected) return;
    if (!desired) return;
    if (current === desired) return;
    if (state.chainId !== requiredChainId) return;

    (async () => {
      try {
        const contract = await attachElectionContract(state.provider as ethers.BrowserProvider, electionAddress as string);
        setState((prev) => ({ ...prev, contract, error: null }));
      } catch (err) {
        handleError(err, CONTRACT_ERRORS.NO_CONTRACT_FOUND);
      }
    })();
  }, [attachElectionContract, electionAddress, handleError, requiredChainId, state.chainId, state.contract?.target, state.isConnected, state.provider]);

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('DEBUG useWallet: accountsChanged event:', accounts);
      if (accounts.length > 0) {
        setState((prev: WalletState) => ({
          ...prev,
          account: accounts[0],
          error: null,
          isConnected: true,
        }));
      } else {
        setState((prev: WalletState) => ({
          ...prev,
          account: null,
          isConnected: false,
          contract: null,
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
