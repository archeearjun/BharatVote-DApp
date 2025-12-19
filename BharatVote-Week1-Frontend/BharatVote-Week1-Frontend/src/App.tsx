import { useState } from 'react';
import { Wallet, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import useWallet from './useWallet';
import Header from './components/Header';
import MainContainer from './components/MainContainer';
import PrimaryButton from './components/PrimaryButton';
import Toast from './components/Toast';

function App() {
  const { connect, isConnected, isLoading, account, chainId, error } = useWallet();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; visible: boolean }>({
    type: 'success',
    message: '',
    visible: false
  });

  const handleConnect = async () => {
    try {
      await connect();
      if (!error) {
        setToast({ type: 'success', message: 'Wallet connected successfully!', visible: true });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to connect wallet', visible: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle font-sans">
      <Header account={account || undefined} chainId={chainId} />
      
      <MainContainer>
        {/* Welcome Card */}
        <div className="card p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome to BharatVote
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Week 1 Deliverable: React + Vite + TypeScript Environment with MetaMask Wallet Connection
          </p>
        </div>

        {/* Connection Status Card */}
        {!isConnected ? (
          <div className="card p-8 space-y-6 max-w-md mx-auto">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Connect Your Wallet
              </h2>
              <p className="text-sm text-slate-600">
                Click the button below to connect your MetaMask wallet and start using BharatVote
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Connection Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <PrimaryButton 
              onClick={handleConnect}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect MetaMask'}
            </PrimaryButton>

            <div className="text-xs text-slate-500 text-center">
              Don't have MetaMask?{' '}
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Install here
              </a>
            </div>
          </div>
        ) : (
          <div className="card p-8 space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Wallet Connected!
              </h2>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    Wallet Address
                  </p>
                  <p className="text-sm font-mono text-slate-900 break-all bg-white px-3 py-2 rounded border border-slate-200">
                    {account}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    Chain ID
                  </p>
                  <p className="text-sm font-mono text-slate-900 bg-white px-3 py-2 rounded border border-slate-200">
                    {chainId}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-900 font-medium">✓ Week 1 Complete!</p>
              <p className="text-sm text-indigo-700 mt-1">
                Your development environment is set up correctly. Vite, React 18, TypeScript, and MetaMask integration are working perfectly.
              </p>
            </div>
          </div>
        )}

        {/* Technical Details Card */}
        <div className="card p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Week 1 Technical Stack
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">React</span>
                <span className="font-mono text-slate-900">18.2.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">TypeScript</span>
                <span className="font-mono text-slate-900">5.8.3</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Vite</span>
                <span className="font-mono text-slate-900">5.0.0</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Ethers.js</span>
                <span className="font-mono text-slate-900">6.14.3</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Tailwind CSS</span>
                <span className="font-mono text-slate-900">3.4.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Material UI</span>
                <span className="font-mono text-slate-900">5.15.3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Implemented */}
        <div className="card p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Features Implemented in Week 1
          </h3>
          <div className="space-y-3">
            {[
              'Vite development environment with HMR (Hot Module Replacement)',
              'React 18 with TypeScript strict mode',
              'Custom useWallet hook for wallet state management',
              'MetaMask wallet connection and detection',
              'Account change event listeners',
              'Network change detection',
              'Browser polyfills for blockchain libraries',
              'Tailwind CSS with custom design system',
              'Material UI theme configuration',
              'Reusable component library (Header, Button, Toast, Container)'
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </MainContainer>

      <Toast 
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
}

export default App;

