import React from 'react';
import { Copy } from 'lucide-react';
import Toast from './Toast';

interface NetworkStripProps {
  account?: string | null;
  chainId?: number | null;
  contractAddress?: string;
}

const short = (val?: string | null) => {
  if (!val) return '—';
  return `${val.slice(0, 6)}...${val.slice(-4)}`;
};

const NetworkStrip: React.FC<NetworkStripProps> = ({ account, chainId, contractAddress }) => {
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const copy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setToast({ type: 'success', message: 'Copied to clipboard' });
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast({ type: 'error', message: 'Copy failed' });
      setTimeout(() => setToast(null), 2000);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500">Network</span>
            <span className="text-sm font-semibold text-slate-800">{chainId ?? 'N/A'}</span>
          </div>
          <button
            type="button"
            onClick={() => copy(account || undefined)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
          >
            <span className="text-xs text-slate-500">Account</span>
            <span className="text-sm font-semibold text-slate-800">{short(account)}</span>
            <Copy className="w-4 h-4 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={() => copy(contractAddress || undefined)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
          >
            <span className="text-xs text-slate-500">Contract</span>
            <span className="text-sm font-semibold text-slate-800">{short(contractAddress)}</span>
            <Copy className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="text-xs text-slate-500">
          {Number(chainId) === 31337
            ? 'Connected to localhost (free, simulated gas)'
            : 'Not on localhost — switch to chain 31337 for dev'}
        </div>
      </div>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default NetworkStrip;

