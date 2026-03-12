"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Tryout, Club, Team } from "@/lib/types";
import { FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;

export function TryoutFilters({ tryouts, clubs = [], teams = [] }: { tryouts: Tryout[]; clubs?: Club[]; teams?: Team[] }) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const [tab, setTab] = useState<"current" | "past">("current");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [gender, setGender] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const allStates = [...new Set([...tryouts.map((t) => t.state), ...clubs.map((c) => c.state), ...teams.map((t) => t.state)])].sort();
  const allGenders = [...new Set([...tryouts.map((t) => t.gender), ...clubs.map((c) => c.gender), ...teams.map((t) => t.gender)])].sort();
  const states = allStates;
  const genders = allGenders;

  const filtered = tryouts.filter((t) => {
    if (tab === "current" && t.isPast) return false;
    if (tab === "past" && !t.isPast) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !t.name.toLowerCase().includes(q) &&
        !t.city.toLowerCase().includes(q) &&
        !t.state.toLowerCase().includes(q) &&
        !(t.clubName || "").toLowerCase().includes(q) &&
        !t.organizerName.toLowerCase().includes(q)
      ) return false;
    }
    if (state && t.state !== state) return false;
    if (gender && t.gender !== gender) return false;
    return true;
  });

  // Filter clubs and teams (only show on "current" tab)
  const filteredClubs = tab === "current" ? clubs.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.city.toLowerCase().includes(q) && !c.state.toLowerCase().includes(q)) return false;
    }
    if (state && c.state !== state) return false;
    if (gender && c.gender !== gender) return false;
    return true;
  }) : [];

  const filteredTeams = tab === "current" ? teams.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.city.toLowerCase().includes(q) && !t.state.toLowerCase().includes(q) && !(t.clubName || "").toLowerCase().includes(q)) return false;
    }
    if (state && t.state !== state) return false;
    if (gender && t.gender !== gender) return false;
    return true;
  }) : [];

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const totalItems = sorted.length + filteredClubs.length + filteredTeams.length;
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const visible = viewAll ? sorted : sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  async function togglePast(slug: string) {
    await fetch(`/api/tryouts/${slug}`, { method: "PATCH" });
    window.location.reload();
  }

  const fallbackImage = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Soccer Tryouts
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Find upcoming tryouts for clubs and teams near you. Open tryouts, ID sessions, and combines for all ages.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, club, city..."
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
            <button
              type="button"
              className="px-8 py-4 rounded-xl bg-accent text-white font-semibold text-base hover:bg-accent-hover transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Tabs + Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Tabs */}
        <div className="flex gap-1 mt-6 mb-2 bg-surface rounded-xl p-1 w-fit">
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

        <FilterBar
          filters={[
            { label: "All Genders", options: genders, value: gender, onChange: (v: string) => { setGender(v); setPage(1); } },
          ]}
        />

        {/* View All / result count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            {totalItems} result{totalItems !== 1 ? "s" : ""} found
            {sorted.length > 0 && <> &middot; {sorted.length} tryout{sorted.length !== 1 ? "s" : ""}</>}
            {filteredClubs.length > 0 && <> &middot; {filteredClubs.length} club{filteredClubs.length !== 1 ? "s" : ""}</>}
            {filteredTeams.length > 0 && <> &middot; {filteredTeams.length} team{filteredTeams.length !== 1 ? "s" : ""}</>}
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

        {sorted.length === 0 && filteredClubs.length === 0 && filteredTeams.length === 0 ? (
          <EmptyState message={tab === "current" ? "No current tryouts found." : "No past tryouts found."} />
        ) : (
          <>
            <div className="space-y-4">
              {visible.map((tryout) => (
                <div
                  key={tryout.id}
                  className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all flex flex-col sm:flex-row"
                >
                  {/* Image */}
                  <a
                    href={`/tryouts/${tryout.slug}`}
                    className="sm:w-48 shrink-0"
                  >
                    <img
                      src={tryout.teamPhoto && !tryout.teamPhoto.includes("idf.webp") ? tryout.teamPhoto : tryout.logo || tryout.imageUrl || fallbackImage}
                      alt={tryout.name}
                      className="w-full h-40 sm:h-full object-cover"
                      style={{ objectPosition: `center ${tryout.imagePosition ?? 50}%` }}
                    />
                  </a>

                  {/* Info */}
                  <div className="flex-1 p-4 sm:p-5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <a href={`/tryouts/${tryout.slug}`} className="min-w-0">
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary group-hover:text-accent-hover transition-colors truncate">
                          {tryout.name}
                        </h3>
                        {tryout.clubName && (
                          <p className="text-muted text-sm">{tryout.clubName}</p>
                        )}
                      </a>
                      {tryout.featured && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold">Featured</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-semibold">{tryout.tryoutType}</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface text-primary text-xs font-semibold">{tryout.gender}</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface text-primary text-xs font-semibold">{tryout.ageGroup}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-3 text-sm">
                      <div><span className="text-muted">Dates:</span> <span className="font-medium text-primary">{tryout.dates}</span></div>
                      {tryout.time && <div><span className="text-muted">Time:</span> <span className="font-medium text-primary">{tryout.time}</span></div>}
                      <div><span className="text-muted">Location:</span> <span className="font-medium text-primary">{tryout.location || `${tryout.city}, ${tryout.state}`}</span></div>
                      {tryout.cost && <div><span className="text-muted">Cost:</span> <span className="font-medium text-primary">{tryout.cost}</span></div>}
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <a
                        href={`/tryouts/${tryout.slug}`}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
                      >
                        View Details
                      </a>
                      {tryout.registrationUrl && (
                        <a
                          href={tryout.registrationUrl.startsWith("http") ? tryout.registrationUrl : `https://${tryout.registrationUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 rounded-lg border border-accent text-accent text-sm font-semibold hover:bg-accent hover:text-white transition-colors"
                        >
                          Register
                        </a>
                      )}
                      {tryout.website && (
                        <a
                          href={tryout.website.startsWith("http") ? tryout.website : `https://${tryout.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-primary text-sm font-semibold hover:bg-surface transition-colors"
                        >
                          Website
                        </a>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => togglePast(tryout.slug)}
                          className="ml-auto inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted hover:bg-surface transition-colors"
                        >
                          {tryout.isPast ? "Move to Current" : "Move to Past"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clubs */}
            {filteredClubs.length > 0 && (
              <>
                <div className="mt-10 mb-4">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary">Soccer Clubs</h2>
                  <p className="text-sm text-muted">Clubs that may be holding tryouts — visit their page for details.</p>
                </div>
                <div className="space-y-4">
                  {filteredClubs.map((club) => (
                    <div
                      key={club.id}
                      className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all flex flex-col sm:flex-row"
                    >
                      <a href={`/clubs/${club.slug}`} className="sm:w-48 shrink-0">
                        <img
                          src={club.teamPhoto && !club.teamPhoto.includes("idf.webp") ? club.teamPhoto : club.logo || club.imageUrl || fallbackImage}
                          alt={club.name}
                          className="w-full h-40 sm:h-full object-cover"
                          style={{ objectPosition: `center ${club.imagePosition ?? 50}%` }}
                        />
                      </a>
                      <div className="flex-1 p-4 sm:p-5 min-w-0">
                        <a href={`/clubs/${club.slug}`} className="min-w-0">
                          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary group-hover:text-accent-hover transition-colors truncate">
                            {club.name}
                          </h3>
                          <p className="text-muted text-sm">{club.city}, {club.state}</p>
                        </a>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {club.level && <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-semibold">{club.level}</span>}
                          {club.gender && <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface text-primary text-xs font-semibold">{club.gender}</span>}
                          {club.ageGroups && <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface text-primary text-xs font-semibold">{club.ageGroups}</span>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-3 text-sm">
                          {club.teamCount > 0 && <div><span className="text-muted">Teams:</span> <span className="font-medium text-primary">{club.teamCount}</span></div>}
                          <div><span className="text-muted">Location:</span> <span className="font-medium text-primary">{club.city}, {club.state}</span></div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <a
                            href={`/clubs/${club.slug}`}
                            className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
                          >
                            View Details
                          </a>
                          <a
                            href={`/clubs/${club.slug}`}
                            className="inline-flex items-center px-4 py-2 rounded-lg border border-accent text-accent text-sm font-semibold hover:bg-accent hover:text-white transition-colors"
                          >
                            Register
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Teams */}
            {filteredTeams.length > 0 && (
              <>
                <div className="mt-10 mb-4">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary">Soccer Teams</h2>
                  <p className="text-sm text-muted">Teams that may be holding tryouts — visit their page for details.</p>
                </div>
                <div className="space-y-4">
                  {filteredTeams.map((team) => (
                    <div
                      key={team.id}
                      className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all flex flex-col sm:flex-row"
                    >
                      <a href={`/teams/${team.slug}`} className="sm:w-48 shrink-0">
                        <img
                          src={team.teamPhoto && !team.teamPhoto.includes("idf.webp") ? team.teamPhoto : team.logo || team.imageUrl || fallbackImage}
                          alt={team.name}
                          className="w-full h-40 sm:h-full object-cover"
                          style={{ objectPosition: `center ${team.imagePosition ?? 50}%` }}
                        />
                      </a>
                      <div className="flex-1 p-4 sm:p-5 min-w-0">
                        <a href={`/teams/${team.slug}`} className="min-w-0">
                          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary group-hover:text-accent-hover transition-colors truncate">
                            {team.name}
                          </h3>
                          {team.clubName && <p className="text-muted text-sm">{team.clubName}</p>}
                          <p className="text-muted text-sm">{team.city}, {team.state}</p>
                        </a>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {team.level && <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-semibold">{team.level}</span>}
                          {team.gender && <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface text-primary text-xs font-semibold">{team.gender}</span>}
                          {team.ageGroup && <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface text-primary text-xs font-semibold">{team.ageGroup}</span>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-3 text-sm">
                          {team.coach && <div><span className="text-muted">Coach:</span> <span className="font-medium text-primary">{team.coach}</span></div>}
                          {team.season && <div><span className="text-muted">Season:</span> <span className="font-medium text-primary">{team.season}</span></div>}
                          <div><span className="text-muted">Location:</span> <span className="font-medium text-primary">{team.city}, {team.state}</span></div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <a
                            href={`/teams/${team.slug}`}
                            className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
                          >
                            View Details
                          </a>
                          <a
                            href={`/teams/${team.slug}`}
                            className="inline-flex items-center px-4 py-2 rounded-lg border border-accent text-accent text-sm font-semibold hover:bg-accent hover:text-white transition-colors"
                          >
                            Register
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
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

            <div className="mt-8"><AnytimeInlineCTA /></div>
          </>
        )}
      </div>
    </>
  );
}
