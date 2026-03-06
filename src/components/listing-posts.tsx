"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ImageUpload } from "./image-upload";

interface Post {
  id: string;
  body: string;
  imageUrl?: string;
  videoUrl?: string;
  hidden: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ListingPostsSidebar({
  listingType,
  listingId,
  slug,
  ownerId,
}: {
  listingType: string;
  listingId: string;
  slug: string;
  ownerId: string | null;
}) {
  const { data: session } = useSession();
  const isOwner = !!session?.user?.id && session.user.id === ownerId;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function fetchPosts() {
    fetch(`/api/listing-posts?type=${listingType}&id=${listingId}&slug=${slug}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPosts(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchPosts(); }, [listingType, listingId, slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/listing-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: listingType, id: listingId, slug,
          body: body.trim(),
          imageUrl: imageUrl || undefined,
          videoUrl: videoUrl || undefined,
        }),
      });
      if (res.ok) {
        setBody(""); setImageUrl(""); setVideoUrl(""); setShowForm(false);
        fetchPosts();
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  async function handleDelete(postId: string) {
    if (!confirm("Delete this post?")) return;
    const res = await fetch("/api/listing-posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId }),
    });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  async function handleToggleHidden(postId: string) {
    const res = await fetch("/api/listing-posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, action: "toggle_hidden" }),
    });
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, hidden: !p.hidden } : p));
    }
  }

  if (loading) return null;
  if (!isOwner && posts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <h4 className="text-sm font-bold">Our Posts</h4>
        {isOwner && !showForm && (
          <button onClick={() => setShowForm(true)} className="text-[11px] font-semibold text-accent hover:text-accent-hover transition-colors">
            + New
          </button>
        )}
      </div>

      {/* Create form */}
      {isOwner && showForm && (
        <form onSubmit={handleSubmit} className="px-4 pb-3 space-y-2.5">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share an update..."
            rows={3}
            className="w-full text-xs px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
            autoFocus
          />

          {imageUrl ? (
            <div className="relative">
              <img src={imageUrl} alt="Preview" className="w-full rounded-lg max-h-[120px] object-cover" />
              <button type="button" onClick={() => setImageUrl("")} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] flex items-center justify-center hover:bg-black/70">&#x2715;</button>
            </div>
          ) : (
            <ImageUpload onUploaded={(url) => setImageUrl(url)} />
          )}

          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube or Vimeo URL (optional)"
            className="w-full text-xs px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setBody(""); setImageUrl(""); setVideoUrl(""); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:bg-surface transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !body.trim()} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50">
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}

      {/* Post links */}
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <div key={post.id} className={`px-4 py-3 ${post.hidden ? "opacity-50" : ""}`}>
            <div className="flex items-start gap-2">
              <a href={`/posts/${post.id}`} className="flex-1 min-w-0 group">
                <p className="text-[13px] text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                  {post.body}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted">{timeAgo(post.createdAt)}</span>
                  {post.imageUrl && <span className="text-[10px] text-muted">&#128247;</span>}
                  {post.videoUrl && <span className="text-[10px] text-muted">&#127909;</span>}
                  {post.hidden && <span className="text-[10px] text-orange-500 font-medium">Hidden</span>}
                </div>
              </a>
              {isOwner && (
                <div className="flex gap-1 shrink-0 pt-0.5">
                  <button
                    onClick={() => handleToggleHidden(post.id)}
                    className="text-muted hover:text-primary transition-colors"
                    title={post.hidden ? "Show post" : "Hide post"}
                  >
                    {post.hidden ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-muted hover:text-red-500 transition-colors"
                    title="Delete post"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && isOwner && !showForm && (
        <div className="px-4 pb-3.5 text-center">
          <p className="text-xs text-muted">No posts yet</p>
        </div>
      )}
    </div>
  );
}
