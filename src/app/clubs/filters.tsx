"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Club } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const quickStates = ["NC", "SC", "VA", "GA", "TX", "FL"];

export function ClubFilters({ clubs }: { clubs: Club[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [level, setLevel] = useState("");
  const [state, setState] = useState("");
  const [gender, setGender] = useState("");

  const levels = [...new Set(clubs.map((c) => c.level))];
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

  // Sort featured first
  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search clubs by name, city, or state..."
        className="w-full px-5 py-3 rounded-xl border border-border bg-white text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mt-6"
      />
      <div className="flex flex-wrap gap-2 mt-3">
        {quickStates.map((s) => (
          <button
            key={s}
            onClick={() => setState(state === s ? "" : s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${state === s ? "bg-accent text-white" : "bg-surface text-primary hover:bg-border"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <FilterBar
        filters={[
          { label: "All Levels", options: levels, value: level, onChange: setLevel },
          { label: "All States", options: states, value: state, onChange: setState },
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
              {/* Insert Anytime CTA after every 6th card */}
              {i === 5 && (
                <div key="cta" className="md:col-span-2 lg:col-span-3">
                  <AnytimeInlineCTA />
                </div>
              )}
            </>
          ))}
        </div>
      )}
    </>
  );
}
