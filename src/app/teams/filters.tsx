"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Team } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function TeamFilters({ teams }: { teams: Team[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [level, setLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [gender, setGender] = useState("");
  const [recruiting, setRecruiting] = useState("");

  const LEVELS = ["MLS Next Pro Pathway", "MLS NEXT", "MLS NEXT 2", "Girls Academy", "ECNL", "ECNL Regional League (ECRL)", "Elite 64", "USL Academy", "Aspire", "NPL", "USYS National League", "DPL", "EDP", "SCCL", "State League", "Regional League", "Club Travel", "Rec Select", "Recreational / Grassroots"];
  const ageGroups = [...new Set(teams.map((t) => t.ageGroup))].sort();
  const states = [...new Set(teams.map((t) => t.state))].sort();

  const filtered = teams.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.city.toLowerCase().includes(q) && !t.state.toLowerCase().includes(q)) return false;
    }
    if (level && t.level !== level) return false;
    if (ageGroup && t.ageGroup !== ageGroup) return false;
    if (state && t.state !== state) return false;
    if (gender && t.gender !== gender) return false;
    if (recruiting === "yes" && !t.lookingForPlayers) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      {/* Hero Section with Search Bar */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Youth Soccer Teams
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Find teams looking for players. Filter by age group, competitive level, and location.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by team name, city, or state..."
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
            { label: "All Birth Years", options: ageGroups, value: ageGroup, onChange: setAgeGroup },
            { label: "All Genders", options: ["Boys", "Girls"], value: gender, onChange: setGender },
            { label: "Recruiting?", options: ["yes"], value: recruiting, onChange: setRecruiting },
          ]}
        />
        {sorted.length === 0 ? (
          <EmptyState message="No teams match your filters." />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((team) => (
                  <ListingCard
                    key={team.id}
                    href={`/teams/${team.slug}`}
                    title={team.name}
                    subtitle={`${team.clubName || ""} · ${team.city}, ${team.state}`}
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
                    cta="View Team"
                  />
              ))}
            </div>
            <div className="mt-8"><AnytimeInlineCTA /></div>
          </>
        )}
      </div>
    </>
  );
}
