"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Club } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function ClubFilters({ clubs }: { clubs: Club[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [level, setLevel] = useState("");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [gender, setGender] = useState("");

  const LEVELS = ["MLS Next Pro Pathway", "MLS NEXT", "MLS NEXT 2", "Girls Academy", "ECNL", "ECNL Regional League (ECRL)", "Elite 64", "USL Academy", "Aspire", "NPL", "USYS National League", "DPL", "EDP", "SCCL", "State League", "Regional League", "Club / Local Travel", "Rec Select", "Recreational / Grassroots"];
  const states = [...new Set(clubs.map((c) => c.state))].sort();

  const filtered = clubs.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.city.toLowerCase().includes(q) && !c.state.toLowerCase().includes(q)) return false;
    }
    if (level && c.level !== level) return false;
    if (state && c.state !== state) return false;
    if (gender && !c.gender.includes(gender)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      {/* Hero Section with Search Bar */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Youth Soccer Clubs
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Browse verified clubs across ECNL, MLS Next, GA, recreational leagues, and more.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by club name, city, or state..."
              className="flex-1 px-5 py-4 rounded-xl text-primary text-base placeholder:text-muted focus:outline-none"
            />
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
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

      {/* Filter + Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FilterBar
          filters={[
            { label: "All Levels", options: LEVELS, value: level, onChange: setLevel },
            { label: "All Genders", options: ["Boys", "Girls"], value: gender, onChange: setGender },
          ]}
        />

        {sorted.length === 0 ? (
          <EmptyState message="No clubs match your filters. Try broadening your search." />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((club, i) => (
              <>
                <ListingCard
                  key={club.id}
                  href={`/clubs/${club.slug}`}
                  title={club.name}
                  subtitle={`${club.city}, ${club.state}`}
                  badges={[
                    { label: club.level, variant: club.level.includes("MLS") ? "purple" : "blue" },
                    { label: club.gender },
                  ]}
                  details={[
                    { label: "Teams", value: String(club.teamCount) },
                    { label: "Ages", value: club.ageGroups },
                  ]}
                  featured={club.featured}
                  cta="View Club"
                />
                {i === 5 && (
                  <div key="cta" className="md:col-span-2 lg:col-span-3">
                    <AnytimeInlineCTA />
                  </div>
                )}
              </>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
