"use client";

import { useState } from "react";
import { Badge, EmptyState, AnytimeInlineCTA } from "@/components/ui";

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

const PER_PAGE = 10;

const COVER_IMAGES = [
  "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp",
  "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg",
  "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg",
  "https://media.anytime-soccer.com/wp-content/uploads/2026/01/idf.webp",
  "https://media.anytime-soccer.com/wp-content/uploads/2026/02/futsal-scaled.jpg",
];

function getCover(coverImage: string | undefined, index: number) {
  if (coverImage && coverImage.startsWith("http")) return coverImage;
  return COVER_IMAGES[index % COVER_IMAGES.length];
}

export function BlogHub({ posts }: { posts: BlogPost[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const categories = [...new Set(posts.map((p) => p.category))].sort();

  const filtered = posts.filter((p) => {
    if (category && p.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.excerpt.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const topCards = sorted.slice(0, 3);
  const topCardIds = new Set(topCards.map((p) => p.id));
  const remaining = sorted.filter((p) => !topCardIds.has(p.id));
  const totalPages = Math.ceil(remaining.length / PER_PAGE);
  const visibleRemaining = viewAll ? remaining : remaining.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {/* ====== HERO SECTION ====== */}
      <div className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#1a4a7a] opacity-90" />
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: "60px" }}>
          <path fill="var(--background, #f8fafc)" d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" />
        </svg>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white uppercase tracking-tight leading-tight mb-4">
            Soccer Blog
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Guides, tips, and insights for soccer parents and players.
          </p>

          <div className="bg-white rounded-2xl sm:rounded-full shadow-2xl p-2 max-w-3xl mx-auto inline-flex flex-col sm:flex-row items-stretch">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search articles..."
              className="px-5 py-3 sm:rounded-l-full text-sm text-primary placeholder:text-muted focus:outline-none min-w-0 flex-1 sm:border-r border-border"
            />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="px-5 py-3 text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer border-t sm:border-t-0 sm:border-r border-border"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              type="button"
              className="px-8 py-3 rounded-xl sm:rounded-r-full sm:rounded-l-none bg-accent text-white font-bold text-sm uppercase tracking-wide hover:bg-accent-hover transition-colors whitespace-nowrap mt-1 sm:mt-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ====== CONTENT ====== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {sorted.length === 0 ? (
          <EmptyState message="No articles match your search." />
        ) : (
          <>
            {/* ====== TOP 3 CARDS ====== */}
            {page === 1 && topCards.length > 0 && (
              <div className="mb-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-amber-500">&#9733;</span> Featured Articles
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topCards.map((post, i) => (
                    <a
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col bg-white rounded-2xl border border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] ring-1 ring-blue-200/50 overflow-hidden hover:-translate-y-0.5 transition-all duration-200 h-full"
                    >
                      <div className="relative h-[200px] overflow-hidden bg-surface">
                        <img src={getCover(post.coverImage, i)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <Badge variant="orange">{post.category}</Badge>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-primary uppercase tracking-tight group-hover:text-accent-hover transition-colors mb-2 min-h-[3rem] line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-primary/70 line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-muted mt-auto">
                          <span>{post.date}</span>
                          <span>&middot;</span>
                          <span>{post.readTime} read</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ====== RESULTS COUNT ====== */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted font-medium">
                {remaining.length} article{remaining.length !== 1 ? "s" : ""} found
                {!viewAll && totalPages > 1 && <> &middot; Page {page} of {totalPages}</>}
              </p>
              {remaining.length > PER_PAGE && (
                <button
                  onClick={() => { setViewAll(!viewAll); setPage(1); }}
                  className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
                >
                  {viewAll ? "Show Pages" : "View All"}
                </button>
              )}
            </div>

            {/* ====== NON-FEATURED ROWS ====== */}
            <div className="space-y-3">
              {visibleRemaining.map((post, i) => (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />
                  <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                      <img src={getCover(post.coverImage, i)} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="flex items-start gap-5 sm:gap-6 flex-1 min-w-0 p-5 sm:p-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">{post.category}</span>
                        <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{post.readTime} read</span>
                      </div>
                      <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-muted mt-1">{post.date}</p>
                      <p className="text-sm text-primary mt-2.5 line-clamp-2 hidden sm:block leading-relaxed">
                        {post.excerpt.split(" ").slice(0, 30).join(" ")}{post.excerpt.split(" ").length > 30 ? "..." : ""}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-14 md:w-16 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
                    <span className="text-white text-2xl font-light">&#8250;</span>
                  </div>
                </a>
              ))}
            </div>

            {/* ====== PAGINATION ====== */}
            {!viewAll && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &larr; Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      p === page ? "bg-primary text-white" : "border border-border hover:bg-surface"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next &rarr;
                </button>
              </div>
            )}

            <div className="mt-8"><AnytimeInlineCTA /></div>
          </>
        )}
      </div>
    </>
  );
}
