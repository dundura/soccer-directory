"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Trainer } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function TrainerFilters({ trainers }: { trainers: Trainer[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [specialty, setSpecialty] = useState("");
  const [state, setState] = useState("");

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
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search trainers by name, city, or state..."
        className="w-full px-5 py-3 rounded-xl border border-border bg-white text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mt-6"
      />
      <FilterBar
        filters={[
          { label: "All Specialties", options: specialties, value: specialty, onChange: setSpecialty },
          { label: "All States", options: states, value: state, onChange: setState },
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
    </>
  );
}
