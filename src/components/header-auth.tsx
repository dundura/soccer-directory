"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export function HeaderAuth() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {session ? (
        <div ref={ref} className="relative hidden sm:block">
          <button
            onClick={() => setOpen(!open)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
          >
            Profile
            <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open && (
            <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-lg border border-border py-2 min-w-[150px] z-50">
              <a
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-primary hover:bg-surface transition-colors"
              >
                Dashboard
              </a>
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-primary hover:bg-surface transition-colors"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
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
