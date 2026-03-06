import DocsLayout from "./DocsLayout";

const steps = [
  "Open BharatVote and click Create Election.",
  "Connect MetaMask and confirm election creation transaction.",
  "After routing to the election address, add candidates from Admin panel.",
  "Upload eligible voter addresses using TXT, CSV, JSON, or pasted text.",
  "Sync backend Merkle root on chain with Sync Now action.",
  "Move to commit phase and let eligible voters commit hash with Merkle proof.",
  "Move to reveal phase and let voters reveal with exact same candidate and password.",
  "Finish election and open tally plus public results."
];

export default function MainElectionGuidePage() {
  return (
    <DocsLayout
      title="Main Election Guide"
      description="A full step-by-step operating guide for admin and voters in main election mode."
    >
      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-slate-900">Before You Start</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Use MetaMask and connect to Sepolia network.</li>
          <li>Keep backend running and configured in frontend environment.</li>
          <li>Prepare a clean eligible voter address file for allowlist upload.</li>
        </ul>
      </section>

      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-slate-900">Main Flow</h2>
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
        <h2 className="text-lg font-semibold text-slate-900">Troubleshooting</h2>
        <p className="mt-2 text-sm text-slate-600">
          If commit fails due to proof mismatch, re-check that backend allowlist was uploaded for the same election address
          and Merkle root was synced on chain after the upload.
        </p>
      </section>
    </DocsLayout>
  );
}

