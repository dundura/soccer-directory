"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { SpecialEvent } from "@/lib/types";
import { ListingCard, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;

export function SpecialEventFilters({ events }: { events: SpecialEvent[] }) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const [tab, setTab] = useState<"current" | "past">("current");
  const [state, setState] = useState("");
  const [gender, setGender] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const states = [...new Set(events.map((t) => t.state))].sort();
  const genders = [...new Set(events.map((t) => t.gender))].sort();

  const filtered = events.filter((t) => {
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
  const nonFeaturedEvents = sorted.filter((t) => !topCardIds.has(t.id));
  const totalPages = Math.ceil(nonFeaturedEvents.length / PER_PAGE);
  const visibleNonFeatured = viewAll ? nonFeaturedEvents : nonFeaturedEvents.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  async function togglePast(slug: string) {
    await fetch(`/api/special-events/${slug}`, { method: "PATCH" });
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
            Find Special Events
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Browse upcoming soccer events and showcases.
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
                {genders.map((g) => <option key={g} value={g}>{g}</option>)}
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

        {/* Tabs */}
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
          <EmptyState message="No events match your filters." />
        ) : (
          <>
            {/* ====== FEATURED CARDS ====== */}
            {page === 1 && topCards.length > 0 && (
              <div className="mb-10">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mb-5 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-amber-500">&#9733;</span> {allFeatured.length > 0 ? "Featured Events" : "Top Events"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topCards.map((event) => (
                    <ListingCard
                      key={event.id}
                      href={`/special-events/${event.slug}`}
                      title={event.name}
                      subtitle={`${event.organizerName || event.clubName || ""} · ${event.city}, ${event.state}`}
                      image={event.teamPhoto && !event.teamPhoto.includes("idf.webp") ? event.teamPhoto : event.logo || event.imageUrl || undefined}
                      badges={[
                        { label: event.eventType, variant: "blue" },
                        { label: event.gender, variant: event.gender === "Boys" ? "blue" : "purple" },
                      ]}
                      details={[
                        { label: "Dates", value: event.dates },
                        { label: "Age Group", value: event.ageGroup },
                        ...(event.cost ? [{ label: "Cost", value: event.cost }] : [{ label: "Location", value: event.location || `${event.city}, ${event.state}` }]),
                      ]}
                      featured
                      imagePosition={event.imagePosition}
                      cta="View Event"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ====== RESULTS COUNT ====== */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted font-medium">
                {nonFeaturedEvents.length} event{nonFeaturedEvents.length !== 1 ? "s" : ""} found
                {!viewAll && totalPages > 1 && <> &middot; Page {page} of {totalPages}</>}
              </p>
              {nonFeaturedEvents.length > PER_PAGE && (
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
              {visibleNonFeatured.map((event) => {
                const img = event.logo || event.teamPhoto || event.imageUrl;
                return (
                  <div key={event.id} className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden">
                    {/* Red accent trim */}
                    <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />

                    {/* Image thumbnail */}
                    <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={event.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-10 h-10 text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                        )}
                      </div>
                    </div>

                    {/* Row content */}
                    <a href={`/special-events/${event.slug}`} className="flex items-start gap-5 sm:gap-6 flex-1 min-w-0 p-5 sm:p-6">
                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
                          {event.name}
                        </h3>
                        <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          {event.city}, {event.state}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{event.eventType}</span>
                          <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{event.gender}</span>
                          <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{event.ageGroup}</span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-primary mt-2.5 line-clamp-2 hidden sm:block leading-relaxed">{event.description.split(" ").slice(0, 30).join(" ")}{event.description.split(" ").length > 30 ? "..." : ""}</p>
                        )}
                      </div>
                    </a>

                    {/* Admin toggle button (outside the link) */}
                    {isAdmin && (
                      <div className="flex items-center pr-3">
                        <button
                          onClick={() => togglePast(event.slug)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted hover:bg-surface transition-colors whitespace-nowrap"
                        >
                          {event.isPast ? "Move to Current" : "Move to Past"}
                        </button>
                      </div>
                    )}

                    {/* Arrow panel */}
                    <a href={`/special-events/${event.slug}`} className="hidden sm:flex items-center justify-center w-14 md:w-16 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
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
