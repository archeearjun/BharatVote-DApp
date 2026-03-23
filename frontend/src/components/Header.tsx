import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getExpectedChainId } from '@/utils/chain';
import {
  Languages,
  Shield,
  User,
  Clock,
  Eye,
  CheckSquare,
  Sparkles
} from 'lucide-react';

const SEPOLIA_CHAIN_ID = 11155111;
const LOCALHOST_CHAIN_ID = 31337;

interface HeaderProps {
  account?: string;
  phase?: number;
  isAdmin?: boolean;
  isDemoElection?: boolean;
  chainId?: number | null;
  expectedChainId?: number;
  backendMerkleRoot?: string | null;
  contractMerkleRoot?: string | null;
  electionName?: string | null;
}

const Header: React.FC<HeaderProps> = ({
  account,
  phase = 0,
  isAdmin = false,
  isDemoElection = false,
  chainId = null,
  expectedChainId = getExpectedChainId(),
  backendMerkleRoot,
  contractMerkleRoot,
  electionName
}) => {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const { lang, setLang, t } = useI18n();

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getPhaseInfo = () => {
    switch (phase) {
      case 0: return { 
        label: t('phase.commit'), 
        icon: Clock,
        bgColor: 'bg-slate-100 text-slate-700',
        dotColor: 'bg-slate-500'
      };
      case 1: return { 
        label: t('phase.reveal'), 
        icon: Eye,
        bgColor: 'bg-warning-100 text-warning-700',
        dotColor: 'bg-warning-500'
      };
      case 2: return { 
        label: t('phase.finished'), 
        icon: CheckSquare,
        bgColor: 'bg-success-100 text-success-700',
        dotColor: 'bg-success-500'
      };
      default: return { 
        label: t('phase.commit'), 
        icon: Clock,
        bgColor: 'bg-slate-100 text-slate-700',
        dotColor: 'bg-slate-500'
      };
    }
  };

  const phaseInfo = getPhaseInfo();
  const chainMatch = expectedChainId !== undefined && chainId !== null && Number(chainId) === Number(expectedChainId);
  const merkleAligned = backendMerkleRoot && contractMerkleRoot && backendMerkleRoot.toLowerCase() === contractMerkleRoot.toLowerCase();
  const showSyncStatus = Boolean(account) && !isDemoElection && Boolean(backendMerkleRoot || contractMerkleRoot);

  const modeBadge = (() => {
    if (!account) return null;
    if (isDemoElection) {
      return { label: 'Demo', icon: Sparkles, className: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
    if (isAdmin) {
      return { label: 'Admin', icon: Shield, className: 'bg-slate-900 text-white border-slate-900' };
    }
    return { label: 'Voter', icon: User, className: 'bg-slate-50 text-slate-700 border-slate-200' };
  })();

  const getNetworkLabel = (id?: number | null) => {
    if (id === null || id === undefined) return 'Network';
    switch (Number(id)) {
      case SEPOLIA_CHAIN_ID:
        return 'Sepolia';
      case LOCALHOST_CHAIN_ID:
        return 'Localhost';
      default:
        return `Chain ${id}`;
    }
  };

  // Simple identicon generator based on address
  const generateIdenticon = (address: string) => {
    const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
    const index = parseInt(address.slice(-1), 16) % colors.length;
    return colors[index];
  };

  const handleLanguageChange = (newLang: string) => {
    const map: any = { EN: 'en', 'हिं': 'hi', 'தமிழ்': 'ta' };
    setLang(map[newLang] || 'en');
    setLanguageMenuOpen(false);
  };

  useEffect(() => {
    if (!languageMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [languageMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Logo and title */}
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 rounded-xl px-1 py-1 -ml-1 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Go to BharatVote landing page"
          >
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight leading-tight truncate">
                {t('app.title')}
              </h1>
              {electionName && (
                <p className="max-w-[30ch] truncate text-sm text-slate-500" title={electionName}>
                  · {electionName}
                </p>
              )}
              <p className="text-sm text-slate-500 leading-tight xl:text-xs">
                {t('app.subtitle')}
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight">
                BV
              </h1>
            </div>
          </Link>

          {/* Right: Account info, admin status, and language */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="hidden xl:flex items-center gap-2 text-sm">
              <Link to="/about" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:bg-slate-50">
                Docs
              </Link>
              <Link to="/faq" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:bg-slate-50">
                FAQ
              </Link>
            </div>

            {/* Network and root status pills */}
            {account && (
              <div className="hidden lg:flex items-center gap-2">
                <div className={`inline-flex items-center gap-2 rounded-full border border-current/20 px-3 py-2 ${phaseInfo.bgColor}`}>
                  <div className={`h-2 w-2 rounded-full ${phaseInfo.dotColor} animate-pulse`} />
                  <phaseInfo.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{phaseInfo.label}</span>
                </div>
                {modeBadge && (
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm ${modeBadge.className}`}>
                    <modeBadge.icon className="w-4 h-4" />
                    <span>{modeBadge.label}</span>
                  </div>
                )}
                <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm ${chainMatch ? 'bg-success-50 text-success-700 border-success-200' : 'bg-warning-50 text-warning-700 border-warning-200'}`}>
                  <div className={`h-2 w-2 rounded-full ${chainMatch ? 'bg-success-500' : 'bg-warning-500'}`} />
                  <span>{chainMatch ? getNetworkLabel(expectedChainId) : `Wrong network: ${getNetworkLabel(chainId)}`}</span>
                </div>
                {showSyncStatus && (
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm ${merkleAligned ? 'bg-success-50 text-success-700 border-success-200' : 'bg-warning-50 text-warning-700 border-warning-200'}`}>
                    <div className={`h-2 w-2 rounded-full ${merkleAligned ? 'bg-success-500' : 'bg-warning-500'}`} />
                    <span>{merkleAligned ? 'Eligibility synced' : 'Sync required'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Phase Badge (Mobile) */}
            {account && (
              <div className="lg:hidden">
                <div className={`inline-flex items-center gap-1.5 rounded-full border border-current/20 px-3 py-2 ${phaseInfo.bgColor}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${phaseInfo.dotColor}`} />
                  <span className="text-sm font-medium">{phaseInfo.label}</span>
                </div>
              </div>
            )}

            {/* Account Info */}
            {account && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${generateIdenticon(account)} shadow-sm`}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Wallet
                  </div>
                  <div className="font-mono text-sm text-slate-700 hidden sm:inline">
                    {shortenAddress(account)}
                  </div>
                  <div className="font-mono text-xs text-slate-700 sm:hidden">
                    {account.slice(0, 4)}…{account.slice(-2)}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center" title={t('header.administratorAccount')}>
                    <Shield className="w-4 h-4 text-slate-900" />
                  </div>
                )}
              </div>
            )}

            {/* Language Toggle */}
            <div className="relative flex items-center" ref={languageMenuRef}>
              <button
                onClick={() => setLanguageMenuOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Choose language"
                aria-expanded={languageMenuOpen}
                aria-haspopup="menu"
              >
                <Languages className="w-5 h-5" />
                <span className="hidden xl:inline text-sm font-medium">Language</span>
              </button>

              {languageMenuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[12rem] rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                  role="menu"
                  aria-label="Language options"
                >
                  {[
                    { value: 'EN', label: t('header.language.english'), isActive: lang === 'en' },
                    { value: 'हिं', label: t('header.language.hindi'), isActive: lang === 'hi' },
                    { value: 'தமிழ்', label: t('header.language.tamil'), isActive: lang === 'ta' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={option.isActive}
                      onClick={() => handleLanguageChange(option.value)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        option.isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{option.label}</span>
                      {option.isActive && <span className="text-xs font-semibold uppercase tracking-wide">Active</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
