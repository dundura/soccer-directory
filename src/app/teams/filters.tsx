"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Team } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;

export function TeamFilters({ teams }: { teams: Team[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [level, setLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [gender, setGender] = useState("");
  const [recruiting, setRecruiting] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const LEVELS = ["MLS Next Pro Pathway", "MLS NEXT", "MLS NEXT 2", "Girls Academy", "ECNL", "ECNL Regional League (ECRL)", "Elite 64", "USL Academy", "Aspire", "NPL", "USYS National League", "DPL", "EDP", "SCCL", "State League", "Regional League", "Club Travel", "Rec Select", "Recreational / Grassroots"];
  const ageGroups = [...new Set(teams.map((t) => t.ageGroup))].sort();
  const states = [...new Set(teams.map((t) => t.state))].sort();

  const filtered = teams.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.city.toLowerCase().includes(q) && !t.state.toLowerCase().includes(q) && !(t.clubName || "").toLowerCase().includes(q)) return false;
    }
    if (level && t.level !== level) return false;
    if (ageGroup && t.ageGroup !== ageGroup) return false;
    if (state && t.state !== state) return false;
    if (gender && t.gender !== gender) return false;
    if (recruiting === "yes" && !t.lookingForPlayers) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const allFeatured = sorted.filter((t) => t.featured);
  const [featuredTeams] = useState(() => {
    const shuffled = [...allFeatured];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3);
  });
  const featuredIds = new Set(featuredTeams.map((t) => t.id));
  const nonFeaturedTeams = sorted.filter((t) => !featuredIds.has(t.id));
  const totalPages = Math.ceil(nonFeaturedTeams.length / PER_PAGE);
  const visibleNonFeatured = viewAll ? nonFeaturedTeams : nonFeaturedTeams.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
            Find a Team to Play For
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Browse youth soccer teams looking for players. Filter by age group, level, and location.
          </p>

          {/* Unified search pill */}
          <div className="bg-white rounded-2xl sm:rounded-full shadow-2xl p-2 flex flex-col sm:flex-row items-stretch gap-0 max-w-4xl mx-auto">
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="px-5 py-3.5 rounded-xl sm:rounded-l-full sm:rounded-r-none text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer sm:w-44 sm:border-r border-border"
            >
              <option value="">All States</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Team name, city, club..."
              className="flex-1 px-5 py-3.5 text-primary placeholder:text-muted focus:outline-none text-sm min-w-0"
            />
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value); setPage(1); }}
              className="px-5 py-3.5 rounded-xl sm:rounded-none text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer sm:w-48 sm:border-l border-border"
            >
              <option value="">All Levels</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <button
              type="button"
              className="px-8 py-3.5 rounded-xl sm:rounded-r-full sm:rounded-l-none bg-accent text-white font-bold text-sm uppercase tracking-wide hover:bg-accent-hover transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ====== CONTENT ====== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Secondary filter bar */}
        <FilterBar
          filters={[
            { label: "All Birth Years", options: ageGroups, value: ageGroup, onChange: (v: string) => { setAgeGroup(v); setPage(1); } },
            { label: "All Genders", options: ["Boys", "Girls"], value: gender, onChange: (v: string) => { setGender(v); setPage(1); } },
            { label: "Recruiting?", options: ["yes"], value: recruiting, onChange: (v: string) => { setRecruiting(v); setPage(1); } },
          ]}
        />

        {sorted.length === 0 ? (
          <EmptyState message="No teams match your filters." />
        ) : (
          <>
            {/* ====== FEATURED CARDS ====== */}
            {featuredTeams.length > 0 && (
              <div className="mb-10">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mb-5 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-amber-500">&#9733;</span> Featured Teams
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredTeams.map((team) => (
                    <ListingCard
                      key={team.id}
                      href={`/teams/${team.slug}`}
                      title={team.name}
                      subtitle={`${team.clubName || ""} · ${team.city}, ${team.state}`}
                      image={team.teamPhoto && !team.teamPhoto.includes("idf.webp") ? team.teamPhoto : team.logo || team.imageUrl || undefined}
                      badges={[
                        { label: team.level, variant: "blue" },
                        { label: team.gender, variant: team.gender === "Boys" ? "blue" : "purple" },
                        ...(team.lookingForPlayers ? [{ label: "Recruiting", variant: "green" as const }] : []),
                      ]}
                      details={[
                        { label: "Birth Year", value: team.ageGroup },
                        { label: "Coach", value: team.coach },
                        ...(team.positionsNeeded ? [{ label: "Positions", value: team.positionsNeeded }] : []),
                        { label: "Season", value: team.season },
                      ]}
                      featured={team.featured}
                      imagePosition={team.imagePosition}
                      cta="View Team"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ====== RESULTS COUNT ====== */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted font-medium">
                {nonFeaturedTeams.length} team{nonFeaturedTeams.length !== 1 ? "s" : ""} found
                {!viewAll && totalPages > 1 && <> &middot; Page {page} of {totalPages}</>}
              </p>
              {nonFeaturedTeams.length > PER_PAGE && (
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
              {visibleNonFeatured.map((team) => {
                const img = team.logo || team.teamPhoto || team.imageUrl;
                return (
                  <a
                    key={team.id}
                    href={`/teams/${team.slug}`}
                    className="group flex items-start gap-5 sm:gap-6 bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all p-5 sm:p-6 border-l-4 border-l-accent/20 hover:border-l-accent"
                  >
                    {/* Logo thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-surface flex-shrink-0 flex items-center justify-center">
                      {img ? (
                        <img src={img} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                      )}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
                        {team.name}
                      </h3>
                      <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        {team.city}, {team.state}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{team.level}</span>
                        <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{team.ageGroup}</span>
                        <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{team.gender}</span>
                        {team.lookingForPlayers && (
                          <span className="px-3 py-1 rounded-full bg-red-50 text-accent text-xs font-bold">Recruiting</span>
                        )}
                      </div>
                      {team.description && (
                        <p className="text-sm text-muted/60 mt-2.5 line-clamp-2 hidden sm:block leading-relaxed">{team.description}</p>
                      )}
                    </div>

                    {/* Arrow */}
                    <span className="text-muted/30 group-hover:text-accent transition-colors text-3xl font-light flex-shrink-0 mt-2 hidden sm:block">
                      &#8250;
                    </span>
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
