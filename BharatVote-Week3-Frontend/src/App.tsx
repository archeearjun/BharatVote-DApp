import { useState, useEffect, Suspense, lazy } from "react";
import useWallet from "./useWallet";
import { UI_MESSAGES, COMMIT_PHASE } from "./constants";
import KycPage from "./components/KycPage";
import Header from "./components/Header";
import { Shield, RefreshCw } from "lucide-react";
import { I18nProvider } from "./i18n";

const Admin = lazy(() => import("./Admin"));
const Voter = lazy(() => import("./Voter"));

function App() {
  const {
    connect,
    isConnected,
    isLoading,
    account,
    contract,
    error,
    provider, // ← used to probe chain & bytecode
  } = useWallet();

  // KYC (for non-admin voters)
  const [isKycVerified, setIsKycVerified] = useState(false);

  // Admin detection & phase/candidates
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminCheckComplete, setIsAdminCheckComplete] = useState(false);
  const [phase, setPhase] = useState<number>(COMMIT_PHASE);
  const [candidates, setCandidates] = useState<any[]>([]);

  // Health checks
  const [contractHealthy, setContractHealthy] = useState<boolean | null>(null);
  const [probeMsg, setProbeMsg] = useState<string | null>(null);

  // Persist KYC per-account so refresh doesn’t force re-verification.
  useEffect(() => {
    if (!account) return;
    const key = `bv_kyc_${account.toLowerCase()}`;
    const fromStorage = localStorage.getItem(key);
    if (fromStorage === "1") {
      setIsKycVerified(true);
    }
  }, [account]);

  // Helper: quickly check if a function exists in the deployed interface
  const hasFn = (name: string) => {
    try {
      contract?.interface?.getFunction(name);
      return true;
    } catch {
      return false;
    }
  };

  // Probe the on-chain contract once we have provider+contract
  useEffect(() => {
    if (!provider || !contract) return;
    (async () => {
      try {
        const addr = await contract.getAddress?.();
        const net = await provider.getNetwork();
        const code = await provider.getCode(addr);
        const fnNames = contract.interface.fragments
          .filter((f: any) => f.type === "function")
          .map((f: any) => f.name);

        console.log("[Probe] contract address:", addr);
        console.log("[Probe] chainId:", Number(net.chainId));
        console.log("[Probe] bytecode length:", code.length); // "0x" => no code
        console.log("[Probe] ABI functions:", fnNames);

        if (code === "0x") {
          setContractHealthy(false);
          setProbeMsg(
            `No contract code at ${addr}. Redeploy on your local chain and update src/contracts/BharatVote.json with the fresh address.`
          );
        } else {
          setContractHealthy(true);
          setProbeMsg(null);
        }
      } catch (e: any) {
        console.error("[Probe] failed:", e);
        setContractHealthy(false);
        setProbeMsg(e?.message || "Probe failed");
      }
    })();
  }, [provider, contract]);

  // Fetch candidates from contract (filter to active)
  const fetchCandidates = async () => {
    if (!contract || !hasFn("getCandidates")) {
      setCandidates([]);
      return;
    }
    try {
      const fetched = await contract.getCandidates();
      const active = (fetched || [])
        .filter((c: any) => c.isActive)
        .map((c: any) => ({
          id: Number(c.id),
          name: c.name,
          isActive: c.isActive,
        }));
      setCandidates(active);
    } catch (err) {
      console.error("DEBUG App: Error fetching candidates:", err);
      setCandidates([]);
    }
  };

  // Admin check + phase + candidates
  useEffect(() => {
    const run = async () => {
      if (!contract || !account || !provider) {
        setIsAdminCheckComplete(false);
        return;
      }

      try {
        // Ensure the address actually has bytecode.
        const addr = await contract.getAddress?.();
        const code = await provider.getCode(addr);
        if (code === "0x") {
          throw new Error(
            `No contract code at ${addr}. Frontend JSON address is stale. Redeploy and update BharatVote.json.`
          );
        }

        // Derive admin address from getContractInfo() if present, else admin()
        let adminAddress: string | undefined;
        if (hasFn("getContractInfo")) {
          const info = await contract.getContractInfo();
          adminAddress = info._admin ?? info[0];
        } else if (hasFn("admin")) {
          adminAddress = await contract.admin();
        } else {
          throw new Error(
            "Neither getContractInfo() nor admin() exist on the deployed bytecode/ABI."
          );
        }

        const isAdminUser =
          adminAddress?.toLowerCase() === account.toLowerCase();

        // Hardhat default first signer fallback (dev-only)
        const knownAdmin = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
        const finalAdminStatus =
          isAdminUser || account.toLowerCase() === knownAdmin.toLowerCase();

        setIsAdmin(finalAdminStatus);

        // Phase (if present)
        if (hasFn("phase")) {
          try {
            const currentPhase = await contract.phase();
            setPhase(Number(currentPhase));
          } catch (phaseErr) {
            console.error("DEBUG App: Error fetching phase:", phaseErr);
          }
        }

        await fetchCandidates();
        setIsAdminCheckComplete(true);
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdminCheckComplete(true);
      }
    };

    run();
  }, [contract, account, provider]); // include provider

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  // Wallet connect screen
  if (!isConnected) {
    return (
      <I18nProvider>
        <div className="min-h-screen bg-gradient-subtle font-sans">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="card p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">
                  BharatVote - Week 3: Commit Phase Voting
                </h1>

                <div className="text-center">
                  <p className="text-slate-600 mb-6">
                    Connect your wallet to start voting
                  </p>
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        {UI_MESSAGES.CONNECTING}
                      </>
                    ) : (
                      UI_MESSAGES.CONNECT_WALLET
                    )}
                  </button>
                  {error && (
                    <p className="mt-4 text-red-600 text-sm">{error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </I18nProvider>
    );
  }

  // If we proved there is no bytecode at the address, show a clear message.
  if (isConnected && contractHealthy === false) {
    return (
      <I18nProvider>
        <div className="min-h-screen bg-gradient-subtle font-sans">
          <div className="flex items-center justify-center min-h-screen">
            <div className="card-premium p-8 text-center max-w-md mx-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Contract Not Deployed at Address
              </h3>
              <p className="text-sm text-slate-700">
                The app tried to call your contract, but there’s no bytecode at
                the configured address.
                <br />
                Redeploy on Hardhat and update{" "}
                <code>src/contracts/BharatVote.json</code> with the fresh
                address.
              </p>
              {probeMsg && (
                <p className="mt-4 text-xs text-slate-500 whitespace-pre-wrap">
                  {probeMsg}
                </p>
              )}
            </div>
          </div>
        </div>
      </I18nProvider>
    );
  }

  // Loading while checking admin status
  if (!isAdminCheckComplete) {
    return (
      <I18nProvider>
        <div className="min-h-screen bg-gradient-subtle font-sans">
          <div className="flex items-center justify-center min-h-screen">
            <div className="card-premium p-8 text-center max-w-sm mx-4">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-slate-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Verifying Access
              </h3>
              <p className="text-sm text-slate-600">
                Checking your authorization level...
              </p>
            </div>
          </div>
        </div>
      </I18nProvider>
    );
  }

  // Non-admin must pass KYC
  if (!isAdmin && !isKycVerified) {
    return (
      <I18nProvider>
        <KycPage
          account={account!}
          onVerified={(_voterId: string) => {
            setIsKycVerified(true);
            if (account) {
              const key = `bv_kyc_${account.toLowerCase()}`;
              localStorage.setItem(key, "1");
            }
          }}
        />
      </I18nProvider>
    );
  }

  // Main interface (Admin or Voter)
  return (
    <I18nProvider>
      <div className="min-h-screen bg-gradient-subtle font-sans">
        <Header account={account ?? undefined} phase={phase} isAdmin={isAdmin} />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {isAdmin ? (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-16">
                    <div className="card p-6 text-center">
                      <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-3" />
                      <p className="text-sm text-slate-600">
                        Loading admin interface...
                      </p>
                    </div>
                  </div>
                }
              >
                <Admin
                  contract={contract}
                  phase={phase}
                  onError={(err: string) => console.error("Admin error:", err)}
                  onPhaseChange={() => {
                    if (contract && hasFn("phase")) {
                      contract
                        .phase()
                        .then((p: any) => setPhase(Number(p)))
                        .catch((e: any) =>
                          console.error("Phase refresh failed:", e)
                        );
                    }
                    fetchCandidates();
                  }}
                  onCandidateAdded={() => {
                    fetchCandidates();
                  }}
                />
              </Suspense>
            ) : (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-16">
                    <div className="card-premium p-8 text-center max-w-sm mx-auto">
                      <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Loading Voting Interface
                      </h3>
                      <p className="text-sm text-slate-600">
                        Preparing your secure voting experience...
                      </p>
                    </div>
                  </div>
                }
              >
                {contract && account && (
                  <Voter
                    contract={contract}
                    phase={phase}
                    setPhase={setPhase}
                    voterId={account}
                    onRevealSuccess={() => {
                      // After reveal, refresh candidates (tally/UI)
                      fetchCandidates();
                    }}
                    candidates={candidates}
                  />
                )}
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </I18nProvider>
  );
}

export default App;
