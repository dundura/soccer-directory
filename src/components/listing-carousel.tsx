"use client";

import { useRef } from "react";

interface CarouselListing {
  id: string;
  name: string;
  _type: string;
  _path: string;
  _subtitle: string;
  teamPhoto?: string | null;
  logo?: string | null;
  imageUrl?: string | null;
  imagePosition?: number;
}

const TYPE_LABELS: Record<string, string> = {
  club: "Club", team: "Team", trainer: "Trainer", camp: "Camp",
  tournament: "Tournament", futsal: "Futsal",
};

export function ListingCarousel({ listings }: { listings: CarouselListing[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: -1 | 1) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 480, behavior: "smooth" });
  }

  if (listings.length === 0) return null;

  return (
    <section className="py-10 border-t border-border">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold">New Listings</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface hover:border-primary/30 transition-colors"
            aria-label="Previous"
          >
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface hover:border-primary/30 transition-colors"
            aria-label="Next"
          >
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {listings.map((listing) => {
          const img = listing.teamPhoto || listing.logo || listing.imageUrl;
          return (
            <a
              key={`${listing._type}-${listing.id}`}
              href={`/${listing._path}/${(listing as unknown as Record<string, string>).slug}`}
              className="flex-shrink-0 w-56 bg-surface rounded-xl border border-border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              {img && (
                <img
                  src={img}
                  alt={listing.name}
                  className="w-full h-28 object-cover rounded-lg mb-3"
                  style={{ objectPosition: listing.imagePosition ? `center ${listing.imagePosition}%` : "center" }}
                />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{TYPE_LABELS[listing._type] || listing._type}</span>
              <p className="text-sm font-bold text-primary mt-1 leading-snug group-hover:text-accent-hover transition-colors line-clamp-2">{listing.name}</p>
              <p className="text-xs text-muted mt-1">{listing._subtitle}</p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
