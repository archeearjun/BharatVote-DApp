import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { ArrowRight, Shield, Sparkles, Users } from "lucide-react";
import CreateElection from "./CreateElection";
import MainContainer from "./MainContainer";

export default function LandingPage() {
  const navigate = useNavigate();
  const [addressInput, setAddressInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [isJoiningDemo, setIsJoiningDemo] = useState(false);

  const demoElectionAddress = import.meta.env.VITE_DEMO_ELECTION_ADDRESS as string | undefined;
  const demoEnabled = useMemo(
    () => Boolean(demoElectionAddress) && ethers.isAddress(demoElectionAddress as string),
    [demoElectionAddress]
  );

  useEffect(() => {
    if (demoElectionAddress && !demoEnabled) {
      console.warn(
        "LandingPage: VITE_DEMO_ELECTION_ADDRESS is set but is not a valid address:",
        demoElectionAddress
      );
    }
  }, [demoElectionAddress, demoEnabled]);

  const goToElection = (address: string) => {
    const trimmed = address.trim();
    if (!ethers.isAddress(trimmed)) {
      setJoinError("Please enter a valid election contract address.");
      return;
    }
    setJoinError(null);
    navigate(`/election/${trimmed}`);
  };

  const joinDemo = async () => {
    if (!demoEnabled || !demoElectionAddress) return;
    const ethereum = (window as any)?.ethereum;
    if (!ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    setIsJoiningDemo(true);
    setDemoError(null);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts?.[0];
      if (!userAddress || !ethers.isAddress(userAddress)) {
        alert("Could not read your wallet address from MetaMask.");
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const resp = await fetch(`${backendUrl}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress }),
      });
      if (!resp.ok) {
        let message = `Failed to join demo (${resp.status})`;
        try {
          const contentType = resp.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await resp.json();
            message = data?.error || JSON.stringify(data);
          } else {
            const text = await resp.text();
            if (text) message = text;
          }
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      // Skip KYC gate for demo users (persisted per-account in App.tsx)
      const key = `bv_kyc_${String(userAddress).toLowerCase()}`;
      localStorage.setItem(key, '1');

      navigate(`/election/${demoElectionAddress}`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to join demo.";
      setDemoError(message);
    } finally {
      setIsJoiningDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle font-sans md:flex md:items-center">
      <MainContainer className="space-y-6" paddingYClassName="py-10 md:py-0">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            BharatVote
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Create an election or join one in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: Admin */}
          <div className="card-premium p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Create Election</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Deploy a new secure voting contract to Sepolia.
                </p>
              </div>
            </div>
            <CreateElection />
          </div>

          {/* Right: Voter */}
          <div className="card-premium p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Cast Your Vote</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Join an existing election by address.
                </p>
              </div>
            </div>

            {/* Public Demo */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-purple-900">✨ Public Demo</div>
                  <div className="text-sm text-purple-800 mt-1">
                    Try the system with free test tokens.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={joinDemo}
                disabled={!demoEnabled || isJoiningDemo}
                className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  demoEnabled && !isJoiningDemo
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-purple-200 text-purple-700 cursor-not-allowed"
                }`}
              >
                {isJoiningDemo ? 'Setting up your wallet...' : 'Join Demo Election'}
                {!isJoiningDemo && <ArrowRight className="w-4 h-4" />}
              </button>

              {!demoEnabled && (
                <div className="mt-2 text-xs text-purple-800/80">
                  Demo is not configured. Set <span className="font-mono">VITE_DEMO_ELECTION_ADDRESS</span>.
                </div>
              )}

              {demoError && (
                <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {demoError}
                </div>
              )}
            </div>

            {/* Manual entry */}
            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700">Enter Election Address</label>
              <div className="mt-2 flex gap-2">
                <input
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="0x..."
                  className="input-base"
                />
                <button
                  type="button"
                  onClick={() => goToElection(addressInput)}
                  className="btn-primary px-5"
                >
                  Go
                </button>
              </div>
              {joinError && <div className="mt-2 text-sm text-red-600">{joinError}</div>}
            </div>
          </div>
        </div>
      </MainContainer>
    </div>
  );
}
