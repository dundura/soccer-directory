import { getBlogPosts } from "@/lib/db";

export async function FeaturedArticles() {
  const posts = await getBlogPosts();
  const articles = posts.slice(0, 3);
  if (articles.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <h3 className="font-[family-name:var(--font-display)] text-[15px] font-bold text-primary mb-4">Featured Articles</h3>
      <div className="space-y-3">
        {articles.map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.slug}`}
            className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-surface transition-colors group"
          >
            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} className="w-20 h-14 rounded-lg object-cover shrink-0 hidden sm:block" />
            )}
            <div className="flex-1 min-w-0">
              <span className="block font-semibold text-sm text-primary group-hover:text-accent-hover transition-colors leading-snug">{post.title}</span>
              <span className="block text-xs text-muted mt-1 line-clamp-1">{post.excerpt}</span>
              <span className="block text-xs text-muted mt-1">{post.date} &middot; {post.readTime}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
