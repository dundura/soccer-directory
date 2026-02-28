"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tournament } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function TournamentFilters({ tournaments }: { tournaments: Tournament[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [level, setLevel] = useState("");
  const [state, setState] = useState("");
  const [format, setFormat] = useState("");
  const [region, setRegion] = useState(searchParams.get("region") || "");

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

  return (
    <>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tournaments by name, city, or organizer..."
        className="w-full px-5 py-3 rounded-xl border border-border bg-white text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mt-6"
      />
      <FilterBar
        filters={[
          { label: "All Regions", options: ["US", "International"], value: region, onChange: setRegion },
          { label: "All Levels", options: levels, value: level, onChange: setLevel },
          { label: "All States", options: states, value: state, onChange: setState },
          { label: "All Formats", options: formats, value: format, onChange: setFormat },
        ]}
      />
      {sorted.length === 0 ? (
        <EmptyState message="No tournaments match your filters." />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((tournament) => (
              <ListingCard
                key={tournament.id}
                href={`/tournaments/${tournament.slug}`}
                title={tournament.name}
                subtitle={`${tournament.organizer} · ${tournament.city}, ${tournament.state}`}
                image={tournament.teamPhoto || undefined}
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
                cta="View Tournament"
              />
            ))}
          </div>
          <div className="mt-8"><AnytimeInlineCTA /></div>
        </>
      )}
    </>
  );
}
