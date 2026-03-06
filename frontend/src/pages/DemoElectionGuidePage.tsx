import DocsLayout from "./DocsLayout";

const steps = [
  "Open landing page and click Join Demo Election.",
  "Connect MetaMask and approve account request.",
  "Backend demo join endpoint auto-registers your wallet in demo allowlist.",
  "If wallet gas is low, backend can top up demo gas balance.",
  "Backend syncs updated Merkle root on chain for demo election.",
  "Commit vote in commit phase using candidate and password.",
  "Reveal vote in reveal phase using the same candidate and password.",
  "Watch demo timer banner and all-time public results analytics."
];

export default function DemoElectionGuidePage() {
  return (
    <DocsLayout
      title="Demo Election Guide"
      description="Fast onboarding guide for classroom and interview demos while keeping the same on-chain commit-reveal logic."
    >
      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-slate-900">What Is Different In Demo Mode</h2>
        <p className="mt-2 text-sm text-slate-600">
          Demo mode skips the main KYC gate and focuses on quick participation. The on-chain voting logic remains unchanged:
          proof-based commit and verified reveal.
        </p>
      </section>

      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-slate-900">Demo Flow</h2>
        <ol className="mt-4 space-y-3 text-sm text-slate-700">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-slate-900">Operational Notes</h2>
        <p className="mt-2 text-sm text-slate-600">
          Demo scheduler can auto-advance phases. If backend sleeps, timer banner can trigger a tick call to advance the lifecycle.
          Public results all-time mode prefers backend indexed analytics and falls back to chain event scanning.
        </p>
      </section>
    </DocsLayout>
  );
}

