import { Link, useParams } from "react-router-dom";
import DocsLayout from "./DocsLayout";
import { getBlogPostBySlug } from "@/content/blogPosts";

function formatDate(isoDate: string) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <DocsLayout
        eyebrow="Blog Post"
        title="Post Not Found"
        description="The requested blog post does not exist or may have been moved."
        heroActions={[{ label: "Back to Blog", to: "/blog", variant: "primary" }]}
        heroAsideTitle="Missing article"
        heroAsideDescription="This route does not match any current post in the BharatVote blog library."
        heroAsideItems={[
          {
            label: "Best next step",
            value: "Return to the blog index",
            description: "Pick one of the available posts from the main library page.",
          },
        ]}
      >
        <section className="card-premium p-6">
          <p className="text-sm text-slate-600">
            Please go back to the blog index and select an available post.
          </p>
          <Link to="/blog" className="btn-secondary mt-4 inline-flex">
            Back to Blog
          </Link>
        </section>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout
      eyebrow="Blog Post"
      title={post.title}
      description={post.summary}
      heroActions={[
        { label: "Back to Blog", to: "/blog", variant: "primary" },
        { label: "Read Key Terms", to: "/learn", variant: "secondary" },
      ]}
      heroAsideTitle="Article metadata"
      heroAsideDescription="The hero keeps the article summary in view and moves the publication metadata into a dedicated side panel, which follows the same organizational pattern as the other pages."
      heroAsideItems={[
        {
          label: "Published",
          value: formatDate(post.publishedAt),
          description: "Use the date to understand where this note sits in the evolution of the project.",
        },
        {
          label: "Read time",
          value: `${post.readMinutes} min`,
          description: "Short technical read focused on one architectural or UX decision.",
        },
        {
          label: "Sections",
          value: `${post.sections.length} blocks`,
          description: "The article is split into structured sections rather than one long wall of text.",
        },
      ]}
      footerActions={[
        { label: "Back to Blog", to: "/blog", variant: "secondary" },
        { label: "Open FAQ", to: "/faq", variant: "secondary" },
      ]}
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <article className="card-premium p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Summary</p>
          <p className="mt-3 text-base leading-8 text-slate-600">{post.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="badge badge-info">
                {tag}
              </span>
            ))}
          </div>
        </article>

        <aside className="card-premium p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Article map</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">On this page</h2>
          <div className="mt-5 space-y-3">
            {post.sections.map((section, index) => (
              <div key={section.heading} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {index + 1}. {section.heading}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This section expands one specific part of the overall argument.
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {post.sections.map((section, index) => (
        <section
          key={section.heading}
          className={`card-premium p-6 sm:p-8 ${
            index % 2 === 0 ? "border-t-4 border-t-slate-900" : "border-l-4 border-l-slate-900"
          }`}
        >
          <h2 className="text-lg font-semibold text-slate-900">{section.heading}</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${section.heading}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      <section className="card-premium p-6">
        <Link to="/blog" className="btn-secondary inline-flex">
          Back to Blog Index
        </Link>
      </section>
    </DocsLayout>
  );
}
