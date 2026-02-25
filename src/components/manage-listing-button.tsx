"use client";

import { useSession } from "next-auth/react";

export function ManageListingButton({ ownerId }: { ownerId: string | null }) {
  const { data: session } = useSession();

  if (!session?.user?.id || session.user.id !== ownerId) return null;

  return (
    <a
      href="/dashboard"
      className="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors"
    >
      Manage Listing
    </a>
  );
}
