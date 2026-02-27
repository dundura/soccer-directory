"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Trainer } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function TrainerFilters({ trainers }: { trainers: Trainer[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "");
  const [state, setState] = useState(searchParams.get("state") || "");

  const specialties = [...new Set(trainers.map((t) => t.specialty))].sort();
  const states = [...new Set(trainers.map((t) => t.state))].sort();

  const filtered = trainers.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.city.toLowerCase().includes(q) && !t.state.toLowerCase().includes(q)) return false;
    }
    if (specialty && t.specialty !== specialty) return false;
    if (state && t.state !== state) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      {/* Hero Section with Search Bar */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Private Trainers & Coaches
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Find verified private trainers offering 1-on-1 and small group sessions near you.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by trainer name, city, or state..."
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
            { label: "All Specialties", options: specialties, value: specialty, onChange: setSpecialty },
          ]}
        />
        {sorted.length === 0 ? (
          <EmptyState message="No trainers match your filters." />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((trainer) => (
                <ListingCard
                  key={trainer.id}
                  href={`/trainers/${trainer.slug}`}
                  title={trainer.name}
                  subtitle={`${trainer.city}, ${trainer.state}`}
                  image={trainer.teamPhoto || undefined}
                  badges={[{ label: trainer.specialty, variant: "green" }]}
                  details={[
                    { label: "Price", value: trainer.priceRange },
                    { label: "Rating", value: `⭐ ${trainer.rating} (${trainer.reviewCount})` },
                    { label: "Experience", value: trainer.experience },
                    { label: "Area", value: trainer.serviceArea },
                  ]}
                  featured={trainer.featured}
                  cta="View Trainer"
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
