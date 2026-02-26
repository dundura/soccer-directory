"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketplaceItem } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

export function ShopFilters({ items }: { items: MarketplaceItem[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [state, setState] = useState(searchParams.get("state") || "");

  const categories = [...new Set(items.map((i) => i.category))].sort();
  const states = [...new Set(items.map((i) => i.state))].sort();

  const filtered = items.filter((i) => {
    if (search) {
      const q = search.toLowerCase();
      if (!i.name.toLowerCase().includes(q) && !i.city.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) return false;
    }
    if (category && i.category !== category) return false;
    if (state && i.state !== state) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      {/* Hero Section with Search Bar */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Soccer Shop
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Buy and sell soccer equipment, books, and gear from the community.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by item name or description..."
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
            { label: "All Categories", options: categories, value: category, onChange: setCategory },
          ]}
        />
        {sorted.length === 0 ? (
          <EmptyState message="No items match your filters." />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((item) => (
                <ListingCard
                  key={item.id}
                  href={`/shop/${item.slug}`}
                  title={item.name}
                  subtitle={`${item.city}, ${item.state}`}
                  badges={[
                    { label: item.category, variant: "green" },
                    { label: item.condition },
                  ]}
                  details={[
                    { label: "Price", value: item.price },
                  ]}
                  featured={item.featured}
                  cta="View Item"
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
