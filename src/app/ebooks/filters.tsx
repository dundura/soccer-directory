"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketplaceItem } from "@/lib/types";
import { ListingCard, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;

export function EbookFilters({ items }: { items: MarketplaceItem[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const states = [...new Set(items.map((i) => i.state))].sort();

  const filtered = items.filter((i) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !i.name.toLowerCase().includes(q) &&
        !(i.description || "").toLowerCase().includes(q) &&
        !i.city.toLowerCase().includes(q)
      )
        return false;
    }
    if (state && i.state !== state) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const allFeatured = sorted.filter((i) => i.featured);
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
  const topCardIds = new Set(topCards.map((i) => i.id));
  const nonFeaturedItems = sorted.filter((i) => !topCardIds.has(i.id));
  const totalPages = Math.ceil(nonFeaturedItems.length / PER_PAGE);
  const visibleNonFeatured = viewAll ? nonFeaturedItems : nonFeaturedItems.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
            Soccer Ebooks
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Download soccer ebooks and guides.
          </p>

          {/* Single unified search bar */}
          <div className="bg-white rounded-2xl lg:rounded-full shadow-2xl p-2 max-w-3xl mx-auto">
            <div className="flex flex-col lg:flex-row items-stretch">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search ebooks..."
                className="px-5 py-3 sm:rounded-l-full text-sm text-primary placeholder:text-muted focus:outline-none min-w-0 flex-1 sm:border-r border-border"
              />
              <select
                value={state}
                onChange={(e) => { setState(e.target.value); setPage(1); }}
                className="px-4 py-3 text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer border-t lg:border-t-0 lg:border-r border-border min-w-0"
              >
                <option value="">All States</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
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

        {sorted.length === 0 && (search || state) ? (
          <EmptyState message="No ebooks match your filters." />
        ) : sorted.length === 0 ? (
          null
        ) : (
          <>
            {/* ====== FEATURED CARDS ====== */}
            {page === 1 && topCards.length > 0 && (
              <div className="mb-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-amber-500">&#9733;</span> {allFeatured.length > 0 ? "Featured Ebooks" : "Top Ebooks"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topCards.map((item) => (
                    <ListingCard
                      key={item.id}
                      href={`/ebooks/${item.slug}`}
                      title={item.name}
                      subtitle={`${item.city}, ${item.state}`}
                      image={item.imageUrl || undefined}
                      badges={[
                        { label: item.price, variant: "green" },
                        ...(item.condition ? [{ label: item.condition }] : []),
                      ]}
                      details={[
                        { label: "Location", value: `${item.city}, ${item.state}` },
                      ]}
                      featured
                      description={item.description ? item.description.split(" ").slice(0, 25).join(" ") + (item.description.split(" ").length > 25 ? "..." : "") : undefined}
                      cta="View Details"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ====== RESULTS COUNT ====== */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted font-medium">
                {nonFeaturedItems.length} ebook{nonFeaturedItems.length !== 1 ? "s" : ""} found
                {!viewAll && totalPages > 1 && <> &middot; Page {page} of {totalPages}</>}
              </p>
              {nonFeaturedItems.length > PER_PAGE && (
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
              {visibleNonFeatured.map((item) => {
                const img = item.imageUrl;
                return (
                  <a
                    key={item.id}
                    href={`/ebooks/${item.slug}`}
                    className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Red accent trim */}
                    <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />

                    {/* Image thumbnail */}
                    <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <svg className="w-10 h-10 text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                        )}
                      </div>
                    </div>

                    {/* Row content */}
                    <div className="flex items-start gap-5 sm:gap-6 flex-1 min-w-0 p-5 sm:p-6">

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          {item.city}, {item.state}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">{item.price}</span>
                          {item.condition && (
                            <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{item.condition}</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-primary mt-2.5 line-clamp-2 hidden sm:block leading-relaxed">
                            {item.description.split(" ").slice(0, 30).join(" ")}{item.description.split(" ").length > 30 ? "..." : ""}
                          </p>
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

      {/* ====== FREE EBOOKS SECTION ====== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-primary uppercase tracking-wide mb-2 mt-4">
          Free Ebooks for Parents & Coaches
        </h2>
        <p className="text-muted text-sm mb-6">Practical guides packed with tips from a passionate soccer parent and coach.</p>

        {/* Featured 3 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {FREE_EBOOKS.slice(0, 3).map((book) => (
            <div key={book.title} className="flex flex-col bg-white rounded-2xl border border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-200/50 overflow-hidden h-full">
              <div className="h-[200px] overflow-hidden bg-surface flex items-center justify-center">
                <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold w-fit mb-2">FREE</span>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-primary uppercase tracking-tight mb-2 min-h-[3rem]">{book.title}</h3>
                <p className="text-sm text-primary/70 line-clamp-2 mb-4 leading-relaxed flex-1">{book.description}</p>
                <a href={book.href} target="_blank" rel="noopener noreferrer" className="block w-full py-3 rounded-xl bg-accent text-white text-center font-bold text-sm uppercase tracking-wide hover:bg-accent-hover transition-colors">
                  Download Free →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Remaining as rows */}
        <div className="space-y-3">
          {FREE_EBOOKS.slice(3).map((book) => (
            <div key={book.title} className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden">
              <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />
              <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                  <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex items-center gap-4 flex-1 min-w-0 p-5 sm:p-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">FREE</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-extrabold text-primary uppercase tracking-tight leading-tight">{book.title}</h3>
                  <p className="text-sm text-primary mt-2 line-clamp-2 hidden sm:block leading-relaxed">{book.description}</p>
                </div>
                <a href={book.href} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-sm uppercase tracking-wide hover:bg-accent-hover transition-colors whitespace-nowrap hidden sm:block">
                  Download →
                </a>
              </div>
              <a href={book.href} target="_blank" rel="noopener noreferrer" className="sm:hidden flex items-center justify-center w-14 flex-shrink-0 bg-primary self-stretch rounded-r-xl">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const FREE_EBOOKS = [
  { title: "The Most Important Skill Never Taught", description: "This powerful (yet simple) tip will change your child\u2019s game forever.", href: "https://anytime-soccer.com/the-most-important-skill-in-youth-soccer/", image: "https://media.anytime-soccer.com/wp-content/uploads/2021/01/ast_facebook_image_3.jpg" },
  { title: "Must-Have Guide to In-Home Training", description: "Everything you need to know to start training at home effectively.", href: "https://anytime-soccer.com/must-have-guide-for-serious-soccer-parents/", image: "https://media.anytime-soccer.com/wp-content/themes/anytime/images/home/bg-1.png" },
  { title: "20 Questions for Every Club", description: "Essential questions to ask before joining any youth soccer club.", href: "https://anytime-soccer.com/20-questions-every-parent-should-ask/", image: "https://media.anytime-soccer.com/wp-content/themes/anytime/images/ebook/ebook-1.png" },
  { title: "Become a Rec Coach SuperHero", description: "Transform your rec coaching with practical tips and strategies.", href: "https://anytime-soccer.com/become-a-rec-coach-superhero/", image: "https://media.anytime-soccer.com/wp-content/themes/anytime/images/ebook/ebook-2.png" },
  { title: "Everything About Guest Playing", description: "Navigate guest playing opportunities like a pro.", href: "https://anytime-soccer.com/everything-you-need-to-know-about-guest-playing/", image: "https://media.anytime-soccer.com/wp-content/themes/anytime/images/ebook/ebook-3.png" },
  { title: "Monopoly: Issues Facing US Youth Soccer", description: "A candid look at what\u2019s holding back American soccer from one parent\u2019s perspective.", href: "https://anytime-soccer.com/monopoly-addressing-issues-facing-youth-soccer-ebook/", image: "https://media.anytime-soccer.com/wp-content/uploads/2024/07/us_soccer-768x596.png" },
  { title: "The Parent Trainer\u2019s Playbook", description: "20 unconventional tips for raising a competitive soccer player from one soccer dad\u2019s journey.", href: "https://anytime-soccer.com/the-parent-trainers-playbook/", image: "https://media.anytime-soccer.com/wp-content/uploads/2024/08/the-playbook-20-unconventional-tips-for-raising-a-compeitive-soccer-player-thus-far-1024x789.png" },
  { title: "Player Cards Guide", description: "Stay informed about eligibility requirements and avoid missed tournament opportunities.", href: "https://anytime-soccer.com/everything-you-need-to-know-about-player-cards/", image: "https://media.anytime-soccer.com/wp-content/uploads/2024/11/pro-tips-for-college-showcases-1.png" },
];
