import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import PrimaryButton from '../components/PrimaryButton';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import MetaMaskService from '../services/MetaMaskService';
import {METAMASK_DEEPLINKS, SUCCESS_MESSAGES, ERROR_MESSAGES} from '../constants';

const WalletConnectScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {voterId, kycVerified} = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  const metaMaskService = MetaMaskService.getInstance();

  useEffect(() => {
    checkMetaMaskInstallation();
    checkExistingConnection();
  }, []);

  const checkMetaMaskInstallation = async () => {
    const installed = await metaMaskService.isMetaMaskInstalled();
    setIsMetaMaskInstalled(installed);
  };

  const checkExistingConnection = async () => {
    const connection = metaMaskService.getConnection();
    if (connection) {
      setConnected(true);
      setWalletAddress(connection.address);
    }
  };

  const handleInstallMetaMask = () => {
    Alert.alert(
      'Install MetaMask',
      'MetaMask mobile app is required to use BharatVote. Would you like to install it from the Play Store?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Install',
          onPress: () => Linking.openURL(METAMASK_DEEPLINKS.PLAY_STORE),
        },
      ],
    );
  };

  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled) {
      handleInstallMetaMask();
      return;
    }

    setLoading(true);
    try {
      const connection = await metaMaskService.connect();
      setConnected(true);
      setWalletAddress(connection.address);
      
      Toast.show({
        type: 'success',
        text1: 'Wallet Connected',
        text2: SUCCESS_MESSAGES.WALLET_CONNECTED,
      });

      // Check if user is admin or voter
      const isAdmin = connection.address.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'; // First Hardhat account
      
      if (isAdmin) {
        navigation.navigate('Admin', {address: connection.address});
      } else {
        navigation.navigate('Voter', {
          address: connection.address,
          kycVerified: true,
        });
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: error.message || ERROR_MESSAGES.WALLET_CONNECTION_FAILED,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await metaMaskService.disconnect();
      setConnected(false);
      setWalletAddress(null);
      
      Toast.show({
        type: 'success',
        text1: 'Wallet Disconnected',
        text2: SUCCESS_MESSAGES.WALLET_DISCONNECTED,
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  // Quick-select helpers for prototype: Admin or Voter
  const handleQuickSelect = async (role: 'admin' | 'voter') => {
    setLoading(true);
    try {
      const adminAddress = '0xf39Fd6e51aad88F6F4ce6AB8827279cffFb92266';
      const voterAddress = (global as any).__kycAddress || '0x01bad59740664445Fd489315E14F4300639c253b';
      const address = role === 'admin' ? adminAddress : voterAddress;
      const connection = await metaMaskService.connectWithAddress(address);
      setConnected(true);
      setWalletAddress(connection.address);

      const isAdmin = role === 'admin';
      if (isAdmin) {
        navigation.navigate('Admin', {address: connection.address});
      } else {
        navigation.navigate('Voter', {
          address: connection.address,
          kycVerified: true,
        });
      }
    } catch (e) {
      console.error('Quick select error', e);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🦊</Text>
          </View>
          <Text style={styles.title}>Connect Your Wallet</Text>
          <Text style={styles.subtitle}>
            Connect your MetaMask wallet to proceed with voting
          </Text>
        </View>

        <Card style={styles.mainCard}>
          {!isMetaMaskInstalled ? (
            <View style={styles.installSection}>
              <View style={styles.warningIcon}>
                <Text style={styles.warningIconText}>⚠️</Text>
              </View>
              <Text style={styles.warningTitle}>MetaMask Required</Text>
              <Text style={styles.warningText}>
                MetaMask mobile app is required to use BharatVote. Please install it from the Play Store to continue.
              </Text>
              <PrimaryButton
                title="Install MetaMask"
                onPress={handleInstallMetaMask}
                size="large"
              />
            </View>
          ) : connected ? (
            <View style={styles.connectedSection}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.connectedTitle}>Wallet Connected</Text>
              <Text style={styles.addressText}>
                {formatAddress(walletAddress)}
              </Text>
              <Text style={styles.statusText}>
                Your wallet is connected and ready for voting
              </Text>
              
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title="Proceed to Vote"
                  onPress={() => 
                    navigation.navigate('Voter', {
                      address: walletAddress,
                      kycVerified: true,
                    })
                  }
                  size="large"
                />
                <PrimaryButton
                  title="Disconnect"
                  onPress={handleDisconnectWallet}
                  variant="secondary"
                  size="medium"
                />
              </View>
            </View>
          ) : (
            <View style={styles.connectSection}>
              <View style={styles.metaMaskIcon}>
                <Text style={styles.metaMaskIconText}>🦊</Text>
              </View>
              <Text style={styles.connectTitle}>Connect MetaMask</Text>
              <Text style={styles.connectText}>
                Connect your MetaMask wallet to participate in the election. Your wallet address will be verified against eligible voters list.
              </Text>
              
              <PrimaryButton
                title="Connect MetaMask"
                onPress={handleConnectWallet}
                loading={loading}
                size="large"
              />

              <View style={styles.quickRow}>
                <PrimaryButton
                  title="Use Admin"
                  onPress={() => handleQuickSelect('admin')}
                  size="medium"
                />
                <PrimaryButton
                  title="Use Voter"
                  onPress={() => handleQuickSelect('voter')}
                  size="medium"
                  variant="secondary"
                />
              </View>
              
              <Text style={styles.infoText}>
                Make sure you have MetaMask mobile app installed and your wallet set up
              </Text>
            </View>
          )}
        </Card>

        {kycVerified && (
          <Card style={styles.kycBadge}>
            <View style={styles.kycContent}>
              <Text style={styles.kycIcon}>✅</Text>
              <View style={styles.kycTextContainer}>
                <Text style={styles.kycTitle}>Identity Verified</Text>
                <Text style={styles.kycSubtitle}>
                  Voter ID: {voterId}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </View>
      
      <LoadingSpinner 
        visible={loading} 
        text="Connecting to MetaMask..." 
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: '#F97316',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  mainCard: {
    marginBottom: 16,
  },
  installSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  warningIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#FEF3C7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIconText: {
    fontSize: 32,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  warningText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  connectedSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  successIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#DCFCE7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconText: {
    fontSize: 32,
    color: '#059669',
    fontWeight: 'bold',
  },
  connectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addressText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#059669',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  quickRow: {
    width: '100%',
    marginTop: 12,
    gap: 8,
  },
  connectSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  metaMaskIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#F97316',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaMaskIconText: {
    fontSize: 32,
  },
  connectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  connectText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  kycBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
    borderWidth: 1,
  },
  kycContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kycIcon: {
    fontSize: 24,
  },
  kycTextContainer: {
    flex: 1,
  },
  kycTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  kycSubtitle: {
    fontSize: 12,
    color: '#047857',
  },
});

export default WalletConnectScreen; 
