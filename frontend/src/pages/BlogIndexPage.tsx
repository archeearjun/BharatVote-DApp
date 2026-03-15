import { Link } from "react-router-dom";
import DocsLayout, { DocsSectionIntro } from "./DocsLayout";
import { BLOG_POSTS } from "@/content/blogPosts";

function formatDate(isoDate: string) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function BlogIndexPage() {
  const [featuredPost, ...restPosts] = BLOG_POSTS;

  return (
    <DocsLayout
      eyebrow="Technical Notes"
      title="BharatVote Blog"
      description="The blog now opens with a featured entry point and a clearer post library, following the same organization pattern as the other content pages instead of dropping straight into a generic list."
      heroActions={[
        featuredPost
          ? { label: "Read Featured Post", to: `/blog/${featuredPost.slug}`, variant: "primary" }
          : { label: "Read Key Terms", to: "/learn", variant: "primary" },
        { label: "Open FAQ", to: "/faq", variant: "secondary" },
      ]}
      heroAsideTitle="What this library covers"
      heroAsideDescription="These posts are short technical write-ups focused on design decisions, election flow tradeoffs, and why the app separates certain responsibilities across layers."
      heroAsideItems={[
        {
          label: "Posts",
          value: `${BLOG_POSTS.length} articles`,
          description: "Compact technical notes rather than long essays.",
        },
        {
          label: "Latest update",
          value: featuredPost ? formatDate(featuredPost.publishedAt) : "No posts yet",
          description: "The most recent article sits in the featured position below.",
        },
        {
          label: "Themes",
          value: "Privacy, eligibility, UX",
          description: "The post selection currently focuses on the biggest architectural and product tradeoffs.",
        },
      ]}
      footerActions={[
        { label: "Read Key Terms", to: "/learn", variant: "secondary" },
        { label: "Open Main Guide", to: "/guide/main-election", variant: "secondary" },
      ]}
    >
      {featuredPost ? (
        <>
          <DocsSectionIntro
            eyebrow="Featured"
            title="Start with the clearest system-level explanation"
            description="The first post gets a wider spotlight so the library has a clear entry point instead of a flat wall of cards."
          />

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <article className="card-premium p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{formatDate(featuredPost.publishedAt)}</span>
                <span>•</span>
                <span>{featuredPost.readMinutes} min read</span>
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {featuredPost.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{featuredPost.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featuredPost.tags.map((tag) => (
                  <span key={tag} className="badge badge-info">
                    {tag}
                  </span>
                ))}
              </div>
              <Link to={`/blog/${featuredPost.slug}`} className="btn-primary mt-6 inline-flex">
                Read Featured Post
              </Link>
            </article>

            <aside className="card-premium p-6 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Why this matters</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">The blog acts like a decision log</h3>
              <div className="mt-5 space-y-3">
                {featuredPost.sections.map((section) => (
                  <div key={section.heading} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-sm font-semibold text-slate-900">{section.heading}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      The article uses this section to explain one layer of the decision clearly and directly.
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        </>
      ) : null}

      <DocsSectionIntro
        eyebrow="Library"
        title="All posts"
        description="The remaining posts stay in a clean grid, but they now sit under a dedicated section header instead of competing with the featured entry."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {(restPosts.length ? restPosts : BLOG_POSTS).map((post) => (
          <article key={post.slug} className="card-premium p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{formatDate(post.publishedAt)}</span>
              <span>•</span>
              <span>{post.readMinutes} min read</span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{post.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{post.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="badge badge-info">
                  {tag}
                </span>
              ))}
            </div>
            <Link to={`/blog/${post.slug}`} className="btn-secondary mt-5 inline-flex">
              Read Post
            </Link>
          </article>
        ))}
      </section>
    </DocsLayout>
  );
}
