import DocsLayout from "./DocsLayout";

const terms = [
  {
    term: "Commit-Reveal Voting",
    meaning:
      "A two-phase process where a voter first submits a hash commitment, then later reveals candidate and salt for verification."
  },
  {
    term: "Merkle Root",
    meaning:
      "A compact cryptographic fingerprint of all eligible voter addresses. The contract stores this root on chain."
  },
  {
    term: "Merkle Proof",
    meaning:
      "A short proof path that shows a voter address belongs to the allowlist represented by the stored Merkle root."
  },
  {
    term: "Election Factory Clone",
    meaning:
      "A lightweight election instance created from one implementation contract, reducing deployment cost for multiple elections."
  },
  {
    term: "On-Chain State",
    meaning:
      "Contract-owned canonical state such as phase, commitments, reveal status, and tally."
  },
  {
    term: "Off-Chain Services",
    meaning:
      "Backend endpoints for allowlist upload, proof generation, demo scheduler, analytics, and mock KYC workflow."
  },
  {
    term: "Main Election",
    meaning:
      "Admin-managed election with allowlist upload and mock KYC gate for voter onboarding."
  },
  {
    term: "Demo Election",
    meaning:
      "Open-enrollment flow optimized for fast onboarding, while preserving the same on-chain commit-reveal verification."
  }
];

export default function LearnPage() {
  return (
    <DocsLayout
      title="Key Terms"
      description="This glossary explains the core concepts used in BharatVote so new users can follow the full flow quickly."
    >
      <section className="grid gap-4">
        {terms.map((item) => (
          <article key={item.term} className="card-premium p-5">
            <h2 className="text-base font-semibold text-slate-900">{item.term}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.meaning}</p>
          </article>
        ))}
      </section>
    </DocsLayout>
  );
}

