"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

type NavLink = { label: string; href: string };
type NavSubgroup = { label: string; links: NavLink[] };
type NavGroup = { label: string; links?: NavLink[]; subgroups?: NavSubgroup[] };

const navGroups: NavGroup[] = [
  {
    label: "Find",
    subgroups: [
      {
        label: "Clubs & Teams",
        links: [
          { label: "Clubs", href: "/clubs" },
          { label: "Teams", href: "/teams" },
          { label: "Futsal", href: "/futsal" },
        ],
      },
      {
        label: "Events",
        links: [
          { label: "Camps", href: "/camps" },
          { label: "Special Events", href: "/special-events" },
          { label: "College Showcases", href: "/camps?type=College+Showcase" },
          { label: "Tryouts", href: "/tryouts" },
          { label: "US Tournaments", href: "/tournaments?region=US" },
          { label: "Int'l Tournaments", href: "/tournaments?region=International" },
          { label: "Fundraisers", href: "/fundraiser/new" },
        ],
      },
      {
        label: "Guest Play",
        links: [
          { label: "Guest Play", href: "/guest-play" },
          { label: "Player Profiles", href: "/guest-play/players" },
          { label: "Guest Player Posts", href: "/guest-play/posts" },
        ],
      },
      {
        label: "Training & Services",
        links: [
          { label: "Coaches & Trainers", href: "/trainers" },
          { label: "Training Apps", href: "/training-apps" },
          { label: "Products & Services", href: "/services" },
        ],
      },
      {
        label: "Consultants",
        links: [
          { label: "Mental Training", href: "/trainers?specialty=Mental+Training" },
          { label: "College Recruiting", href: "/college-recruiting" },
        ],
      },
    ],
  },
  {
    label: "Free",
    links: [
      { label: "Free Resources", href: "/free" },
      { label: "Ebooks", href: "/ebooks" },
      { label: "Free Giveaways", href: "/giveaways" },
    ],
  },
  {
    label: "Media",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Podcasts", href: "/podcasts" },
      { label: "YouTube Channels", href: "/youtube-channels" },
      { label: "Soccer Blogs", href: "/blogs" },
      { label: "Facebook Groups", href: "/facebook-groups" },
      { label: "Forum", href: "/forum" },
    ],
  },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const { data: session } = useSession();

  function toggleGroup(label: string) {
    if (openGroup === label) {
      setOpenGroup(null);
      setOpenSub(null);
    } else {
      setOpenGroup(label);
      setOpenSub(null);
    }
  }

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
            {navGroups.map((group) => (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between text-white text-lg font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-colors"
                >
                  {group.label}
                  <svg className={`w-4 h-4 transition-transform ${openGroup === group.label ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openGroup === group.label && group.links && (
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

                {openGroup === group.label && group.subgroups && (
                  <div className="flex flex-col gap-1 pl-4 mb-2">
                    {group.subgroups.map((sub) => (
                      <div key={sub.label}>
                        <button
                          onClick={() => setOpenSub(openSub === sub.label ? null : sub.label)}
                          className="w-full flex items-center justify-between text-white/80 text-base font-semibold py-2 px-4 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          {sub.label}
                          <svg className={`w-3.5 h-3.5 transition-transform ${openSub === sub.label ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openSub === sub.label && (
                          <div className="flex flex-col gap-1 pl-4 mb-1">
                            {sub.links.map((link) => (
                              <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="text-white/60 text-sm font-medium py-2 px-4 rounded-xl hover:bg-white/10 transition-colors"
                              >
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a
              href="/rankings"
              onClick={() => setOpen(false)}
              className="text-white text-lg font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-colors block"
            >
              Rankings
            </a>
            <a
              href="/shop"
              onClick={() => setOpen(false)}
              className="text-white text-lg font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-colors block"
            >
              Recommendations
            </a>
            <a
              href="/fundraiser/new"
              onClick={() => setOpen(false)}
              className="text-white text-lg font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-colors block"
            >
              Fundraising
            </a>
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
