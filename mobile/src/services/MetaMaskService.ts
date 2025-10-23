import {Linking, Alert} from 'react-native';
import {ethers} from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {METAMASK_DEEPLINKS, WALLET_ERRORS} from '../constants';

interface WalletConnection {
  address: string;
  provider: ethers.JsonRpcProvider;
  signer: ethers.JsonRpcSigner;
}

class MetaMaskService {
  private static instance: MetaMaskService;
  private connection: WalletConnection | null = null;
  private isConnecting = false;

  public static getInstance(): MetaMaskService {
    if (!MetaMaskService.instance) {
      MetaMaskService.instance = new MetaMaskService();
    }
    return MetaMaskService.instance;
  }

  // Check if MetaMask mobile app is installed
  async isMetaMaskInstalled(): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(METAMASK_DEEPLINKS.DEEPLINK_BASE);
      return supported;
    } catch (error) {
      console.error('Error checking MetaMask installation:', error);
      return false;
    }
  }

  // Open MetaMask app or redirect to Play Store
  async openMetaMask(): Promise<void> {
    const isInstalled = await this.isMetaMaskInstalled();
    
    if (isInstalled) {
      await Linking.openURL(METAMASK_DEEPLINKS.DEEPLINK_BASE);
    } else {
      Alert.alert(
        'MetaMask Required',
        'MetaMask mobile app is required to use BharatVote. Would you like to install it?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Install',
            onPress: () => Linking.openURL(METAMASK_DEEPLINKS.PLAY_STORE),
          },
        ],
      );
    }
  }

  // Connect to MetaMask using deep linking (demo fallback without MetaMask)
  async connect(): Promise<WalletConnection> {
    if (this.isConnecting) {
      throw new Error('Connection already in progress');
    }

    if (this.connection) {
      return this.connection;
    }

    try {
      this.isConnecting = true;

      // Check if MetaMask is installed; if not, continue in demo mode
      const isInstalled = await this.isMetaMaskInstalled();

      // Use local Hardhat JSON-RPC in emulator
      const provider = new ethers.JsonRpcProvider('http://10.0.2.2:8545');
      
      // Get stored account or request connection
      let address = await AsyncStorage.getItem('metamask_account');
      
      if (!address) {
        if (isInstalled) {
          // Open MetaMask for connection (manual step)
          await this.openMetaMask();
        }
        // Demo fallback: choose a role address deterministically if provided by backend
        const kycAddress = (global as any).__kycAddress as string | undefined;
        // If no KYC address, default to the first local account used as Admin
        address = (kycAddress || '0xf39Fd6e51aad88F6F4ce6AB8827279cffFb92266');
        await AsyncStorage.setItem('metamask_account', address);
      }

      const signer = await provider.getSigner(address);
      
      this.connection = {
        address,
        provider,
        signer,
      };

      return this.connection;
    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  // Disconnect from MetaMask
  async disconnect(): Promise<void> {
    this.connection = null;
    await AsyncStorage.removeItem('metamask_account');
  }

  // Demo: directly connect using a provided address (bypass MetaMask)
  async connectWithAddress(address: string): Promise<WalletConnection> {
    const provider = new ethers.JsonRpcProvider('http://10.0.2.2:8545');
    const signer = await provider.getSigner(address);
    this.connection = { address, provider, signer };
    await AsyncStorage.setItem('metamask_account', address);
    return this.connection;
  }

  // Get current connection
  getConnection(): WalletConnection | null {
    return this.connection;
  }

  // Check if connected
  isConnected(): boolean {
    return this.connection !== null;
  }

  // Get account address
  getAddress(): string | null {
    return this.connection?.address || null;
  }

  // Sign transaction
  async signTransaction(transaction: any): Promise<string> {
    if (!this.connection) {
      throw new Error(WALLET_ERRORS.NO_ACCOUNTS);
    }

    try {
      // Open MetaMask for transaction signing
      const deepLink = `${METAMASK_DEEPLINKS.DEEPLINK_BASE}wc?uri=${encodeURIComponent(JSON.stringify(transaction))}`;
      await Linking.openURL(deepLink);
      
      // In a real implementation, you'd wait for the transaction response
      // This is simplified for demonstration
      return await this.connection.signer.sendTransaction(transaction);
    } catch (error) {
      console.error('Transaction signing error:', error);
      throw error;
    }
  }

  // Switch network
  async switchNetwork(chainId: number): Promise<void> {
    if (!this.connection) {
      throw new Error(WALLET_ERRORS.NO_ACCOUNTS);
    }

    try {
      // Open MetaMask to switch network
      const deepLink = `${METAMASK_DEEPLINKS.DEEPLINK_BASE}switchnetwork?chainId=${chainId}`;
      await Linking.openURL(deepLink);
    } catch (error) {
      console.error('Network switch error:', error);
      throw error;
    }
  }

  // Request account access
  async requestAccounts(): Promise<string[]> {
    const connection = await this.connect();
    return [connection.address];
  }

  // Get balance
  async getBalance(): Promise<string> {
    if (!this.connection) {
      throw new Error(WALLET_ERRORS.NO_ACCOUNTS);
    }

    try {
      const balance = await this.connection.provider.getBalance(this.connection.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }
}

export default MetaMaskService; 