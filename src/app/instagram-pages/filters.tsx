"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ListingCard, EmptyState, AnytimeInlineCTA } from "@/components/ui";

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
  const [state, setState] = useState(searchParams.get("state") || "");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const states = [...new Set(pages.map((p) => p.state).filter(Boolean))].sort();

  const filtered = pages.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.city.toLowerCase().includes(q) &&
        !p.state.toLowerCase().includes(q) &&
        !p.ownerName.toLowerCase().includes(q)
      ) return false;
    }
    if (category && p.category !== category) return false;
    if (state && p.state !== state) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const allFeatured = sorted.filter((p) => p.featured);
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
  const topCardIds = new Set(topCards.map((p) => p.id));
  const nonFeaturedPages = sorted.filter((p) => !topCardIds.has(p.id));
  const totalPages = Math.ceil(nonFeaturedPages.length / PER_PAGE);
  const visibleNonFeatured = viewAll ? nonFeaturedPages : nonFeaturedPages.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
            SOCCER INSTAGRAM PAGES
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Follow soccer creators on Instagram.
          </p>

          {/* Single unified filter pill */}
          <div className="bg-white rounded-2xl lg:rounded-full shadow-2xl p-2 max-w-3xl mx-auto">
            <div className="inline-flex flex-col lg:flex-row items-stretch w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, city, state, owner..."
                className="px-5 py-3 sm:rounded-l-full text-sm text-primary placeholder:text-muted focus:outline-none min-w-0 flex-1 sm:border-r border-border"
              />
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
      </div>

      {/* ====== CONTENT ====== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {sorted.length === 0 ? (
          <EmptyState message="No Instagram pages match your filters." />
        ) : (
          <>
            {/* ====== FEATURED CARDS ====== */}
            {page === 1 && topCards.length > 0 && (
              <div className="mb-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-amber-500">&#9733;</span> {allFeatured.length > 0 ? "Featured Pages" : "Top Pages"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topCards.map((igPage) => (
                    <ListingCard
                      key={igPage.id}
                      href={`/instagram-pages/${igPage.slug}`}
                      title={igPage.name}
                      subtitle={`${igPage.city}, ${igPage.state}`}
                      image={igPage.logo || igPage.teamPhoto || undefined}
                      badges={[
                        { label: igPage.category, variant: "blue" },
                      ]}
                      details={[
                        { label: "Owner", value: igPage.ownerName },
                        { label: "Followers", value: igPage.followerCount || "—" },
                      ]}
                      featured
                      description={igPage.description ? igPage.description.split(" ").slice(0, 25).join(" ") + (igPage.description.split(" ").length > 25 ? "..." : "") : undefined}
                      cta="View Page"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ====== RESULTS COUNT ====== */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted font-medium">
                {nonFeaturedPages.length} page{nonFeaturedPages.length !== 1 ? "s" : ""} found
                {!viewAll && totalPages > 1 && <> &middot; Page {page} of {totalPages}</>}
              </p>
              {nonFeaturedPages.length > PER_PAGE && (
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
              {visibleNonFeatured.map((igPage) => {
                const img = igPage.logo || igPage.teamPhoto;
                return (
                  <a
                    key={igPage.id}
                    href={`/instagram-pages/${igPage.slug}`}
                    className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Red accent trim */}
                    <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />

                    {/* Image thumbnail */}
                    <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={igPage.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row content */}
                    <div className="flex items-start gap-5 sm:gap-6 flex-1 min-w-0 p-5 sm:p-6">

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
                          {igPage.name}
                        </h3>
                        <p className="text-sm text-muted mt-1">
                          {igPage.city}, {igPage.state}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{igPage.category}</span>
                          {igPage.followerCount && (
                            <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{igPage.followerCount} followers</span>
                          )}
                        </div>
                        <p className="text-sm text-primary mt-2.5 line-clamp-2 hidden sm:block leading-relaxed">
                          {igPage.description ? (igPage.description.split(" ").slice(0, 30).join(" ") + (igPage.description.split(" ").length > 30 ? "..." : "")) : `Follow ${igPage.name} on Instagram`}
                        </p>
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
