import React from "react";

type Resource = { label: string; href: string; desc: string; emoji: string };

// Maps both blog post categories AND listing types → related directory links
const CATEGORY_RESOURCES: Record<string, Resource[]> = {
  // ── Listing types ──────────────────────────────────────────
  club: [
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Find a trainer in your area" },
    { emoji: "📋", label: "Tryouts", href: "/tryouts", desc: "Open tryouts near you" },
    { emoji: "👥", label: "Teams", href: "/teams", desc: "Browse available teams" },
    { emoji: "⛺", label: "Soccer Camps", href: "/camps", desc: "Summer camps near you" },
  ],
  trainer: [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find clubs in your area" },
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Top apps for home training" },
    { emoji: "🛒", label: "Gear & Equipment", href: "/gear", desc: "Training gear and equipment" },
    { emoji: "⛺", label: "Soccer Camps", href: "/camps", desc: "Summer camps near you" },
  ],
  camp: [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find clubs in your area" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Work with a trainer" },
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Train between sessions" },
    { emoji: "🛒", label: "Gear & Equipment", href: "/gear", desc: "Get the right gear" },
  ],
  tryout: [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Browse clubs holding tryouts" },
    { emoji: "👥", label: "Teams", href: "/teams", desc: "Teams looking for players" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Prepare with a trainer" },
    { emoji: "👤", label: "Player Profiles", href: "/players", desc: "Players seeking opportunities" },
  ],
  team: [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find the parent club" },
    { emoji: "📋", label: "Tryouts", href: "/tryouts", desc: "Open tryouts nearby" },
    { emoji: "🤝", label: "Scrimmages", href: "/scrimmages", desc: "Find scrimmage partners" },
    { emoji: "👤", label: "Player Profiles", href: "/players", desc: "Players seeking teams" },
  ],
  tournament: [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find participating clubs" },
    { emoji: "👥", label: "Teams", href: "/teams", desc: "Browse competing teams" },
    { emoji: "🤝", label: "Scrimmages", href: "/scrimmages", desc: "Warm up with a scrimmage" },
    { emoji: "👤", label: "Player Profiles", href: "/players", desc: "Player profiles" },
  ],
  consultant: [
    { emoji: "🎓", label: "College Recruiting", href: "/college-recruiting", desc: "More recruiting resources" },
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find ECNL and MLS Next clubs" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Train with a professional" },
  ],
  "training-app": [
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Train with a professional" },
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find clubs near you" },
    { emoji: "🛒", label: "Gear & Equipment", href: "/gear", desc: "Pair with the right gear" },
  ],
  "gear-item": [
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Top training apps" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Work with a trainer" },
    { emoji: "⛺", label: "Soccer Camps", href: "/camps", desc: "Summer camps near you" },
  ],
  service: [
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Find a trainer near you" },
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find clubs near you" },
    { emoji: "⛺", label: "Soccer Camps", href: "/camps", desc: "Summer camps near you" },
  ],
  podcast: [
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Find a trainer near you" },
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Train smarter at home" },
    { emoji: "📚", label: "Soccer Blogs", href: "/blogs", desc: "Read blogs from the community" },
  ],
  "youtube-channel": [
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Top apps for home training" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Work with a trainer" },
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find clubs near you" },
  ],
  player: [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find a club near you" },
    { emoji: "📋", label: "Tryouts", href: "/tryouts", desc: "Open tryouts near you" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Work with a trainer" },
  ],
  scrimmage: [
    { emoji: "👥", label: "Teams", href: "/teams", desc: "Find teams near you" },
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find clubs in your area" },
    { emoji: "👤", label: "Player Profiles", href: "/players", desc: "Players seeking scrimmages" },
  ],
  futsal: [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find clubs near you" },
    { emoji: "👥", label: "Teams", href: "/teams", desc: "Browse available teams" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Work with a trainer" },
  ],
  "guest-play": [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find clubs in your area" },
    { emoji: "👥", label: "Teams", href: "/teams", desc: "Teams looking for players" },
    { emoji: "👤", label: "Player Profiles", href: "/players", desc: "Browse player profiles" },
  ],
  ebook: [
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Work with a trainer" },
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Top apps for home training" },
    { emoji: "🎓", label: "College Recruiting", href: "/college-recruiting", desc: "Recruiting resources" },
  ],
  // ── Blog post categories ────────────────────────────────────
  Camps: [
    { emoji: "⛺", label: "Find Soccer Camps", href: "/camps", desc: "Browse summer camps near you" },
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find competitive clubs in your area" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Work with a personal trainer" },
  ],
  "Training Tips": [
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Find a trainer in your area" },
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Top apps for home training" },
    { emoji: "🛒", label: "Gear & Equipment", href: "/gear", desc: "Training gear and equipment" },
  ],
  "College Recruiting": [
    { emoji: "🎓", label: "College Recruiting", href: "/college-recruiting", desc: "Recruiting consultants and resources" },
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find ECNL and MLS Next clubs" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Get an edge with personal training" },
  ],
  "Player Development": [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find a club that fits your level" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Accelerate development with a trainer" },
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Train smarter at home" },
  ],
  "Parent Guides": [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find the right club for your child" },
    { emoji: "⛺", label: "Soccer Camps", href: "/camps", desc: "Summer camps near you" },
    { emoji: "📋", label: "Tryouts", href: "/tryouts", desc: "Upcoming tryouts in your state" },
  ],
  Coaching: [
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Connect with trainers and coaches" },
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Coaching opportunities at clubs" },
    { emoji: "⚽", label: "Services", href: "/services", desc: "Soccer services and coaching programs" },
  ],
  "Home Training": [
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Best apps for solo training" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Find a trainer near you" },
    { emoji: "🛒", label: "Gear & Equipment", href: "/gear", desc: "Home training gear" },
  ],
  "Gear & Equipment": [
    { emoji: "🛒", label: "Gear & Equipment", href: "/gear", desc: "Browse all gear and equipment" },
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Pair gear with the right app" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Train with a professional" },
  ],
  "Club Spotlight": [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Browse clubs in your area" },
    { emoji: "👥", label: "Teams", href: "/teams", desc: "Find teams looking for players" },
    { emoji: "📋", label: "Tryouts", href: "/tryouts", desc: "Open tryouts near you" },
  ],
  "Featured Club": [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Browse clubs in your area" },
    { emoji: "👥", label: "Teams", href: "/teams", desc: "Find teams looking for players" },
    { emoji: "📋", label: "Tryouts", href: "/tryouts", desc: "Open tryouts near you" },
  ],
  "Club Selection": [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Compare clubs in your area" },
    { emoji: "📋", label: "Tryouts", href: "/tryouts", desc: "Open tryouts near you" },
    { emoji: "👥", label: "Teams", href: "/teams", desc: "Browse available teams" },
  ],
  Tryouts: [
    { emoji: "📋", label: "Tryouts", href: "/tryouts", desc: "Open tryouts near you" },
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find clubs holding tryouts" },
    { emoji: "👥", label: "Teams", href: "/teams", desc: "Teams looking for players" },
  ],
  "Getting Started": [
    { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find a club near you" },
    { emoji: "⛺", label: "Soccer Camps", href: "/camps", desc: "Get started at a camp" },
    { emoji: "📋", label: "Tryouts", href: "/tryouts", desc: "Upcoming tryouts" },
    { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Work with a trainer" },
  ],
  "Product Spotlight": [
    { emoji: "🛒", label: "Gear & Equipment", href: "/gear", desc: "Browse all soccer gear" },
    { emoji: "📱", label: "Training Apps", href: "/training-apps", desc: "Top training apps" },
    { emoji: "⚽", label: "Services", href: "/services", desc: "Soccer services near you" },
  ],
};

const DEFAULT_RESOURCES: Resource[] = [
  { emoji: "🏟️", label: "Soccer Clubs", href: "/clubs", desc: "Find clubs in your area" },
  { emoji: "⛺", label: "Soccer Camps", href: "/camps", desc: "Summer camps near you" },
  { emoji: "🎯", label: "Private Trainers", href: "/trainers", desc: "Work with a trainer" },
];

export function InternalLinkBlock({ category, type }: { category?: string; type?: string }) {
  const key = type ?? category ?? "";
  const resources = CATEGORY_RESOURCES[key] ?? DEFAULT_RESOURCES;

  return (
    <div className="my-10 rounded-2xl border border-border bg-muted/30 p-6">
      <h3 className="font-[family-name:var(--font-display)] text-base font-bold mb-4 text-foreground">
        Explore Related Resources
      </h3>
      <div className="grid sm:grid-cols-3 gap-3">
        {resources.map((r) => (
          <a
            key={r.href}
            href={r.href}
            className="flex items-start gap-3 rounded-xl bg-white border border-border p-4 hover:shadow-md hover:border-accent transition-all group"
          >
            <span className="text-2xl flex-shrink-0">{r.emoji}</span>
            <div>
              <div className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors">
                {r.label}
              </div>
              <div className="text-xs text-muted mt-0.5">{r.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
