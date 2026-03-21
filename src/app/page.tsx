import { getClubs, getTeams, getTrainers, getCamps, getTournaments, getFutsalTeams, getBlogPosts } from "@/lib/db";
import { ListingCard, Badge, AnytimeInlineCTA } from "@/components/ui";
import { HeroSearchBar } from "@/components/hero-search";
import { RotatingText } from "@/components/rotating-text";
import SitePopup from "@/components/site-popup";
import { ListingCarousel } from "@/components/listing-carousel";
import { SectionCarousel } from "@/components/section-carousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [clubs, teams, trainers, camps, tournaments, futsalTeams, blogPosts] = await Promise.all([
    getClubs(), getTeams(), getTrainers(), getCamps(), getTournaments(), getFutsalTeams(), getBlogPosts(),
  ]);

  const featuredClubs = clubs.filter((c) => c.featured).sort(() => Math.random() - 0.5).slice(0, 10);
  const featuredTeams = teams.filter((t) => t.featured).sort(() => Math.random() - 0.5).slice(0, 10);
  const featuredTrainers = trainers.filter((t) => t.featured).sort(() => Math.random() - 0.5).slice(0, 10);
  const featuredCamps = camps.filter((c) => c.featured).sort(() => Math.random() - 0.5).slice(0, 10);
  const featuredTournaments = tournaments.filter((t) => t.featured).sort(() => Math.random() - 0.5).slice(0, 10);
  const featuredFutsal = futsalTeams.filter((t) => t.featured).sort(() => Math.random() - 0.5).slice(0, 10);
  const featuredPosts = blogPosts.slice(0, 3);

  // New listings: random, one per creator
  let newListings: { id: string; name: string; slug: string; _type: string; _path: string; _subtitle: string; teamPhoto?: string | null; logo?: string | null; imageUrl?: string | null; imagePosition?: number }[] = [];
  try {
    const allListingsPool = [
      ...clubs.map(c => ({ id: c.id, name: c.name, slug: c.slug, teamPhoto: c.teamPhoto, logo: c.logo, imageUrl: c.imageUrl, imagePosition: c.imagePosition, userId: (c as any).userId, _type: 'club', _path: 'clubs', _subtitle: `${c.city || ''}, ${c.state || ''}` })),
      ...teams.map(t => ({ id: t.id, name: t.name, slug: t.slug, teamPhoto: t.teamPhoto, logo: t.logo, imageUrl: t.imageUrl, imagePosition: t.imagePosition, userId: (t as any).userId, _type: 'team', _path: 'teams', _subtitle: `${t.city || ''}, ${t.state || ''}` })),
      ...trainers.map(t => ({ id: t.id, name: t.name, slug: t.slug, teamPhoto: t.teamPhoto, logo: t.logo, imageUrl: t.imageUrl, imagePosition: t.imagePosition, userId: (t as any).userId, _type: 'trainer', _path: 'trainers', _subtitle: `${t.city || ''}, ${t.state || ''}` })),
      ...camps.map(c => ({ id: c.id, name: c.name, slug: c.slug, teamPhoto: c.teamPhoto, logo: c.logo, imageUrl: c.imageUrl, imagePosition: c.imagePosition, userId: (c as any).userId, _type: 'camp', _path: 'camps', _subtitle: `${c.city || ''}, ${c.state || ''}` })),
      ...tournaments.map(t => ({ id: t.id, name: t.name, slug: t.slug, teamPhoto: t.teamPhoto, logo: t.logo, imageUrl: t.imageUrl, imagePosition: t.imagePosition, userId: (t as any).userId, _type: 'tournament', _path: 'tournaments', _subtitle: `${t.city || ''}, ${t.state || ''}` })),
      ...futsalTeams.map(t => ({ id: t.id, name: t.name, slug: t.slug, teamPhoto: t.teamPhoto, logo: t.logo, imageUrl: t.imageUrl, imagePosition: t.imagePosition, userId: (t as any).userId, _type: 'futsal', _path: 'futsal', _subtitle: `${t.city || ''}, ${t.state || ''}` })),
    ].sort(() => Math.random() - 0.5);
    const seenUsers = new Set<string>();
    for (const l of allListingsPool) {
      const uid = l.userId || l.id;
      if (seenUsers.has(uid)) continue;
      seenUsers.add(uid);
      newListings.push(l);
      if (newListings.length >= 18) break;
    }
  } catch (e) {
    console.error('Error building new listings:', e);
  }

  const TYPE_BADGE_MAP: Record<string, string> = { club: 'Club', team: 'Team', trainer: 'Trainer', camp: 'Camp', tournament: 'Tournament', futsal: 'Futsal' };

  const BLOG_COVER_IMAGES = [
    "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp",
    "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg",
    "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg",
    "https://media.anytime-soccer.com/wp-content/uploads/2026/01/idf.webp",
    "https://media.anytime-soccer.com/wp-content/uploads/2026/02/futsal-scaled.jpg",
  ];

  return (
    <>
      <SitePopup />
      {/* ── Hero ──────────────────────────────────── */}
      <section className="bg-surface px-4 sm:px-6 lg:px-8 pt-6 pb-0">
        <div className="relative bg-primary rounded-[20px] overflow-hidden max-w-7xl mx-auto">
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
            <div className="flex items-center gap-12">
              {/* Left Column — Text Content */}
              <div className="flex-1 min-w-0">
                <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">
                  Welcome to Soccer Near Me
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                  Find the perfect youth soccer<RotatingText /> near you
                </h1>
                <p className="text-white/70 text-lg md:text-xl mb-8 max-w-2xl">
                  Search our directory of verified clubs, teams, private trainers, camps, and guest player opportunities. All in one place.
                </p>

                {/* Search Bar */}
                <HeroSearchBar />

                {/* Search Shortcuts */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {[
                    { label: "🏟️ Clubs", href: "/clubs" },
                    { label: "👥 Teams", href: "/teams" },
                    { label: "⚽ Futsal", href: "/futsal" },
                    { label: "🎯 Trainers", href: "/trainers" },
                    { label: "⛺ Camps", href: "/camps" },
                    { label: "🤝 Guest Play", href: "/guest-play" },
                    { label: "🏆 Tournaments", href: "/tournaments" },
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium text-sm hover:bg-white/20 hover:border-white/20 transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="flex gap-8 text-white/50 text-sm">
                  <div><span className="text-white font-bold text-xl">{clubs.length}+</span> Clubs</div>
                  <div><span className="text-white font-bold text-xl">{teams.length}+</span> Teams</div>
                  <div><span className="text-white font-bold text-xl">{trainers.length}+</span> Trainers</div>
                  <div><span className="text-white font-bold text-xl">{camps.length}+</span> Camps</div>
                </div>
              </div>

              {/* Right Column — Hero Image + Floating Cards */}
              <div className="hidden lg:block relative w-[420px] shrink-0">
                <div className="relative">
                  <img
                    src="/hero-soccer.webp"
                    alt="Youth soccer players training"
                    className="w-full h-[480px] object-cover rounded-2xl"
                  />

                  {/* Floating Card 1 — top-left */}
                  <div className="absolute -top-4 -left-8 bg-white rounded-xl shadow-xl p-4 w-52 animate-float">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary">Charlotte FC 2012</span>
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">2012</span>
                    </div>
                    <span className="inline-block text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mr-1">Boys</span>
                    <span className="inline-block text-[10px] font-semibold bg-red-50 text-[#DC373E] px-2 py-0.5 rounded-full">Recruiting</span>
                    <p className="text-xs text-muted mt-2">Charlotte, NC</p>
                  </div>

                  {/* Floating Card 2 — bottom-right */}
                  <div className="absolute -bottom-4 -right-6 bg-white rounded-xl shadow-xl p-4 w-52 animate-float-alt">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary">NC Fusion ECNL</span>
                      <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-full">2011</span>
                    </div>
                    <span className="inline-block text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full mr-1">Girls</span>
                    <span className="inline-block text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">ECNL</span>
                    <p className="text-xs text-muted mt-2">Greensboro, NC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 mt-6 mb-8">
      <div className="bg-white rounded-[20px] max-w-7xl mx-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Featured Clubs ─────────────────────── */}
        <SectionCarousel title="Featured Clubs" subtitle="Top youth soccer organizations" viewAllHref="/clubs">
          {featuredClubs.map((club) => (
            <div key={club.id} className="flex-shrink-0 w-[320px]">
              <ListingCard
                href={`/clubs/${club.slug}`}
                title={club.name}
                subtitle={`${club.city}, ${club.state}`}
                image={club.teamPhoto && !club.teamPhoto.includes("idf.webp") ? club.teamPhoto : club.logo || club.imageUrl || undefined}
                badges={[
                  { label: club.level, variant: club.level.includes("MLS") ? "purple" : "blue" },
                  { label: club.gender },
                ]}
                details={[
                  { label: "Teams", value: String(club.teamCount) },
                  { label: "Ages", value: club.ageGroups },
                ]}
                featured
                imagePosition={club.imagePosition}
                cta="View Club"
              />
            </div>
          ))}
        </SectionCarousel>

        {/* ── New Listings Carousel ─────────────── */}
        <ListingCarousel listings={newListings.map(l => ({ ...l, slug: l.slug }))} />

        {/* ── Featured Teams ─────────────────────── */}
        <SectionCarousel title="Teams Looking for Players" subtitle="Open roster spots across the region" viewAllHref="/teams">
          {featuredTeams.map((team) => (
            <div key={team.id} className="flex-shrink-0 w-[320px]">
              <ListingCard href={`/teams/${team.slug}`} title={team.name} subtitle={`${team.clubName} · ${team.city}, ${team.state}`} image={team.teamPhoto && !team.teamPhoto.includes("idf.webp") ? team.teamPhoto : team.logo || team.imageUrl || undefined} badges={[{ label: team.level, variant: "blue" }, { label: team.gender, variant: team.gender === "Boys" ? "blue" : "purple" }, ...(team.lookingForPlayers ? [{ label: "Recruiting", variant: "green" as const }] : [])]} details={[{ label: "Birth Year", value: team.ageGroup }, { label: "Coach", value: team.coach }, { label: "Season", value: team.season }]} featured imagePosition={team.imagePosition} cta="View Team" />
            </div>
          ))}
        </SectionCarousel>

        {/* ── Featured Futsal Teams ─────────────── */}
        {featuredFutsal.length > 0 && (
          <SectionCarousel title="Futsal Teams" subtitle="Find futsal teams near you" viewAllHref="/futsal">
            {featuredFutsal.map((team) => (
              <div key={team.id} className="flex-shrink-0 w-[320px]">
                <ListingCard href={`/futsal/${team.slug}`} title={team.name} subtitle={`${team.clubName || ""} · ${team.city}, ${team.state}`} image={team.teamPhoto && !team.teamPhoto.includes("idf.webp") ? team.teamPhoto : team.logo || team.imageUrl || undefined} badges={[{ label: team.level, variant: "blue" }, { label: team.gender, variant: team.gender === "Boys" ? "blue" : "purple" }, { label: team.format, variant: "orange" }]} details={[{ label: "Age Group", value: team.ageGroup }, { label: "Coach", value: team.coach }, { label: "Season", value: team.season }]} featured imagePosition={team.imagePosition} cta="View Team" />
              </div>
            ))}
          </SectionCarousel>
        )}

        {/* ── Anytime CTA Mid-page ──────────────── */}
        <section className="py-8">
          <AnytimeInlineCTA />
        </section>

        {/* ── Featured Trainers ──────────────────── */}
        <SectionCarousel title="Private Trainers" subtitle="Verified coaches offering 1-on-1 and small group training" viewAllHref="/trainers">
          {featuredTrainers.map((trainer) => (
            <div key={trainer.id} className="flex-shrink-0 w-[320px]">
              <ListingCard href={`/trainers/${trainer.slug}`} title={trainer.name} subtitle={`${trainer.city}, ${trainer.state}`} image={trainer.teamPhoto && !trainer.teamPhoto.includes("idf.webp") ? trainer.teamPhoto : trainer.logo || trainer.imageUrl || undefined} badges={[{ label: trainer.specialty, variant: "green" }]} details={[{ label: "Price", value: trainer.priceRange }, { label: "Rating", value: `⭐ ${trainer.rating} (${trainer.reviewCount})` }, { label: "Experience", value: trainer.experience }]} featured={trainer.featured} imagePosition={trainer.imagePosition} cta="View Trainer" />
            </div>
          ))}
        </SectionCarousel>

        {/* ── Featured Camps ─────────────────────── */}
        <SectionCarousel title="Upcoming Camps & Clinics" subtitle="Registration open for summer 2026" viewAllHref="/camps">
          {featuredCamps.map((camp) => (
            <div key={camp.id} className="flex-shrink-0 w-[320px]">
              <ListingCard href={`/camps/${camp.slug}`} title={camp.name} subtitle={`${camp.organizerName} · ${camp.city}, ${camp.state}`} image={camp.teamPhoto && !camp.teamPhoto.includes("idf.webp") ? camp.teamPhoto : camp.logo || camp.imageUrl || undefined} badges={[{ label: camp.campType, variant: "orange" }, { label: camp.gender }]} details={[{ label: "Ages", value: camp.ageRange }, { label: "Dates", value: camp.dates }, { label: "Price", value: camp.price }]} featured={camp.featured} imagePosition={camp.imagePosition} cta="View Camp" />
            </div>
          ))}
        </SectionCarousel>

        {/* ── Featured Tournaments ──────────────── */}
        <SectionCarousel title="Upcoming Tournaments" subtitle="Register your team for top events" viewAllHref="/tournaments">
          {featuredTournaments.map((tournament) => (
            <div key={tournament.id} className="flex-shrink-0 w-[320px]">
              <ListingCard href={`/tournaments/${tournament.slug}`} title={tournament.name} subtitle={`${tournament.organizer} · ${tournament.city}, ${tournament.state}`} image={tournament.teamPhoto && !tournament.teamPhoto.includes("idf.webp") ? tournament.teamPhoto : tournament.logo || tournament.imageUrl || undefined} badges={[{ label: tournament.level, variant: "blue" }, { label: tournament.format, variant: "orange" }]} details={[{ label: "Dates", value: tournament.dates }, { label: "Ages", value: tournament.ageGroups }, { label: "Entry Fee", value: tournament.entryFee }]} featured={tournament.featured} imagePosition={tournament.imagePosition} cta="View Tournament" />
            </div>
          ))}
        </SectionCarousel>

        {/* ── Blog Preview ───────────────────────── */}
        <SectionCarousel title="From the Blog" subtitle="Guides and tips for soccer parents" viewAllHref="/blog">
          {featuredPosts.map((post, i) => (
            <a key={post.id} href={`/blog/${post.slug}`} className="flex-shrink-0 w-[320px] group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="relative">
                <img src={post.coverImage && post.coverImage.startsWith("http") ? post.coverImage : BLOG_COVER_IMAGES[i % BLOG_COVER_IMAGES.length]} alt={post.title} className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <Badge variant="orange">{post.category}</Badge>
                  <h3 className="font-[family-name:var(--font-display)] text-base font-bold mt-1.5 text-white leading-snug line-clamp-2 drop-shadow-sm">{post.title}</h3>
                </div>
              </div>
              <div className="p-4 pt-3">
                <p className="text-muted text-sm line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-muted mt-2">
                  <span>{post.date}</span><span>&middot;</span><span>{post.readTime} read</span>
                </div>
              </div>
            </a>
          ))}
        </SectionCarousel>

        {/* ── List Your Club CTA ─────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="bg-surface rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-4">
              Are you a club, coach, or trainer?
            </h2>
            <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
              Get discovered by thousands of soccer families. Create your free listing and start connecting with players today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/dashboard" className="px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors">
                Create Free Listing
              </a>
              <a href="/blog/how-it-works" className="px-8 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors">
                Learn How It Works
              </a>
            </div>
          </div>
        </section>
      </div>
      </div>
      </div>
    </>
  );
}
