"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { BookMediaAppearance } from "@/lib/db";
import { ImageUpload } from "@/components/image-upload";

export function BookMediaSection({ bookId, bookSlug, ownerId }: { bookId: string; bookSlug: string; ownerId: string | null }) {
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as any)?.role === "admin";

  const [appearances, setAppearances] = useState<BookMediaAppearance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const fetchAppearances = useCallback(async () => {
    const res = await fetch(`/api/book-media?bookId=${bookId}`);
    const data = await res.json();
    setAppearances(data.appearances || []);
    setLoading(false);
  }, [bookId]);

  useEffect(() => { fetchAppearances(); }, [fetchAppearances]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/book-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", bookId, title, description, url, previewImage }),
    });
    setTitle(""); setDescription(""); setUrl(""); setPreviewImage(""); setShowForm(false);
    setSaving(false);
    fetchAppearances();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media appearance?")) return;
    await fetch("/api/book-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", bookId, appearanceId: id }),
    });
    fetchAppearances();
  };

  const handleTogglePin = async (id: string) => {
    await fetch("/api/book-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "togglePin", bookId, appearanceId: id }),
    });
    fetchAppearances();
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const idx = appearances.findIndex(a => a.id === id);
    if (idx < 0 || (direction === "up" && idx === 0) || (direction === "down" && idx === appearances.length - 1)) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = appearances.map((a, i) => {
      if (i === idx) return { id: appearances[swapIdx].id, sort: i };
      if (i === swapIdx) return { id: appearances[idx].id, sort: i };
      return { id: a.id, sort: i };
    });
    await fetch("/api/book-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", bookId, order: newOrder }),
    });
    fetchAppearances();
  };

  if (loading) return null;
  if (appearances.length === 0) return null;

  const pinnedAppearances = appearances.filter(a => a.pinned);
  const displayAppearances = pinnedAppearances.length > 0 ? pinnedAppearances : appearances.slice(0, 3);
  const shownAppearances = expanded ? appearances : displayAppearances;

  return (
    <div className="border-t border-border pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-extrabold text-primary uppercase tracking-tight">Media Appearances</h3>
        {isOwner && (
          <button onClick={() => setShowForm(!showForm)} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
            + Add Appearance
          </button>
        )}
      </div>

      {/* Create Form */}
      {isOwner && showForm && (
        <div className="bg-white rounded-xl p-5 border border-border space-y-3 mb-4">
          <p className="text-sm font-bold text-primary">New Media Appearance</p>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. Interview on Soccer Dad Podcast)" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent resize-none" />
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (YouTube, article, podcast link)" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Preview Image (optional)</label>
            {previewImage ? (
              <div className="relative inline-block">
                <img src={previewImage} alt="Preview" className="max-h-[100px] rounded-lg object-cover" />
                <button type="button" onClick={() => setPreviewImage("")} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80">&#x2715;</button>
              </div>
            ) : (
              <ImageUpload onUploaded={(u) => setPreviewImage(u)} />
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving || !title.trim()} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">{saving ? "Saving..." : "Add Appearance"}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {appearances.length === 0 && isOwner && (
        <p className="text-sm text-muted text-center py-4">No media appearances yet.</p>
      )}

      {/* Appearances List */}
      <div className="space-y-3">
        {shownAppearances.map((item) => (
          <a
            key={item.id}
            href={`/books-and-authors/${bookSlug}/media/${item.slug || item.id}`}
            className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />
            {item.previewImage && (
              <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-surface">
                  <img src={item.previewImage} alt={item.title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0 p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight group-hover:text-accent transition-colors">{item.title}</h4>
                {item.description && <p className="text-sm text-primary/70 mt-1 line-clamp-2">{item.description}</p>}
                <span className="text-sm font-semibold text-accent group-hover:text-accent-hover transition-colors mt-1 inline-block">View →</span>
              </div>
              {isOwner && (
                <div className="flex flex-col gap-1 flex-shrink-0 items-center" onClick={(e) => e.preventDefault()}>
                  <button onClick={(e) => { e.stopPropagation(); handleReorder(item.id, "up"); }} className="text-muted hover:text-primary transition-colors p-0.5" title="Move up">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleReorder(item.id, "down"); }} className="text-muted hover:text-primary transition-colors p-0.5" title="Move down">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleTogglePin(item.id); }} className={`text-[10px] transition-colors ${item.pinned ? "text-amber-600 font-semibold" : "text-muted hover:text-amber-600"}`}>
                    {item.pinned ? "★" : "☆"}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="text-[10px] text-muted hover:text-red-500 transition-colors">✕</button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center w-12 sm:w-14 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
              <span className="text-white text-2xl font-light">&#8250;</span>
            </div>
          </a>
        ))}
      </div>

      {/* Expand / View All */}
      {appearances.length > 0 && (
        <div className="flex items-center justify-center gap-4 pt-3">
          {!expanded && appearances.length > (pinnedAppearances.length > 0 ? pinnedAppearances.length : 3) && (
            <button onClick={() => setExpanded(true)} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
              Show All {appearances.length} Appearances
            </button>
          )}
          <a href={`/books-and-authors/${bookSlug}/media`} className="text-sm font-semibold text-primary hover:text-accent transition-colors">
            View All Media →
          </a>
        </div>
      )}
    </div>
  );
}
