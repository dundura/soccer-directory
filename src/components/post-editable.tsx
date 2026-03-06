"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { VideoEmbed } from "./profile-ui";

export function PostEditableContent({
  postId,
  body,
  slug,
  imageUrl,
  videoUrl,
  userId,
}: {
  postId: string;
  body: string;
  slug: string;
  imageUrl?: string;
  videoUrl?: string;
  userId: string;
}) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === userId;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const canEdit = isOwner || isAdmin;

  const [editingBody, setEditingBody] = useState(false);
  const [bodyValue, setBodyValue] = useState(body);
  const [saving, setSaving] = useState(false);

  const [editingSlug, setEditingSlug] = useState(false);
  const [slugValue, setSlugValue] = useState(slug);
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugError, setSlugError] = useState("");

  async function saveBody() {
    setSaving(true);
    const res = await fetch("/api/listing-posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, action: "edit_body", body: bodyValue }),
    });
    if (res.ok) {
      setEditingBody(false);
    }
    setSaving(false);
  }

  async function saveSlug() {
    setSlugSaving(true);
    setSlugError("");
    const res = await fetch("/api/listing-posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, action: "edit_slug", slug: slugValue }),
    });
    if (res.ok) {
      setEditingSlug(false);
      // Redirect to new slug URL
      window.location.href = `/posts/${slugValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    } else {
      const json = await res.json();
      setSlugError(json.error || "Failed to update slug");
    }
    setSlugSaving(false);
  }

  return (
    <>
      {/* Body */}
      <div className="px-6 pb-4">
        {editingBody ? (
          <div className="space-y-3">
            <textarea
              value={bodyValue}
              onChange={(e) => setBodyValue(e.target.value)}
              rows={8}
              className="w-full text-[15px] leading-relaxed px-3 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setEditingBody(false); setBodyValue(body); }} className="px-4 py-2 rounded-lg text-xs font-medium text-muted hover:bg-surface transition-colors">Cancel</button>
              <button onClick={saveBody} disabled={saving} className="px-5 py-2 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <div className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: bodyValue }} />
            {canEdit && (
              <button
                onClick={() => setEditingBody(true)}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-accent hover:text-accent-hover bg-white/90 px-2 py-1 rounded-lg"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="px-4 pb-4">
          <img src={imageUrl} alt="" className="w-full rounded-xl object-cover" />
        </div>
      )}

      {/* Video */}
      {videoUrl && (
        <div className="px-4 pb-4">
          <VideoEmbed url={videoUrl} />
        </div>
      )}

      {/* Slug editor */}
      {canEdit && (
        <div className="px-6 pb-4 border-t border-border pt-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-medium">URL:</span>
            {editingSlug ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-muted shrink-0">soccer-near-me.com/posts/</span>
                <input
                  value={slugValue}
                  onChange={(e) => setSlugValue(e.target.value)}
                  className="flex-1 px-2 py-1 rounded border border-border text-xs focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
                <button onClick={saveSlug} disabled={slugSaving} className="text-xs font-bold text-accent hover:text-accent-hover disabled:opacity-50">
                  {slugSaving ? "..." : "Save"}
                </button>
                <button onClick={() => { setEditingSlug(false); setSlugValue(slug); setSlugError(""); }} className="text-xs text-muted hover:text-primary">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span className="text-primary">/posts/{slug}</span>
                <button onClick={() => setEditingSlug(true)} className="text-accent hover:text-accent-hover font-semibold">Edit</button>
              </>
            )}
          </div>
          {slugError && <p className="text-xs text-red-500 mt-1">{slugError}</p>}
        </div>
      )}
    </>
  );
}
