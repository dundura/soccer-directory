"use client";

import { useState } from "react";
import { Badge, AnytimeInlineCTA } from "@/components/ui";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featured: boolean;
  coverImage?: string;
}

const COVER_IMAGES = [
  "https://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp",
  "http://anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg",
  "http://anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg",
  "http://anytime-soccer.com/wp-content/uploads/2026/01/idf.webp",
  "http://anytime-soccer.com/wp-content/uploads/2026/02/futsal-scaled.jpg",
];

function getCover(coverImage: string | undefined, index: number) {
  if (coverImage && coverImage.startsWith("http")) return coverImage;
  return COVER_IMAGES[index % COVER_IMAGES.length];
}

export function BlogHub({ posts }: { posts: BlogPost[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showAll, setShowAll] = useState(false);

  const categories = [...new Set(posts.map((p) => p.category))].sort();

  // Filter by search and category
  const filtered = posts.filter((p) => {
    if (category && p.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.excerpt.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const displayPosts = showAll ? filtered : filtered.slice(0, 12);

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">Blog</h1>
          <p className="text-white/70 max-w-2xl text-lg mb-6">
            Guides, tips, and insights to help your player find the right team and reach their potential.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 max-w-3xl">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-primary text-base placeholder:text-muted focus:outline-none"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3.5 rounded-xl border border-border text-sm font-medium text-primary bg-surface focus:outline-none cursor-pointer sm:w-52"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {search && (
            <p className="text-white/60 text-sm mt-3">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;</p>
          )}
          {filtered.length > 12 && (
            <div className="mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm font-semibold text-white/80 hover:text-white transition-colors"
              >
                {showAll ? "← Show Less" : "View All Articles →"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-muted text-lg">No articles match your filters.</p>
          </div>
        ) : showAll ? (
          <div className="divide-y divide-border">
            {filtered.map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex items-center gap-4 py-4 hover:bg-surface/50 transition-colors -mx-2 px-2 rounded-lg"
              >
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-20 h-14 rounded-lg object-cover shrink-0 hidden sm:block"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="orange">{post.category}</Badge>
                    <span className="text-xs text-muted">{post.date}</span>
                    <span className="text-xs text-muted">&middot;</span>
                    <span className="text-xs text-muted">{post.readTime}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-primary group-hover:text-accent-hover transition-colors truncate">
                    {post.title}
                  </h3>
                  <p className="text-muted text-xs line-clamp-1 mt-0.5 hidden sm:block">{post.excerpt}</p>
                </div>
                <svg className="w-4 h-4 text-muted group-hover:text-accent-hover transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map((post, i) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="relative">
                  <img
                    src={getCover(post.coverImage, i)}
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
                <div className="p-4 pt-3">
                  <p className="text-muted text-sm line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted mt-2">
                    <span>{post.date}</span>
                    <span>&middot;</span>
                    <span>{post.readTime} read</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-12"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
