import DocsLayout from "./DocsLayout";

export default function AboutPage() {
  return (
    <DocsLayout
      title="About BharatVote"
      description="BharatVote is a blockchain voting application using commit-reveal privacy, Merkle proof eligibility, and role-based admin and voter workflows."
    >
      <section className="grid gap-6 md:grid-cols-2">
        <article className="card-premium p-6">
          <h2 className="text-lg font-semibold text-slate-900">Problem We Solve</h2>
          <p className="mt-2 text-sm text-slate-600">
            A voting system must preserve secrecy during active voting, enforce eligibility, and produce an auditable final tally.
            BharatVote separates these concerns into on-chain verification and off-chain operational support.
          </p>
        </article>
        <article className="card-premium p-6">
          <h2 className="text-lg font-semibold text-slate-900">Core Architecture</h2>
          <p className="mt-2 text-sm text-slate-600">
            Smart contracts enforce election phases and counting. Backend provides KYC mock, Merkle proof APIs, demo automation,
            and analytics indexing. Frontend orchestrates wallet, routes, and admin or voter actions.
          </p>
        </article>
      </section>

      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-slate-900">Trust Boundary</h2>
        <p className="mt-2 text-sm text-slate-600">
          Final correctness is on-chain. The contract verifies eligibility proof, commit hash integrity, reveal validity, and tally updates.
          Backend is used for off-chain compute and user experience support.
        </p>
      </section>
    </DocsLayout>
  );
}

