"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ManageListingButton({ ownerId, listingType, listingId, listingSlug }: { ownerId: string | null; listingType?: string; listingId?: string; listingSlug?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archived, setArchived] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [featured, setFeatured] = useState<boolean | null>(null);
  const [featureLoading, setFeatureLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => {
    if (listingType && listingId && session?.user?.id) {
      const role = (session.user as { role?: string }).role;
      if (role === "admin") {
        fetch(`/api/admin?action=checkFeatured&type=${listingType}&id=${listingId}`)
          .then(r => r.json())
          .then(d => setFeatured(!!d.featured))
          .catch(() => {});
      }
    }
  }, [listingType, listingId, session]);

  if (!session?.user?.id) return null;

  const isOwner = session.user.id === ownerId;
  const isAdmin = (session.user as { role?: string }).role === "admin";

  async function handleToggleFeatured() {
    if (!listingType || !listingId) return;
    setFeatureLoading(true);
    try {
      await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateFeatured", type: listingType, id: listingId, featured: !featured }),
      });
      setFeatured(!featured);
    } catch { /* */ }
    setFeatureLoading(false);
  }

  if (!isOwner && !isAdmin) return null;

  const editHref = listingType && listingId
    ? `/dashboard?editType=${listingType}&editId=${listingId}`
    : "/dashboard";

  // Resolve slug for the current page from the URL
  const currentSlug = typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : "";
  const listingNameFromPage = typeof document !== "undefined" ? document.querySelector("h1")?.textContent || "" : "";
  const createPostHref = listingType && listingId
    ? `/posts/new?type=${listingType}&id=${listingId}&slug=${encodeURIComponent(currentSlug)}&name=${encodeURIComponent(listingNameFromPage)}`
    : "";

  async function handleInviteReview(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !listingType || !listingId) return;
    setInviting(true);
    setInviteMsg("");
    try {
      const res = await fetch("/api/reviews/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingType, listingId, email: inviteEmail.trim() }),
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

  async function handleRestore() {
    if (!listingType || !listingId) return;
    if (!confirm("Restore this listing? It will be visible to the public again.")) return;
    setRestoring(true);
    try {
      const res = await fetch("/api/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: listingType, id: listingId, action: "restore" }),
      });
      if (res.ok) {
        setArchived(false);
        router.refresh();
      }
    } catch { /* */ }
    setRestoring(false);
  }

  return (
    <div className="space-y-2">
      <a
        href={editHref}
        className="block w-full text-center px-4 py-2 rounded-xl border-2 border-accent/20 bg-accent/5 text-accent text-sm font-bold hover:bg-accent/10 transition-colors"
      >
        Edit Listing
      </a>

      {/* Feature toggle (admin only) */}
      {isAdmin && listingType && listingId && (
        <button
          onClick={handleToggleFeatured}
          disabled={featureLoading}
          className={`block w-full text-center px-4 py-2 rounded-xl border-2 text-sm font-bold transition-colors disabled:opacity-50 ${
            featured
              ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
          }`}
        >
          {featureLoading ? "Updating..." : featured ? "★ Featured — Unfeature" : "☆ Feature on Homepage"}
        </button>
      )}

      {/* Create Post */}
      {createPostHref && (
        <a
          href={createPostHref}
          className="block w-full text-center px-4 py-2 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 transition-colors"
        >
          {listingType === "player" ? "Create Guest Player Post" : "Create Post"}
        </a>
      )}

      {/* Add Special Event */}
      {listingType && listingId && (
        <a
          href={`/event/new?type=${listingType}&id=${listingId}&slug=${encodeURIComponent(currentSlug)}`}
          className="block w-full text-center px-4 py-2 rounded-xl border-2 border-accent/20 bg-accent/5 text-accent text-sm font-bold hover:bg-accent/10 transition-colors"
        >
          Add Special Event
        </a>
      )}

      {/* Write Blog Post (not for players) */}
      {createPostHref && listingType !== "player" && (
        <a
          href={createPostHref.replace("/posts/new?", "/posts/new-blog?")}
          className="block w-full text-center px-4 py-2 rounded-xl border-2 border-accent/20 bg-accent/5 text-accent text-sm font-bold hover:bg-accent/10 transition-colors"
        >
          Write Blog Post
        </a>
      )}

      {/* Invite Feedback (not for Instagram/TikTok/Player) */}
      {listingType && listingId && listingType !== "instagrampage" && listingType !== "tiktokpage" && listingType !== "player" && (
        <>
          {!showInviteForm ? (
            <button
              onClick={() => setShowInviteForm(true)}
              className="block w-full text-center px-4 py-2 rounded-xl border-2 border-green-200 bg-green-50 text-green-700 text-sm font-bold hover:bg-green-100 transition-colors"
            >
              {inviteMsg || "Invite Feedback"}
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
            <>
              <button
                onClick={handleRestore}
                disabled={restoring}
                className="block w-full px-4 py-2 rounded-xl border border-green-200 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                {restoring ? "Restoring..." : "Restore Listing"}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="block w-full px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </>
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
  const href = `/dashboard?editType=${listingType}&editId=${listingId}`;
  return (
    <a href={href} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
      Edit
    </a>
  );
}
