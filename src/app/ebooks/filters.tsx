"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketplaceItem } from "@/lib/types";
import { ListingCard, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function EbookFilters({ items }: { items: MarketplaceItem[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [state, setState] = useState(searchParams.get("state") || "");

  const states = [...new Set(items.map((i) => i.state))].sort();

  const filtered = items.filter((i) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !i.name.toLowerCase().includes(q) &&
        !(i.description || "").toLowerCase().includes(q) &&
        !i.city.toLowerCase().includes(q)
      )
        return false;
    }
    if (state && i.state !== state) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">Ebooks</h1>
          <p className="text-white/70 max-w-2xl text-lg">Free soccer ebooks for players, coaches, and parents.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ebooks..."
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

        {sorted.length === 0 ? (
          <EmptyState message="No ebooks found. Check back soon!" />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((item) => (
                <ListingCard
                  key={item.id}
                  href={`/ebooks/${item.slug}`}
                  title={item.name}
                  subtitle={`${item.city}, ${item.state}`}
                  image={item.imageUrl || undefined}
                  badges={[
                    { label: item.price, variant: "green" },
                    ...(item.condition ? [{ label: item.condition }] : []),
                  ]}
                  details={[{ label: "Location", value: `${item.city}, ${item.state}` }]}
                  featured={item.featured}
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
