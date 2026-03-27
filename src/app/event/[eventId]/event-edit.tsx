"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/components/image-upload";
import { RichTextEditor } from "@/components/rich-text-editor";

interface EventData {
  id: string;
  listingType: string;
  listingId: string;
  title: string;
  slug?: string;
  description?: string;
  previewImage?: string;
  eventDate?: string;
  eventTime?: string;
  address?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
}

export function EventEdit({ event, ownerId }: { event: EventData; ownerId: string | null }) {
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as any)?.role === "admin";

  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [slug, setSlug] = useState(event.slug || "");
  const [description, setDescription] = useState(event.description || "");
  const [previewImage, setPreviewImage] = useState(event.previewImage || "");
  const [eventDate, setEventDate] = useState(event.eventDate || "");
  const [eventTime, setEventTime] = useState(event.eventTime || "");
  const [address, setAddress] = useState(event.address || "");
  const [location, setLocation] = useState(event.location || "");
  const [website, setWebsite] = useState(event.website || "");
  const [contactEmail, setContactEmail] = useState(event.contactEmail || "");

  if (!isOwner) return null;

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/listing-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        listingType: event.listingType,
        listingId: event.listingId,
        eventId: event.id,
        title, slug, description, previewImage: previewImage || undefined,
        eventDate: eventDate || undefined, eventTime: eventTime || undefined,
        address: address || undefined, location: location || undefined,
        website: website || undefined, contactEmail: contactEmail || undefined,
      }),
    });
    setSaving(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this event?")) return;
    await fetch("/api/listing-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete",
        listingType: event.listingType,
        listingId: event.listingId,
        eventId: event.id,
      }),
    });
    window.history.back();
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent";

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <button onClick={() => setShowEdit(!showEdit)} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-primary hover:bg-surface transition-colors">
          Edit Event
        </button>
        <button onClick={handleDelete} className="px-4 py-2 rounded-lg border border-red-300 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
          Delete Event
        </button>
      </div>

      {showEdit && (
        <div className="bg-white rounded-xl p-5 border border-border space-y-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">URL Slug</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))} className={inputClass + " font-mono"} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Description</label>
            <RichTextEditor content={description} onChange={setDescription} placeholder="Event description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Event Date</label>
              <input type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="e.g. June 15, 2026" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Event Time</label>
              <input type="text" value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="e.g. 6:00 PM" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Location Name</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Website URL</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Contact Email</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Preview Image</label>
            {previewImage ? (
              <div className="relative inline-block">
                <img src={previewImage} alt="Preview" className="max-h-[120px] rounded-lg object-cover" />
                <button type="button" onClick={() => setPreviewImage("")} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80">&#x2715;</button>
              </div>
            ) : (
              <ImageUpload onUploaded={(u) => setPreviewImage(u)} />
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => setShowEdit(false)} className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
