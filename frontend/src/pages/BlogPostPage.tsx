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
        title="Post Not Found"
        description="The requested blog post does not exist or may have been moved."
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
      title={post.title}
      description={`${formatDate(post.publishedAt)} • ${post.readMinutes} min read`}
    >
      <article className="card-premium p-6">
        <p className="text-sm text-slate-600">{post.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="badge badge-info">
              {tag}
            </span>
          ))}
        </div>
      </article>

      {post.sections.map((section) => (
        <section key={section.heading} className="card-premium p-6">
          <h2 className="text-lg font-semibold text-slate-900">{section.heading}</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
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

