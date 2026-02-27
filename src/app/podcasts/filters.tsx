"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Podcast } from "@/lib/types";
import { Badge, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";
import { PlayerAvatar } from "@/components/player-avatar";

const CATEGORIES = ["Youth Soccer", "Coaching", "Player Development", "College Recruiting", "Professional Soccer", "Soccer Culture", "Training & Fitness", "Other"];

export function PodcastFilters({ podcasts }: { podcasts: Podcast[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  const states = [...new Set(podcasts.map((p) => p.state))].sort();

  const filtered = podcasts.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.hostName.toLowerCase().includes(q) &&
        !p.city.toLowerCase().includes(q) &&
        !p.state.toLowerCase().includes(q) &&
        !(p.description || "").toLowerCase().includes(q)
      ) return false;
    }
    if (state && p.state !== state) return false;
    if (category && p.category !== category) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Soccer Podcasts
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Discover podcasts covering youth soccer, coaching, player development, and more.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by podcast name, host, or topic..."
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
            <button type="button" className="px-8 py-4 rounded-xl bg-accent text-white font-semibold text-base hover:bg-accent-hover transition-colors whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FilterBar
          filters={[
            { label: "All Categories", options: CATEGORIES, value: category, onChange: setCategory },
          ]}
        />

        {sorted.length === 0 ? (
          <EmptyState message="No podcasts match your filters. Try broadening your search." />
        ) : (
          <div className="space-y-4">
            {sorted.map((podcast, i) => (
              <div key={podcast.id}>
                <a
                  href={`/podcasts/${podcast.slug}`}
                  className="group block bg-white rounded-2xl border border-border p-4 md:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative"
                >
                  {podcast.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="flex gap-4 md:gap-6">
                    <div className="shrink-0">
                      <PlayerAvatar
                        src={podcast.teamPhoto || podcast.logo}
                        name={podcast.name}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border border-border"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge variant="blue">{podcast.category}</Badge>
                      </div>
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary group-hover:text-accent-hover transition-colors mb-1">
                        {podcast.name}
                      </h3>
                      <p className="text-muted text-sm mb-2">
                        Hosted by {podcast.hostName} &middot; {podcast.city}, {podcast.state}
                      </p>
                      {podcast.description && (
                        <p className="text-sm text-muted line-clamp-2">{podcast.description}</p>
                      )}
                    </div>
                  </div>
                </a>
                {i === 4 && (
                  <div className="mt-4">
                    <AnytimeInlineCTA />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-12"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
