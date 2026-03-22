"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PhotoVideoService } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const CATEGORIES = [
  "Training Equipment",
  "Apparel",
  "Nutrition",
  "Technology",
  "Photography / Video",
  "Recruiting PhotoVideoService",
  "Team Management",
  "Field Rental",
  "Transportation",
  "Books",
  "Other",
];
const PER_PAGE = 10;

export function PhotoVideoFilters({ services }: { services: PhotoVideoService[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const states = [...new Set(services.map((s) => s.state))].sort();

  const filtered = services.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.providerName.toLowerCase().includes(q) &&
        !(s.description || "").toLowerCase().includes(q) &&
        !s.city.toLowerCase().includes(q)
      )
        return false;
    }
    if (category && s.category !== category) return false;
    if (state && s.state !== state) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const visible = viewAll ? sorted : sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Products &amp; PhotoVideoPhoto & Video Services
          </h1>
          <p className="text-white/70 max-w-2xl text-lg">
            Discover soccer products, services, and tools from trusted providers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products & services..."
            className="flex-1 px-5 py-4 rounded-xl text-primary text-base placeholder:text-muted focus:outline-none"
          />
          <select
            value={state}
            onChange={(e) => { setState(e.target.value); setPage(1); }}
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
            { label: "All Categories", options: CATEGORIES, value: category, onChange: (v: string) => { setCategory(v); setPage(1); } },
          ]}
        />

        {/* View All / result count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            {sorted.length} listing{sorted.length !== 1 ? "s" : ""} found
            {!viewAll && sorted.length > PER_PAGE && <> &middot; Page {page} of {totalPages}</>}
          </p>
          {sorted.length > PER_PAGE && (
            <button
              onClick={() => { setViewAll(!viewAll); setPage(1); }}
              className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              {viewAll ? "Show Pages" : "View All"}
            </button>
          )}
        </div>

        {sorted.length === 0 ? (
          <EmptyState message="No products or services match your filters." />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((service) => (
                <ListingCard
                  key={service.id}
                  href={`/services/${service.slug}`}
                  title={service.name}
                  subtitle={`by ${service.providerName} · ${service.city}, ${service.state}`}
                  image={service.imageUrl || undefined}
                  badges={[
                    { label: service.category, variant: "green" },
                    ...(service.price ? [{ label: service.price }] : []),
                  ]}
                  details={[
                    { label: "Location", value: `${service.city}, ${service.state}` },
                  ]}
                  featured={service.featured}
                  imagePosition={service.imagePosition}
                  cta="View Details"
                />
              ))}
            </div>

            {/* Pagination */}
            {!viewAll && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &larr; Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      p === page ? "bg-primary text-white" : "border border-border hover:bg-surface"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next &rarr;
                </button>
              </div>
            )}

            <div className="mt-8"><AnytimeInlineCTA /></div>
          </>
        )}
      </div>
    </>
  );
}
