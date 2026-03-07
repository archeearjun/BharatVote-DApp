import DocsLayout from "./DocsLayout";

export default function AboutPage() {
  return (
    <DocsLayout
      title="About BharatVote and Me"
      description="Personal portfolio page for BharatVote by Archee Arjun, including project intent, architecture highlights, and demo resources."
    >
      <section className="grid gap-6 md:grid-cols-2">
        <article className="card-premium p-6">
          <h2 className="text-lg font-semibold text-slate-900">About Me</h2>
          <p className="mt-2 text-sm text-slate-600">
            I am Archee Arjun from BITS Pilani. I built BharatVote as a blockchain voting project focused on
            verifiable election flows, clean user experience, and practical deployment on Sepolia.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://www.linkedin.com/in/archeearjun/"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              LinkedIn Profile
            </a>
          </div>
        </article>
        <article className="card-premium p-6">
          <h2 className="text-lg font-semibold text-slate-900">Project Overview</h2>
          <p className="mt-2 text-sm text-slate-600">
            BharatVote is a three-layer application. The smart contract layer enforces election correctness on chain,
            the backend handles allowlist proofs and demo operations, and the frontend manages admin and voter workflows.
          </p>
        </article>
      </section>

      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-slate-900">Why I Built This</h2>
        <p className="mt-2 text-sm text-slate-600">
          I wanted to build a voting system where privacy and correctness are both explicit. Commit-reveal protects vote secrecy
          during active phases, and Merkle proof eligibility avoids expensive on-chain voter list storage.
        </p>
      </section>

      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-slate-900">Project Highlights</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Clone-based election creation through an on-chain factory.</li>
          <li>Merkle-root-based voter eligibility with proof verification on commit.</li>
          <li>Commit-reveal voting phases with on-chain tally integrity.</li>
          <li>Main election and demo election modes with separate onboarding flows.</li>
          <li>Public read-only results and demo analytics support.</li>
        </ul>
      </section>

      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-slate-900">Demo Video</h2>
        <p className="mt-2 text-sm text-slate-600">
          Full product walkthrough and election flow demonstration:
        </p>
        <div className="mt-4">
          <a
            href="https://drive.google.com/file/d/1DVnHP_X05USvukOKQOIMmL6KTnCEIO2r/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            Watch Demo Video
          </a>
        </div>
      </section>
    </DocsLayout>
  );
}
