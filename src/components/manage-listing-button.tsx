"use client";

import { useSession } from "next-auth/react";

export function ManageListingButton({ ownerId, listingType, listingId }: { ownerId: string | null; listingType?: string; listingId?: string }) {
  const { data: session } = useSession();

  if (!session?.user?.id) return null;

  const isOwner = session.user.id === ownerId;
  const isAdmin = (session.user as { role?: string }).role === "admin";

  if (!isOwner && !isAdmin) return null;

  const href = isAdmin && listingType && listingId
    ? `/admin?editType=${listingType}&editId=${listingId}`
    : "/dashboard";

  return (
    <a
      href={href}
      className="inline-flex items-center px-4 py-2 rounded-xl border-2 border-red-200 bg-red-50 text-[#DC373E] text-sm font-bold hover:bg-red-100 transition-colors"
    >
      Manage Listing
    </a>
  );
}
