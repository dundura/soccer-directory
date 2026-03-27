import {
  getClubs, getTeams, getTrainers, getCamps, getTournaments, getFutsalTeams, getBlogPosts,
  getPlayerProfiles, getTryouts, getSpecialEvents, getPodcasts, getYoutubeChannels,
  getFacebookGroups, getInstagramPages, getTikTokPages, getServices, getTrainingApps,
  getBlogs, getSoccerBooks, getPhotoVideoServices, getScrimmages,
} from "@/lib/db";
import { getNewsArticles, type NewsArticle } from "@/lib/news";
import { ListingCard, Badge, AnytimeInlineCTA } from "@/components/ui";
import { HeroSearchBar } from "@/components/hero-search";
import { RotatingText } from "@/components/rotating-text";
import SitePopup from "@/components/site-popup";
import { SectionCarousel } from "@/components/section-carousel";
import { ExpandableCategories } from "@/components/expandable-categories";

export const dynamic = "force-dynamic";

/* ── Helpers ──────────────────────────────────────────────── */

/** Truncate text to a word limit */
function truncateWords(text: string | undefined | null, limit: number): string {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "...";
}

/** Normalize a listing into a common shape for the row component */
interface RowListing {
  id: string;
  name: string;
  slug: string;
  href: string;
  image?: string | null;
  city: string;
  state: string;
  pills: string[];
  description: string;
  featured: boolean;
  typeBadge?: string;
}

function toRowListing(
  item: Record<string, any>,
  pathPrefix: string,
  nameField: string,
  pillFields: string[],
  typeBadge?: string,
): RowListing {
  const img = item.logo || item.teamPhoto || item.imageUrl || item.image_url;
  return {
    id: item.id,
    name: item[nameField] || item.name || "",
    slug: item.slug,
    href: `/${pathPrefix}/${item.slug}`,
    image: img && !String(img).includes("idf.webp") ? img : null,
    city: item.city || "",
    state: item.state || "",
    pills: pillFields.map((f) => item[f]).filter(Boolean).map(String),
    description: truncateWords(item.description, 30),
    featured: !!item.featured,
    typeBadge,
  };
}

/** Sort by featured DESC, then randomize within each group */
function sortFeaturedFirst<T extends { featured: boolean }>(items: T[]): T[] {
  const featured = [...items].filter((i) => i.featured).sort(() => Math.random() - 0.5);
  const rest = [...items].filter((i) => !i.featured).sort(() => Math.random() - 0.5);
  return [...featured, ...rest];
}

/* ── Row Component (GPS-style) ────────────────────────────── */

function ListingRow({ listing }: { listing: RowListing }) {
  return (
    <a
      href={listing.href}
      className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Red accent trim */}
      <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />

      {/* Image thumbnail */}
      <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
          {listing.image ? (
            <img src={listing.image} alt={listing.name} className="w-full h-full object-contain p-1" />
          ) : (
            <svg className="w-10 h-10 text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Row content */}
      <div className="flex items-start gap-5 sm:gap-6 flex-1 min-w-0 p-5 sm:p-6">
        <div className="flex-1 min-w-0">
          {listing.typeBadge && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{listing.typeBadge}</span>
          )}
          <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
            {listing.name}
          </h3>
          <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {listing.city}{listing.city && listing.state ? ", " : ""}{listing.state}
          </p>
          {listing.pills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {listing.pills.map((pill, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{pill}</span>
              ))}
            </div>
          )}
          {listing.description && (
            <p className="text-sm text-primary mt-2.5 line-clamp-2 hidden sm:block leading-relaxed">{listing.description}</p>
          )}
        </div>
      </div>

      {/* Arrow panel */}
      <div className="hidden sm:flex items-center justify-center w-14 md:w-16 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
        <span className="text-white text-2xl font-light">&#8250;</span>
      </div>
    </a>
  );
}

/* ── Category Section (3 rows + View All) ─────────────────── */

function CategorySection({ title, viewAllHref, listings }: { title: string; viewAllHref: string; listings: RowListing[] }) {
  if (listings.length === 0) return null;
  const shown = listings.slice(0, 3);
  return (
    <section className="py-10 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold">{title}</h2>
        <a href={viewAllHref} className="text-sm font-semibold text-accent-hover hover:text-accent transition-colors">
          View All &rarr;
        </a>
      </div>
      <div className="space-y-3">
        {shown.map((listing) => (
          <ListingRow key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default async function HomePage() {
  const [
    clubs, teams, trainers, camps, tournaments, futsalTeams, blogPosts,
    players, tryouts, specialEvents, podcasts, youtubeChannels,
    facebookGroups, instagramPages, tiktokPages, services, trainingApps,
    blogs, soccerBooks, photoVideoServices, scrimmages,
  ] = await Promise.all([
    getClubs(), getTeams(), getTrainers(), getCamps(), getTournaments(), getFutsalTeams(), getBlogPosts(),
    getPlayerProfiles(), getTryouts(), getSpecialEvents(), getPodcasts(), getYoutubeChannels(),
    getFacebookGroups(), getInstagramPages(), getTikTokPages(), getServices(), getTrainingApps(),
    getBlogs(), getSoccerBooks(), getPhotoVideoServices(), getScrimmages(),
  ]);

  const newsArticles = await getNewsArticles();

  /* ── Featured carousel: pool all featured from every category ── */
  const featuredPool: RowListing[] = [
    ...clubs.filter((c) => c.featured).map((c) => toRowListing(c, "clubs", "name", [c.level, c.gender], "Club")),
    ...teams.filter((t) => t.featured).map((t) => toRowListing(t, "teams", "name", [t.level, t.gender, t.ageGroup], "Team")),
    ...trainers.filter((t) => t.featured).map((t) => toRowListing(t, "trainers", "name", [t.specialty], "Trainer")),
    ...camps.filter((c) => c.featured).map((c) => toRowListing(c, "camps", "name", [c.campType, c.gender], "Camp")),
    ...tournaments.filter((t) => t.featured).map((t) => toRowListing(t, "tournaments", "name", [t.level, t.format], "Tournament")),
    ...tryouts.filter((t) => t.featured).map((t) => toRowListing(t, "tryouts", "name", [t.tryoutType, t.gender], "Tryout")),
    ...specialEvents.filter((e) => e.featured).map((e) => toRowListing(e, "special-events", "name", [e.eventType, e.gender], "Event")),
    ...players.filter((p) => p.featured).map((p) => toRowListing({ ...p, name: p.playerName }, "players", "name", [p.position, p.level], "Player")),
    ...futsalTeams.filter((t) => t.featured).map((t) => toRowListing(t, "futsal", "name", [t.level, t.format], "Futsal")),
    ...scrimmages.filter((s) => s.featured).map((s) => toRowListing({ ...s, name: s.teamName }, "scrimmages", "name", [s.level, s.ageGroup], "Scrimmage")),
    ...podcasts.filter((p) => p.featured).map((p) => toRowListing(p, "podcasts", "name", [p.category], "Podcast")),
    ...youtubeChannels.filter((y) => y.featured).map((y) => toRowListing(y, "youtube", "name", [y.category], "YouTube")),
    ...blogs.filter((b) => b.featured).map((b) => toRowListing(b, "blogs", "name", [b.category], "Blog")),
    ...facebookGroups.filter((f) => f.featured).map((f) => toRowListing(f, "facebook-groups", "name", [f.category], "Facebook")),
    ...instagramPages.filter((i) => i.featured).map((i) => toRowListing(i, "instagram", "name", [i.category], "Instagram")),
    ...tiktokPages.filter((t) => t.featured).map((t) => toRowListing(t, "tiktok", "name", [t.category], "TikTok")),
    ...services.filter((s) => s.featured).map((s) => toRowListing(s, "services", "name", [s.category], "Service")),
    ...trainingApps.filter((a) => a.featured).map((a) => toRowListing(a, "training-apps", "name", [a.category], "App")),
    ...soccerBooks.filter((b) => b.featured).map((b) => toRowListing(b, "books", "name", [b.category], "Book")),
    ...photoVideoServices.filter((p) => p.featured).map((p) => toRowListing(p, "photo-video", "name", [p.category], "Photo/Video")),
  ].sort(() => Math.random() - 0.5);

  /* ── Main category row data (sorted featured first, take 3) ── */
  const clubRows = sortFeaturedFirst(clubs).map((c) => toRowListing(c, "clubs", "name", [c.level, c.gender]));
  const teamRows = sortFeaturedFirst(teams).map((t) => toRowListing(t, "teams", "name", [t.level, t.gender, t.ageGroup]));
  const playerRows = sortFeaturedFirst(players).map((p) => toRowListing({ ...p, name: p.playerName }, "players", "name", [p.position, p.level, p.gender]));
  const trainerRows = sortFeaturedFirst(trainers).map((t) => toRowListing(t, "trainers", "name", [t.specialty, t.priceRange]));
  const campRows = sortFeaturedFirst(camps).map((c) => toRowListing(c, "camps", "name", [c.campType, c.gender, c.ageRange]));
  const tryoutRows = sortFeaturedFirst(tryouts).map((t) => toRowListing(t, "tryouts", "name", [t.tryoutType, t.gender, t.ageGroup]));
  const tournamentRows = sortFeaturedFirst(tournaments).map((t) => toRowListing(t, "tournaments", "name", [t.level, t.format, t.ageGroups]));
  const specialEventRows = sortFeaturedFirst(specialEvents).map((e) => toRowListing(e, "special-events", "name", [e.eventType, e.gender, e.ageGroup]));

  /* ── More categories row data ── */
  const futsalRows = sortFeaturedFirst(futsalTeams).map((t) => toRowListing(t, "futsal", "name", [t.level, t.format, t.gender]));
  const scrimmageRows = sortFeaturedFirst(scrimmages).map((s) => toRowListing({ ...s, name: s.teamName }, "scrimmages", "name", [s.level, s.ageGroup, s.gender]));
  const podcastRows = sortFeaturedFirst(podcasts).map((p) => toRowListing(p, "podcasts", "name", [p.category]));
  const youtubeRows = sortFeaturedFirst(youtubeChannels).map((y) => toRowListing(y, "youtube", "name", [y.category]));
  const blogRows = sortFeaturedFirst(blogs).map((b) => toRowListing(b, "blogs", "name", [b.category]));
  const fbGroupRows = sortFeaturedFirst(facebookGroups).map((f) => toRowListing(f, "facebook-groups", "name", [f.category, f.privacy]));
  const instaRows = sortFeaturedFirst(instagramPages).map((i) => toRowListing(i, "instagram", "name", [i.category]));
  const tiktokRows = sortFeaturedFirst(tiktokPages).map((t) => toRowListing(t, "tiktok", "name", [t.category]));
  const serviceRows = sortFeaturedFirst(services).map((s) => toRowListing(s, "services", "name", [s.category]));
  const appRows = sortFeaturedFirst(trainingApps).map((a) => toRowListing(a, "training-apps", "name", [a.category]));
  const bookRows = sortFeaturedFirst(soccerBooks).map((b) => toRowListing(b, "books", "name", [b.category]));
  const photoVideoRows = sortFeaturedFirst(photoVideoServices).map((p) => toRowListing(p, "photo-video", "name", [p.category]));

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
              {/* Left Column -- Text Content */}
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

              {/* Right Column -- Hero Image + Floating Cards */}
              <div className="hidden lg:block relative w-[420px] shrink-0">
                <div className="relative">
                  <img
                    src="/hero-soccer.webp"
                    alt="Youth soccer players training"
                    className="w-full h-[480px] object-cover rounded-2xl"
                  />

                  {/* Floating Card 1 -- top-left */}
                  <div className="absolute -top-4 -left-8 bg-white rounded-xl shadow-xl p-4 w-52 animate-float">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary">Charlotte FC 2012</span>
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">2012</span>
                    </div>
                    <span className="inline-block text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mr-1">Boys</span>
                    <span className="inline-block text-[10px] font-semibold bg-red-50 text-[#DC373E] px-2 py-0.5 rounded-full">Recruiting</span>
                    <p className="text-xs text-muted mt-2">Charlotte, NC</p>
                  </div>

                  {/* Floating Card 2 -- bottom-right */}
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

        {/* ── Featured Listings Carousel ───────────── */}
        {featuredPool.length > 0 && (
          <SectionCarousel title="Featured Listings" subtitle="Handpicked from across all categories" viewAllHref="/clubs">
            {featuredPool.slice(0, 20).map((listing) => (
              <div key={`${listing.typeBadge}-${listing.id}`} className="flex-shrink-0 w-[320px]">
                <ListingCard
                  href={listing.href}
                  title={listing.name}
                  subtitle={`${listing.city}${listing.city && listing.state ? ", " : ""}${listing.state}`}
                  image={listing.image || undefined}
                  badges={[
                    ...(listing.typeBadge ? [{ label: listing.typeBadge, variant: "red" as const }] : []),
                    ...listing.pills.slice(0, 2).map((p) => ({ label: p, variant: "blue" as const })),
                  ]}
                  description={listing.description}
                  details={[]}
                  featured
                  cta={`View ${listing.typeBadge || "Listing"}`}
                />
              </div>
            ))}
          </SectionCarousel>
        )}

        {/* ── Soccer News Carousel ────────────────── */}
        {newsArticles.length > 0 && (
          <SectionCarousel title="Soccer News" subtitle="Latest headlines from top soccer sources">
            {newsArticles.map((article, idx) => (
              <a
                key={idx}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[320px] group flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 h-full"
              >
                {/* Image */}
                <div className="w-full h-44 overflow-hidden bg-surface flex-shrink-0">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Source badge */}
                  <span className={`self-start px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 ${
                    article.source === "ESPN" ? "bg-red-50 text-red-700" :
                    article.source === "BBC" ? "bg-blue-50 text-blue-700" :
                    article.source === "The Guardian" ? "bg-indigo-50 text-indigo-700" :
                    article.source === "MLS" ? "bg-purple-50 text-purple-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {article.source}
                  </span>

                  {/* Title */}
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary leading-tight line-clamp-2 group-hover:text-accent transition-colors mb-2">
                    {article.title}
                  </h3>

                  {/* Description */}
                  {article.description && (
                    <p className="text-sm text-muted line-clamp-2 leading-relaxed mb-3 flex-1">
                      {article.description}
                    </p>
                  )}

                  {/* Date */}
                  <p className="text-xs text-muted mt-auto">
                    {article.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </a>
            ))}
          </SectionCarousel>
        )}

        {/* ── Main Category Sections (3 rows each) ── */}
        <CategorySection title="Clubs" viewAllHref="/clubs" listings={clubRows} />
        <CategorySection title="Teams" viewAllHref="/teams" listings={teamRows} />
        <CategorySection title="Trainers" viewAllHref="/trainers" listings={trainerRows} />
        <CategorySection title="Camps" viewAllHref="/camps" listings={campRows} />
        <CategorySection title="Tryouts" viewAllHref="/tryouts" listings={tryoutRows} />
        <CategorySection title="Tournaments" viewAllHref="/tournaments" listings={tournamentRows} />
        <CategorySection title="Special Events" viewAllHref="/special-events" listings={specialEventRows} />
        <CategorySection title="Players" viewAllHref="/players" listings={playerRows} />

        {/* ── More Categories (expandable) ────────── */}
        <ExpandableCategories>
          <CategorySection title="Futsal" viewAllHref="/futsal" listings={futsalRows} />
          <CategorySection title="Scrimmages" viewAllHref="/scrimmages" listings={scrimmageRows} />
          <CategorySection title="Podcasts" viewAllHref="/podcasts" listings={podcastRows} />
          <CategorySection title="YouTube Channels" viewAllHref="/youtube" listings={youtubeRows} />
          <CategorySection title="Blogs" viewAllHref="/blogs" listings={blogRows} />
          <CategorySection title="Facebook Groups" viewAllHref="/facebook-groups" listings={fbGroupRows} />
          <CategorySection title="Instagram Pages" viewAllHref="/instagram" listings={instaRows} />
          <CategorySection title="TikTok Pages" viewAllHref="/tiktok" listings={tiktokRows} />
          <CategorySection title="Services" viewAllHref="/services" listings={serviceRows} />
          <CategorySection title="Training Apps" viewAllHref="/training-apps" listings={appRows} />
          <CategorySection title="Books" viewAllHref="/books" listings={bookRows} />
          <CategorySection title="Photo/Video Services" viewAllHref="/photo-video" listings={photoVideoRows} />
        </ExpandableCategories>

        {/* ── Anytime CTA ──────────────── */}
        <section className="py-8">
          <AnytimeInlineCTA />
        </section>

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
