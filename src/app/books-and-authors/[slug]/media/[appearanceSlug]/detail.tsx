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

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/book-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", bookId, appearanceId: appearance.id, title: editTitle, slug: editSlug, description: editDesc, url: editUrl, previewImage: editImage }),
    });
    setSaving(false);
    window.location.reload();
  };

  if (!isOwner) return null;

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
          <input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="URL" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
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
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => setShowEdit(false)} className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
