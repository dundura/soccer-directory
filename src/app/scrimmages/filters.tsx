"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Scrimmage } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;

export function ScrimmageFilters({ scrimmages }: { scrimmages: Scrimmage[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [level, setLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [availability, setAvailability] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const levels = [...new Set(scrimmages.map((s) => s.level))].sort();
  const ageGroups = [...new Set(scrimmages.map((s) => s.ageGroup))].sort();

  const filtered = scrimmages.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      if (!s.teamName.toLowerCase().includes(q) && !s.city.toLowerCase().includes(q) && !s.state.toLowerCase().includes(q)) return false;
    }
    if (level && s.level !== level) return false;
    if (ageGroup && s.ageGroup !== ageGroup) return false;
    if (gender && s.gender !== gender) return false;
    if (availability && s.availability !== availability) return false;
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
        placeholder="Search scrimmages by team name, city, or state..."
        className="w-full px-5 py-3 rounded-xl border border-border bg-white text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mt-6"
      />
      <FilterBar
        filters={[
          { label: "All Levels", options: levels, value: level, onChange: (v: string) => { setLevel(v); setPage(1); } },
          { label: "All Age Groups", options: ageGroups, value: ageGroup, onChange: (v: string) => { setAgeGroup(v); setPage(1); } },
          { label: "All Genders", options: ["Boys", "Girls", "Coed"], value: gender, onChange: (v: string) => { setGender(v); setPage(1); } },
          { label: "Availability", options: ["Looking for Scrimmage", "Open to Scrimmages", "Looking for Regular Scrimmage Partners"], value: availability, onChange: (v: string) => { setAvailability(v); setPage(1); } },
        ]}
      />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">
          {sorted.length} scrimmage{sorted.length !== 1 ? "s" : ""} found
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
        <EmptyState message="No scrimmages match your filters." />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((s) => (
              <ListingCard
                key={s.id}
                href={`/scrimmages/${s.slug}`}
                title={s.teamName}
                subtitle={`${s.city}, ${s.state}`}
                image={s.teamPhoto || s.logo || s.imageUrl || undefined}
                badges={[
                  { label: s.level, variant: "blue" },
                  { label: s.gender, variant: s.gender === "Boys" ? "blue" : "purple" },
                  { label: s.availability, variant: "green" },
                ]}
                details={[
                  { label: "Age Group", value: s.ageGroup },
                ]}
                featured={s.featured}
                imagePosition={s.imagePosition}
                cta="Contact Team"
              />
            ))}
          </div>

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
