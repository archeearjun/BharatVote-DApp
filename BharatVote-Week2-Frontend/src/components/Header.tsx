import React from "react";
import { Shield, User, CheckCircle } from "lucide-react";
import {
  getPhaseLabel,
  EXPECTED_CHAIN_ID,
  EXPECTED_CHAIN_NAME,
} from "@/constants";

interface HeaderProps {
  account?: string;
  chainId?: number | null;
  phase?: number;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  account,
  chainId,
  phase,
  isAdmin,
}) => {
  const shortenAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id: number | null | undefined) => {
    if (id == null) return "Unknown";
    switch (id) {
      case 1:
        return "Mainnet";
      case 5:
        return "Goerli";
      case 11155111:
        return "Sepolia";
      case 31337:
        return "Localhost";
      default:
        return `Chain ${id}`;
    }
  };

  // simple colored box avatar
  const generateIdenticon = (address: string) => {
    const colors = [
      "bg-red-400",
      "bg-blue-400",
      "bg-green-400",
      "bg-yellow-400",
      "bg-purple-400",
      "bg-pink-400",
    ];
    const last = address?.slice(-1) || "0";
    const idx = parseInt(last, 16) % colors.length;
    return colors[idx];
  };

  const isOnExpectedNetwork =
    chainId != null ? Number(chainId) === Number(EXPECTED_CHAIN_ID) : false;

  return (
    <header className="bg-white border-b border-slate-200 h-16 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* left: brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                BharatVote
              </h1>
              <p className="text-xs text-slate-500">
                Week 2: Contract Integration
                {typeof phase === "number" && (
                  <> · {getPhaseLabel(phase)}</>
                )}
              </p>
            </div>
          </div>

          {/* right: status */}
          <div className="flex items-center space-x-3">
            {/* network badge (only if we know chain) */}
            {chainId != null && (
              <div
                className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full border ${
                  isOnExpectedNetwork
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnExpectedNetwork ? "bg-emerald-500" : "bg-amber-500"
                  } animate-pulse`}
                />
                <span className="text-xs font-medium">
                  {getNetworkName(chainId)}
                  {!isOnExpectedNetwork && (
                    <> → use {EXPECTED_CHAIN_NAME}</>
                  )}
                </span>
              </div>
            )}

            {/* admin badge */}
            {account && isAdmin && (
              <div className="hidden sm:flex items-center space-x-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200">
                <Shield className="w-3 h-3" />
                <span className="text-xs font-medium">Admin</span>
              </div>
            )}

            {/* connection badge */}
            {account && (
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs font-medium">Connected</span>
              </div>
            )}

            {/* account */}
            {account && (
              <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <span className="font-mono text-sm text-slate-700">
                  {shortenAddress(account)}
                </span>
                <div
                  className={`w-7 h-7 ${generateIdenticon(
                    account
                  )} rounded-lg flex items-center justify-center shadow-sm`}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
