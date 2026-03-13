"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Blog } from "@/lib/types";
import type { ListingPost } from "@/lib/db";
import { Badge, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";
import { PlayerAvatar } from "@/components/player-avatar";

const CATEGORIES = ["Youth Soccer", "Coaching", "Player Development", "College Recruiting", "Professional Soccer", "Soccer Culture", "Training & Fitness", "Soccer Parenting", "Other"];
const PER_PAGE = 10;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

export function BlogFilters({ blogs, articles = [] }: { blogs: Blog[]; articles?: ListingPost[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const states = [...new Set(blogs.map((b) => b.state))].sort();

  const filtered = blogs.filter((b) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !b.name.toLowerCase().includes(q) &&
        !b.authorName.toLowerCase().includes(q) &&
        !b.city.toLowerCase().includes(q) &&
        !b.state.toLowerCase().includes(q) &&
        !(b.description || "").toLowerCase().includes(q)
      ) return false;
    }
    if (state && b.state !== state) return false;
    if (category && b.category !== category) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const visible = viewAll ? sorted : sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Soccer Blogs
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Discover blogs covering youth soccer, coaching, player development, and more.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by blog name, author, or topic..."
              className="flex-1 px-5 py-4 rounded-xl text-primary text-base placeholder:text-muted focus:outline-none"
            />
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="px-4 py-4 rounded-xl border border-border text-sm font-medium text-primary bg-surface focus:outline-none cursor-pointer sm:w-48"
            >
              <option value="">All States</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="button" className="px-8 py-4 rounded-xl bg-accent text-white font-semibold text-base hover:bg-accent-hover transition-colors whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FilterBar
          filters={[
            { label: "All Categories", options: CATEGORIES, value: category, onChange: (v: string) => { setCategory(v); setPage(1); } },
          ]}
        />

        {/* View All / result count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            {sorted.length} blog{sorted.length !== 1 ? "s" : ""} found
            {!viewAll && sorted.length > PER_PAGE && <> &middot; Page {page} of {totalPages}</>}
          </p>
          {sorted.length > PER_PAGE && (
            <button
              onClick={() => { setViewAll(!viewAll); setPage(1); }}
              className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              {viewAll ? "Show Pages" : "View All"}
            </button>
          )}
        </div>

        {sorted.length === 0 ? (
          <EmptyState message="No blogs match your filters. Try broadening your search." />
        ) : (
          <div className="space-y-4">
            {visible.map((blog) => (
              <a
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="group block bg-white rounded-2xl border border-border p-4 md:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative"
              >
                {blog.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                      Featured
                    </span>
                  </div>
                )}
                <div className="flex gap-4 md:gap-6">
                  <div className="shrink-0">
                    <PlayerAvatar
                      src={blog.teamPhoto || blog.logo}
                      name={blog.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border border-border"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="blue">{blog.category}</Badge>
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary group-hover:text-accent-hover transition-colors mb-1">
                      {blog.name}
                    </h3>
                    <p className="text-muted text-sm mb-2">
                      By {blog.authorName} &middot; {blog.city}, {blog.state}
                    </p>
                    {blog.description && (
                      <p className="text-sm text-muted line-clamp-2">{blog.description}</p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Pagination */}
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

        {/* Member Articles */}
        {articles.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary">
                Member Articles
              </h2>
              <span className="text-sm text-muted font-medium">({articles.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const plainBody = stripHtml(article.body);
                const date = new Date(article.createdAt);
                return (
                  <a
                    key={article.id}
                    href={`/posts/${article.slug || article.id}`}
                    className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {article.imageUrl && (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt={article.title || ""}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-primary group-hover:text-accent transition-colors mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted line-clamp-3 mb-3">
                        {plainBody}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                          {article.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-primary">{article.userName}</span>
                        <span>&middot;</span>
                        <span>{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
