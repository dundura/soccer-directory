"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PlayerProfile } from "@/lib/types";
import { Badge, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";
import { PlayerAvatar } from "@/components/player-avatar";

const POSITIONS = ["GK", "CB", "FB/WB", "CDM", "CM", "CAM", "Winger", "ST"];
const LEVELS = ["MLS Next Pro Pathway", "MLS NEXT", "MLS NEXT 2", "Girls Academy", "ECNL", "ECNL Regional League (ECRL)", "Elite 64", "USL Academy", "Aspire", "NPL", "USYS National League", "DPL", "EDP", "SCCL", "State League", "Regional League", "Club Travel", "Rec Select", "Recreational / Grassroots"];
const PER_PAGE = 10;

export function PlayerFilters({ players }: { players: PlayerProfile[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [position, setPosition] = useState(searchParams.get("position") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [level, setLevel] = useState(searchParams.get("level") || "");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const states = [...new Set(players.map((p) => p.state))].sort();

  const filtered = players.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.playerName.toLowerCase().includes(q) &&
        !p.city.toLowerCase().includes(q) &&
        !p.state.toLowerCase().includes(q) &&
        !(p.currentClub || "").toLowerCase().includes(q)
      ) return false;
    }
    if (position && p.position !== position && p.secondaryPosition !== position) return false;
    if (state && p.state !== state) return false;
    if (gender && p.gender !== gender) return false;
    if (level && p.level !== level) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const visible = viewAll ? sorted : sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <div className="relative bg-primary text-white py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-surface" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Find a Player to Join Your Team
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Browse youth soccer players looking for guest play opportunities, tryouts, and team placements.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by player name, city, state, or club..."
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FilterBar
          filters={[
            { label: "All Positions", options: POSITIONS, value: position, onChange: (v: string) => { setPosition(v); setPage(1); } },
            { label: "All Genders", options: ["Boys", "Girls"], value: gender, onChange: (v: string) => { setGender(v); setPage(1); } },
            { label: "All Levels", options: LEVELS, value: level, onChange: (v: string) => { setLevel(v); setPage(1); } },
          ]}
        />

        {/* View All / result count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            {sorted.length} player{sorted.length !== 1 ? "s" : ""} found
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
          <EmptyState message="No player profiles match your filters. Try broadening your search." />
        ) : (
          <div className="space-y-4">
            {visible.map((player) => (
              <a
                key={player.id}
                href={`/players/${player.slug}`}
                className="group block bg-white rounded-2xl border border-border p-4 md:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative"
              >
                {player.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                      Featured
                    </span>
                  </div>
                )}
                <div className="flex gap-4 md:gap-6">
                  <div className="shrink-0">
                    <PlayerAvatar
                      src={player.teamPhoto}
                      name={player.playerName}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border border-border"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="blue">{player.position}</Badge>
                      {player.secondaryPosition && <Badge variant="default">{player.secondaryPosition}</Badge>}
                      <Badge variant={player.gender === "Boys" ? "blue" : "purple"}>{player.gender}</Badge>
                      <Badge variant="default">{player.birthYear}</Badge>
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary group-hover:text-accent-hover transition-colors mb-1">
                      {player.playerName}
                    </h3>
                    <p className="text-muted text-sm mb-2">
                      {player.currentClub && <>{player.currentClub} &middot; </>}
                      {player.city}, {player.state}
                      {player.height && <> &middot; {player.height}</>}
                      {player.preferredFoot && <> &middot; {player.preferredFoot} foot</>}
                    </p>
                    <p className="text-sm text-muted/80 mb-2">{player.level}</p>
                    {player.lookingFor && (
                      <p className="text-sm text-muted line-clamp-2">
                        <span className="font-medium text-primary">Looking for:</span> {player.lookingFor}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

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

        <div className="mt-12"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
