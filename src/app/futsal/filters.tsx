"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FutsalTeam } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;

export function FutsalFilters({ teams }: { teams: FutsalTeam[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [level, setLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [recruiting, setRecruiting] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const levels = [...new Set(teams.map((t) => t.level))].sort();
  const ageGroups = [...new Set(teams.map((t) => t.ageGroup))].sort();

  const filtered = teams.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.city.toLowerCase().includes(q) && !t.state.toLowerCase().includes(q)) return false;
    }
    if (level && t.level !== level) return false;
    if (ageGroup && t.ageGroup !== ageGroup) return false;
    if (gender && t.gender !== gender) return false;
    if (recruiting === "yes" && !t.lookingForPlayers) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const visible = viewAll ? sorted : sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search futsal teams by name, city, or state..."
        className="w-full px-5 py-3 rounded-xl border border-border bg-white text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mt-6"
      />
      <FilterBar
        filters={[
          { label: "All Levels", options: levels, value: level, onChange: (v: string) => { setLevel(v); setPage(1); } },
          { label: "All Age Groups", options: ageGroups, value: ageGroup, onChange: (v: string) => { setAgeGroup(v); setPage(1); } },
          { label: "All Genders", options: ["Boys", "Girls", "Coed", "Men", "Women"], value: gender, onChange: (v: string) => { setGender(v); setPage(1); } },
          { label: "Recruiting?", options: ["yes"], value: recruiting, onChange: (v: string) => { setRecruiting(v); setPage(1); } },
        ]}
      />

      {/* View All / result count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">
          {sorted.length} team{sorted.length !== 1 ? "s" : ""} found
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
        <EmptyState message="No futsal teams match your filters." />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((team) => (
              <ListingCard
                key={team.id}
                href={`/futsal/${team.slug}`}
                title={team.name}
                subtitle={`${team.clubName || ""} · ${team.city}, ${team.state}`}
                image={team.teamPhoto && !team.teamPhoto.includes("idf.webp") ? team.teamPhoto : team.logo || team.imageUrl || undefined}
                badges={[
                  { label: team.level, variant: "blue" },
                  { label: team.gender, variant: team.gender === "Boys" ? "blue" : "purple" },
                  { label: team.format, variant: "orange" },
                  ...(team.lookingForPlayers ? [{ label: "Recruiting", variant: "green" as const }] : []),
                ]}
                details={[
                  { label: "Age Group", value: team.ageGroup },
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
    </>
  );
}
