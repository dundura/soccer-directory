"use client";

import { useSession } from "next-auth/react";

export function ManageListingButton({ ownerId }: { ownerId: string | null }) {
  const { data: session } = useSession();

  if (!session?.user?.id || session.user.id !== ownerId) return null;

  return (
    <a
      href="/dashboard"
      className="inline-flex items-center px-4 py-2 rounded-xl border-2 border-red-200 bg-red-50 text-[#DC373E] text-sm font-bold hover:bg-red-100 transition-colors"
    >
      Manage Listing
    </a>
  );
}
