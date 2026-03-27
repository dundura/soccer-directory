"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostDeleteButton({ postId, postUserId, listingOwnerId, backUrl }: { postId: string; postUserId: string; listingOwnerId?: string; backUrl?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const isAdmin = (session?.user as any)?.role === "admin";
  const isPostOwner = session?.user?.id === postUserId;
  const isListingOwner = !!(listingOwnerId && session?.user?.id === listingOwnerId);

  if (!isAdmin && !isPostOwner && !isListingOwner) return null;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch("/api/listing-posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId }),
    });
    if (res.ok) {
      router.push(backUrl || "/");
    } else {
      alert("Failed to delete post");
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-4 py-2 rounded-lg border border-red-300 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete Post"}
    </button>
  );
}
