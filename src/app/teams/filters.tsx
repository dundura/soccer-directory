"use client";

import { useState } from "react";
import { Team } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function TeamFilters({ teams }: { teams: Team[] }) {
  const [level, setLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [recruiting, setRecruiting] = useState("");

  const levels = [...new Set(teams.map((t) => t.level))].sort();
  const ageGroups = [...new Set(teams.map((t) => t.ageGroup))].sort();

  const filtered = teams.filter((t) => {
    if (level && t.level !== level) return false;
    if (ageGroup && t.ageGroup !== ageGroup) return false;
    if (gender && t.gender !== gender) return false;
    if (recruiting === "yes" && !t.lookingForPlayers) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      <FilterBar
        filters={[
          { label: "All Levels", options: levels, value: level, onChange: setLevel },
          { label: "All Birth Years", options: ageGroups, value: ageGroup, onChange: setAgeGroup },
          { label: "All Genders", options: ["Boys", "Girls"], value: gender, onChange: setGender },
          { label: "Recruiting?", options: ["yes"], value: recruiting, onChange: setRecruiting },
        ]}
      />
      {sorted.length === 0 ? (
        <EmptyState message="No teams match your filters." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((team, i) => (
            <>
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
              {i === 5 && <div key="cta" className="md:col-span-2 lg:col-span-3"><AnytimeInlineCTA /></div>}
            </>
          ))}
        </div>
      )}
    </>
  );
}
