import DocsLayout, { DocsSectionIntro, DocsSplitSection } from "./DocsLayout";

const terms = [
  {
    category: "Voting Flow",
    term: "Commit-Reveal Voting",
    meaning:
      "A two-phase process where a voter first submits a hash commitment, then later reveals candidate and salt for verification.",
  },
  {
    category: "Eligibility",
    term: "Merkle Root",
    meaning:
      "A compact cryptographic fingerprint of all eligible voter addresses. The contract stores this root on chain.",
  },
  {
    category: "Eligibility",
    term: "Merkle Proof",
    meaning:
      "A short proof path that shows a voter address belongs to the allowlist represented by the stored Merkle root.",
  },
  {
    category: "Deployment",
    term: "Election Factory Clone",
    meaning:
      "A lightweight election instance created from one implementation contract, reducing deployment cost for multiple elections.",
  },
  {
    category: "Architecture",
    term: "On-Chain State",
    meaning:
      "Contract-owned canonical state such as phase, commitments, reveal status, and tally.",
  },
  {
    category: "Architecture",
    term: "Off-Chain Services",
    meaning:
      "Backend endpoints for allowlist upload, proof generation, demo scheduler, analytics, and mock KYC workflow.",
  },
  {
    category: "Modes",
    term: "Main Election",
    meaning:
      "Admin-managed election with allowlist upload and mock KYC gate for voter onboarding.",
  },
  {
    category: "Modes",
    term: "Demo Election",
    meaning:
      "Open-enrollment flow optimized for fast onboarding, while preserving the same on-chain commit-reveal verification.",
  },
];

export default function LearnPage() {
  return (
    <DocsLayout
      eyebrow="Glossary"
      title="Key Terms"
      description="This glossary now follows a stronger instructional pattern: orient the reader first, then break the vocabulary into labeled concept cards so the product is easier to read page by page."
      heroActions={[
        { label: "Open Main Guide", to: "/guide/main-election", variant: "primary" },
        { label: "Read the FAQ", to: "/faq", variant: "secondary" },
      ]}
      heroAsideTitle="How to use this page"
      heroAsideDescription="Read this like a reference panel, not a long article. The goal is to make each core concept easy to scan before jumping into the guides or blog."
      heroAsideItems={[
        {
          label: "Terms",
          value: `${terms.length} core concepts`,
          description: "Enough to understand the product architecture and the voting lifecycle.",
        },
        {
          label: "Best after",
          value: "About page",
          description: "Start there for context, then come here when a technical term needs decoding.",
        },
        {
          label: "Best before",
          value: "Guides + blog",
          description: "Once these concepts are clear, the workflow pages become much easier to follow.",
        },
      ]}
      footerActions={[
        { label: "Open Demo Guide", to: "/guide/demo-election", variant: "secondary" },
        { label: "Read the Blog", to: "/blog", variant: "secondary" },
      ]}
    >
      <DocsSplitSection
        eyebrow="Orientation"
        title="Start with the concepts that shape every page"
        description="This glossary frames the concepts first, then presents each idea in a compact, scannable unit."
        bullets={[
          {
            title: "Understand the voting lifecycle",
            description: "Commit, reveal, and tally appear throughout the app and explain the election timing model.",
          },
          {
            title: "Understand eligibility",
            description: "Merkle roots and proofs explain how BharatVote verifies membership without storing huge lists on chain.",
          },
        ]}
        asideTitle="Recommended reading path"
        asideDescription="If you are new to the product, follow this order."
        asideItems={[
          {
            title: "1. About page",
            description: "Get the project story and architecture in plain language.",
          },
          {
            title: "2. Key terms",
            description: "Use this page to anchor the vocabulary behind the flows.",
          },
          {
            title: "3. Main or demo guide",
            description: "Move from concepts into exact operational steps.",
          },
        ]}
      />

      <DocsSectionIntro
        eyebrow="Concept Library"
        title="Grouped terms, not just a long glossary"
        description="Each card carries a track label so readers can understand where the concept belongs in the product."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {terms.map((item) => (
          <article key={item.term} className="card-premium p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              {item.category}
            </p>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{item.term}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.meaning}</p>
          </article>
        ))}
      </section>
    </DocsLayout>
  );
}
