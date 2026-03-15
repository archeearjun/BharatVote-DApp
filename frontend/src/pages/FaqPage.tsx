import DocsLayout, { DocsSectionIntro, DocsSplitSection } from "./DocsLayout";

const faqs = [
  {
    category: "Architecture",
    question: "What data is on chain versus off chain?",
    answer:
      "On chain stores election-critical state such as admin, phase, merkle root, commitments, reveal flags, and tally. Off chain stores support data such as allowlist files, proof services, and demo analytics.",
  },
  {
    category: "Eligibility",
    question: "Why is there a Sync Now button for Merkle root?",
    answer:
      "Eligible voter addresses are uploaded and processed off chain. The final Merkle root must be explicitly written on chain so contract eligibility verification uses the latest list.",
  },
  {
    category: "Prototype Scope",
    question: "Is KYC fully production-grade in this prototype?",
    answer:
      "No. KYC and face steps are mock or performative here. Final vote eligibility is still enforced on chain using Merkle proof verification during commit.",
  },
  {
    category: "Modes",
    question: "How do demo and main election differ?",
    answer:
      "Main election uses admin-managed allowlist and KYC gate. Demo flow prioritizes onboarding speed with open enrollment endpoint, but keeps the same on-chain commit-reveal verification.",
  },
  {
    category: "Scalability",
    question: "How does BharatVote scale for many elections?",
    answer:
      "ElectionFactory creates lightweight clone instances. Merkle root compression avoids storing huge voter lists on chain. This keeps deployment and storage costs controlled.",
  },
];

export default function FaqPage() {
  return (
    <DocsLayout
      eyebrow="Help Center"
      title="Frequently Asked Questions"
      description="This page now uses a more structured support pattern: explain the common concerns up front, then present each answer as a categorized card instead of a plain stacked list."
      heroActions={[
        { label: "Open Main Guide", to: "/guide/main-election", variant: "primary" },
        { label: "Read the Blog", to: "/blog", variant: "secondary" },
      ]}
      heroAsideTitle="Who this page is for"
      heroAsideDescription="These answers are written for evaluators, technical reviewers, admins, and curious users who need short, reliable explanations without digging through the app."
      heroAsideItems={[
        {
          label: "Audience",
          value: "Reviewers + users",
          description: "Useful during demos, interviews, project reviews, and onboarding.",
        },
        {
          label: "Scope",
          value: "Architecture + operations",
          description: "Covers what the system does, why specific buttons exist, and where the prototype draws its boundaries.",
        },
        {
          label: "Best pair",
          value: "Guide pages",
          description: "Use the FAQ for the why, and the guides for the exact how.",
        },
      ]}
      footerActions={[
        { label: "Key Terms", to: "/learn", variant: "secondary" },
        { label: "Demo Guide", to: "/guide/demo-election", variant: "secondary" },
      ]}
    >
      <DocsSplitSection
        eyebrow="Read First"
        title="Most questions come from three pressure points"
        description="In practice, people usually want clarity on one of three things: what is actually enforced on chain, what the prototype intentionally simplifies, and how the demo flow differs from the main election flow."
        bullets={[
          {
            title: "Trust model",
            description: "Which parts of the system are enforced on chain, and which parts are helpers around the workflow?",
          },
          {
            title: "Prototype honesty",
            description: "What is production-grade and what is still a simulated or mock step?",
          },
          {
            title: "Operational flow",
            description: "Why do certain admin actions exist and how do they connect to eligibility checks?",
          },
        ]}
        asideTitle="Quick routes"
        asideDescription="If a question points to a workflow rather than a definition, go directly here."
        asideItems={[
          {
            title: "Main election guide",
            description: "Best for admin steps, allowlist handling, and the full commit-to-results lifecycle.",
          },
          {
            title: "Demo guide",
            description: "Best for classroom or interview-friendly onboarding where speed matters.",
          },
          {
            title: "Key terms",
            description: "Best when the blocker is vocabulary rather than process.",
          },
        ]}
      />

      <DocsSectionIntro
        eyebrow="Answers"
        title="Operational and technical questions, categorized"
        description="The page keeps the answers short, but the new layout makes them easier to scan by grouping each one as a focused support card."
      />

      <section className="grid gap-4 xl:grid-cols-2">
        {faqs.map((item) => (
          <article key={item.question} className="card-premium p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              {item.category}
            </p>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{item.question}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
          </article>
        ))}
      </section>
    </DocsLayout>
  );
}
