import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { 
  Typography, 
  Chip, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Tooltip
} from '@mui/material';
import { 
  Languages,
  Shield,
  CheckCircle,
  User,
  Clock,
  Eye,
  CheckSquare
} from 'lucide-react';

interface HeaderProps {
  account?: string;
  phase?: number;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ account, phase = 0, isAdmin = false }) => {
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null);
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

  // Simple identicon generator based on address
  const generateIdenticon = (address: string) => {
    const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
    const index = parseInt(address.slice(-1), 16) % colors.length;
    return colors[index];
  };

  const handleLanguageChange = (newLang: string) => {
    const map: any = { EN: 'en', 'हिं': 'hi', 'தமிழ்': 'ta' };
    setLang(map[newLang] || 'en');
    setLanguageAnchor(null);
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
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                {t('app.title')}
              </h1>
              <p className="text-xs text-slate-500">
                {t('app.subtitle')}
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight">
                BV
              </h1>
            </div>
          </div>

          {/* Center: Phase badge */}
          {account && (
            <div className="hidden md:flex items-center">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${phaseInfo.bgColor} border border-current/20`}>
                <div className={`w-2 h-2 rounded-full ${phaseInfo.dotColor} animate-pulse`} />
                <phaseInfo.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{phaseInfo.label}</span>
              </div>
            </div>
          )}

          {/* Right: Account info, admin status, and language */}
          <div className="flex items-center space-x-3">
            {/* Phase Badge (Mobile) */}
            {account && (
              <div className="md:hidden">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${phaseInfo.bgColor} border border-current/20`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${phaseInfo.dotColor}`} />
                  <span className="text-xs font-medium">{phaseInfo.label}</span>
                </div>
              </div>
            )}

            {/* Account Info */}
            {account && (
              <div className="flex items-center space-x-3">
                {/* Wallet Connection Status */}
                <div className="hidden sm:flex items-center space-x-2 bg-success-50 text-success-700 px-3 py-1.5 rounded-full border border-success-200">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {t('header.connectedToMetaMask')}
                  </span>
                </div>

                {/* Account Address */}
                <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <span className="font-mono text-sm text-slate-700">
                    {shortenAddress(account)}
                  </span>
                  
                  {/* Admin Badge */}
                  {isAdmin && (
                    <Tooltip title={t('header.administratorAccount')}>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-slate-900" />
                      </div>
                    </Tooltip>
                  )}
                  
                  {/* Account Avatar */}
                  <div className={`w-7 h-7 ${generateIdenticon(account)} rounded-lg flex items-center justify-center shadow-sm`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Language Toggle */}
            <div className="flex items-center">
              <button
                onClick={(e) => setLanguageAnchor(e.currentTarget)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Languages className="w-5 h-5" />
              </button>
              
              <Menu
                anchorEl={languageAnchor}
                open={Boolean(languageAnchor)}
                onClose={() => setLanguageAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                className="mt-2"
              >
                <MenuItem onClick={() => handleLanguageChange('EN')} className="text-sm">
                  {t('header.language.english')}
                </MenuItem>
                <MenuItem onClick={() => handleLanguageChange('हिं')} className="text-sm">
                  {t('header.language.hindi')}
                </MenuItem>
                <MenuItem onClick={() => handleLanguageChange('தமிழ்')} className="text-sm">
                  {t('header.language.tamil')}
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 