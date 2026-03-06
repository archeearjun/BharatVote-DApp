import { Link } from "react-router-dom";
import DocsLayout from "./DocsLayout";
import { BLOG_POSTS } from "@/content/blogPosts";

function formatDate(isoDate: string) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function BlogIndexPage() {
  return (
    <DocsLayout
      title="BharatVote Blog"
      description="Technical posts explaining design decisions, election flow tradeoffs, and scaling patterns."
    >
      <section className="grid gap-4">
        {BLOG_POSTS.map((post) => (
          <article key={post.slug} className="card-premium p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{formatDate(post.publishedAt)}</span>
              <span>•</span>
              <span>{post.readMinutes} min read</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{post.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{post.summary}</p>
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

