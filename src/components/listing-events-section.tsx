"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { ListingEvent } from "@/lib/db";
import { ImageUpload } from "@/components/image-upload";

const TYPE_PATHS: Record<string, string> = {
  club: "clubs", team: "teams", trainer: "trainers", camp: "camps", tournament: "tournaments",
  futsal: "futsal", podcast: "podcasts", service: "services", tryout: "tryouts",
  specialevent: "special-events", guest: "guest-play", fbgroup: "facebook-groups",
  youtube: "youtube-channels", trainingapp: "training-apps", blog: "blogs",
  recruiter: "college-recruiting", instagrampage: "instagram-pages", tiktokpage: "tiktok-pages",
  soccerbook: "books-and-authors", photovideo: "photo-video-services", player: "players",
  scrimmage: "scrimmages", marketplace: "shop", ebook: "ebooks", giveaway: "giveaways",
};

function useListingEvents(listingType: string, listingId: string) {
  const [events, setEvents] = useState<ListingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchEvents = useCallback(async () => {
    const res = await fetch(`/api/listing-events?listingType=${listingType}&listingId=${listingId}`);
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }, [listingType, listingId]);
  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  return { events, loading, refetch: fetchEvents };
}

/* ── Sidebar Widget: shows create form + event count ── */
export function ListingEventsSidebar({ listingType, listingId, listingSlug, ownerId }: { listingType: string; listingId: string; listingSlug: string; ownerId: string | null }) {
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as any)?.role === "admin";
  const { events, loading } = useListingEvents(listingType, listingId);

  if (loading) return null;
  if (events.length === 0 && !isOwner) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <h4 className="text-sm font-bold">Special Events</h4>
        {isOwner && (
          <a href={`/event/new?type=${listingType}&id=${listingId}&slug=${encodeURIComponent(listingSlug)}`} className="text-[11px] font-semibold text-accent hover:text-accent-hover transition-colors">
            + Add Special Event
          </a>
        )}
      </div>
      {events.length > 0 && (
        <div className="px-4 pb-3.5 space-y-2">
          {events.map((evt) => (
            <a key={evt.id} href={`/event/${evt.slug || evt.id}`} className="block text-sm font-semibold text-accent hover:text-accent-hover transition-colors truncate">
              {evt.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Content Display: shows events as GPS-style rows ── */
export function ListingEventsDisplay({ listingType, listingId, listingSlug, ownerId }: { listingType: string; listingId: string; listingSlug: string; ownerId: string | null }) {
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as any)?.role === "admin";
  const { events, loading, refetch } = useListingEvents(listingType, listingId);

  const handleDelete = async (eventId: string) => {
    if (!confirm("Delete this special event?")) return;
    await fetch("/api/listing-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", listingType, listingId, eventId }),
    });
    refetch();
  };

  if (loading) return null;
  if (events.length === 0 && !isOwner) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-extrabold text-primary uppercase tracking-tight">Special Events</h2>
        </div>
        {isOwner && (
          <a href={`/event/new?type=${listingType}&id=${listingId}&slug=${encodeURIComponent(listingSlug)}`} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
            + Add Special Event
          </a>
        )}
      </div>
      <div className="p-5 sm:p-6 pt-4 space-y-3">
        {events.map((evt) => (
          <a
            key={evt.id}
            href={`/event/${evt.slug || evt.id}`}
            className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />
            {evt.previewImage && (
              <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-surface">
                  <img src={evt.previewImage} alt={evt.title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0 p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight group-hover:text-accent transition-colors">{evt.title}</h3>
                {(evt.eventDate || evt.location) && (
                  <p className="text-sm text-muted mt-1 flex items-center gap-2 flex-wrap">
                    {evt.eventDate && <span>{evt.eventDate}{evt.eventTime ? ` at ${evt.eventTime}` : ""}</span>}
                    {evt.eventDate && evt.location && <span>&middot;</span>}
                    {evt.location && <span>{evt.location}</span>}
                  </p>
                )}
                {evt.description && <p className="text-sm text-primary/70 mt-1 line-clamp-1">{evt.description}</p>}
                <span className="text-sm font-semibold text-accent group-hover:text-accent-hover transition-colors mt-1 inline-block">View Details →</span>
              </div>
              {isOwner && (
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(evt.id); }} className="text-xs text-muted hover:text-red-500 transition-colors flex-shrink-0">Delete</button>
              )}
            </div>
            <div className="flex items-center justify-center w-12 sm:w-14 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
              <span className="text-white text-2xl font-light">&#8250;</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ── Legacy: combined component (backwards compat) ── */
export function ListingEventsSection({ listingType, listingId, listingSlug, ownerId }: { listingType: string; listingId: string; listingSlug: string; ownerId: string | null }) {
  return <ListingEventsDisplay listingType={listingType} listingId={listingId} listingSlug={listingSlug} ownerId={ownerId} />;
}
