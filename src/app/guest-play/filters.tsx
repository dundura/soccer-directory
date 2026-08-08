"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { GuestOpportunity } from "@/lib/types";
import { ListingCard, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function GuestPlayFilters({ opportunities }: { opportunities: GuestOpportunity[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");

  const states = [...new Set(opportunities.map((o) => o.state).filter(Boolean))].sort();
  const ageGroups = [...new Set(opportunities.map((o) => o.ageGroup).filter(Boolean))].sort();
  const genders = [...new Set(opportunities.map((o) => o.gender).filter(Boolean))].sort();

  const filtered = opportunities.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      const haystack = [o.teamName, o.tournament, o.city, o.state];
      if (!haystack.some((f) => (f || "").toLowerCase().includes(q))) return false;
    }
    if (state && o.state !== state) return false;
    if (gender && o.gender !== gender) return false;
    if (ageGroup && o.ageGroup !== ageGroup) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      {/* ====== FILTER BAR ====== */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-2 mb-8 flex flex-col sm:flex-row items-stretch gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by team, tournament, or city..."
          className="px-5 py-3 rounded-xl text-sm text-primary placeholder:text-muted focus:outline-none min-w-0 flex-1 sm:border-r border-border"
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="px-5 py-3 rounded-xl text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer sm:border-r border-border"
        >
          <option value="">All States</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="px-5 py-3 rounded-xl text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer sm:border-r border-border"
        >
          <option value="">All Genders</option>
          {genders.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="px-5 py-3 rounded-xl text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer"
        >
          <option value="">All Ages</option>
          {ageGroups.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {opportunities.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-lg">No upcoming guest player opportunities at the moment.</p>
          <p className="text-muted text-sm mt-2">Check back soon or list your own opportunity!</p>
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState message="No guest player opportunities match your filters." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((opp) => (
            <ListingCard
              key={opp.id}
              href={`/guest-play/${opp.slug}`}
              title={opp.teamName}
              subtitle={`${opp.tournament} · ${opp.city}, ${opp.state}`}
              image={opp.teamPhoto && !opp.teamPhoto.includes("idf.webp") ? opp.teamPhoto : opp.logo || opp.imageUrl || undefined}
              badges={[
                { label: opp.level, variant: "blue" },
                { label: opp.gender, variant: opp.gender === "Boys" ? "blue" : "purple" },
                { label: opp.ageGroup },
              ]}
              details={[
                { label: "Dates", value: opp.dates },
                { label: "Tournament", value: opp.tournament },
                { label: "Positions Needed", value: opp.positionsNeeded },
              ]}
              featured={opp.featured}
              imagePosition={opp.imagePosition}
              cta="View Details"
            />
          ))}
        </div>
      )}

      <div className="mt-12"><AnytimeInlineCTA /></div>
    </div>
  );
}
