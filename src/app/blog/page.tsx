import { getBlogPosts } from "@/lib/db";
import { PageHeader, Badge, AnytimeInlineCTA } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const DEFAULT_COVER = "https://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

export const metadata: Metadata = {
  title: "Soccer Blog | Tips, Guides & News for Soccer Parents | Soccer Near Me",
  description: "Expert guides on youth soccer: club selection, tryout prep, home training, player development pathways, and more.",
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  const featured = blogPosts.filter((p) => p.featured);
  const rest = blogPosts.filter((p) => !p.featured);

  return (
    <>
      <PageHeader
        title="Blog"
        description="Guides, tips, and insights to help your player find the right team and reach their potential."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">

        {/* Featured Posts */}
        {featured.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {featured.map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <img
                  src={post.coverImage || DEFAULT_COVER}
                  alt={post.title}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5">
                  <Badge variant="orange">{post.category}</Badge>
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-bold mt-2.5 mb-2 group-hover:text-accent-hover transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-muted text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime} read</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Anytime CTA */}
        <div className="mb-12"><AnytimeInlineCTA /></div>

        {/* All Posts Grid */}
        {rest.length > 0 && (
          <>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-6">More Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <img
                    src={post.coverImage || DEFAULT_COVER}
                    alt={post.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="orange">{post.category}</Badge>
                      <span className="text-xs text-muted">{post.readTime} read</span>
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-base font-bold group-hover:text-accent-hover transition-colors mb-1 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted text-sm line-clamp-2">{post.excerpt}</p>
                    <p className="text-xs text-muted mt-3">{post.date}</p>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
