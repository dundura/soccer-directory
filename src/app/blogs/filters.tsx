"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Blog } from "@/lib/types";
import { ListingCard, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const CATEGORIES = ["Youth Soccer", "Coaching", "Player Development", "College Recruiting", "Professional Soccer", "Soccer Culture", "Training & Fitness", "Soccer Parenting", "Other"];
const PER_PAGE = 10;

export function BlogFilters({ blogs }: { blogs: Blog[] }) {
  const searchParams = useSearchParams();
  const [state, setState] = useState(searchParams.get("state") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const states = [...new Set(blogs.map((b) => b.state))].sort();

  const filtered = blogs.filter((b) => {
    if (state && b.state !== state) return false;
    if (category && b.category !== category) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const allFeatured = sorted.filter((b) => b.featured);
  const [topCards] = useState(() => {
    if (allFeatured.length > 0) {
      const shuffled = [...allFeatured];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, 3);
    }
    return sorted.slice(0, 3);
  });
  const topCardIds = new Set(topCards.map((b) => b.id));
  const nonFeatured = sorted.filter((b) => !topCardIds.has(b.id));
  const totalPages = Math.ceil(nonFeatured.length / PER_PAGE);
  const visibleNonFeatured = viewAll ? nonFeatured : nonFeatured.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const hasActiveFilters = !!(state || category);

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
            Soccer Blogs
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Discover soccer blogs and writers.
          </p>

          <div className="bg-white rounded-2xl lg:rounded-full shadow-2xl p-2 max-w-xl mx-auto inline-flex flex-col lg:flex-row items-stretch">
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="px-4 py-3 lg:rounded-l-full text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer lg:border-r border-border min-w-0"
            >
              <option value="">All States</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="px-4 py-3 text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer border-t lg:border-t-0 lg:border-r border-border min-w-0"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              type="button"
              className="px-8 py-3 rounded-xl lg:rounded-r-full lg:rounded-l-none bg-accent text-white font-bold text-sm uppercase tracking-wide hover:bg-accent-hover transition-colors whitespace-nowrap mt-1 lg:mt-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ====== CONTENT ====== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {sorted.length === 0 ? (
          <EmptyState message="No blogs match your filters." />
        ) : (
          <>
            {/* ====== FEATURED CARDS ====== */}
            {page === 1 && !hasActiveFilters && topCards.length > 0 && (
              <div className="mb-10">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mb-5 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-amber-500">&#9733;</span> {allFeatured.length > 0 ? "Featured Blogs" : "Top Blogs"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topCards.map((blog) => (
                    <ListingCard
                      key={blog.id}
                      href={`/blogs/${blog.slug}`}
                      title={blog.name}
                      subtitle={`by ${blog.authorName} · ${blog.city}, ${blog.state}`}
                      image={blog.logo || blog.teamPhoto || blog.imageUrl || undefined}
                      badges={[
                        { label: blog.category, variant: "blue" },
                      ]}
                      details={[
                        { label: "Author", value: blog.authorName },
                      ]}
                      featured
                      imagePosition={blog.imagePosition}
                      cta="Read Blog"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ====== RESULTS COUNT ====== */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted font-medium">
                {nonFeatured.length} blog{nonFeatured.length !== 1 ? "s" : ""} found
                {!viewAll && totalPages > 1 && <> &middot; Page {page} of {totalPages}</>}
              </p>
              {nonFeatured.length > PER_PAGE && (
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
              {visibleNonFeatured.map((blog) => {
                const img = blog.logo || blog.teamPhoto || blog.imageUrl;
                const desc = blog.description ? blog.description.split(/\s+/).slice(0, 30).join(" ") : "";
                return (
                  <a
                    key={blog.id}
                    href={`/blogs/${blog.slug}`}
                    className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Red accent trim */}
                    <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />

                    {/* Image thumbnail */}
                    <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={blog.name} className="w-full h-full object-contain" />
                        ) : (
                          <svg className="w-10 h-10 text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        )}
                      </div>
                    </div>

                    {/* Row content */}
                    <div className="flex items-start gap-5 sm:gap-6 flex-1 min-w-0 p-5 sm:p-6">

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
                          {blog.name}
                        </h3>
                        <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          {blog.city}, {blog.state}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{blog.category}</span>
                          <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{blog.authorName}</span>
                        </div>
                        {desc && (
                          <p className="text-sm text-primary mt-2.5 line-clamp-2 hidden sm:block leading-relaxed">{desc}</p>
                        )}
                      </div>
                    </div>

                    {/* Arrow panel */}
                    <div className="hidden sm:flex items-center justify-center w-14 md:w-16 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
                      <span className="text-white text-2xl font-light">&#8250;</span>
                    </div>
                  </a>
                );
              })}
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
