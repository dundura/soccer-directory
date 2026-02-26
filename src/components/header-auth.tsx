"use client";

import { signOut, useSession } from "next-auth/react";

export function HeaderAuth() {
  const { data: session } = useSession();

  return (
    <>
      {session ? (
        <>
          <a href="/dashboard" className="hidden sm:inline-flex text-sm text-white/80 hover:text-white transition-colors">
            Profile
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="hidden sm:inline-flex text-sm text-white/80 hover:text-white transition-colors"
          >
            Log Out
          </button>
        </>
      ) : (
        <a href="/dashboard" className="hidden sm:inline-flex text-sm text-white/80 hover:text-white transition-colors">
          Log In
        </a>
      )}
      <a
        href="/dashboard"
        className="hidden md:inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
      >
        Get Listed
      </a>
    </>
  );
}
