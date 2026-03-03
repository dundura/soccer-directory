"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { TrainingApp } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const CATEGORIES = [
  "Training",
  "Fitness & Conditioning",
  "Video Analysis",
  "Tactics & Strategy",
  "Player Development",
  "Team Management",
  "Social & Community",
  "Other",
];

export function TrainingAppFilters({ apps }: { apps: TrainingApp[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [state, setState] = useState(searchParams.get("state") || "");

  const states = [...new Set(apps.map((a) => a.state))].sort();

  const filtered = apps.filter((a) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !a.name.toLowerCase().includes(q) &&
        !a.providerName.toLowerCase().includes(q) &&
        !(a.description || "").toLowerCase().includes(q) &&
        !a.city.toLowerCase().includes(q)
      )
        return false;
    }
    if (category && a.category !== category) return false;
    if (state && a.state !== state) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Training Apps
          </h1>
          <p className="text-white/70 max-w-2xl text-lg">
            Discover soccer training apps to help players, coaches, and families improve their game.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search training apps..."
            className="flex-1 px-5 py-4 rounded-xl text-primary text-base placeholder:text-muted focus:outline-none"
          />
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="px-4 py-4 rounded-xl border border-border text-sm font-medium text-primary bg-surface focus:outline-none cursor-pointer sm:w-48"
          >
            <option value="">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <FilterBar
          filters={[
            { label: "All Categories", options: CATEGORIES, value: category, onChange: setCategory },
          ]}
        />

        {sorted.length === 0 ? (
          <EmptyState message="No training apps match your filters." />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((app) => (
                <ListingCard
                  key={app.id}
                  href={`/training-apps/${app.slug}`}
                  title={app.name}
                  subtitle={`by ${app.providerName} · ${app.city}, ${app.state}`}
                  image={app.imageUrl || undefined}
                  badges={[
                    { label: app.category, variant: "green" },
                    ...(app.price ? [{ label: app.price }] : []),
                  ]}
                  details={[
                    { label: "Location", value: `${app.city}, ${app.state}` },
                  ]}
                  featured={app.featured}
                  cta="View Details"
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
