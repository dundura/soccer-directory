"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";
import { PlayerAvatar } from "@/components/player-avatar";

interface InstagramPage {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  category: string;
  pageUrl: string;
  followerCount?: string;
  privacy: string;
  city: string;
  state: string;
  description?: string;
  teamPhoto?: string;
  logo?: string;
  featured: boolean;
}

const CATEGORIES = ["Soccer Clubs", "Training Accounts", "Player Profiles", "Brands & Equipment", "News & Commentary", "Community", "General"];
const PER_PAGE = 10;

export function InstagramPageFilters({ pages }: { pages: InstagramPage[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const filtered = pages.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.ownerName.toLowerCase().includes(q) &&
        !(p.description || "").toLowerCase().includes(q)
      ) return false;
    }
    if (category && p.category !== category) return false;
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
            Instagram Pages
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Discover soccer Instagram pages for training, highlights, and community.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by page name, owner, or topic..."
              className="flex-1 px-5 py-4 rounded-xl text-primary text-base placeholder:text-muted focus:outline-none"
            />
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

        {/* Add Your Page CTA + View All / result count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            {sorted.length} page{sorted.length !== 1 ? "s" : ""} found
            {!viewAll && sorted.length > PER_PAGE && <> &middot; Page {page} of {totalPages}</>}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard?type=instagrampage"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
            >
              + Add Your Page
            </Link>
            {sorted.length > PER_PAGE && (
              <button
                onClick={() => { setViewAll(!viewAll); setPage(1); }}
                className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                {viewAll ? "Show Pages" : "View All"}
              </button>
            )}
          </div>
        </div>

        {sorted.length === 0 ? (
          <EmptyState message="No Instagram pages match your filters. Try broadening your search." />
        ) : (
          <div className="space-y-4">
            {visible.map((igPage) => (
              <div
                key={igPage.id}
                className="group bg-white rounded-2xl border border-border p-4 md:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative"
              >
                {igPage.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                      Featured
                    </span>
                  </div>
                )}
                <div className="flex gap-4 md:gap-6">
                  <a href={`/instagram-pages/${igPage.slug}`} className="shrink-0">
                    {igPage.teamPhoto || igPage.logo ? (
                      <PlayerAvatar
                        src={igPage.teamPhoto || igPage.logo}
                        name={igPage.name}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border border-border"
                      />
                    ) : (
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl border border-border bg-surface flex items-center justify-center text-4xl">
                        📸
                      </div>
                    )}
                  </a>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="blue">{igPage.category}</Badge>
                      <Badge variant={igPage.privacy === "Public" ? "green" : "default"}>{igPage.privacy}</Badge>
                    </div>
                    <a href={`/instagram-pages/${igPage.slug}`}>
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary group-hover:text-accent-hover transition-colors mb-1">
                        {igPage.name}
                      </h3>
                    </a>
                    <p className="text-muted text-sm mb-2">
                      Owner: {igPage.ownerName}
                      {igPage.followerCount && <> &middot; {igPage.followerCount} followers</>}
                    </p>
                    {igPage.description && (
                      <p className="text-sm text-muted line-clamp-2 mb-3">{igPage.description}</p>
                    )}
                    <a
                      href={igPage.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      Follow
                    </a>
                  </div>
                </div>
              </div>
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

        <div className="mt-12"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
