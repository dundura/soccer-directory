"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tournament } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;

export function TournamentFilters({ tournaments }: { tournaments: Tournament[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [level, setLevel] = useState("");
  const [state, setState] = useState("");
  const [format, setFormat] = useState("");
  const [region, setRegion] = useState(searchParams.get("region") || "");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const levels = [...new Set(tournaments.map((t) => t.level))].sort();
  const states = [...new Set(tournaments.map((t) => t.state))].sort();
  const formats = [...new Set(tournaments.map((t) => t.format))].sort();

  const filtered = tournaments.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.city.toLowerCase().includes(q) && !t.state.toLowerCase().includes(q) && !t.organizer.toLowerCase().includes(q)) return false;
    }
    if (level && t.level !== level) return false;
    if (state && t.state !== state) return false;
    if (format && t.format !== format) return false;
    if (region && t.region !== region) return false;
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
        placeholder="Search tournaments by name, city, or organizer..."
        className="w-full px-5 py-3 rounded-xl border border-border bg-white text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mt-6"
      />
      <FilterBar
        filters={[
          { label: "All Regions", options: ["US", "International"], value: region, onChange: (v: string) => { setRegion(v); setPage(1); } },
          { label: "All Levels", options: levels, value: level, onChange: (v: string) => { setLevel(v); setPage(1); } },
          { label: "All States", options: states, value: state, onChange: (v: string) => { setState(v); setPage(1); } },
          { label: "All Formats", options: formats, value: format, onChange: (v: string) => { setFormat(v); setPage(1); } },
        ]}
      />

      {/* View All / result count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">
          {sorted.length} tournament{sorted.length !== 1 ? "s" : ""} found
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
        <EmptyState message="No tournaments match your filters." />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((tournament) => (
              <ListingCard
                key={tournament.id}
                href={`/tournaments/${tournament.slug}`}
                title={tournament.name}
                subtitle={`${tournament.organizer} · ${tournament.city}, ${tournament.state}`}
                image={tournament.teamPhoto && !tournament.teamPhoto.includes("idf.webp") ? tournament.teamPhoto : tournament.logo || tournament.imageUrl || undefined}
                badges={[
                  { label: tournament.level, variant: "blue" },
                  { label: tournament.format, variant: "orange" },
                  { label: tournament.gender },
                  { label: tournament.region, variant: tournament.region === "International" ? "purple" : "default" },
                ]}
                details={[
                  { label: "Dates", value: tournament.dates },
                  { label: "Ages", value: tournament.ageGroups },
                  { label: "Entry Fee", value: tournament.entryFee },
                ]}
                featured={tournament.featured}
                imagePosition={tournament.imagePosition}
                cta="View Tournament"
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
