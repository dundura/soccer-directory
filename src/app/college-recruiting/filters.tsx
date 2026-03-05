"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Recruiter } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;

export function RecruiterFilters({ recruiters }: { recruiters: Recruiter[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const specialties = [...new Set(recruiters.map((t) => t.specialty).filter(Boolean))].sort();
  const states = [...new Set(recruiters.map((t) => t.state).filter(Boolean))].sort();

  const filtered = recruiters.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !(t.city || "").toLowerCase().includes(q) && !(t.state || "").toLowerCase().includes(q)) return false;
    }
    if (specialty && t.specialty !== specialty) return false;
    if (state && t.state !== state) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const visible = viewAll ? sorted : sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {/* Hero Section with Search Bar */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            College Recruiting Advisors
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Find experienced college recruiting advisors to help navigate the recruiting process for NCAA, NAIA, and JUCO programs.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, city, or state..."
              className="flex-1 px-5 py-4 rounded-xl text-primary text-base placeholder:text-muted focus:outline-none"
            />
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
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
            { label: "All Specialties", options: specialties, value: specialty, onChange: (v: string) => { setSpecialty(v); setPage(1); } },
          ]}
        />

        {/* View All / result count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            {sorted.length} advisor{sorted.length !== 1 ? "s" : ""} found
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
          <EmptyState message="No recruiting advisors match your filters." />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((recruiter) => (
                <ListingCard
                  key={recruiter.id}
                  href={`/college-recruiting/${recruiter.slug}`}
                  title={recruiter.name}
                  subtitle={[recruiter.city, recruiter.state].filter(Boolean).join(", ")}
                  image={recruiter.teamPhoto && !recruiter.teamPhoto.includes("idf.webp") ? recruiter.teamPhoto : recruiter.logo || recruiter.imageUrl || undefined}
                  badges={recruiter.specialty ? [{ label: recruiter.specialty, variant: "green" }] : []}
                  details={[
                    ...(recruiter.priceRange ? [{ label: "Price", value: recruiter.priceRange }] : []),
                    { label: "Rating", value: `⭐ ${recruiter.rating} (${recruiter.reviewCount})` },
                    ...(recruiter.experience ? [{ label: "Experience", value: recruiter.experience.length > 50 ? recruiter.experience.slice(0, 50) + "…" : recruiter.experience }] : []),
                    ...(recruiter.serviceArea ? [{ label: "Area", value: recruiter.serviceArea.length > 50 ? recruiter.serviceArea.slice(0, 50) + "…" : recruiter.serviceArea }] : []),
                  ]}
                  featured={recruiter.featured}
                  imagePosition={recruiter.imagePosition}
                  cta="View Advisor"
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
