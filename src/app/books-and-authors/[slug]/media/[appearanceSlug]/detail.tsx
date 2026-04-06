"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { BookMediaAppearance } from "@/lib/db";
import { ImageUpload } from "@/components/image-upload";
import { RichTextEditor } from "@/components/rich-text-editor";

export function MediaAppearanceDetail({ appearance, bookId, bookSlug, ownerId }: { appearance: BookMediaAppearance; bookId: string; bookSlug: string; ownerId: string | null }) {
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as any)?.role === "admin";

  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(appearance.title);
  const [editDesc, setEditDesc] = useState(appearance.description || "");
  const [editUrl, setEditUrl] = useState(appearance.url || "");
  const [editSlug, setEditSlug] = useState(appearance.slug || "");
  const [editImage, setEditImage] = useState(appearance.previewImage || "");
  const [cta1Label, setCta1Label] = useState(appearance.cta1Label || "");
  const [cta1Url, setCta1Url] = useState(appearance.cta1Url || "");
  const [cta2Label, setCta2Label] = useState(appearance.cta2Label || "");
  const [cta2Url, setCta2Url] = useState(appearance.cta2Url || "");
  const [cta3Label, setCta3Label] = useState(appearance.cta3Label || "");
  const [cta3Url, setCta3Url] = useState(appearance.cta3Url || "");

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/book-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", bookId, appearanceId: appearance.id, title: editTitle, slug: editSlug, description: editDesc, url: editUrl, previewImage: editImage, cta1Label, cta1Url, cta2Label, cta2Url, cta3Label, cta3Url }),
    });
    setSaving(false);
    window.location.reload();
  };

  if (!isOwner) return null;

  const ctaInputStyle = "px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-accent";

  return (
    <div className="mb-4">
      <button onClick={() => setShowEdit(!showEdit)} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-primary hover:bg-surface transition-colors">
        Edit Appearance
      </button>

      {showEdit && (
        <div className="bg-white rounded-xl p-5 border border-border space-y-3 mt-3">
          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Description</label>
            <RichTextEditor content={editDesc} onChange={setEditDesc} placeholder="Description" />
          </div>
          <input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="Video URL" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
          <div>
            <label className="block text-xs font-medium text-muted mb-1">URL Slug</label>
            <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm font-mono focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Preview Image</label>
            {editImage ? (
              <div className="relative inline-block">
                <img src={editImage} alt="Preview" className="max-h-[120px] rounded-lg object-cover" />
                <button type="button" onClick={() => setEditImage("")} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80">&#x2715;</button>
              </div>
            ) : (
              <ImageUpload onUploaded={(u) => setEditImage(u)} />
            )}
          </div>

          {/* CTA Buttons */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2">CTA Buttons (optional)</label>
            <div className="space-y-2">
              {([
                { label: cta1Label, setLabel: setCta1Label, url: cta1Url, setUrl: setCta1Url, num: 1 },
                { label: cta2Label, setLabel: setCta2Label, url: cta2Url, setUrl: setCta2Url, num: 2 },
                { label: cta3Label, setLabel: setCta3Label, url: cta3Url, setUrl: setCta3Url, num: 3 },
              ] as const).map(({ label, setLabel, url: ctaUrl, setUrl, num }) => (
                <div key={num} className="flex gap-2 items-center">
                  <span className="text-xs text-muted w-4 shrink-0">{num}</span>
                  <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Button label" className={`${ctaInputStyle} w-1/3`} />
                  <input type="url" value={ctaUrl} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={`${ctaInputStyle} flex-1`} />
                </div>
              ))}
            </div>
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
