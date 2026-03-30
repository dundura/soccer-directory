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
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="relative">
      {/* Compact toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <a href={editHref} className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors">
          Edit Listing
        </a>
        {createPostHref && (
          <a href={createPostHref} className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-primary hover:bg-surface transition-colors">
            {listingType === "player" ? "Post" : "Create Post"}
          </a>
        )}
        {listingType && listingId && (
          <a href={`/event/new?type=${listingType}&id=${listingId}&slug=${encodeURIComponent(currentSlug)}`} className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-primary hover:bg-surface transition-colors">
            Add Event
          </a>
        )}
        {listingType === "soccerbook" && listingId && (
          <a href={`#media-appearances`} className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-primary hover:bg-surface transition-colors">
            Add Media
          </a>
        )}
        <button onClick={() => setMenuOpen(!menuOpen)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted hover:bg-surface transition-colors">
          More ▾
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-border shadow-lg z-50 min-w-[200px] py-1" onMouseLeave={() => setMenuOpen(false)}>
          {isAdmin && listingType && listingId && (
            <button onClick={() => { handleToggleFeatured(); setMenuOpen(false); }} disabled={featureLoading} className="block w-full text-left px-4 py-2 text-sm hover:bg-surface transition-colors">
              {featureLoading ? "Updating..." : featured ? "★ Unfeature" : "☆ Feature on Homepage"}
            </button>
          )}
          {createPostHref && listingType !== "player" && (
            <a href={createPostHref.replace("/posts/new?", "/posts/new-blog?")} className="block px-4 py-2 text-sm text-primary hover:bg-surface transition-colors">
              Write Blog Post
            </a>
          )}
          {listingType && listingId && listingType !== "instagrampage" && listingType !== "tiktokpage" && listingType !== "player" && !showInviteForm && (
            <button onClick={() => { setShowInviteForm(true); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-surface transition-colors">
              {inviteMsg || "Invite Feedback"}
            </button>
          )}
          {listingType === "player" && listingId && isOwner && (
            <a href={`/dashboard/player?id=${listingId}`} className="block px-4 py-2 text-sm text-primary hover:bg-surface transition-colors">
              Player Dashboard
            </a>
          )}
          {listingType === "fundraiser" && listingSlug && isOwner && (
            <a href={`/fundraiser/${listingSlug}/edit`} className="block px-4 py-2 text-sm text-primary hover:bg-surface transition-colors">
              Manage Roster
            </a>
          )}
          {listingType && listingId && !archived && (
            <button onClick={() => { handleArchive(); setMenuOpen(false); }} disabled={archiving} className="block w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-surface transition-colors disabled:opacity-50">
              {archiving ? "Archiving..." : "Archive Listing"}
            </button>
          )}
          {listingType && listingId && archived && (
            <>
              <button onClick={() => { handleRestore(); setMenuOpen(false); }} disabled={restoring} className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-surface transition-colors disabled:opacity-50">
                {restoring ? "Restoring..." : "Restore Listing"}
              </button>
              <button onClick={() => { handleDelete(); setMenuOpen(false); }} disabled={deleting} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-surface transition-colors disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Invite form (shown inline when triggered) */}
      {showInviteForm && (
        <form onSubmit={handleInviteReview} className="mt-2 rounded-xl border border-border bg-white p-3 space-y-2">
          <p className="text-xs text-muted">Send a review invitation by email</p>
          <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="reviewer@email.com" className="w-full text-xs px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-green-300" autoFocus />
          {inviteMsg && <p className={`text-xs ${inviteMsg.includes("sent") ? "text-green-600" : "text-red-500"}`}>{inviteMsg}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowInviteForm(false); setInviteEmail(""); setInviteMsg(""); }} className="px-3 py-1.5 rounded-lg text-xs text-muted hover:bg-surface">Cancel</button>
            <button type="submit" disabled={inviting || !inviteEmail.trim()} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">{inviting ? "Sending..." : "Send"}</button>
          </div>
        </form>
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
