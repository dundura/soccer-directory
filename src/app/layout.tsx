import type { Metadata } from "next";
import { MobileMenu } from "@/components/mobile-menu";
import { NavDropdown } from "@/components/nav-dropdown";
import AuthProvider from "@/components/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soccer Near Me | Find Youth Soccer Teams, Clubs, Camps & Trainers",
  description: "The #1 directory for youth soccer. Find clubs, teams, private trainers, camps, and guest player opportunities near you. Powered by Anytime Soccer Training.",
  keywords: "youth soccer, soccer teams, soccer clubs, soccer camps, private soccer trainer, guest player, ECNL, MLS Next",
  openGraph: {
    title: "Soccer Near Me | Find Youth Soccer Teams, Clubs, Camps & Trainers Near You",
    description: "The #1 directory for youth soccer. Find clubs, teams, private trainers, camps, and guest player opportunities near you.",
    url: "https://www.soccer-near-me.com",
    siteName: "Soccer Near Me",
    images: [{ url: "https://www.soccer-near-me.com/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soccer Near Me | Find Youth Soccer Teams, Clubs, Camps & Trainers Near You",
    description: "The #1 directory for youth soccer. Find clubs, teams, private trainers, camps, and guest player opportunities near you.",
    images: ["https://www.soccer-near-me.com/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface antialiased">
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

// ── Header ───────────────────────────────────────────────────
function Header() {
  return (
    <header className="bg-primary text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Anytime Soccer Training" className="h-8 w-8 rounded-full" />
            <span className="font-[family-name:var(--font-display)] font-bold text-xl tracking-tight">
              Soccer <span className="text-accent">Near Me</span>
            </span>
          </a>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Clubs", href: "/clubs" },
              { label: "Teams", href: "/teams" },
              { label: "Futsal", href: "/futsal" },
              { label: "Trainers", href: "/trainers" },
              { label: "Camps", href: "/camps" },
              { label: "Guest Play", href: "/guest-play" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <NavDropdown
              label="Tournaments"
              items={[
                { label: "US Tournaments", href: "/tournaments?region=US" },
                { label: "International", href: "/tournaments?region=International" },
                { label: "All Tournaments", href: "/tournaments" },
              ]}
            />
            <a href="/forum" className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">Forum</a>
            <a href="/blog" className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">Blog</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="hidden sm:inline-flex text-sm text-white/80 hover:text-white transition-colors">
              Log In
            </a>
            <a
              href="/dashboard"
              className="hidden md:inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
            >
              Get Listed
            </a>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-primary text-white/60 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-[family-name:var(--font-display)] text-white font-semibold mb-4 text-sm">For Players</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="/clubs" className="hover:text-white transition-colors">Find Clubs</a>
              <a href="/teams" className="hover:text-white transition-colors">Find Teams</a>
              <a href="/futsal" className="hover:text-white transition-colors">Find Futsal Teams</a>
              <a href="/trainers" className="hover:text-white transition-colors">Find Trainers</a>
              <a href="/camps" className="hover:text-white transition-colors">Find Camps</a>
              <a href="/guest-play" className="hover:text-white transition-colors">Guest Player Ops</a>
              <a href="/tournaments" className="hover:text-white transition-colors">Find Tournaments</a>
            </div>
          </div>
          <div>
            <h4 className="font-[family-name:var(--font-display)] text-white font-semibold mb-4 text-sm">For Clubs & Coaches</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="/dashboard" className="hover:text-white transition-colors">Get Listed</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Manage Listings</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Post a Camp</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Post a Tournament</a>
            </div>
          </div>
          <div>
            <h4 className="font-[family-name:var(--font-display)] text-white font-semibold mb-4 text-sm">Resources</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="/blog" className="hover:text-white transition-colors">Blog</a>
              <a href="https://anytime-soccer.com" target="_blank" className="hover:text-white transition-colors">Anytime Soccer Training</a>
              <a href="https://anytime-soccer.com/podcast" target="_blank" className="hover:text-white transition-colors">The Inside Scoop Podcast</a>
            </div>
          </div>
          <div>
            <h4 className="font-[family-name:var(--font-display)] text-white font-semibold mb-4 text-sm">States</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="/clubs?state=NC" className="hover:text-white transition-colors">North Carolina</a>
              <a href="/clubs?state=SC" className="hover:text-white transition-colors">South Carolina</a>
              <a href="/clubs?state=VA" className="hover:text-white transition-colors">Virginia</a>
              <a href="/clubs?state=GA" className="hover:text-white transition-colors">Georgia</a>
              <a href="/clubs?state=TX" className="hover:text-white transition-colors">Texas</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2026 Soccer Near Me. A product of <a href="https://anytime-soccer.com" target="_blank" className="text-accent hover:underline">Anytime Soccer Training</a></p>
          <div className="flex gap-6 text-sm">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
