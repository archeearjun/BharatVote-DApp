import { useEffect, Suspense, lazy, useState, useMemo } from "react";
import eligibleVoters from "../../eligibleVoters.json";
import MainContainer from './components/MainContainer';
import PrimaryButton from './components/PrimaryButton';
import Header from './components/Header';
import Toast from './components/Toast';
import { 
  COMMIT_PHASE
} from "./constants"; // Application-wide constants.
// Removed global App.css to avoid legacy global overrides that broke layout
import useWallet from "./useWallet"; // Custom hook for wallet connection and contract interaction.
import KycPage from "./KycPage";
import { Typography } from '@mui/material'; // Added for Typography
import { useI18n } from './i18n';
import { 
  Shield, 
  Wallet, 
  AlertTriangle, 
  RefreshCw, 
  BarChart3,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import NetworkStrip from './components/NetworkStrip';
import StepWizard from './components/StepWizard';
import PublicResults from './components/PublicResults';

const AdminPanel = lazy(() => import('./Admin'));
const Voter = lazy(() => import('./Voter'));
const Tally = lazy(() => import('./Tally'));

/**
 * Main application component.
 * Manages global state such as wallet connection, admin status, and election phase.
 * Conditionally renders Admin, Voter, or Tally components based on the current state.
 */
export default function App() {
  // Destructure state and functions from the custom useWallet hook.
  const { connect, isConnected, isLoading, account, contract, error, chainId, provider } = useWallet();
  // KYC verification state (for non-admin voters)
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [verifiedVoterId, setVerifiedVoterId] = useState<string | null>(null);
  // State to determine if the connected account is the administrator.
  const [isAdmin, setIsAdmin] = useState(false);
  // State to track if we've finished checking admin status
  const [isAdminCheckComplete, setIsAdminCheckComplete] = useState(false);
  // State to hold the current phase of the election, initialized to COMMIT_PHASE.
  const [phase, setPhase] = useState<number>(COMMIT_PHASE);
  // Merkle roots: backend and contract for readiness alignment
  const [backendMerkleRoot, setBackendMerkleRoot] = useState<string | null>(null);
  const [contractMerkleRoot, setContractMerkleRoot] = useState<string | null>(null);
  // State to force a refresh of the tally component
  const [tallyRefreshKey, setTallyRefreshKey] = useState<number>(0);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { t } = useI18n();
  const [pendingTx, setPendingTx] = useState<string | null>(null);
  const [hasUserCommitted, setHasUserCommitted] = useState(false);
  const [hasUserRevealed, setHasUserRevealed] = useState(false);
  const [adminTallyOpen, setAdminTallyOpen] = useState(false);
  const totalEligibleVoters = (eligibleVoters as string[])?.length || 0;

  // Persist KYC verification per account so refresh does not force re-verification
  useEffect(() => {
    if (!account) {
      console.log('DEBUG KYC Persistence: No account, skipping check');
      return;
    }
    const key = `bv_kyc_${account.toLowerCase()}`;
    const fromStorage = localStorage.getItem(key);
    const storedVoterId = localStorage.getItem(`${key}_id`);
    console.log('DEBUG KYC Persistence: Checking for account:', account);
    console.log('DEBUG KYC Persistence: Key:', key);
    console.log('DEBUG KYC Persistence: Value from storage:', fromStorage);
    console.log('DEBUG KYC Persistence: Current isKycVerified:', isKycVerified);
    
    if (fromStorage === '1') {
      console.log('DEBUG KYC Persistence: Found existing KYC verification, setting to true');
      setIsKycVerified(true);
      setVerifiedVoterId(storedVoterId || account);
    } else {
      console.log('DEBUG KYC Persistence: No existing KYC verification found');
    }
  }, [account]);

  // Additional effect to persist KYC state when phase changes (prevent re-KYC)
  useEffect(() => {
    console.log('DEBUG KYC Phase Check: Running phase change check');
    console.log('DEBUG KYC Phase Check: account:', account);
    console.log('DEBUG KYC Phase Check: isAdmin:', isAdmin);
    console.log('DEBUG KYC Phase Check: phase:', phase);
    console.log('DEBUG KYC Phase Check: isKycVerified:', isKycVerified);
    
    if (!account || isAdmin) {
      console.log('DEBUG KYC Phase Check: Skipping - no account or is admin');
      return;
    }
    
    const key = `bv_kyc_${account.toLowerCase()}`;
    const fromStorage = localStorage.getItem(key);
    const storedVoterId = localStorage.getItem(`${key}_id`);
    console.log('DEBUG KYC Phase Check: Storage value:', fromStorage);
    
    // If KYC was verified before but state was reset, restore it
    if (fromStorage === '1' && !isKycVerified) {
      console.log('DEBUG KYC Phase Check: Restoring KYC verification after phase change');
      setIsKycVerified(true);
      setVerifiedVoterId(storedVoterId || account);
    } else if (fromStorage === '1' && isKycVerified) {
      console.log('DEBUG KYC Phase Check: KYC already verified in state, no action needed');
    } else if (!fromStorage) {
      console.log('DEBUG KYC Phase Check: No KYC verification in storage');
    }
  }, [account, phase, isAdmin, isKycVerified]);

  // Debug logs for current wallet and contract states.
  // These provide insights into the application's connection status.
  console.log('DEBUG APP: isConnected', isConnected);
  console.log('DEBUG APP: isLoading', isLoading);
  console.log('DEBUG APP: account', account);
  console.log('DEBUG APP: contract', contract);
  console.log('DEBUG APP: error', error);
  console.log('DEBUG APP: chainId', chainId);
  console.log('DEBUG APP: isAdmin', isAdmin);
  console.log('DEBUG APP: isAdminCheckComplete', isAdminCheckComplete);

  

  const fetchCandidates = async () => {
    if (!contract) {
      console.log('DEBUG App: No contract available, cannot fetch candidates');
      setCandidates([]);
      return;
    }
    
    try {
      console.log('DEBUG App: Attempting to fetch candidates...');
      const fetchedCandidates = await contract.getCandidates();
      console.log('DEBUG App: Fetched candidates:', fetchedCandidates);
      setCandidates(fetchedCandidates || []);
    } catch (err: any) {
      console.error('DEBUG App: Error fetching candidates:', err);
      
      // Try fallback with candidateCount and manual fetching
      try {
        const count = await contract.candidateCount();
        console.log('DEBUG App: Candidate count fallback:', Number(count));
        
        if (Number(count) === 0) {
          console.log('DEBUG App: No candidates exist');
          setCandidates([]);
          return;
        }
        
        // Try to fetch candidates manually by ID
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
          } catch (candidateErr) {
            console.error(`Failed to fetch candidate ${i}:`, candidateErr);
          }
        }
        
        console.log('DEBUG App: Manual fetch resulted in:', candidatesList);
        setCandidates(candidatesList);
        
      } catch (countErr) {
        console.error('DEBUG App: Candidate count fallback also failed:', countErr);
        setCandidates([]);
      }
    }
  };

  // Fetch backend merkle root once (or when backend URL changes)
  useEffect(() => {
    const fetchBackendRoot = async () => {
      try {
        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL || BACKEND_URL}/api/merkle-root`);
        if (!resp.ok) return;
        const data = await resp.json();
        if (data?.merkleRoot) {
          setBackendMerkleRoot(data.merkleRoot);
        }
      } catch (err) {
        console.warn('DEBUG: Failed to fetch backend merkle root', err);
      }
    };
    fetchBackendRoot();
  }, []);

  // Fetch contract merkle root when contract is ready
  useEffect(() => {
    const readContractRoot = async () => {
      if (!contract) return;
      try {
        const root = await contract.merkleRoot();
        setContractMerkleRoot(root);
      } catch (err) {
        console.warn('DEBUG: Failed to read contract merkle root', err);
      }
    };
    readContractRoot();
  }, [contract]);

  const steps = useMemo(() => ([
    { id: 0, title: 'Verify Identity', description: 'KYC and proof readiness' },
    { id: 1, title: 'Commit Vote', description: 'Encrypt and submit your choice' },
    { id: 2, title: 'Reveal Vote', description: 'Prove and count your vote' },
    { id: 3, title: 'View Results', description: 'See live/final tally' },
  ]), []);

  const currentStep = useMemo(() => {
    if (isAdmin) return 0;
    if (!isKycVerified) return 0;
    if (phase === 0) return 1;
    if (phase === 1) return 2;
    return 3;
  }, [isAdmin, isKycVerified, phase]);

  const canShowVoterTally = hasUserCommitted || hasUserRevealed;

  /**
   * Initiates the wallet connection process.
   * This function simply calls the `connect` function from the `useWallet` hook.
   */
  const connectWallet = async () => {
    connect();
  };

  /**
   * Effect hook to initialize application data and set up event listeners.
   * Runs when `isConnected`, `contract`, `account`, or `provider` change.
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
        if (isConnected && contract && account && provider) {
          console.log('DEBUG: Attempting to fetch admin address...');
          console.log('DEBUG: Contract address:', contract.target);
          console.log('DEBUG: Provider:', provider);
          console.log('DEBUG: Account:', account);
          
          // Test basic provider communication by getting block number.
          try {
            console.log('DEBUG: Attempting to get block number...');
            const blockNumber = await provider.getBlockNumber();
            console.log('DEBUG: Current Block Number:', blockNumber);
          } catch (blockErr) {
            console.error('DEBUG: Error getting block number:', blockErr);
            // Log error but continue execution to check admin fetch behavior.
          }

          // Check network
          try {
            const network = await provider.getNetwork();
            console.log('DEBUG: Current Network Chain ID:', network.chainId);
            console.log('DEBUG: Expected Chain ID: 31337 (Hardhat)');
            console.log('DEBUG: Network Match:', Number(network.chainId) === 31337);
            
            if (Number(network.chainId) !== 31337) {
              console.warn('DEBUG: WARNING - Connected to wrong network! Expected Hardhat (31337) but got:', network.chainId);
            }
          } catch (networkErr) {
            console.error('DEBUG: Error getting network:', networkErr);
          }

          // Check if contract exists and is accessible
          try {
            const contractCode = await provider.getCode(contract.target as string);
            console.log('DEBUG: Contract code at address:', contract.target);
            console.log('DEBUG: Contract code length:', contractCode.length);
            console.log('DEBUG: Contract exists:', contractCode !== '0x');
            
            if (contractCode === '0x') {
              console.error('DEBUG: ERROR - No contract found at address:', contract.target);
            }
          } catch (contractCheckErr) {
            console.error('DEBUG: Error checking contract existence:', contractCheckErr);
          }

          try {
            // Fetch the admin address directly from the contract via provider.call.
            const callData = contract.interface.encodeFunctionData("admin");
            console.log('DEBUG: Call data for admin function:', callData);
            const adminResult = await provider.call({ to: contract.target as string, data: callData });
            console.log('DEBUG: Admin result from contract:', adminResult);
            const [adminAddress] = contract.interface.decodeFunctionData("admin", adminResult);
            console.log('DEBUG: Decoded admin address:', adminAddress);

            const currentAccount = account; // Use a local variable for consistency.
            
            // Determine if the connected account is the admin.
            const isCurrentAccountAdmin = (adminAddress as string).toLowerCase() === currentAccount.toLowerCase();
            
            // Fallback: Also check if the current account matches the known Hardhat admin address
            const knownAdminAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
            const isKnownAdmin = currentAccount.toLowerCase() === knownAdminAddress.toLowerCase();
            
            // Use either contract admin check or known admin address check
            const finalAdminStatus = isCurrentAccountAdmin || isKnownAdmin;
            
            setIsAdmin(finalAdminStatus);
            setIsAdminCheckComplete(true);

            console.log('DEBUG: Connected Account:', currentAccount);
            console.log('DEBUG: Contract Admin Address:', adminAddress);
            console.log('DEBUG: Known Admin Address:', knownAdminAddress);
            console.log('DEBUG: Is Admin (Contract Check):', isCurrentAccountAdmin);
            console.log('DEBUG: Is Admin (Known Address Check):', isKnownAdmin);
            console.log('DEBUG: Final Admin Status:', finalAdminStatus);
          } catch (adminCheckError) {
            console.error('DEBUG: Error checking admin status:', adminCheckError);
            
            // Try alternative method: call admin function directly on contract
            try {
              console.log('DEBUG: Trying alternative admin check method...');
              const adminAddress = await contract.admin();
              console.log('DEBUG: Alternative admin check result:', adminAddress);
              
              const isCurrentAccountAdmin = adminAddress.toLowerCase() === account.toLowerCase();
              console.log('DEBUG: Alternative admin check - Is Admin:', isCurrentAccountAdmin);
              
              setIsAdmin(isCurrentAccountAdmin);
              setIsAdminCheckComplete(true);
            } catch (alternativeError) {
              console.error('DEBUG: Alternative admin check also failed:', alternativeError);
              
              // Final fallback to known admin address check if all contract calls fail
              const knownAdminAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
              const isKnownAdmin = account.toLowerCase() === knownAdminAddress.toLowerCase();
              
              console.log('DEBUG: Final fallback admin check - Known Admin Address:', knownAdminAddress);
              console.log('DEBUG: Final fallback admin check - Is Admin:', isKnownAdmin);
              
              setIsAdmin(isKnownAdmin);
              setIsAdminCheckComplete(true);
            }
          }

          // Fetch the current election phase from the contract.
          const currentPhase = await contract.phase();
          console.log('DEBUG APP EFFECT: Phase fetched from contract:', currentPhase);
          setPhase(Number(currentPhase)); // Update the phase state.

          // Fetch candidates
          await fetchCandidates();

          // Listen for contract events that affect candidate list and phase
          if (contract.on) {
            contract.on(contract.filters.PhaseChanged(), async (newPhase: bigint) => {
              console.log('DEBUG APP EVENT: PhaseChanged event - newPhase:', newPhase);
              setPhase(Number(newPhase)); // Update phase when a change event is received.

              const contractMerkleRoot = await contract.merkleRoot();
              console.log("DEBUG: Contract Merkle Root:", contractMerkleRoot);
            });

            // Candidate list changes
            const refreshCandidates = async () => {
              try {
                await fetchCandidates();
              } catch (e) {
                console.warn('DEBUG APP EVENT: refreshCandidates failed', e);
              }
            };
            contract.on(contract.filters.CandidateAdded(), refreshCandidates);
            contract.on(contract.filters.CandidateRemoved(), refreshCandidates);
            contract.on(contract.filters.AllCandidatesCleared(), async () => {
              setCandidates([]);
              await fetchCandidates();
            });
            // After reset, everything changes
            if ((contract as any).filters?.ElectionReset) {
              contract.on((contract as any).filters.ElectionReset(), async () => {
                setCandidates([]);
                setPhase(0);
                await fetchCandidates();
              });
            }
          }

          // Also listen to a custom window event emitted by admin after phase change confirmations
          const onPhaseUpdated = async () => {
            try {
              const p = await contract.phase();
              setPhase(Number(p));
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
          contract.removeAllListeners(contract.getEvent('PhaseChanged'));
        } catch {}
        try { contract.removeAllListeners(contract.getEvent('CandidateAdded')); } catch {}
        try { contract.removeAllListeners(contract.getEvent('CandidateRemoved')); } catch {}
        try { contract.removeAllListeners(contract.getEvent('AllCandidatesCleared')); } catch {}
        try { if ((contract as any).getEvent) contract.removeAllListeners((contract as any).getEvent('ElectionReset')); } catch {}
      }
      try { (window as any).__bv_cleanup_phase?.(); } catch {}
      // Wallet event listeners are managed by the useWallet hook.
    };
  }, [isConnected, contract, account, provider]); // Dependencies: re-run effect if these values change.

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
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
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

            {/* Language Selector */}
            <div className="mb-8">
              <p className="text-xs font-medium text-slate-700 mb-3 uppercase tracking-wide">Select Language</p>
              <div className="flex space-x-1 bg-slate-100 rounded-xl p-1">
                {[
                  { code: 'en', name: 'EN' },
                  { code: 'hi', name: 'हिं' },
                  { code: 'ta', name: 'தமிழ்' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      localStorage.setItem('lang', lang.code);
                      window.location.reload();
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      localStorage.getItem('lang') === lang.code
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
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
            </div>

            {/* Call to Action */}
            {hasMetaMask ? (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                aria-label="Connect MetaMask Wallet"
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
                className="btn-warning w-full mb-6"
              >
                <Wallet className="w-5 h-5" />
                <span>{t('wallet.installMetaMask')}</span>
              </button>
            )}

            {/* Security Note */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="w-3 h-3" />
                <span>{t('wallet.weNeverAccess')}</span>
              </div>
              <a
                href="https://support.metamask.io/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-slate-600 hover:text-slate-900 underline transition-colors"
              >
                {t('wallet.learnHow')}
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

  // If user is not admin and hasn't passed KYC yet, show the mock KYC portal
  console.log('DEBUG APP Render Decision: isAdmin:', isAdmin, 'isKycVerified:', isKycVerified);
  console.log('DEBUG APP Render Decision: Should show KYC?', !isAdmin && !isKycVerified);
  
  if (!isAdmin && !isKycVerified) {
    console.log('DEBUG APP: Rendering KYC page');
    return (
      <KycPage
        account={account}
        onVerified={(voterId: string) => {
          console.log('DEBUG: KYC verification completed for voterId:', voterId);
          setIsKycVerified(true);
          setVerifiedVoterId(voterId);
          
          // Persist KYC verification to localStorage
          if (account) {
            const key = `bv_kyc_${account.toLowerCase()}`;
            localStorage.setItem(key, '1');
            console.log('DEBUG: KYC verification persisted to localStorage with key:', key);
          }
        }}
      />
    );
  }
  
  console.log('DEBUG APP: Rendering main app (voter or admin interface)');

  // Debug log for the current phase value, visible in the console.
  console.log('DEBUG APP HEADER: Current phase value:', phase);
  console.log('DEBUG APP STATE:', {
    isConnected,
    account: account?.slice(0, 10) + '...',
    contract: !!contract,
    isAdmin,
    isKycVerified,
    isAdminCheckComplete
  });

  // Main application render.
  return (
    <div className="min-h-screen bg-gradient-subtle font-sans">
      <Header 
        account={account} 
        phase={phase} 
        isAdmin={isAdmin} 
        chainId={chainId}
        expectedChainId={31337}
        backendMerkleRoot={backendMerkleRoot}
        contractMerkleRoot={contractMerkleRoot}
      />
      
      <MainContainer>
        {/* Network / Wallet strip */}
        <div className="mb-4">
          <NetworkStrip
            account={account}
            chainId={chainId}
            contractAddress={contract?.target as string | undefined}
          />
        </div>

        {/* Stepper */}
        <div className="mb-6">
          <StepWizard
            steps={steps}
            currentStep={currentStep}
            lockedReason={!isKycVerified ? 'Complete KYC to proceed' : undefined}
          />
        </div>

        {/* Readiness checklist */}
        {account && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className={`p-4 rounded-xl border ${Number(chainId) === 31337 ? 'border-success-200 bg-success-50' : 'border-warning-200 bg-warning-50'}`}>
              <p className="text-sm font-semibold text-slate-900">Network</p>
              <p className="text-xs text-slate-600 mt-1">
                {Number(chainId) === 31337 ? 'Connected to expected chain (31337)' : `Connected to chain ${chainId ?? 'unknown'}, expected 31337`}
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${backendMerkleRoot && contractMerkleRoot && backendMerkleRoot.toLowerCase() === contractMerkleRoot.toLowerCase() ? 'border-success-200 bg-success-50' : 'border-warning-200 bg-warning-50'}`}>
              <p className="text-sm font-semibold text-slate-900">Eligibility Root</p>
              <p className="text-xs text-slate-600 mt-1">
                {backendMerkleRoot && contractMerkleRoot
                  ? backendMerkleRoot.toLowerCase() === contractMerkleRoot.toLowerCase()
                    ? 'Backend root matches on-chain root'
                    : 'Backend root differs from on-chain root'
                  : 'Root not fetched yet'}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-sm font-semibold text-slate-900">Voting Actions</p>
              <p className="text-xs text-slate-600 mt-1">
                Commit and reveal will be disabled if KYC is missing, wrong phase, or root mismatch.
              </p>
            </div>
          </div>
        )}

        {/* Public results section (read-only, no wallet needed) */}
        <div className="flex justify-end">
          <a href="#public-tally" className="text-sm text-blue-600 hover:text-blue-800 underline">
            View public tally (no wallet)
          </a>
        </div>
        <div id="public-tally" className="mt-4">
          <PublicResults />
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
                {adminTallyOpen ? 'Hide Tally' : 'Show Tally'}
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
                    eligibleCount={totalEligibleVoters}
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
                onRevealSuccess={() => {
                  setHasUserRevealed(true);
                  setTallyRefreshKey(prev => prev + 1);
                }} 
                onCommitSuccess={() => setHasUserCommitted(true)}
                onStatusChange={({ committed, revealed }) => {
                  setHasUserCommitted(committed);
                  setHasUserRevealed(revealed);
                }}
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
                  eligibleCount={totalEligibleVoters}
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
                  eligibleCount={totalEligibleVoters}
                />
              </Suspense>
            )}
          </div>
        )}
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