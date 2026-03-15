import DocsLayout, { DocsSectionIntro, DocsSplitSection } from "./DocsLayout";

const steps = [
  {
    phase: "Setup",
    title: "Create the election contract",
    detail: "Open BharatVote, choose Create Election, connect MetaMask, and confirm the deployment transaction on Sepolia.",
  },
  {
    phase: "Setup",
    title: "Add candidates in the admin panel",
    detail: "After the app routes to the new election address, configure the candidate list before opening voting.",
  },
  {
    phase: "Eligibility",
    title: "Upload the voter allowlist",
    detail: "Import eligible addresses using TXT, CSV, JSON, or pasted text so the backend can build the Merkle tree.",
  },
  {
    phase: "Eligibility",
    title: "Sync the Merkle root on chain",
    detail: "Use Sync Now so the contract reads the latest eligibility root before voters begin committing.",
  },
  {
    phase: "Commit",
    title: "Open commit phase",
    detail: "Eligible voters submit hash commitments with their Merkle proofs while the underlying choice stays private.",
  },
  {
    phase: "Reveal",
    title: "Open reveal phase",
    detail: "Voters reveal the exact same candidate and password that produced their earlier commitment hash.",
  },
  {
    phase: "Results",
    title: "Finish the election",
    detail: "Close the election and review tally output plus the public read-only results view.",
  },
  {
    phase: "Review",
    title: "Check any proof mismatch immediately",
    detail: "If commit fails, verify that the uploaded allowlist, generated proofs, and synced Merkle root all correspond to the same election address.",
  },
];

export default function MainElectionGuidePage() {
  return (
    <DocsLayout
      eyebrow="Operator Guide"
      title="Main Election Guide"
      description="This page now follows a more deliberate product-doc pattern: preparation first, execution second, and troubleshooting kept adjacent to the flow instead of buried at the end."
      heroActions={[
        { label: "Read Key Terms", to: "/learn", variant: "primary" },
        { label: "Open FAQ", to: "/faq", variant: "secondary" },
      ]}
      heroAsideTitle="Main mode at a glance"
      heroAsideDescription="Main election mode is the stricter path. It assumes an admin-managed allowlist, explicit Merkle-root sync, and a mock KYC gate before voters enter the election UI."
      heroAsideItems={[
        {
          label: "Actors",
          value: "Admin + allowlisted voters",
          description: "The admin prepares the election; voters commit and reveal only after they pass the gate.",
        },
        {
          label: "Lifecycle",
          value: "Setup -> Commit -> Reveal -> Results",
          description: "Each stage has a different responsibility and the contract enforces the transitions.",
        },
        {
          label: "Most critical action",
          value: "Merkle root sync",
          description: "If the root is stale, valid voters can still fail verification.",
        },
      ]}
      footerActions={[
        { label: "Open Demo Guide", to: "/guide/demo-election", variant: "secondary" },
        { label: "Read the Blog", to: "/blog", variant: "secondary" },
      ]}
    >
      <DocsSplitSection
        eyebrow="Preparation"
        title="Set the election up correctly before voting starts"
        description="The page now uses a TensorFlow-like split section here: one side explains the logic, the other side isolates the exact readiness checklist so the operator sees both context and action at once."
        bullets={[
          {
            title: "Use MetaMask on Sepolia",
            description: "The main flow assumes the wallet and chain are already correct before any admin action begins.",
          },
          {
            title: "Keep the backend available",
            description: "Allowlist upload, proof generation, and mock KYC support all depend on the backend layer being reachable.",
          },
          {
            title: "Prepare a clean voter list",
            description: "Garbage input at the allowlist stage turns into broken proofs later.",
          },
        ]}
        asideTitle="Readiness checklist"
        asideDescription="If these three items are true, the rest of the flow becomes predictable."
        asideItems={[
          {
            title: "Wallet ready",
            description: "MetaMask connected and pointed to Sepolia.",
          },
          {
            title: "Backend ready",
            description: "Frontend environment is wired to the running backend instance.",
          },
          {
            title: "Allowlist ready",
            description: "Eligible addresses are cleaned and prepared for upload.",
          },
        ]}
      />

      <DocsSectionIntro
        eyebrow="Execution"
        title="Run the main election in clear stages"
        description="Each step is isolated as its own operational card so the flow reads more like a product playbook than a long unordered checklist."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => (
          <article key={step.title} className="card-premium p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                {index + 1}
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {step.phase}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{step.detail}</p>
          </article>
        ))}
      </section>
    </DocsLayout>
  );
}
