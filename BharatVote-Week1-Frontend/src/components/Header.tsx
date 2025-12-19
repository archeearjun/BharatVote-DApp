import React from 'react';
import { Shield, User, CheckCircle } from 'lucide-react';

interface HeaderProps {
  account?: string;
  chainId?: number | null;
}

const Header: React.FC<HeaderProps> = ({ account, chainId }) => {
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id: number | null) => {
    if (!id) return 'Unknown';
    switch (id) {
      case 1: return 'Mainnet';
      case 5: return 'Goerli';
      case 11155111: return 'Sepolia';
      case 31337: return 'Localhost';
      default: return `Chain ${id}`;
    }
  };

  // Simple identicon generator based on address
  const generateIdenticon = (address: string) => {
    const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
    const index = parseInt(address.slice(-1), 16) % colors.length;
    return colors[index];
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                BharatVote
              </h1>
              <p className="text-xs text-slate-500">
                Week 1: Wallet Connection
              </p>
            </div>
          </div>

          {/* Right: Account info */}
          <div className="flex items-center space-x-3">
            {account && (
              <>
                {/* Wallet Connection Status */}
                <div className="hidden sm:flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    Connected
                  </span>
                </div>

                {/* Network Badge */}
                {chainId !== null && (
                  <div className="hidden md:flex items-center space-x-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium">
                      {getNetworkName(chainId)}
                    </span>
                  </div>
                )}

                {/* Account Address */}
                <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <span className="font-mono text-sm text-slate-700">
                    {shortenAddress(account)}
                  </span>
                  
                  {/* Account Avatar */}
                  <div className={`w-7 h-7 ${generateIdenticon(account)} rounded-lg flex items-center justify-center shadow-sm`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

