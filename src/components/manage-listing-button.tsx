"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ManageListingButton({ ownerId, listingType, listingId, listingSlug }: { ownerId: string | null; listingType?: string; listingId?: string; listingSlug?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archived, setArchived] = useState(false);

  if (!session?.user?.id) return null;

  const isOwner = session.user.id === ownerId;
  const isAdmin = (session.user as { role?: string }).role === "admin";

  if (!isOwner && !isAdmin) return null;

  const editHref = isAdmin && !isOwner && listingType && listingId
    ? `/admin?editType=${listingType}&editId=${listingId}`
    : listingType && listingId
      ? `/dashboard?editType=${listingType}&editId=${listingId}`
      : "/dashboard";

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
