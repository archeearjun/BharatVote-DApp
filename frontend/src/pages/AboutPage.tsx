import DocsLayout, { DocsSectionIntro, DocsSplitSection } from "./DocsLayout";

const systemLayers = [
  {
    label: "Contract Layer",
    title: "Election rules stay verifiable on chain",
    description:
      "Admin access, phase transitions, Merkle-root verification, commitments, reveals, and final tally integrity all live inside the smart contracts.",
  },
  {
    label: "Backend Layer",
    title: "Off-chain services handle operational weight",
    description:
      "The backend computes allowlist proofs, supports mock KYC, powers demo joins, and helps with analytics without becoming the source of truth for vote correctness.",
  },
  {
    label: "Frontend Layer",
    title: "The UI separates admin and voter journeys cleanly",
    description:
      "Landing, guides, blog, FAQ, and the election flows all serve different audiences, so the frontend needs structure as much as it needs visuals.",
  },
];

const highlights = [
  "Clone-based election deployment through an on-chain factory.",
  "Merkle allowlists to keep eligibility scalable and cheap.",
  "Commit-reveal voting so privacy survives the active election window.",
  "Separate main and demo modes for stricter versus faster onboarding.",
  "Public read-only results for observers without wallet access.",
  "Sepolia-first deployment so demos stay practical and reproducible.",
];

export default function AboutPage() {
  return (
    <DocsLayout
      eyebrow="Project Story"
      title="About BharatVote and Me"
      description="This page now opens like a product overview instead of a loose profile page: who built BharatVote, how the system is organized, why the design choices matter, and where to review the working demo."
      heroActions={[
        {
          label: "Watch Demo Video",
          href: "https://drive.google.com/file/d/1DVnHP_X05USvukOKQOIMmL6KTnCEIO2r/view?usp=sharing",
          variant: "primary",
        },
        {
          label: "LinkedIn Profile",
          href: "https://www.linkedin.com/in/archeearjun/",
          variant: "secondary",
        },
      ]}
      heroAsideTitle="What this page covers"
      heroAsideDescription="The structure borrows the TensorFlow idea of guiding people through context first, then system breakdown, then evidence and next actions."
      heroAsideItems={[
        {
          label: "Builder",
          value: "Archee Arjun",
          description: "BITS Pilani student building BharatVote as a verifiable blockchain voting project.",
        },
        {
          label: "Architecture",
          value: "3-layer stack",
          description: "Smart contracts, backend services, and a frontend with distinct admin and voter journeys.",
        },
        {
          label: "Focus",
          value: "Privacy + correctness",
          description: "Commit-reveal and Merkle proofs anchor the technical design.",
        },
      ]}
      footerActions={[
        { label: "Open Main Guide", to: "/guide/main-election", variant: "secondary" },
        { label: "Read the Blog", to: "/blog", variant: "secondary" },
      ]}
    >
      <DocsSectionIntro
        eyebrow="System View"
        title="How BharatVote is organized"
        description="Instead of presenting the project as one big block, the page now breaks it into the same kind of guided modules seen on TensorFlow: overview, architecture, principles, and supporting proof points."
      />

      <section className="grid gap-4 lg:grid-cols-3">
        {systemLayers.map((layer) => (
          <article key={layer.title} className="card-premium p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              {layer.label}
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">{layer.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{layer.description}</p>
          </article>
        ))}
      </section>

      <DocsSplitSection
        eyebrow="Intent"
        title="Why I built BharatVote this way"
        description="The point was not just to put voting on blockchain. The point was to show a credible path where secrecy, eligibility, and auditability are all explicit, and where the demo flow stays understandable for evaluators."
        bullets={[
          {
            title: "Protect active voting",
            description:
              "Commit-reveal avoids exposing live choices before the reveal window opens, which keeps intermediate trends from influencing late voters.",
          },
          {
            title: "Keep eligibility scalable",
            description:
              "Merkle proofs let the contract verify membership without storing the whole voter list on chain.",
          },
          {
            title: "Make demos practical",
            description:
              "Separate demo and main election modes let the product show both strict and fast onboarding paths.",
          },
          {
            title: "Preserve a clean UI",
            description:
              "A structured frontend keeps technical depth accessible instead of dumping everything into one screen.",
          },
        ]}
        asideTitle="Project principles"
        asideDescription="These are the constraints that shaped the implementation."
        asideItems={[
          {
            title: "On-chain source of truth",
            description: "Critical election state belongs to the contracts, not the backend.",
          },
          {
            title: "Operational helpers stay off chain",
            description: "Proof generation, uploads, demo joins, and mock KYC can be operational services without owning the tally.",
          },
          {
            title: "Every audience gets a clearer path",
            description: "Admins, voters, reviewers, and interviewers each need different entry points into the same system.",
          },
        ]}
      />

      <DocsSectionIntro
        eyebrow="Highlights"
        title="What the project demonstrates well"
        description="This is the evaluation layer of the page: concise proof points instead of long narrative paragraphs."
      />

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {highlights.map((highlight, index) => (
          <article key={highlight} className="card-premium p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              {index + 1}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{highlight}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <article className="card-premium p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Walkthrough</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">See the full product flow in action</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            The demo video shows the end-to-end system rather than isolated screens. That makes it the best companion to this page after the architecture overview.
          </p>
          <a
            href="https://drive.google.com/file/d/1DVnHP_X05USvukOKQOIMmL6KTnCEIO2r/view?usp=sharing"
            target="_blank"
            rel="noreferrer noopener"
            className="btn-primary mt-6 inline-flex"
          >
            Watch Demo Video
          </a>
        </article>

        <article className="card-premium p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Builder</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">About me</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            I am Archee Arjun from BITS Pilani. I built BharatVote to combine rigorous election mechanics with a product experience that still feels demo-ready and understandable.
          </p>
          <a
            href="https://www.linkedin.com/in/archeearjun/"
            target="_blank"
            rel="noreferrer noopener"
            className="btn-secondary mt-6 inline-flex"
          >
            LinkedIn Profile
          </a>
        </article>
      </section>
    </DocsLayout>
  );
}
