import DocsLayout from "./DocsLayout";

const faqs = [
  {
    question: "What data is on chain versus off chain?",
    answer:
      "On chain stores election-critical state such as admin, phase, merkle root, commitments, reveal flags, and tally. Off chain stores support data such as allowlist files, proof services, and demo analytics."
  },
  {
    question: "Why is there a Sync Now button for Merkle root?",
    answer:
      "Eligible voter addresses are uploaded and processed off chain. The final Merkle root must be explicitly written on chain so contract eligibility verification uses the latest list."
  },
  {
    question: "Is KYC fully production-grade in this prototype?",
    answer:
      "No. KYC and face steps are mock or performative here. Final vote eligibility is still enforced on chain using Merkle proof verification during commit."
  },
  {
    question: "How do demo and main election differ?",
    answer:
      "Main election uses admin-managed allowlist and KYC gate. Demo flow prioritizes onboarding speed with open enrollment endpoint, but keeps the same on-chain commit-reveal verification."
  },
  {
    question: "How does BharatVote scale for many elections?",
    answer:
      "ElectionFactory creates lightweight clone instances. Merkle root compression avoids storing huge voter lists on chain. This keeps deployment and storage costs controlled."
  },
];

export default function FaqPage() {
  return (
    <DocsLayout
      title="Frequently Asked Questions"
      description="Quick answers for users, evaluators, and interview panels."
    >
      <section className="grid gap-4">
        {faqs.map((item) => (
          <article key={item.question} className="card-premium p-6">
            <h2 className="text-base font-semibold text-slate-900">{item.question}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
          </article>
        ))}
      </section>
    </DocsLayout>
  );
}

