"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

const navGroups = [
  {
    label: "Find",
    links: [
      { label: "Clubs", href: "/clubs" },
      { label: "Teams", href: "/teams" },
      { label: "Futsal", href: "/futsal" },
    ],
  },
  {
    label: "Guest Play",
    links: [
      { label: "Opportunities", href: "/guest-play" },
      { label: "Players", href: "/guest-play/players" },
      { label: "Guest Player Posts", href: "/guest-play/posts" },
    ],
  },
  {
    label: "Camps",
    links: [
      { label: "Camps", href: "/camps" },
      { label: "College Showcases", href: "/camps?type=College+Showcase" },
    ],
  },
  {
    label: "Train",
    links: [
      { label: "Private/Group Training", href: "/trainers" },
      { label: "Mental Training", href: "/trainers?specialty=Mental+Training" },
    ],
  },
  {
    label: "Tournaments",
    links: [
      { label: "US Tournaments", href: "/tournaments?region=US" },
      { label: "Int'l Tournaments", href: "/tournaments?region=International" },
    ],
  },
  {
    label: "Recommendations",
    links: [
      { label: "Equipment", href: "/shop" },
    ],
  },
  {
    label: "Blog",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Forum", href: "/forum" },
    ],
  },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
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
          <nav className="flex-1 flex flex-col px-6 pt-6 gap-1 overflow-y-auto">
            {navGroups.map((group, idx) => (
              <div key={group.label}>
                <button
                  onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                  className="w-full flex items-center justify-between text-white text-lg font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-colors"
                >
                  {group.label}
                  <svg className={`w-4 h-4 transition-transform ${openGroup === group.label ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openGroup === group.label && (
                  <div className="flex flex-col gap-1 pl-4 mb-2">
                    {group.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="text-white/70 text-base font-medium py-2 px-4 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
                {group.label === "Blog" && (
                  <a
                    href="/free"
                    onClick={() => setOpen(false)}
                    className="text-white text-lg font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-colors block"
                  >
                    Free
                  </a>
                )}
              </div>
            ))}
            <hr className="border-white/10 my-3" />
            <a
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-white/80 text-lg font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-colors"
            >
              {session ? "Profile" : "Log In"}
            </a>
            {session && (
              <button
                onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                className="text-left text-white/80 text-lg font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-colors"
              >
                Log Out
              </button>
            )}
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
