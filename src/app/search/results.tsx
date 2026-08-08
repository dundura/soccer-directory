"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSearchResult } from "@/lib/db";

const PER_PAGE = 25;

function truncateWords(text: string, limit: number): string {
  if (!text) return "";
  const plain = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain.split(" ");
  return words.length <= limit ? plain : words.slice(0, limit).join(" ") + "...";
}

function ResultRow({ result }: { result: SiteSearchResult }) {
  const location = [result.city, result.state].filter(Boolean).join(", ");
  return (
    <a
      href={result.href}
      className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="w-1.5 bg-accent flex-shrink-0" />
      {result.image && (
        <div className="w-24 sm:w-32 flex-shrink-0 bg-surface flex items-center justify-center p-2">
          <img src={result.image} alt={result.name} className="max-w-full max-h-20 object-contain" />
        </div>
      )}
      <div className="flex-1 min-w-0 p-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[11px] font-semibold uppercase tracking-wide">
            {result.typeLabel}
          </span>
          {result.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
              &#9733; Featured
            </span>
          )}
        </div>
        <h3 className="font-bold text-primary text-base sm:text-lg leading-snug group-hover:text-accent transition-colors truncate">
          {result.name}
        </h3>
        {location && <p className="text-sm text-muted mt-0.5">{location}</p>}
        {result.description && (
          <p className="text-sm text-muted mt-1 line-clamp-2">{truncateWords(result.description, 28)}</p>
        )}
      </div>
    </a>
  );
}

export function SearchResults({
  query,
  results,
  initialType,
}: {
  query: string;
  results: SiteSearchResult[];
  initialType: string;
}) {
  const router = useRouter();
  const [input, setInput] = useState(query);
  const [type, setType] = useState(initialType);
  const [page, setPage] = useState(1);

  // Counts per type, in the order the ranked results came back
  const counts = new Map<string, { label: string; count: number }>();
  for (const r of results) {
    const entry = counts.get(r.type);
    if (entry) entry.count++;
    else counts.set(r.type, { label: r.typeLabel, count: 1 });
  }
  const tabs = [...counts.entries()].sort((a, b) => b[1].count - a[1].count);

  const filtered = type ? results.filter((r) => r.type === type) : results;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = input.trim();
    if (next.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(next)}`);
  }

  function pickType(value: string) {
    setType(value);
    setPage(1);
  }

  return (
    <>
      {/* ====== HERO ====== */}
      <div className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#1a4a7a] opacity-90" />
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: "60px" }}>
          <path fill="var(--background, #f8fafc)" d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" />
        </svg>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold text-white uppercase tracking-tight leading-tight mb-4">
            Search Everything
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Clubs, teams, trainers, camps, tournaments, tryouts and more &mdash; all in one place.
          </p>
          <form onSubmit={submit} className="bg-white rounded-2xl sm:rounded-full shadow-2xl p-2 max-w-3xl mx-auto flex flex-col sm:flex-row items-stretch">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search by name, city, or state..."
              className="px-5 py-3 sm:rounded-l-full text-sm text-primary placeholder:text-muted focus:outline-none min-w-0 flex-1"
              autoFocus={!query}
            />
            <button
              type="submit"
              className="px-8 py-3 rounded-xl sm:rounded-r-full sm:rounded-l-none bg-accent text-white font-bold text-sm uppercase tracking-wide hover:bg-accent-hover transition-colors whitespace-nowrap mt-1 sm:mt-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ====== RESULTS ====== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {!query ? (
          <p className="text-center text-muted py-12">Type a name above to search every listing on the site.</p>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-primary font-semibold text-lg mb-2">
              No listings match &ldquo;{query}&rdquo;.
            </p>
            <p className="text-muted text-sm">Try a shorter name, or search by city or state.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-4">
              <span className="font-semibold text-primary">{results.length}</span>{" "}
              {results.length === 1 ? "listing" : "listings"} matching &ldquo;{query}&rdquo;
            </p>

            {/* Type filter chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => pickType("")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  type === "" ? "bg-accent text-white border-accent" : "bg-white text-primary border-border hover:border-accent/40"
                }`}
              >
                All ({results.length})
              </button>
              {tabs.map(([value, { label, count }]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => pickType(value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    type === value ? "bg-accent text-white border-accent" : "bg-white text-primary border-border hover:border-accent/40"
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {visible.map((r) => (
                <ResultRow key={`${r.type}-${r.id}`} result={r} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-primary bg-white disabled:opacity-40 hover:border-accent/40 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-primary bg-white disabled:opacity-40 hover:border-accent/40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
