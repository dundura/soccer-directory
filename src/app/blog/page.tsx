import { getBlogPosts } from "@/lib/db";
import { PageHeader, Badge, AnytimeInlineCTA } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const COVER_IMAGES = [
  "https://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp",
  "http://anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg",
  "http://anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg",
  "http://anytime-soccer.com/wp-content/uploads/2026/01/idf.webp",
  "http://anytime-soccer.com/wp-content/uploads/2026/02/futsal-scaled.jpg",
];

function getCover(coverImage: string | undefined, index: number) {
  return coverImage || COVER_IMAGES[index % COVER_IMAGES.length];
}

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
            {featured.map((post, i) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="relative">
                  <img
                    src={getCover(post.coverImage, i)}
                    alt={post.title}
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <Badge variant="orange">{post.category}</Badge>
                    <h2 className="font-[family-name:var(--font-display)] text-lg font-bold mt-2 text-white leading-snug line-clamp-2 drop-shadow-sm">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-white/70 mt-2">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime} read</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-muted text-sm line-clamp-2">{post.excerpt}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* All Posts Grid */}
        {rest.length > 0 && (
          <>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-6">More Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className="relative">
                    <img
                      src={getCover(post.coverImage, featured.length + i)}
                      alt={post.title}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <Badge variant="orange">{post.category}</Badge>
                      <h3 className="font-[family-name:var(--font-display)] text-base font-bold mt-1.5 text-white leading-snug line-clamp-2 drop-shadow-sm">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5 pt-3">
                    <p className="text-muted text-sm line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-3">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime} read</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {/* Anytime CTA */}
        <div className="mt-12"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
