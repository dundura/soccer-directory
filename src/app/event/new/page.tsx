"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function NewEventPage() {
  return <Suspense><NewEventForm /></Suspense>;
}

function NewEventForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const listingType = searchParams.get("type") || "";
  const listingId = searchParams.get("id") || "";
  const listingSlug = searchParams.get("slug") || "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  if (status === "loading") {
    return <div className="max-w-[800px] mx-auto px-6 py-16 text-center"><div className="animate-pulse text-muted">Loading...</div></div>;
  }

  if (!session?.user?.id || !listingType || !listingId) {
    return <div className="max-w-[800px] mx-auto px-6 py-16 text-center"><p className="text-muted">Invalid link. Please go back to your listing.</p></div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/listing-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create", listingType, listingId, title, description, previewImage,
          eventDate, eventTime, address, location, website, contactEmail,
        }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      const pathPrefix = TYPE_PATHS[listingType] || listingType;
      router.push(`/${pathPrefix}/${listingSlug}`);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10">
      <div className="mb-8">
        <a href={`/${TYPE_PATHS[listingType] || listingType}/${listingSlug}`} className="text-sm text-muted hover:text-primary transition-colors">&larr; Back to listing</a>
        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold text-primary uppercase tracking-tight mt-3">Create Special Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl p-6 md:p-8 border border-border">
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Event Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Showcase 2026" className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell people about this event..." rows={4} className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Date</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Time</label>
            <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Location / Venue</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Charlotte Soccer Complex" className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address (optional)" className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Website / Registration URL</label>
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Contact Email</label>
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com" className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Preview Image (shown when sharing)</label>
          {previewImage ? (
            <div className="relative inline-block">
              <img src={previewImage} alt="Preview" className="max-h-[200px] rounded-xl object-cover" />
              <button type="button" onClick={() => setPreviewImage("")} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80">&#x2715;</button>
            </div>
          ) : (
            <ImageUpload onUploaded={(url) => setPreviewImage(url)} />
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting || !title.trim()} className="px-8 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
            {submitting ? "Creating..." : "Create Special Event"}
          </button>
          <a href={`/${TYPE_PATHS[listingType] || listingType}/${listingSlug}`} className="px-8 py-3 rounded-xl border border-border font-medium hover:bg-surface transition-colors text-sm flex items-center">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
