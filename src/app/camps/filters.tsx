"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Camp } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function CampFilters({ camps }: { camps: Camp[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [campType, setCampType] = useState("");
  const [state, setState] = useState(searchParams.get("state") || "");

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
      {/* Hero Section with Search Bar */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Soccer Camps & Clinics
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Find the perfect camp — from elite ID camps and college showcases to fun recreational programs.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by camp name, city, or organizer..."
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
            { label: "All Camp Types", options: campTypes, value: campType, onChange: setCampType },
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
      </div>
    </>
  );
}
