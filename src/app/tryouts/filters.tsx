"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Tryout, Club, Team } from "@/lib/types";
import { ListingCard, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;

export function TryoutFilters({ tryouts, clubs = [], teams = [] }: { tryouts: Tryout[]; clubs?: Club[]; teams?: Team[] }) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const [tab, setTab] = useState<"current" | "past">("current");
  const [state, setState] = useState("");
  const [gender, setGender] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const allStates = [...new Set([...tryouts.map((t) => t.state), ...clubs.map((c) => c.state), ...teams.map((t) => t.state)])].sort();
  const states = allStates;

  const filtered = tryouts.filter((t) => {
    if (tab === "current" && t.isPast) return false;
    if (tab === "past" && !t.isPast) return false;
    if (state && t.state !== state) return false;
    if (gender && t.gender !== gender) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const allFeatured = sorted.filter((t) => t.featured);
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
  const topCardIds = new Set(topCards.map((t) => t.id));
  const nonFeaturedTryouts = sorted.filter((t) => !topCardIds.has(t.id));
  const totalPages = Math.ceil(nonFeaturedTryouts.length / PER_PAGE);
  const visibleNonFeatured = viewAll ? nonFeaturedTryouts : nonFeaturedTryouts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const fallbackImage = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

  async function togglePast(slug: string) {
    await fetch(`/api/tryouts/${slug}`, { method: "PATCH" });
    window.location.reload();
  }

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
            Find Open Tryouts
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Browse upcoming tryouts and open evaluations.
          </p>

          {/* Single unified filter pill bar */}
          <div className="bg-white rounded-2xl lg:rounded-full shadow-2xl p-2 max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-stretch">
              <select
                value={state}
                onChange={(e) => { setState(e.target.value); setPage(1); }}
                className="px-4 py-3 lg:rounded-l-full text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer lg:border-r border-border min-w-0"
              >
                <option value="">All States</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={gender}
                onChange={(e) => { setGender(e.target.value); setPage(1); }}
                className="px-4 py-3 text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer border-t lg:border-t-0 lg:border-r border-border min-w-0"
              >
                <option value="">All Genders</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
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

        {/* ====== TAB TOGGLE ====== */}
        <div className="flex gap-1 mt-6 mb-6 bg-surface rounded-xl p-1 w-fit">
          <button
            onClick={() => { setTab("current"); setPage(1); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "current" ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary"}`}
          >
            Current
          </button>
          <button
            onClick={() => { setTab("past"); setPage(1); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "past" ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary"}`}
          >
            Past
          </button>
        </div>

        {sorted.length === 0 ? (
          <EmptyState message="No tryouts match your filters." />
        ) : (
          <>
            {/* ====== FEATURED CARDS ====== */}
            {topCards.length > 0 && (
              <div className="mb-10">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mb-5 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-amber-500">&#9733;</span> {allFeatured.length > 0 ? "Featured Tryouts" : "Top Tryouts"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topCards.map((tryout) => (
                    <ListingCard
                      key={tryout.id}
                      href={`/tryouts/${tryout.slug}`}
                      title={tryout.name}
                      subtitle={`${tryout.organizerName || tryout.clubName || ""} · ${tryout.city}, ${tryout.state}`}
                      image={tryout.teamPhoto && !tryout.teamPhoto.includes("idf.webp") ? tryout.teamPhoto : tryout.logo || tryout.imageUrl || fallbackImage}
                      badges={[
                        { label: tryout.tryoutType, variant: "blue" },
                        { label: tryout.gender, variant: tryout.gender === "Boys" ? "blue" : "purple" },
                      ]}
                      details={[
                        { label: "Dates", value: tryout.dates },
                        { label: "Age Group", value: tryout.ageGroup },
                        ...(tryout.cost ? [{ label: "Cost", value: tryout.cost }] : []),
                      ]}
                      featured={tryout.featured}
                      imagePosition={tryout.imagePosition}
                      cta="View Tryout"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ====== RESULTS COUNT ====== */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted font-medium">
                {nonFeaturedTryouts.length} tryout{nonFeaturedTryouts.length !== 1 ? "s" : ""} found
                {!viewAll && totalPages > 1 && <> &middot; Page {page} of {totalPages}</>}
              </p>
              {nonFeaturedTryouts.length > PER_PAGE && (
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
              {visibleNonFeatured.map((tryout) => {
                const img = tryout.logo || tryout.teamPhoto || tryout.imageUrl;
                return (
                  <div
                    key={tryout.id}
                    className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Red accent trim */}
                    <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />

                    {/* Image thumbnail */}
                    <div className="hidden sm:flex items-center justify-center flex-shrink-0 p-3 sm:p-4">
                      <a href={`/tryouts/${tryout.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={tryout.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-10 h-10 text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                        )}
                      </a>
                    </div>

                    {/* Row content */}
                    <div className="flex items-start gap-5 sm:gap-6 flex-1 min-w-0 p-5 sm:p-6">

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <a href={`/tryouts/${tryout.slug}`}>
                          <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
                            {tryout.name}
                          </h3>
                        </a>
                        <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          {tryout.location || `${tryout.city}, ${tryout.state}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{tryout.tryoutType}</span>
                          <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{tryout.gender}</span>
                          <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{tryout.ageGroup}</span>
                        </div>
                        <p className="text-sm text-primary mt-2 font-medium">
                          {tryout.dates}{tryout.time && ` · ${tryout.time}`}
                        </p>
                        {tryout.description && (
                          <p className="text-sm text-primary mt-1.5 line-clamp-2 hidden sm:block leading-relaxed">{tryout.description}</p>
                        )}
                        {isAdmin && (
                          <button
                            onClick={(e) => { e.preventDefault(); togglePast(tryout.slug); }}
                            className="mt-2 inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted hover:bg-surface transition-colors"
                          >
                            {tryout.isPast ? "Move to Current" : "Move to Past"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Arrow panel */}
                    <a
                      href={`/tryouts/${tryout.slug}`}
                      className="hidden sm:flex items-center justify-center w-14 md:w-16 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl"
                    >
                      <span className="text-white text-2xl font-light">&#8250;</span>
                    </a>
                  </div>
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
