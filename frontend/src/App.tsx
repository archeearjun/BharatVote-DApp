import { useEffect, Suspense, lazy, useState, useMemo, useCallback } from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import eligibleVoters from "../../eligibleVoters.json";
import MainContainer from './components/MainContainer';
import Header from './components/Header';
import Toast from './components/Toast';
import { 
  BACKEND_URL,
  COMMIT_PHASE
} from "./constants"; // Application-wide constants.
// Removed global App.css to avoid legacy global overrides that broke layout
import useWallet from "./useWallet"; // Custom hook for wallet connection and contract interaction.
import KycPage from "./KycPage";
import { useI18n } from './i18n';
import { 
  Shield, 
  Wallet, 
  AlertTriangle, 
  RefreshCw, 
  BarChart3
} from 'lucide-react';
import StepWizard from './components/StepWizard';
import PublicResults from './components/PublicResults';
import LandingPage from "./components/LandingPage";
import { getChainConfig, getExpectedChainId } from "@/utils/chain";
import AboutPage from "./pages/AboutPage";
import LearnPage from "./pages/LearnPage";
import MainElectionGuidePage from "./pages/MainElectionGuidePage";
import DemoElectionGuidePage from "./pages/DemoElectionGuidePage";
import BlogIndexPage from "./pages/BlogIndexPage";
import BlogPostPage from "./pages/BlogPostPage";
import FaqPage from "./pages/FaqPage";
import { getStoredKycVerification, setStoredKycVerification } from "./utils/kycStorage";

const AdminPanel = lazy(() => import('./Admin'));
const Voter = lazy(() => import('./Voter'));
const Tally = lazy(() => import('./Tally'));

/**
 * Main application component.
 * Manages global state such as wallet connection, admin status, and election phase.
 * Conditionally renders Admin, Voter, or Tally components based on the current state.
 */
function ElectionUI({ electionAddress }: { electionAddress: string }) {
  const { connect, isConnected, isLoading, account, contract, error, chainId } = useWallet(electionAddress);
  // KYC verification state (for non-admin voters)
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [verifiedVoterId, setVerifiedVoterId] = useState<string | null>(null);
  // State to determine if the connected account is the administrator.
  const [isAdmin, setIsAdmin] = useState(false);
  // State to track if we've finished checking admin status
  const [isAdminCheckComplete, setIsAdminCheckComplete] = useState(false);
  // State to hold the current phase of the election, initialized to COMMIT_PHASE.
  const [phase, setPhase] = useState<number>(COMMIT_PHASE);
  const [electionName, setElectionName] = useState<string | null>(null);
  // Merkle roots: backend and contract for readiness alignment
  const [backendMerkleRoot, setBackendMerkleRoot] = useState<string | null>(null);
  const [contractMerkleRoot, setContractMerkleRoot] = useState<string | null>(null);
  const [backendAllowlistCount, setBackendAllowlistCount] = useState<number | null>(null);
  // State to force a refresh of the tally component
  const [tallyRefreshKey, setTallyRefreshKey] = useState<number>(0);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { t, lang, setLang } = useI18n();
  const [pendingTx, setPendingTx] = useState<string | null>(null);
  const [hasUserCommitted, setHasUserCommitted] = useState(false);
  const [hasUserRevealed, setHasUserRevealed] = useState(false);
  const [adminTallyOpen, setAdminTallyOpen] = useState(false);
  const [showPublicResults, setShowPublicResults] = useState(false);
  const [voterRefreshSignal, setVoterRefreshSignal] = useState(0);
  const demoElectionAddress = import.meta.env.VITE_DEMO_ELECTION_ADDRESS as string | undefined;
  const isDemoElection = useMemo(() => {
    if (!demoElectionAddress || !electionAddress) return false;
    return String(demoElectionAddress).toLowerCase() === String(electionAddress).toLowerCase();
  }, [demoElectionAddress, electionAddress]);
  const totalEligibleVoters = (eligibleVoters as string[])?.length || 0;
  const eligibleCountForTally = isDemoElection ? undefined : backendAllowlistCount ?? totalEligibleVoters;
  const expectedChainId = getExpectedChainId();

  // Demo convenience: bypass KYC gate for demo election even if user deep-links to /election/:address.
  useEffect(() => {
    if (!isDemoElection) return;
    if (!account) return;
    if (isAdmin) return;
    try {
      setStoredKycVerification(account, electionAddress, account);
    } catch {}
    setIsKycVerified(true);
    setVerifiedVoterId(account);
  }, [isDemoElection, account, isAdmin, electionAddress]);

  // Keep the local KYC gate aligned with the current election scope.
  useEffect(() => {
    if (!account) {
      setIsKycVerified(false);
      setVerifiedVoterId(null);
      return;
    }

    const { isVerified, voterId } = getStoredKycVerification(account, electionAddress);

    if (isVerified) {
      setIsKycVerified(true);
      setVerifiedVoterId(voterId || account);
      return;
    }

    setIsKycVerified(false);
    setVerifiedVoterId(null);
  }, [account, electionAddress]);

  const fetchCandidates = useCallback(async () => {
    if (!contract) {
      setCandidates([]);
      return;
    }
    
    try {
      const fetchedCandidates = await contract.getCandidates();
      setCandidates(fetchedCandidates || []);
    } catch (err: any) {
      try {
        const count = await contract.candidateCount();
        
        if (Number(count) === 0) {
          setCandidates([]);
          return;
        }
        
        const candidatesList = [];
        for (let i = 0; i < Number(count); i++) {
          try {
            const candidate = await contract.candidates(i);
            candidatesList.push({
              id: i,
              name: candidate.name,
              voteCount: Number(candidate.voteCount),
              isActive: true
            });
          } catch {}
        }
        
        setCandidates(candidatesList);
        
      } catch {
        setCandidates([]);
      }
    }
  }, [contract]);

  // Fetch backend merkle root once (or when backend URL changes)
  useEffect(() => {
    const fetchBackendRoot = async () => {
      try {
        setBackendMerkleRoot(null);
        const base = import.meta.env.VITE_BACKEND_URL || BACKEND_URL;
        const url = new URL(`${base}/api/merkle-root`);
        url.searchParams.set('electionAddress', electionAddress);
        const resp = await fetch(url.toString());
        if (!resp.ok) return;
        const data = await resp.json();
        if (data?.merkleRoot) {
          setBackendMerkleRoot(data.merkleRoot);
        }
      } catch (err) {
        console.warn('Failed to fetch backend merkle root', err);
      }
    };
    fetchBackendRoot();
  }, [electionAddress]);

  useEffect(() => {
    if (isDemoElection) {
      setBackendAllowlistCount(null);
      return;
    }
    const fetchAllowlistSummary = async () => {
      try {
        setBackendAllowlistCount(null);
        const base = import.meta.env.VITE_BACKEND_URL || BACKEND_URL;
        const resp = await fetch(`${base}/api/admin/voter-list/${encodeURIComponent(electionAddress)}`);
        if (!resp.ok) return;
        const data = await resp.json();
        if (typeof data?.count === 'number') {
          setBackendAllowlistCount(data.count);
        }
      } catch (err) {
        console.warn('Failed to fetch allowlist summary', err);
      }
    };
    fetchAllowlistSummary();
  }, [electionAddress, isDemoElection]);

  // Fetch contract merkle root when contract is ready
  useEffect(() => {
    const readContractRoot = async () => {
      if (!contract) return;
      try {
        const root = await contract.merkleRoot();
        setContractMerkleRoot(root);
      } catch (err) {
        console.warn('Failed to read contract merkle root', err);
      }
    };
    readContractRoot();
  }, [contract]);

  // Fetch election name when contract is ready
  useEffect(() => {
    let cancelled = false;
    const readElectionName = async () => {
      if (!contract) {
        if (!cancelled) setElectionName(null);
        return;
      }
      try {
        const n = await contract.name();
        if (!cancelled) setElectionName(n);
      } catch (err) {
        console.warn('Failed to read election name', err);
        if (!cancelled) setElectionName(null);
      }
    };
    readElectionName();
    return () => {
      cancelled = true;
    };
  }, [contract]);

  const steps = useMemo(() => {
    if (isAdmin) {
      return [
        { id: 0, title: 'Setup', description: 'Connect & configure' },
        { id: 1, title: 'Voting', description: 'Commit votes' },
        { id: 2, title: 'Reveal', description: 'Reveal votes' },
        { id: 3, title: 'Tally', description: 'Results' },
      ];
    }
    return [
      { id: 0, title: 'Setup', description: 'Verify identity' },
      { id: 1, title: 'Commit', description: 'Submit your choice' },
      { id: 2, title: 'Reveal', description: 'Prove your vote' },
      { id: 3, title: 'Results', description: 'View tally' },
    ];
  }, [isAdmin]);

  const currentStep = useMemo(() => {
    if (isAdmin) {
      if (!account) return 0;
      if (phase === 0) return 1;
      if (phase === 1) return 2;
      return 3;
    }
    if (!isKycVerified) return 0;
    if (phase === 0) return 1;
    if (phase === 1) return 2;
    return 3;
  }, [isAdmin, isKycVerified, phase, account]);

  const canShowVoterTally = isDemoElection ? (hasUserCommitted || hasUserRevealed) : (hasUserRevealed || phase === 2);
  const canShowPublicResults = isDemoElection || hasUserRevealed || phase === 2;

  /**
   * Initiates the wallet connection process.
   * This function simply calls the `connect` function from the `useWallet` hook.
   */
  const connectWallet = async () => {
    connect();
  };

  /**
   * Effect hook to initialize application data and set up event listeners.
   * Runs when wallet or contract state changes.
   */
  useEffect(() => {
    const init = async () => {
      try {
        // Reset admin check when wallet state changes
        if (!isConnected || !contract || !account) {
          setIsAdminCheckComplete(false);
          setIsAdmin(false);
          setCandidates([]); // Clear candidates when no contract
          setHasUserCommitted(false);
          setHasUserRevealed(false);
          setAdminTallyOpen(false);
          // Don't reset KYC verification when wallet disconnects - it should persist
          // setIsKycVerified(false);
          // setVerifiedVoterId(null);
          return;
        }

        // Proceed only if wallet is connected, contract and account are available.
        if (isConnected && contract && account) {
          setIsAdminCheckComplete(false);

          try {
            const contractAdmin = await contract.admin();
            const currentAccount = account;

            const isCurrentAccountAdmin =
              String(contractAdmin).toLowerCase() === String(currentAccount).toLowerCase();

            // Dev-only fallback for localhost hardhat account.
            const knownAdminAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
            const isKnownAdmin =
              import.meta.env.DEV &&
              Number(chainId) === 31337 &&
              String(currentAccount).toLowerCase() === knownAdminAddress.toLowerCase();

            const finalAdminStatus = isCurrentAccountAdmin || isKnownAdmin;

            setIsAdmin(finalAdminStatus);
            setIsAdminCheckComplete(true);
          } catch (adminCheckError) {
            console.error('Failed to check admin status', adminCheckError);
            setIsAdmin(false);
            setIsAdminCheckComplete(true);
          }

          const currentPhase = await contract.phase();
          setPhase(Number(currentPhase));

          await fetchCandidates();

          if (contract.on) {
            contract.on('PhaseChanged', async (newPhase: bigint) => {
              setPhase(Number(newPhase));
              setVoterRefreshSignal((prev) => prev + 1);

              try {
                const root = await contract.merkleRoot();
                setContractMerkleRoot(root);
              } catch {}
            });

            const refreshCandidates = async () => {
              try {
                await fetchCandidates();
              } catch (e) {
                console.warn('Failed to refresh candidates after contract event', e);
              }
            };
            contract.on('CandidateAdded', refreshCandidates);
            contract.on('CandidateRemoved', refreshCandidates);
            contract.on('AllCandidatesCleared', async () => {
              setCandidates([]);
              await fetchCandidates();
            });
            // After reset, everything changes
            contract.on('ElectionReset', async () => {
              setCandidates([]);
              setPhase(0);
              setVoterRefreshSignal((prev) => prev + 1);
              await fetchCandidates();
            });
          }

          // Also listen to a custom window event emitted by admin after phase change confirmations
          const onPhaseUpdated = async () => {
            try {
              const p = await contract.phase();
              setPhase(Number(p));
              setVoterRefreshSignal((prev) => prev + 1);
              await fetchCandidates();
            } catch {}
          };
          window.addEventListener('bv-phase-updated', onPhaseUpdated);
          // Save cleanup
          (window as any).__bv_cleanup_phase = () => window.removeEventListener('bv-phase-updated', onPhaseUpdated);
        }

      } catch (err) {
        console.error('App initialization error:', err);
        // Even if there's an error, mark admin check as complete to prevent infinite loading
        setIsAdminCheckComplete(true);
        // Errors are now managed by the useWallet hook, so no direct state update here.
      } finally {
        // Loading state is now managed by the useWallet hook, so no direct state update here.
      }
    };

    init(); // Call the initialization function when the effect runs.

    // Cleanup function for the effect.
    return () => {
      // Remove listeners when dependencies change
      if (contract && contract.removeAllListeners) {
        try {
          contract.removeAllListeners('PhaseChanged');
        } catch {}
        try { contract.removeAllListeners('CandidateAdded'); } catch {}
        try { contract.removeAllListeners('CandidateRemoved'); } catch {}
        try { contract.removeAllListeners('AllCandidatesCleared'); } catch {}
        try { contract.removeAllListeners('ElectionReset'); } catch {}
      }
      try { (window as any).__bv_cleanup_phase?.(); } catch {}
    };
  }, [account, chainId, contract, fetchCandidates, isConnected]);

  // Phase polling fallback: re-read phase every 30s in case event listeners drop
  useEffect(() => {
    if (!contract) return;
    const id = setInterval(async () => {
      try {
        const p = await contract.phase();
        setPhase(Number(p));
      } catch {}
    }, 30_000);
    return () => clearInterval(id);
  }, [contract]);

  // Enable Enter/Space key to trigger connect on the connect screen
  useEffect(() => {
    const shouldEnableHotkey = !account || !contract;
    if (!shouldEnableHotkey) return;

    const handler = (e: KeyboardEvent) => {
      const isActivateKey = e.key === 'Enter' || e.key === ' ';
      if (!isActivateKey) return;
      if ((window as any)?.ethereum?.isMetaMask && !isLoading) {
        e.preventDefault();
        connectWallet();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [account, contract, isLoading]);

  // Display a loading spinner and message if the application is still loading.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle font-sans">
        <div className="flex items-center justify-center min-h-screen">
          <div className="card-premium p-8 text-center max-w-sm mx-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Initializing BharatVote</h3>
            <p className="text-sm text-slate-600">Connecting to blockchain network...</p>
          </div>
        </div>
      </div>
    );
  }

  // Display an error message if there's an error during wallet connection or app initialization.
  if (error) {
    const isWrongNetwork = error.toLowerCase().includes('switch to the configured network');
    const handleSwitchNetwork = async () => {
      if (!(window as any)?.ethereum) return;
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
        });
        await connectWallet();
      } catch (switchError: any) {
        if (switchError?.code === 4902) {
          const config = getChainConfig(expectedChainId);
          if (!config) return;
          try {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [config],
            });
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
            });
            await connectWallet();
          } catch (addError) {
            console.error('Network add/switch failed', addError);
          }
        } else {
          console.error('Network switch failed', switchError);
        }
      }
    };

    return (
      <div className="min-h-screen bg-gradient-subtle font-sans">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="card-premium p-8 text-center max-w-md w-full">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-error-50 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-error-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Connection Error</h2>
            <p className="text-slate-600 mb-8 text-balance">{error}</p>
            <div className="space-y-3">
              {isWrongNetwork && (
                <button
                  onClick={handleSwitchNetwork}
                  className="btn-primary w-full"
                >
                  <RefreshCw className="w-4 h-4" />
                  Switch to Sepolia
                </button>
              )}
              <button 
                onClick={() => window.location.reload()}
                className="btn-secondary w-full"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prompt the user to connect their wallet if not already connected.
  if (!account || !contract) {
    const hasMetaMask = typeof window !== 'undefined' && (window as any).ethereum && (window as any).ethereum.isMetaMask;
    const openMetaMaskInstall = () => {
      window.open('https://metamask.io/download/', '_blank', 'noopener,noreferrer');
    };

    return (
      <div className="min-h-screen bg-gradient-subtle font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="card-premium p-8 text-center animate-fade-in">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-2 tracking-tight">BharatVote</h1>
              <p className="text-sm text-slate-600">Secure Digital Voting Platform</p>
            </div>

            {/* Connection Content */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                {hasMetaMask ? t('wallet.connectWithMetaMask') : t('wallet.metaMaskRequired')}
              </h2>
              <p className="text-sm text-slate-600 text-balance">
                {hasMetaMask
                  ? t('wallet.securelyConnect')
                  : t('wallet.installMetaMask')}
              </p>
              {hasMetaMask && (
                <p className="text-xs text-slate-500 mt-3">
                  {t('wallet.autoSepolia')}
                </p>
              )}
            </div>

            {/* Call to Action */}
            {hasMetaMask ? (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                aria-label="Connect MetaMask Wallet"
                aria-describedby="wallet-security-note"
                className="btn-primary w-full mb-6"
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>{t('wallet.connecting')}</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>{t('wallet.connectMetaMask')}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={openMetaMaskInstall}
                aria-label="Install MetaMask"
                aria-describedby="wallet-security-note"
                className="btn-warning w-full mb-6"
              >
                <Wallet className="w-5 h-5" />
                <span>{t('wallet.installMetaMask')}</span>
              </button>
            )}

            {/* Language Selector */}
            <div className="mb-6">
              <p className="text-xs font-medium text-slate-700 mb-3 uppercase tracking-wide">Language</p>
              <div className="flex space-x-1 bg-slate-100 rounded-xl p-1">
                {[
                  { code: 'en', name: 'EN' },
                  { code: 'hi', name: 'हिं' },
                  { code: 'ta', name: 'தமிழ்' }
                ].map((languageOption) => (
                  <button
                    key={languageOption.code}
                    onClick={() => setLang(languageOption.code as 'en' | 'hi' | 'ta')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      lang === languageOption.code
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {languageOption.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Security Note */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="w-3 h-3" />
                <span id="wallet-security-note">{t('wallet.weNeverAccess')}</span>
              </div>
              <a
                href="https://support.metamask.io/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-slate-600 hover:text-slate-900 underline transition-colors"
              >
                {t('wallet.learnHow')}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking admin status
  if (!isAdminCheckComplete) {
    return (
      <div className="min-h-screen bg-gradient-subtle font-sans">
        <div className="flex items-center justify-center min-h-screen">
          <div className="card-premium p-8 text-center max-w-sm mx-4">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-slate-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Verifying Access</h3>
            <p className="text-sm text-slate-600">Checking your authorization level...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isKycVerified) {
    return (
      <KycPage
        account={account}
        electionAddress={electionAddress}
        onVerified={(voterId: string) => {
          setIsKycVerified(true);
          setVerifiedVoterId(voterId);
          
          if (account) {
            setStoredKycVerification(account, electionAddress, voterId);
          }
        }}
      />
    );
  }

  // Main application render.
  return (
    <div className="min-h-screen bg-gradient-subtle font-sans">
      <Header 
        account={account} 
        phase={phase} 
        isAdmin={isAdmin} 
        isDemoElection={isDemoElection}
        chainId={chainId}
        expectedChainId={getExpectedChainId()}
        backendMerkleRoot={backendMerkleRoot}
        contractMerkleRoot={contractMerkleRoot}
        electionName={electionName}
      />
      
      <MainContainer>
        {/* Stepper */}
        <div className="mb-4">
          <StepWizard
            steps={steps}
            currentStep={currentStep}
            lockedReason={!isAdmin && !isKycVerified ? 'Complete verification to proceed' : undefined}
          />
        </div>

        {isAdmin ? (
          <>
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="card p-6 text-center">
                  <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-600">Loading admin interface...</p>
                </div>
              </div>
            }>
               <AdminPanel
                 contract={contract}
                 phase={phase}
                 backendMerkleRoot={backendMerkleRoot}
                 contractMerkleRoot={contractMerkleRoot}
                 electionAddress={electionAddress}
                 isDemoElection={isDemoElection}
                 onAllowlistUpdated={(info) => {
                   if (typeof info?.count === 'number') {
                     setBackendAllowlistCount(info.count);
                   }
                   if (info?.merkleRoot) {
                     setBackendMerkleRoot(info.merkleRoot);
                   }
                 }}
                  onError={(error: string) => setToast({ type: 'error', message: error })}
                  onPhaseChange={() => {
                    contract.phase().then((p: any) => setPhase(Number(p)));
                    fetchCandidates();
                    // Force header pill to update immediately by reading phase and setting state
                  setTimeout(async () => {
                    try {
                      const p2 = await contract.phase();
                      setPhase(Number(p2));
                    } catch {}
                  }, 0);
                }}
              />
            </Suspense>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setAdminTallyOpen((prev) => !prev)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                {adminTallyOpen ? 'Hide Results Dashboard' : 'Open Results Dashboard'}
              </button>
              {adminTallyOpen && (
                <Suspense fallback={
                  <div className="card p-6 text-center">
                    <BarChart3 className="w-6 h-6 text-slate-400 animate-pulse mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Loading election results...</p>
                  </div>
                }>
                  <Tally
                    contract={contract}
                    phase={phase}
                    refreshTrigger={tallyRefreshKey}
                    eligibleCount={eligibleCountForTally}
                    isDemoElection={isDemoElection}
                  />
                </Suspense>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="card-premium p-8 text-center max-w-sm mx-auto">
                  <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Voting Interface</h3>
                  <p className="text-sm text-slate-600">Preparing your secure voting experience...</p>
                </div>
              </div>
            }>
                <Voter 
                  contract={contract} 
                  phase={phase} 
                  setPhase={setPhase} 
                  account={account as string}
                  voterId={(verifiedVoterId || account) as string} 
                  isDemoElection={isDemoElection}
                  electionAddress={electionAddress}
                  onRevealSuccess={() => {
                    setHasUserRevealed(true);
                    setTallyRefreshKey(prev => prev + 1);
                  }} 
                onCommitSuccess={() => setHasUserCommitted(true)}
                onStatusChange={({ committed, revealed }) => {
                  setHasUserCommitted(committed);
                  setHasUserRevealed(revealed);
                }}
                refreshSignal={voterRefreshSignal}
                candidates={candidates}
              />
            </Suspense>
            
            {/* Make Tally more prominent during reveal and finished phases */}
            {canShowVoterTally && (phase === 1 || phase === 2) && (
              <Suspense fallback={
                <div className="card p-6 text-center">
                  <BarChart3 className="w-6 h-6 text-slate-400 animate-pulse mx-auto mb-3" />
                  <p className="text-sm text-slate-600">Loading election results...</p>
                </div>
              }>
                <div className="card-premium p-6 mb-6 border-l-4 border-l-slate-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {phase === 1 ? 'Live Election Results' : 'Final Election Results'}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {phase === 1 
                          ? 'Votes are being revealed and counted in real-time'
                          : 'The election is complete - view final results below'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <Tally 
                  contract={contract} 
                  phase={phase} 
                    refreshTrigger={tallyRefreshKey}
                    eligibleCount={eligibleCountForTally}
                    isDemoElection={isDemoElection}
                  />
              </Suspense>
            )}
            
            {/* Show Tally during commit phase but less prominently */}
            {canShowVoterTally && phase === 0 && (
              <Suspense fallback={
                <div className="card p-6 text-center">
                  <BarChart3 className="w-6 h-6 text-slate-400 animate-pulse mx-auto mb-3" />
                  <p className="text-sm text-slate-600">Loading preliminary results...</p>
                </div>
              }>
                <Tally 
                  contract={contract} 
                  phase={phase} 
                  refreshTrigger={tallyRefreshKey} 
                  eligibleCount={eligibleCountForTally}
                  isDemoElection={isDemoElection}
                />
              </Suspense>
            )}
          </div>
        )}

        <div className="mt-8 card-premium p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Public Results</h3>
              <p className="text-sm text-slate-600">
                Open the read-only results view for this election.
              </p>
              {!canShowPublicResults && !isDemoElection && (
                <p className="mt-2 text-sm text-slate-500">
                  This view unlocks after you reveal your vote or when the election finishes.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (!canShowPublicResults && !isDemoElection) return;
                setShowPublicResults((prev) => !prev);
              }}
              className={`btn-secondary inline-flex items-center gap-2 ${!canShowPublicResults && !isDemoElection ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={!canShowPublicResults && !isDemoElection}
            >
              {showPublicResults ? 'Hide Results' : !canShowPublicResults && !isDemoElection ? 'Locked Until Reveal' : 'View Results'}
            </button>
          </div>

          {showPublicResults && (canShowPublicResults || isDemoElection) && (
            <div className="mt-4">
              <PublicResults contractAddress={electionAddress} isDemoElection={isDemoElection} />
            </div>
          )}
        </div>
      </MainContainer>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function ElectionRoute() {
  const params = useParams();
  const address = params.address;
  if (!address) return <Navigate to="/" replace />;
  return <ElectionUI electionAddress={address} />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/guide/main-election" element={<MainElectionGuidePage />} />
        <Route path="/guide/demo-election" element={<DemoElectionGuidePage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/election/:address" element={<ElectionRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
