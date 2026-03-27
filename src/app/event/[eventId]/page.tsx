import { getListingNameById, getListingSlugById, getListingOwnerIdById } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShareButtons } from "@/components/profile-ui";
import { EventEdit } from "./event-edit";

export const dynamic = "force-dynamic";

const TYPE_PATHS: Record<string, string> = {
  club: "clubs", team: "teams", trainer: "trainers", camp: "camps", tournament: "tournaments",
  futsal: "futsal", podcast: "podcasts", service: "services", tryout: "tryouts",
  specialevent: "special-events", guest: "guest-play", fbgroup: "facebook-groups",
  youtube: "youtube-channels", trainingapp: "training-apps", blog: "blogs",
  recruiter: "college-recruiting", instagrampage: "instagram-pages", tiktokpage: "tiktok-pages",
  soccerbook: "books-and-authors", photovideo: "photo-video-services", player: "players",
  scrimmage: "scrimmages", marketplace: "shop", ebook: "ebooks", giveaway: "giveaways",
};

async function getEvent(eventId: string) {
  const { neon } = await import("@neondatabase/serverless");
  const sql2 = neon(process.env.DATABASE_URL!);
  let rows = await sql2`SELECT * FROM listing_events WHERE slug = ${eventId} LIMIT 1`;
  if (!rows[0]) rows = await sql2`SELECT * FROM listing_events WHERE id = ${eventId} LIMIT 1`;
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id as string, listingType: r.listing_type as string, listingId: r.listing_id as string,
    title: r.title as string, slug: r.slug as string | undefined,
    description: r.description as string | undefined, previewImage: r.preview_image as string | undefined,
    eventDate: r.event_date as string | undefined, eventTime: r.event_time as string | undefined,
    address: r.address as string | undefined, location: r.location as string | undefined,
    website: r.website as string | undefined, contactEmail: r.contact_email as string | undefined,
  };
}

type Props = { params: Promise<{ eventId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) return {};
  const listingName = await getListingNameById(event.listingType, event.listingId) || "";
  return {
    title: `${event.title} | ${listingName} | Soccer Near Me`,
    description: event.description || `${event.title} - ${listingName}`,
    openGraph: {
      title: `${event.title} | ${listingName}`,
      description: event.description || `${event.title} - event from ${listingName}`,
      images: event.previewImage ? [event.previewImage] : undefined,
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) notFound();

  const listingName = await getListingNameById(event.listingType, event.listingId) || "Listing";
  const listingSlug = await getListingSlugById(event.listingType, event.listingId) || "";
  const ownerId = await getListingOwnerIdById(event.listingType, event.listingId).catch(() => null);
  const pathPrefix = TYPE_PATHS[event.listingType] || event.listingType;
  const pageUrl = `https://www.soccer-near-me.com/event/${event.slug || event.id}`;

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[900px] mx-auto px-6 py-3.5 text-sm text-muted">
        <a href={`/${pathPrefix}`} className="text-primary hover:underline capitalize">{pathPrefix}</a>
        {" › "}
        <a href={`/${pathPrefix}/${listingSlug}`} className="text-primary hover:underline">{listingName}</a>
        {" › "}
        <span>{event.title}</span>
      </div>

      <div className="max-w-[900px] mx-auto px-6 pb-6">
        <EventEdit event={event} ownerId={ownerId} />
        {/* Event Header */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6">
          {event.previewImage && (
            <img src={event.previewImage} alt={event.title} className="w-full h-[220px] sm:h-[300px] object-cover" />
          )}
          <div className="p-6 sm:p-8">
            <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase tracking-tight leading-tight mb-4">
              {event.title}
            </h1>

            {/* Date/Time/Location */}
            <div className="space-y-2 mb-5">
              {event.eventDate && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="font-semibold text-primary">{event.eventDate}{event.eventTime ? ` at ${event.eventTime}` : ""}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span className="text-primary">{event.location}</span>
                </div>
              )}
              {event.address && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  <span className="text-muted">{event.address}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-6">
                <p className="text-primary leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {event.website && (
                <a
                  href={event.website.startsWith("http") ? event.website : `https://${event.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Visit Website
                </a>
              )}
              {event.contactEmail && (
                <a
                  href={`mailto:${event.contactEmail}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Contact
                </a>
              )}
            </div>

            {/* Share */}
            <ShareButtons url={pageUrl} title={event.title} />

            {/* Back link */}
            <div className="mt-6 pt-4 border-t border-border">
              <a href={`/${pathPrefix}/${listingSlug}`} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
                &larr; Back to {listingName}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Training Plan Banner */}
      <div className="max-w-[900px] mx-auto px-6 pb-16">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-light p-6 md:p-8 text-white flex items-center gap-6">
          <div className="flex-1">
            <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-1">Free Training Plan</p>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">
              Free 7-Day Training Plan
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Get 5,000+ quality touches per day in less than 10 minutes. No guessing. Just press play.
            </p>
            <a
              href="https://www.anytime-soccer.com/free-soccer-drills-for-kids"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
            >
              Start My Free Plan &rarr;
            </a>
          </div>
          <img
            src="https://d2vm0l3c6tu9qp.cloudfront.net/Anytime-soccer-camp.webp"
            alt="Anytime Soccer Training"
            className="hidden sm:block w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover flex-shrink-0"
          />
        </div>
      </div>
    </>
  );
}
