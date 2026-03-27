import { getBlogPosts, getBlogPostBySlug } from "@/lib/db";

const PINNED_SLUG = "top-7-soccer-training-apps-train-smarter-at-home";

export async function FeaturedArticles() {
  const [posts, pinned] = await Promise.all([getBlogPosts(), getBlogPostBySlug(PINNED_SLUG)]);
  const others = posts.filter((p) => p.slug !== PINNED_SLUG);
  // Pick 2 random articles from the remaining posts
  const shuffled = others.sort(() => Math.random() - 0.5);
  const random2 = shuffled.slice(0, 2);
  const articles = pinned ? [pinned, ...random2] : posts.slice(0, 3);
  if (articles.length === 0) return null;

  return (
    <div className="border-t border-border pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">Featured Articles</h3>
        <a href="/blog" className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">View All &rarr;</a>
      </div>
      <div className="space-y-3">
        {articles.map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />
            <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-center">
              <h4 className="font-[family-name:var(--font-display)] text-base sm:text-lg font-extrabold text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors line-clamp-2">{post.title}</h4>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{post.category}</span>
                <span className="text-xs text-muted">{post.date} &middot; {post.readTime}</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-center w-12 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
              <span className="text-white text-xl font-light">&#8250;</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
