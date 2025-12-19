import React, { useState, useEffect } from 'react';
import useWallet from '../useWallet';
import contractJson from '../contracts/BharatVote.json';

interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorer: string;
  contractAddress: string;
  isLocal: boolean;
}

const NETWORKS: NetworkConfig[] = [
  {
    name: 'Local Hardhat',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    explorer: 'http://localhost:8545',
    contractAddress: contractJson.address,
    isLocal: true
  }
];

const NetworkSwitcher: React.FC = () => {
  const { chainId, provider } = useWallet();
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    if (chainId) {
      const network = NETWORKS.find(n => n.chainId === chainId);
      setCurrentNetwork(network || null);
    }
  }, [chainId]);

  const switchNetwork = async (targetNetwork: NetworkConfig) => {
    if (!provider) return;

    setIsSwitching(true);
    try {
      // Try to switch to the target network
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetNetwork.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetNetwork.chainId.toString(16)}`,
                chainName: targetNetwork.name,
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [targetNetwork.rpcUrl],
                blockExplorerUrls: [targetNetwork.explorer],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
    } finally {
      setIsSwitching(false);
    }
  };

  const getNetworkStatus = () => {
    if (!currentNetwork) return 'Unknown Network';
    return currentNetwork.isLocal ? '🖥️ Local' : '🌐 Public';
  };

  if (!provider) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Network Configuration
      </h3>
      
      <div className="space-y-3">
        {/* Current Network Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Network
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentNetwork?.name || 'Not Connected'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getNetworkStatus()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Chain ID: {chainId || 'N/A'}
            </p>
          </div>
        </div>

        {/* Network Options */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Switch Network:
          </p>
          {NETWORKS.map((network) => (
            <button
              key={network.chainId}
              onClick={() => switchNetwork(network)}
              disabled={isSwitching || chainId === network.chainId}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                chainId === network.chainId
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              } ${
                isSwitching || chainId === network.chainId
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {network.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chain ID: {network.chainId}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {network.isLocal ? '🖥️ Local Development' : '🌐 Public Demo'}
                  </p>
                </div>
                {chainId === network.chainId && (
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Contract Address */}
        {currentNetwork && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Contract Address:
            </p>
            <p className="text-xs font-mono text-blue-700 dark:text-blue-300 break-all">
              {currentNetwork.contractAddress}
            </p>
            {!currentNetwork.isLocal && (
              <a
                href={`${currentNetwork.explorer}/address/${currentNetwork.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
              >
                View on Explorer →
              </a>
            )}
          </div>
        )}

        {/* Demo Instructions */}
        {currentNetwork && !currentNetwork.isLocal && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              🌟 Demo Mode Active
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Share this network and contract address with your audience. 
              They can connect their wallets to the same network to interact with your demo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkSwitcher;

