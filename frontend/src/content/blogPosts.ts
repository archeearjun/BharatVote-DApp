export interface BlogSection {
  heading: string;
  paragraphs: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  readMinutes: number;
  tags: string[];
  sections: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-commit-reveal",
    title: "Why We Use Commit-Reveal Voting",
    summary:
      "A practical look at how commit-reveal protects privacy during voting and still gives verifiable counting.",
    publishedAt: "2026-03-06",
    readMinutes: 6,
    tags: ["Solidity", "Privacy", "Voting"],
    sections: [
      {
        heading: "The Core Problem",
        paragraphs: [
          "If voters submit their choices directly during an active election, partial trends become visible too early. That can influence remaining voters and reduce fairness.",
          "We needed a pattern where a voter can lock a choice first, but keep that choice hidden until reveal phase."
        ]
      },
      {
        heading: "How Commit-Reveal Works Here",
        paragraphs: [
          "In commit phase, the voter submits a hash of candidate and salt. The contract stores only this hash, not the plain choice.",
          "In reveal phase, the voter submits the same candidate and salt. The contract recomputes the hash and verifies it matches the earlier commitment before counting the vote."
        ]
      },
      {
        heading: "Why This Is Better Than Commit-Only",
        paragraphs: [
          "Commit-only is not enough because final counting requires reveal data. Without reveal, there is no way to know the selected candidate.",
          "Commit-reveal gives both privacy during voting and verifiable counting at the end."
        ]
      }
    ]
  },
  {
    slug: "merkle-allowlist-explained",
    title: "Merkle Allowlists in BharatVote",
    summary:
      "How we keep large voter lists off chain while preserving on-chain eligibility verification.",
    publishedAt: "2026-03-06",
    readMinutes: 7,
    tags: ["Merkle Tree", "Scalability", "Eligibility"],
    sections: [
      {
        heading: "Why Not Store Full Voter Lists On Chain",
        paragraphs: [
          "Storing thousands of addresses on chain is expensive and slow.",
          "For scale and cost, we store only one Merkle root on chain and keep full address lists off chain."
        ]
      },
      {
        heading: "What Happens During Voting",
        paragraphs: [
          "Backend builds a Merkle tree from eligible wallet addresses and returns proofs for each voter.",
          "The voter sends the proof with commit transaction. The contract verifies that proof against on-chain Merkle root."
        ]
      },
      {
        heading: "Operational Flow",
        paragraphs: [
          "Admin uploads eligible addresses, backend computes Merkle root, and admin syncs that root on chain.",
          "Once synced, only addresses with valid proofs can commit."
        ]
      }
    ]
  },
  {
    slug: "main-vs-demo-elections",
    title: "Main Election vs Demo Election",
    summary:
      "What is intentionally different between production-like main flow and fast onboarding demo flow.",
    publishedAt: "2026-03-06",
    readMinutes: 5,
    tags: ["UX", "Demo", "Architecture"],
    sections: [
      {
        heading: "Main Election",
        paragraphs: [
          "Main election includes a guided verification gate and admin-managed allowlist upload for each election address.",
          "Voters go through verification flow before reaching the voter panel."
        ]
      },
      {
        heading: "Demo Election",
        paragraphs: [
          "Demo flow optimizes for speed. New wallets can join through open enrollment endpoint and skip KYC gate.",
          "The core on-chain voting logic is still the same: Merkle-gated commit and reveal."
        ]
      },
      {
        heading: "Why We Keep Both",
        paragraphs: [
          "Main flow demonstrates stricter onboarding and admin control.",
          "Demo flow is useful for classroom and interview environments where fast participation is required."
        ]
      }
    ]
  }
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
