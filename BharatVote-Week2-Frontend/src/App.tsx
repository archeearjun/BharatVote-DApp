import { useState, useEffect, useRef, useMemo } from "react";
import { ethers } from "ethers";
import { Wallet, Info, CheckCircle2, AlertCircle, Shield, Users } from "lucide-react";
import useWallet from "./useWallet";
import Header from "./components/Header";
import MainContainer from "./components/MainContainer";
import PrimaryButton from "./components/PrimaryButton";
import Toast from "./components/Toast";
import {
  COMMIT_PHASE,
  RPC_URL,
  getPhaseLabel,
  getPhaseHint,
} from "./constants";

type Candidate = {
  id: bigint | number;
  name: string;
  isActive: boolean;
};

function App() {
  const {
    connect,
    isConnected,
    isLoading,
    account,
    contract,
    provider, // may use later
    chainId,
    error,
  } = useWallet();

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
    visible: boolean;
  }>({
    type: "success",
    message: "",
    visible: false,
  });

  // week 2 ui state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminCheckComplete, setIsAdminCheckComplete] = useState(false);
  const [phase, setPhase] = useState<number>(COMMIT_PHASE);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // to avoid double event listeners
  const listenersAttachedRef = useRef(false);

  // single read-only provider → bypass MetaMask cache
  const rpcProvider = useMemo(() => {
    return new ethers.JsonRpcProvider(RPC_URL);
  }, []);

  const handleConnect = async () => {
    try {
      await connect();
      setToast({
        type: "success",
        message: "Wallet connected successfully!",
        visible: true,
      });
    } catch {
      setToast({
        type: "error",
        message: "Failed to connect wallet",
        visible: true,
      });
    }
  };

  useEffect(() => {
    // if wallet/contract not ready, do nothing
    if (!contract || !account) return;

    // for guarding state updates
    let isMounted = true;

    const isCircuitBreakerError = (err: any): boolean => {
      const json = JSON.stringify(err || {}).toLowerCase();
      const msg = err?.message?.toLowerCase() || "";
      const cause = err?.data?.cause?.message?.toLowerCase() || "";
      return (
        json.includes("circuit breaker") ||
        msg.includes("circuit breaker") ||
        cause.includes("circuit breaker")
      );
    };

    const retryWithDelay = async <T,>(
      fn: () => Promise<T>,
      retries = 4,
      initialDelay = 800
    ): Promise<T | null> => {
      let delay = initialDelay;
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (err: any) {
          if (isCircuitBreakerError(err) && i < retries - 1) {
            await new Promise((res) => setTimeout(res, delay));
            delay = Math.floor(delay * 1.5);
            continue;
          }
          throw err;
        }
      }
      return null;
    };

    // main init block in IIFE
    (async () => {
      try {
        const contractAny = contract as any;
        const contractAddress =
          contractAny?.target ||
          contractAny?.address ||
          "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const contractInterface = contractAny?.interface;

        if (!contractAddress || !contractInterface) {
          if (isMounted) {
            setToast({
              type: "error",
              message: "Contract address/ABI not found. Please check deployment.",
              visible: true,
            });
            setIsAdminCheckComplete(true);
          }
          return;
        }

        const readContract = new ethers.Contract(
          contractAddress,
          contractInterface,
          rpcProvider
        );

        // 1) make sure contract exists at this address
        let code: string;
        try {
          code = await rpcProvider.getCode(contractAddress, "latest");
        } catch (getCodeError: any) {
          console.error("❌ Cannot read contract bytecode from Hardhat:", getCodeError);
          if (isMounted) {
            setToast({
              type: "error",
              message: "Cannot connect to Hardhat node. Start: npx hardhat node",
              visible: true,
            });
            setIsAdminCheckComplete(true);
          }
          return;
        }

        if (!code || code === "0x") {
          console.error("❌ No contract deployed at:", contractAddress);
          if (isMounted) {
            setToast({
              type: "error",
              message:
                "Contract not found on localhost. Run: npx hardhat run scripts/deploy.ts --network localhost",
              visible: true,
            });
            setIsAdminCheckComplete(true);
          }
          return;
        }

        // 2) admin detection
        try {
          const adminAddress = await retryWithDelay(() => readContract.admin());
          if (isMounted) {
            if (adminAddress) {
              setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());
            } else {
              setIsAdmin(false);
            }
            setIsAdminCheckComplete(true);
          }
        } catch (adminErr: any) {
          console.error("DEBUG: Admin check failed:", adminErr);
          if (isMounted) {
            setToast({
              type: "error",
              message: "Cannot read admin from contract. Check ABI / Hardhat node.",
              visible: true,
            });
            setIsAdmin(false);
            setIsAdminCheckComplete(true);
          }
        }

        // 3) phase detection
        try {
          const currentPhase = await retryWithDelay(() => readContract.phase());
          if (isMounted && currentPhase !== null && currentPhase !== undefined) {
            setPhase(Number(currentPhase));
          }
        } catch (phaseErr: any) {
          console.warn("DEBUG: Phase check failed:", phaseErr);
        }

        // 4) candidates
        try {
          const list = await retryWithDelay(() => readContract.getCandidates());
          if (isMounted && list) {
            setCandidates(list);
          }
        } catch (candidatesErr: any) {
          console.warn("DEBUG: Candidates fetch failed:", candidatesErr);
        }

        // 5) event listeners (only once)
        if (!listenersAttachedRef.current && contract.on && contract.filters) {
          const onPhaseChanged = (newPhase: bigint) => {
            if (!isMounted) return;
            setPhase(Number(newPhase));
          };

          const onCandidateAdded = async () => {
            try {
              const updated = await readContract.getCandidates();
              if (isMounted) {
                setCandidates(updated);
              }
            } catch (e) {
              console.warn("DEBUG: Failed to refresh candidates after add:", e);
            }
          };

          const onCandidateRemoved = async () => {
            try {
              const updated = await readContract.getCandidates();
              if (isMounted) {
                setCandidates(updated);
              }
            } catch (e) {
              console.warn("DEBUG: Failed to refresh candidates after remove:", e);
            }
          };

          contract.on(contract.filters.PhaseChanged(), onPhaseChanged);
          contract.on(contract.filters.CandidateAdded(), onCandidateAdded);
          contract.on(contract.filters.CandidateRemoved(), onCandidateRemoved);

          listenersAttachedRef.current = true;

          // store cleanup on ref so we can call in return
          (listenersAttachedRef as any).currentCleanup = () => {
            try {
              contract.off(contract.filters.PhaseChanged(), onPhaseChanged);
              contract.off(contract.filters.CandidateAdded(), onCandidateAdded);
              contract.off(contract.filters.CandidateRemoved(), onCandidateRemoved);
            } catch {
              // ignore
            }
          };
        }
      } catch (err) {
        console.error("DEBUG: Initialization error:", err);
      }
    })();

    // CLEANUP
    return () => {
      isMounted = false;
      // detach listeners if we attached
      const maybeCleanup = (listenersAttachedRef as any).currentCleanup;
      if (typeof maybeCleanup === "function") {
        maybeCleanup();
      }
      listenersAttachedRef.current = false;
    };
  }, [contract, account, rpcProvider]);

  return (
    <div className="min-h-screen bg-gradient-subtle font-sans">
      <Header
        account={account || undefined}
        chainId={chainId}
        phase={phase}
        isAdmin={isAdmin}
      />

      <MainContainer>
        {/* Welcome Card */}
        <div className="card p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome to BharatVote</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Week 2 Deliverable: Contract Integration with Admin &amp; Phase Detection
          </p>
        </div>

        {/* Connection Status Card */}
        {!isConnected ? (
          <div className="card p-8 space-y-6 max-w-md mx-auto">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Connect Your Wallet</h2>
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

            <PrimaryButton onClick={handleConnect} loading={isLoading} disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect MetaMask"}
            </PrimaryButton>

            <div className="text-xs text-slate-500 text-center">
              Don&apos;t have MetaMask?{" "}
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
          <>
            {/* Wallet Connected Card */}
            <div className="card p-8 space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">Wallet Connected!</h2>
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
            </div>

            {/* Week 2: Contract Integration Status */}
            {isAdminCheckComplete && (
              <div className="card p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Week 2: Contract Integration Status
                </h3>
                <div className="space-y-4">
                  {/* Admin Status */}
                  <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                    <Shield
                      className={`w-5 h-5 ${isAdmin ? "text-purple-600" : "text-slate-400"} flex-shrink-0 mt-0.5`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        Admin Status: {isAdmin ? "Administrator" : "Regular User"}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {isAdmin
                          ? "You have admin privileges to manage the election"
                          : "You can participate as a voter when the election starts"}
                      </p>
                    </div>
                  </div>

                  {/* Election Phase */}
                  <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        Current Phase: {getPhaseLabel(phase)}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {getPhaseHint(phase)}
                      </p>
                    </div>
                  </div>

                  {/* Candidates */}
                  {candidates.length > 0 && (
                    <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          Candidates: {candidates.filter((c) => c.isActive).length} Active
                        </p>
                        <div className="mt-2 space-y-1">
                          {candidates
                            .filter((c) => c.isActive)
                            .map((candidate) => (
                              <p
                                key={
                                  typeof candidate.id === "bigint"
                                    ? candidate.id.toString()
                                    : candidate.id
                                }
                                className="text-xs text-slate-700"
                              >
                                • {candidate.name}
                              </p>
                            ))}
                          {candidates.filter((c) => c.isActive).length === 0 && (
                            <p className="text-xs text-slate-500 italic">No candidates added yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Progress Card */}
            <div className="card p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Week 2 Technical Implementation
              </h3>
              <div className="space-y-3">
                {[
                  "Contract instance creation via Ethers.js",
                  "Admin detection by reading contract.admin()",
                  "Phase detection by reading contract.phase()",
                  "Real-time event listeners for PhaseChanged events",
                  "Candidate list fetching and updates",
                  "Role-based UI detection (admin vs voter)",
                  "Type-safe contract interface with TypeScript",
                  "Clean ABI/address abstraction layer",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Technical Stack Card */}
        <div className="card p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Week 1 + Week 2 Technical Stack
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">React</span>
                <span className="font-mono text-slate-900">18.2.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">TypeScript</span>
                <span className="font-mono text-slate-900">5.x</span>
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
