import DocsLayout, { DocsSectionIntro, DocsSplitSection } from "./DocsLayout";

const steps = [
  {
    phase: "Join",
    title: "Use the landing-page demo entry point",
    detail: "Open the landing page and choose Join Demo Election so the app routes you into the fast onboarding path.",
  },
  {
    phase: "Wallet",
    title: "Connect MetaMask",
    detail: "Approve the account request and let the product read the active wallet address for demo registration.",
  },
  {
    phase: "Enrollment",
    title: "Auto-register in the demo allowlist",
    detail: "The backend join endpoint adds the wallet to the demo allowlist and prepares proof eligibility without asking for the main KYC sequence.",
  },
  {
    phase: "Support",
    title: "Top up gas if needed",
    detail: "If the wallet is underfunded, the backend can help with demo gas so onboarding does not stall during evaluation.",
  },
  {
    phase: "Eligibility",
    title: "Sync the refreshed Merkle root",
    detail: "Once the demo allowlist changes, the backend syncs the updated root on chain so commit verification stays aligned.",
  },
  {
    phase: "Commit",
    title: "Commit your vote",
    detail: "During commit phase, submit the commitment using the selected candidate and password-derived hash.",
  },
  {
    phase: "Reveal",
    title: "Reveal with the same inputs",
    detail: "In reveal phase, submit the exact same candidate and password combination used during commit.",
  },
  {
    phase: "Observe",
    title: "Watch timers and public analytics",
    detail: "The demo timer banner and all-time public results make the demo more self-explanatory for interview or classroom use.",
  },
];

export default function DemoElectionGuidePage() {
  return (
    <DocsLayout
      eyebrow="Fast Onboarding"
      title="Demo Election Guide"
      description="This guide now mirrors the TensorFlow-style organization more closely: first explain what makes demo mode different, then present the flow as compact operational cards with clear state changes."
      heroActions={[
        { label: "Open FAQ", to: "/faq", variant: "primary" },
        { label: "Read Key Terms", to: "/learn", variant: "secondary" },
      ]}
      heroAsideTitle="Demo mode at a glance"
      heroAsideDescription="Demo mode removes friction but keeps the same core contract logic. The point is faster participation, not a different trust model for vote verification."
      heroAsideItems={[
        {
          label: "Audience",
          value: "Classrooms + interviews",
          description: "Designed for fast hands-on participation where time is limited.",
        },
        {
          label: "Difference",
          value: "No main KYC gate",
          description: "The app prioritizes entry speed while keeping Merkle-gated commit and reveal logic intact.",
        },
        {
          label: "Support",
          value: "Backend-assisted onboarding",
          description: "Demo enrollment, gas help, and phase support reduce friction during live demos.",
        },
      ]}
      footerActions={[
        { label: "Open Main Guide", to: "/guide/main-election", variant: "secondary" },
        { label: "Read the Blog", to: "/blog", variant: "secondary" },
      ]}
    >
      <DocsSplitSection
        eyebrow="Difference"
        title="Demo mode is faster, not structurally looser"
        description="The page now makes the tradeoff explicit. Demo mode skips the heavyweight onboarding path, but the election still relies on the same proof-based commit and verified reveal lifecycle."
        bullets={[
          {
            title: "Faster entry",
            description: "Users join through a dedicated backend endpoint instead of the mock KYC sequence.",
          },
          {
            title: "Same core vote logic",
            description: "The contract still checks the commitment and reveal pair against the stored state.",
          },
          {
            title: "Better live demos",
            description: "Gas help, timers, and analytics reduce the odds of a stalled presentation.",
          },
        ]}
        asideTitle="Where demo mode helps most"
        asideDescription="This path is best when the goal is to demonstrate the product quickly in front of an audience."
        asideItems={[
          {
            title: "Interview settings",
            description: "Less setup overhead means more time to discuss the architecture and tradeoffs.",
          },
          {
            title: "Classroom demos",
            description: "Students can join faster without waiting on a manual allowlist flow.",
          },
          {
            title: "Live review sessions",
            description: "The flow stays short enough to fit inside a limited presentation window.",
          },
        ]}
      />

      <DocsSectionIntro
        eyebrow="Execution"
        title="Run the demo flow as a guided sequence"
        description="Each card below maps to an operational stage so the fast path still feels controlled and understandable."
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
