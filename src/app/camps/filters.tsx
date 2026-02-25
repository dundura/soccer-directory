"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Camp } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function CampFilters({ camps }: { camps: Camp[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [campType, setCampType] = useState("");
  const [state, setState] = useState("");

  const campTypes = [...new Set(camps.map((c) => c.campType))].sort();
  const states = [...new Set(camps.map((c) => c.state))].sort();

  const filtered = camps.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.city.toLowerCase().includes(q) && !c.state.toLowerCase().includes(q) && !c.organizerName.toLowerCase().includes(q)) return false;
    }
    if (campType && c.campType !== campType) return false;
    if (state && c.state !== state) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search camps by name, city, or organizer..."
        className="w-full px-5 py-3 rounded-xl border border-border bg-white text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mt-6"
      />
      <FilterBar
        filters={[
          { label: "All Camp Types", options: campTypes, value: campType, onChange: setCampType },
          { label: "All States", options: states, value: state, onChange: setState },
        ]}
      />
      {sorted.length === 0 ? (
        <EmptyState message="No camps match your filters." />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((camp) => (
              <ListingCard
                key={camp.id}
                href={`/camps/${camp.slug}`}
                title={camp.name}
                subtitle={`${camp.organizerName} · ${camp.city}, ${camp.state}`}
                badges={[
                  { label: camp.campType, variant: "orange" },
                  { label: camp.gender },
                ]}
                details={[
                  { label: "Ages", value: camp.ageRange },
                  { label: "Dates", value: camp.dates },
                  { label: "Price", value: camp.price },
                ]}
                featured={camp.featured}
                cta="View Camp"
              />
            ))}
          </div>
          <div className="mt-8"><AnytimeInlineCTA /></div>
        </>
      )}
    </>
  );
}
