"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const navLinks = [
  { label: "Clubs", href: "/clubs" },
  { label: "Teams", href: "/teams" },
  { label: "Futsal", href: "/futsal" },
  { label: "Trainers", href: "/trainers" },
  { label: "Camps", href: "/camps" },
  { label: "Guest Play", href: "/guest-play" },
  { label: "International Trips", href: "/international-trips" },
  { label: "US Tournaments", href: "/tournaments?region=US" },
  { label: "Int'l Tournaments", href: "/tournaments?region=International" },
  { label: "Forum", href: "/forum" },
  { label: "Blog", href: "/blog" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-white" />
        <span className="block w-5 h-0.5 bg-white" />
        <span className="block w-5 h-0.5 bg-white" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-primary flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
            <a href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <img src="/logo.png" alt="Anytime Soccer Training" className="h-8 w-8 rounded-full" />
              <span className="font-[family-name:var(--font-display)] font-bold text-xl tracking-tight text-white">
                Soccer <span className="text-accent">Near Me</span>
              </span>
            </a>
            <button
              onClick={() => setOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white text-2xl"
              aria-label="Close menu"
            >
              &#x2715;
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 flex flex-col px-6 pt-6 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-white text-lg font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-white/10 my-3" />
            <a
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-white/80 text-lg font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-colors"
            >
              {session ? "Profile" : "Log In"}
            </a>
            <a
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 text-center py-3 px-4 rounded-xl bg-accent text-white text-lg font-semibold hover:bg-accent-hover transition-colors"
            >
              Get Listed
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
