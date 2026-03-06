"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./image-upload";

export function ManageListingButton({ ownerId, listingType, listingId, listingSlug }: { ownerId: string | null; listingType?: string; listingId?: string; listingSlug?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archived, setArchived] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postBody, setPostBody] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postVideo, setPostVideo] = useState("");
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  if (!session?.user?.id) return null;

  const isOwner = session.user.id === ownerId;
  const isAdmin = (session.user as { role?: string }).role === "admin";

  if (!isOwner && !isAdmin) return null;

  const editHref = isAdmin && !isOwner && listingType && listingId
    ? `/admin?editType=${listingType}&editId=${listingId}`
    : listingType && listingId
      ? `/dashboard?editType=${listingType}&editId=${listingId}`
      : "/dashboard";

  // Resolve slug for the current page from the URL
  const currentSlug = typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : "";

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!postBody.trim() || !listingType || !listingId) return;
    setPosting(true);
    try {
      const res = await fetch("/api/listing-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: listingType, id: listingId, slug: currentSlug,
          body: postBody.trim(),
          imageUrl: postImage || undefined,
          videoUrl: postVideo || undefined,
        }),
      });
      if (res.ok) {
        setPostBody(""); setPostImage(""); setPostVideo(""); setShowPostForm(false);
        setPostSuccess(true);
        setTimeout(() => setPostSuccess(false), 3000);
      }
    } catch { /* */ }
    setPosting(false);
  }

  async function handleInviteReview(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !listingType || !listingId) return;
    setInviting(true);
    setInviteMsg("");
    try {
      const res = await fetch("/api/reviews/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: listingType, id: listingId, email: inviteEmail.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setInviteEmail("");
        setInviteMsg("Invitation sent!");
        setTimeout(() => { setInviteMsg(""); setShowInviteForm(false); }, 2000);
      } else {
        setInviteMsg(json.error || "Failed to send");
      }
    } catch {
      setInviteMsg("Failed to send");
    }
    setInviting(false);
  }

  async function handleArchive() {
    if (!listingType || !listingId) return;
    if (!confirm("Archive this listing? It will be hidden from public view.")) return;
    setArchiving(true);
    try {
      const res = await fetch("/api/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: listingType, id: listingId }),
      });
      if (res.ok) {
        setArchived(true);
        router.push("/dashboard");
        return;
      }
    } catch { /* */ }
    setArchiving(false);
  }

  async function handleDelete() {
    if (!listingType || !listingId) return;
    if (!confirm("Permanently delete this listing? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: listingType, id: listingId }),
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch { /* */ }
    setDeleting(false);
  }

  return (
    <div className="space-y-2">
      <a
        href={editHref}
        className="block w-full text-center px-4 py-2 rounded-xl border-2 border-accent/20 bg-accent/5 text-accent text-sm font-bold hover:bg-accent/10 transition-colors"
      >
        Edit Listing
      </a>

      {/* Create Post */}
      {listingType && listingId && (
        <>
          {!showPostForm ? (
            <button
              onClick={() => setShowPostForm(true)}
              className="block w-full text-center px-4 py-2 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 transition-colors"
            >
              {postSuccess ? "Post Created!" : "Create Post"}
            </button>
          ) : (
            <form onSubmit={handleCreatePost} className="rounded-xl border-2 border-primary/20 bg-white p-3 space-y-2">
              <textarea
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                placeholder="Share an update..."
                rows={3}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
                autoFocus
              />
              {postImage ? (
                <div className="relative">
                  <img src={postImage} alt="Preview" className="w-full rounded-lg max-h-[120px] object-cover" />
                  <button type="button" onClick={() => setPostImage("")} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] flex items-center justify-center hover:bg-black/70">&#x2715;</button>
                </div>
              ) : (
                <ImageUpload onUploaded={(url) => setPostImage(url)} />
              )}
              <input
                type="url"
                value={postVideo}
                onChange={(e) => setPostVideo(e.target.value)}
                placeholder="YouTube or Vimeo URL (optional)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowPostForm(false); setPostBody(""); setPostImage(""); setPostVideo(""); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:bg-surface transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={posting || !postBody.trim()} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50">
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Invite Review */}
      {listingType && listingId && (
        <>
          {!showInviteForm ? (
            <button
              onClick={() => setShowInviteForm(true)}
              className="block w-full text-center px-4 py-2 rounded-xl border-2 border-green-200 bg-green-50 text-green-700 text-sm font-bold hover:bg-green-100 transition-colors"
            >
              {inviteMsg || "Invite Review"}
            </button>
          ) : (
            <form onSubmit={handleInviteReview} className="rounded-xl border-2 border-green-200 bg-white p-3 space-y-2">
              <p className="text-xs text-muted">Send a review invitation by email</p>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="reviewer@email.com"
                className="w-full text-xs px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
                autoFocus
              />
              {inviteMsg && <p className={`text-xs ${inviteMsg.includes("sent") ? "text-green-600" : "text-red-500"}`}>{inviteMsg}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowInviteForm(false); setInviteEmail(""); setInviteMsg(""); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:bg-surface transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={inviting || !inviteEmail.trim()} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50">
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {listingType === "player" && listingId && isOwner && (
        <a
          href={`/dashboard/player?id=${listingId}`}
          className="block w-full text-center px-4 py-2 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 transition-colors"
        >
          Player Dashboard
        </a>
      )}
      {listingType === "fundraiser" && listingSlug && isOwner && (
        <a
          href={`/fundraiser/${listingSlug}/edit`}
          className="block w-full text-center px-4 py-2 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 transition-colors"
        >
          Manage Roster
        </a>
      )}
      {listingType && listingId && (
        <>
          {!archived ? (
            <button
              onClick={handleArchive}
              disabled={archiving}
              className="block w-full px-4 py-2 rounded-xl border border-amber-200 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              {archiving ? "Archiving..." : "Archive Listing"}
            </button>
          ) : (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="block w-full px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Permanently"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function EditSectionLink({ ownerId, listingType, listingId }: { ownerId: string | null; listingType: string; listingId: string }) {
  const { data: session } = useSession();
  if (!session?.user?.id) return null;
  const isOwner = session.user.id === ownerId;
  const isAdmin = (session.user as { role?: string }).role === "admin";
  if (!isOwner && !isAdmin) return null;
  const href = isAdmin && !isOwner
    ? `/admin?editType=${listingType}&editId=${listingId}`
    : `/dashboard?editType=${listingType}&editId=${listingId}`;
  return (
    <a href={href} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
      Edit
    </a>
  );
}
