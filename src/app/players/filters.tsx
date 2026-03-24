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
  const [birthYear, setBirthYear] = useState(searchParams.get("birthYear") || "");
  const [availability, setAvailability] = useState(searchParams.get("availability") || "");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

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
    if (state) {
      const loc = state.toLowerCase();
      if (!p.city.toLowerCase().includes(loc) && !p.state.toLowerCase().includes(loc)) return false;
    }
    if (position && p.position !== position && p.secondaryPosition !== position) return false;
    if (gender && p.gender !== gender) return false;
    if (birthYear && p.birthYear !== birthYear) return false;
    if (availability === "guest" && !p.availableForGuestPlay) return false;
    if (availability === "team" && !p.lookingForTeam) return false;
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
          <div className="bg-white rounded-2xl shadow-lg p-2">
            <div className="flex flex-col md:flex-row md:items-center md:divide-x md:divide-border">
              <input
                type="text"
                value={state}
                onChange={(e) => { setState(e.target.value); setPage(1); }}
                placeholder="Location"
                className="px-4 py-3.5 text-sm text-primary placeholder:text-muted focus:outline-none md:w-36 bg-transparent"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Keywords"
                className="flex-1 px-4 py-3.5 text-sm text-primary placeholder:text-muted focus:outline-none bg-transparent"
              />
              <select
                value={gender}
                onChange={(e) => { setGender(e.target.value); setPage(1); }}
                className="px-4 py-3.5 text-sm font-medium text-primary focus:outline-none cursor-pointer bg-transparent md:w-32"
              >
                <option value="">Gender</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
              </select>
              <select
                value={birthYear}
                onChange={(e) => { setBirthYear(e.target.value); setPage(1); }}
                className="px-4 py-3.5 text-sm font-medium text-primary focus:outline-none cursor-pointer bg-transparent md:w-40"
              >
                <option value="">Birth Year</option>
                {["2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016"].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={position}
                onChange={(e) => { setPosition(e.target.value); setPage(1); }}
                className="px-4 py-3.5 text-sm font-medium text-primary focus:outline-none cursor-pointer bg-transparent md:w-36"
              >
                <option value="">Position</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select
                value={availability}
                onChange={(e) => { setAvailability(e.target.value); setPage(1); }}
                className="px-4 py-3.5 text-sm font-medium text-primary focus:outline-none cursor-pointer bg-transparent md:w-44"
              >
                <option value="">Availability</option>
                <option value="guest">Seeking Guest Play</option>
                <option value="team">Available for Tryouts</option>
              </select>
              <div className="p-1">
                <button
                  type="button"
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((player) => (
              <div
                key={player.id}
                className="relative group pt-18"
              >
                {/* Circular photo overlapping top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                  <PlayerAvatar
                    src={player.teamPhoto}
                    name={player.playerName}
                    imagePosition={player.imagePosition}
                    className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>

                {/* Dark card body */}
                <div className="bg-primary rounded-t-2xl pt-18 pb-5 px-5 text-center">
                  {player.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
                      Featured
                    </span>
                  )}
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white uppercase tracking-wide mt-2">
                    {player.playerName}
                  </h3>
                  <div className="flex items-center justify-center gap-4 mt-3 text-white/70 text-xs">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {player.city}, {player.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth={2} /><circle cx="12" cy="12" r="2.5" /></svg>
                      {player.secondaryPosition ? (
                        <span className="relative group/pos cursor-pointer underline decoration-dotted">
                          Multiple
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/pos:block bg-white text-primary text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg border border-border z-20">
                            {player.position}, {player.secondaryPosition}
                          </span>
                        </span>
                      ) : player.position}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {player.gender}
                    </span>
                  </div>
                  {(player.availableForGuestPlay || player.lookingForTeam) && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {player.availableForGuestPlay && (
                        <span className="px-2.5 py-1 rounded-full bg-[#DC373E]/20 text-[#FF8A8E] text-xs font-semibold animate-pulse">Seeking Guest Play</span>
                      )}
                      {player.availableForGuestPlay && !player.lookingForTeam && (
                        <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-xs font-semibold">Guest Player Only</span>
                      )}
                      {player.lookingForTeam && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold animate-pulse">Available for Tryouts</span>
                      )}
                    </div>
                  )}
                </div>

                {/* White bottom section */}
                <div className="bg-white rounded-b-2xl border border-t-0 border-border px-5 py-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-primary">{player.birthYear}</p>
                      <p className="text-xs text-muted">Birth Year</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-primary">{player.level || "—"}</p>
                      <p className="text-xs text-muted">Level of Play</p>
                    </div>
                  </div>
                  {player.socialMedia && (player.socialMedia.instagram || player.socialMedia.youtube) && (
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {player.socialMedia.instagram && (
                        <a href={player.socialMedia.instagram.startsWith("http") ? player.socialMedia.instagram : `https://instagram.com/${player.socialMedia.instagram}`} target="_blank" rel="noopener" title="Instagram" className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </a>
                      )}
                      {player.socialMedia.youtube && (
                        <a href={player.socialMedia.youtube.startsWith("http") ? player.socialMedia.youtube : `https://youtube.com/${player.socialMedia.youtube}`} target="_blank" rel="noopener" title="YouTube" className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                      )}
                    </div>
                  )}
                  <a
                    href={`/players/${player.slug}`}
                    className="block w-full text-center py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent-hover transition-colors"
                  >
                    View Player
                  </a>
                </div>
              </div>
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
