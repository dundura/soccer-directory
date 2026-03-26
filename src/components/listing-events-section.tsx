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

export function ListingEventsSection({ listingType, listingId, listingSlug, ownerId }: { listingType: string; listingId: string; listingSlug: string; ownerId: string | null }) {
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as any)?.role === "admin";

  const [events, setEvents] = useState<ListingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const pathPrefix = TYPE_PATHS[listingType] || listingType;

  const fetchEvents = useCallback(async () => {
    const res = await fetch(`/api/listing-events?listingType=${listingType}&listingId=${listingId}`);
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }, [listingType, listingId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const resetForm = () => {
    setTitle(""); setDescription(""); setPreviewImage(""); setEventDate("");
    setEventTime(""); setAddress(""); setLocation(""); setWebsite(""); setContactEmail("");
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/listing-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create", listingType, listingId, title, description, previewImage,
        eventDate, eventTime, address, location, website, contactEmail,
      }),
    });
    setSaving(false);
    resetForm();
    fetchEvents();
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Delete this special event?")) return;
    await fetch("/api/listing-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", listingType, listingId, eventId }),
    });
    fetchEvents();
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
          <button onClick={() => setShowForm(!showForm)} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
            + Add Special Event
          </button>
        )}
      </div>

      <div className="p-5 sm:p-6 pt-4 space-y-4">
        {/* Create Form */}
        {isOwner && showForm && (
          <div className="bg-white rounded-xl p-5 border border-border space-y-3">
            <p className="text-sm font-bold text-primary">New Special Event</p>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title *" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Date</label>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Time</label>
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
              </div>
            </div>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location / Venue name" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address (optional)" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website / Registration URL (optional)" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Contact email (optional)" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Preview Image (optional — shown when sharing)</label>
              {previewImage ? (
                <div className="relative inline-block">
                  <img src={previewImage} alt="Preview" className="max-h-[120px] rounded-lg object-cover" />
                  <button type="button" onClick={() => setPreviewImage("")} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80">&#x2715;</button>
                </div>
              ) : (
                <ImageUpload onUploaded={(url) => setPreviewImage(url)} />
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleCreate} disabled={saving || !title.trim()} className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Create Special Event"}
              </button>
              <button onClick={resetForm} className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {events.length === 0 && isOwner && (
          <p className="text-sm text-muted text-center py-4">No special events yet. Add your first special event.</p>
        )}

        {/* Events List */}
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
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(evt.id); }}
                  className="text-xs text-muted hover:text-red-500 transition-colors flex-shrink-0"
                >
                  Delete
                </button>
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
