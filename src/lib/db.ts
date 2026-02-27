import { neon } from "@neondatabase/serverless";
import type { Club, Team, TeamEvent, Trainer, Camp, GuestOpportunity, BlogPost, Tournament, FutsalTeam, InternationalTrip, MarketplaceItem, PlayerProfile, Podcast, TopEpisode, FacebookGroup, Service, ProfileFields, MediaLink, Review, ReviewerRole, ReviewStatus, ForumTopic, ForumCategory, ForumComment, GuestPost, GuestPostCategory, GuestPostComment } from "./types";

const sql = neon(process.env.DATABASE_URL!);

// ── Type normalization (virtual → DB) ────────────────────────
function normalizeType(type: string): string {
  if (type === "equipment" || type === "books") return "marketplace";
  if (type === "showcase") return "camp";
  return type;
}

// ── Shared profile field mapper ──────────────────────────────
function mapProfileFields(r: Record<string, unknown>): ProfileFields {
  let photos: string[] | undefined;
  if (r.photos) {
    try { photos = JSON.parse(r.photos as string); } catch { photos = undefined; }
  }
  let schedule: string[] | undefined;
  if (r.practice_schedule) {
    try { schedule = JSON.parse(r.practice_schedule as string); } catch { schedule = undefined; }
  }
  let sm: ProfileFields["socialMedia"];
  if (r.social_media) {
    try { sm = JSON.parse(r.social_media as string); } catch { sm = undefined; }
  }
  let mediaLinks: MediaLink[] | undefined;
  if (r.media_links) {
    try { mediaLinks = JSON.parse(r.media_links as string); } catch { mediaLinks = undefined; }
  }
  return {
    teamPhoto: r.team_photo as string | undefined,
    photos,
    videoUrl: r.video_url as string | undefined,
    practiceSchedule: schedule,
    address: r.address as string | undefined,
    imageUrl: r.image_url as string | undefined,
    logo: r.logo as string | undefined,
    socialMedia: sm,
    phone: r.phone as string | undefined,
    mediaLinks,
  };
}

// ── Clubs ────────────────────────────────────────────────────
export async function getClubs(): Promise<Club[]> {
  const rows = await sql`SELECT * FROM clubs WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapClub);
}

export async function getClubBySlug(slug: string): Promise<Club | null> {
  const rows = await sql`SELECT * FROM clubs WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapClub(rows[0]) : null;
}

export async function getClubById(id: string): Promise<Club | null> {
  const rows = await sql`SELECT * FROM clubs WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapClub(rows[0]) : null;
}

export async function getClubSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM clubs WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapClub(r: Record<string, unknown>): Club {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    level: r.level as string, league: r.league as string | undefined, leagueUrl: r.league_url as string | undefined,
    ageGroups: r.age_groups as string, gender: r.gender as string,
    teamCount: r.team_count as number, description: r.description as string,
    website: r.website as string | undefined, email: r.email as string | undefined,
    blogUrl: r.blog_url as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    ...mapProfileFields(r),
  };
}

// ── Teams ────────────────────────────────────────────────────
export async function getTeams(): Promise<Team[]> {
  const rows = await sql`SELECT * FROM teams WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapTeam);
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const rows = await sql`SELECT * FROM teams WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapTeam(rows[0]) : null;
}

export async function getTeamSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM teams WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

export async function getTeamsByClubId(clubId: string): Promise<Team[]> {
  const rows = await sql`SELECT * FROM teams WHERE club_id = ${clubId} AND status = 'approved' ORDER BY name ASC`;
  return rows.map(mapTeam);
}

export async function getSimilarTeams(slug: string, state: string, ageGroup: string, limit = 3): Promise<Team[]> {
  const rows = await sql`SELECT * FROM teams WHERE slug != ${slug} AND status = 'approved' AND (state = ${state} OR age_group = ${ageGroup}) ORDER BY CASE WHEN state = ${state} AND age_group = ${ageGroup} THEN 0 WHEN state = ${state} THEN 1 ELSE 2 END, featured DESC LIMIT ${limit}`;
  return rows.map(mapTeam);
}

function mapTeam(r: Record<string, unknown>): Team {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    clubId: r.club_id as string | undefined, clubName: r.club_name as string | undefined,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    level: r.level as string, ageGroup: r.age_group as string, gender: r.gender as string,
    coach: r.coach as string, lookingForPlayers: r.looking_for_players as boolean,
    positionsNeeded: r.positions_needed as string | undefined,
    season: r.season as string, description: r.description as string | undefined,
    events: r.events ? (() => { try { return JSON.parse(r.events as string) as TeamEvent[]; } catch { return undefined; } })() : undefined,
    annualTournaments: r.annual_tournaments ? (() => { try { return JSON.parse(r.annual_tournaments as string) as string[]; } catch { return undefined; } })() : undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    ...mapProfileFields(r),
  };
}

// ── Trainers ─────────────────────────────────────────────────
export async function getTrainers(): Promise<Trainer[]> {
  const rows = await sql`SELECT * FROM trainers WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapTrainer);
}

export async function getTrainerBySlug(slug: string): Promise<Trainer | null> {
  const rows = await sql`SELECT * FROM trainers WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapTrainer(rows[0]) : null;
}

export async function getTrainerSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM trainers WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapTrainer(r: Record<string, unknown>): Trainer {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    specialty: r.specialty as string, experience: r.experience as string,
    credentials: r.credentials as string, priceRange: r.price_range as string,
    serviceArea: r.service_area as string, description: r.description as string | undefined,
    rating: Number(r.rating), reviewCount: Number(r.review_count),
    website: r.website as string | undefined, email: r.email as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    ...mapProfileFields(r),
  };
}

// ── Camps ────────────────────────────────────────────────────
export async function getCamps(): Promise<Camp[]> {
  const rows = await sql`SELECT * FROM camps WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapCamp);
}

export async function getCampBySlug(slug: string): Promise<Camp | null> {
  const rows = await sql`SELECT * FROM camps WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapCamp(rows[0]) : null;
}

export async function getCampSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM camps WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapCamp(r: Record<string, unknown>): Camp {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    organizerName: r.organizer_name as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    campType: r.camp_type as Camp["campType"],
    ageRange: r.age_range as string, dates: r.dates as string,
    price: r.price as string, gender: r.gender as string,
    location: r.location as string | undefined, description: r.description as string,
    registrationUrl: r.registration_url as string | undefined,
    email: r.email as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    ...mapProfileFields(r),
  };
}

// ── Guest Opportunities ──────────────────────────────────────
export async function getGuestOpportunities(): Promise<GuestOpportunity[]> {
  const rows = await sql`SELECT * FROM guest_opportunities WHERE status = 'approved' ORDER BY featured DESC, team_name ASC`;
  return rows.map(mapGuest);
}

export async function getGuestBySlug(slug: string): Promise<GuestOpportunity | null> {
  const rows = await sql`SELECT * FROM guest_opportunities WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapGuest(rows[0]) : null;
}

export async function getGuestSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM guest_opportunities WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapGuest(r: Record<string, unknown>): GuestOpportunity {
  return {
    id: r.id as string, slug: r.slug as string, teamName: r.team_name as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    level: r.level as string, ageGroup: r.age_group as string, gender: r.gender as string,
    dates: r.dates as string, tournament: r.tournament as string,
    positionsNeeded: r.positions_needed as string,
    contactEmail: r.contact_email as string,
    description: r.description as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    ...mapProfileFields(r),
  };
}

// ── Player Profiles ─────────────────────────────────────────
export async function getPlayerProfiles(): Promise<PlayerProfile[]> {
  const rows = await sql`SELECT * FROM player_profiles WHERE status = 'approved' ORDER BY featured DESC, player_name ASC`;
  return rows.map(mapPlayerProfile);
}

export async function getPlayerProfileBySlug(slug: string): Promise<PlayerProfile | null> {
  const rows = await sql`SELECT * FROM player_profiles WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapPlayerProfile(rows[0]) : null;
}

export async function getPlayerProfileSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM player_profiles WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapPlayerProfile(r: Record<string, unknown>): PlayerProfile {
  return {
    id: r.id as string, slug: r.slug as string, playerName: r.player_name as string,
    position: r.position as string, secondaryPosition: r.secondary_position as string | undefined,
    birthYear: r.birth_year as string, height: r.height as string | undefined,
    preferredFoot: r.preferred_foot as string | undefined,
    currentClub: r.current_club as string | undefined,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    level: r.level as string, gender: r.gender as string,
    gpa: r.gpa as string | undefined,
    description: r.description as string | undefined,
    lookingFor: r.looking_for as string | undefined,
    contactEmail: r.contact_email as string,
    videoUrl2: r.video_url_2 as string | undefined,
    videoUrl3: r.video_url_3 as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string,
    ...mapProfileFields(r),
  };
}

// ── Podcasts ────────────────────────────────────────────────
export async function getPodcasts(): Promise<Podcast[]> {
  const rows = await sql`SELECT * FROM podcasts WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapPodcast);
}

export async function getPodcastBySlug(slug: string): Promise<Podcast | null> {
  const rows = await sql`SELECT * FROM podcasts WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapPodcast(rows[0]) : null;
}

export async function getPodcastSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM podcasts WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapPodcast(r: Record<string, unknown>): Podcast {
  let topEpisodes: TopEpisode[] | undefined;
  if (r.top_episodes) {
    try { topEpisodes = JSON.parse(r.top_episodes as string); } catch { topEpisodes = undefined; }
  }
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    hostName: r.host_name as string, category: r.category as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    description: r.description as string | undefined,
    website: r.website as string | undefined,
    rssFeedUrl: r.rss_feed_url as string | undefined,
    followUrl: r.follow_url as string | undefined,
    email: r.email as string | undefined,
    topEpisodes,
    videoUrl2: r.video_url_2 as string | undefined,
    videoUrl3: r.video_url_3 as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── Facebook Groups ─────────────────────────────────────────
export async function getFacebookGroups(): Promise<FacebookGroup[]> {
  const rows = await sql`SELECT * FROM facebook_groups WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapFacebookGroup);
}

export async function getFacebookGroupBySlug(slug: string): Promise<FacebookGroup | null> {
  const rows = await sql`SELECT * FROM facebook_groups WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapFacebookGroup(rows[0]) : null;
}

export async function getFacebookGroupSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM facebook_groups WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapFacebookGroup(r: Record<string, unknown>): FacebookGroup {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    adminName: r.admin_name as string, category: r.category as string,
    groupUrl: r.group_url as string,
    memberCount: r.member_count as string | undefined,
    privacy: r.privacy as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    description: r.description as string | undefined,
    email: r.email as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── International Trips ─────────────────────────────────────
export async function getInternationalTrips(): Promise<InternationalTrip[]> {
  const rows = await sql`SELECT * FROM international_trips WHERE status = 'approved' ORDER BY featured DESC, trip_name ASC`;
  return rows.map(mapTrip);
}

export async function getTripBySlug(slug: string): Promise<InternationalTrip | null> {
  const rows = await sql`SELECT * FROM international_trips WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapTrip(rows[0]) : null;
}

export async function getTripSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM international_trips WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapTrip(r: Record<string, unknown>): InternationalTrip {
  return {
    id: r.id as string, slug: r.slug as string, tripName: r.trip_name as string,
    organizer: r.organizer as string, destination: r.destination as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    dates: r.dates as string, ageGroup: r.age_group as string, gender: r.gender as string,
    level: r.level as string, price: r.price as string | undefined,
    spotsAvailable: r.spots_available as string | undefined,
    contactEmail: r.contact_email as string,
    description: r.description as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    ...mapProfileFields(r),
  };
}

// ── Marketplace ─────────────────────────────────────────────
export async function getMarketplaceItems(): Promise<MarketplaceItem[]> {
  const rows = await sql`SELECT * FROM marketplace WHERE status = 'approved' ORDER BY featured DESC, created_at DESC`;
  return rows.map(mapMarketplaceItem);
}

export async function getMarketplaceItemBySlug(slug: string): Promise<MarketplaceItem | null> {
  const rows = await sql`SELECT * FROM marketplace WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapMarketplaceItem(rows[0]) : null;
}

function mapMarketplaceItem(r: Record<string, unknown>): MarketplaceItem {
  let photos: string[] | undefined;
  if (r.photos) {
    try { photos = JSON.parse(r.photos as string); } catch { photos = undefined; }
  }
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    category: r.category as string, description: r.description as string,
    price: r.price as string, condition: r.condition as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    contactEmail: r.contact_email as string, phone: r.phone as string | undefined,
    imageUrl: r.image_url as string | undefined, photos,
    featured: r.featured as boolean, createdAt: r.created_at as string,
  };
}

// ── Tournaments ──────────────────────────────────────────────
export async function getTournaments(): Promise<Tournament[]> {
  const rows = await sql`SELECT * FROM tournaments WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapTournament);
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  const rows = await sql`SELECT * FROM tournaments WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapTournament(rows[0]) : null;
}

export async function getTournamentSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM tournaments WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapTournament(r: Record<string, unknown>): Tournament {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    organizer: r.organizer as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    dates: r.dates as string, ageGroups: r.age_groups as string,
    gender: r.gender as string, level: r.level as string,
    entryFee: r.entry_fee as string, format: r.format as string,
    description: r.description as string,
    registrationUrl: r.registration_url as string | undefined,
    email: r.email as string | undefined,
    region: (r.region as string) || "US",
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    ...mapProfileFields(r),
  };
}

// ── Futsal Teams ────────────────────────────────────────────
export async function getFutsalTeams(): Promise<FutsalTeam[]> {
  const rows = await sql`SELECT * FROM futsal_teams WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapFutsalTeam);
}

export async function getFutsalTeamBySlug(slug: string): Promise<FutsalTeam | null> {
  const rows = await sql`SELECT * FROM futsal_teams WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapFutsalTeam(rows[0]) : null;
}

export async function getFutsalTeamSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM futsal_teams WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapFutsalTeam(r: Record<string, unknown>): FutsalTeam {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    clubName: r.club_name as string | undefined,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    level: r.level as string, ageGroup: r.age_group as string, gender: r.gender as string,
    coach: r.coach as string, lookingForPlayers: r.looking_for_players as boolean,
    positionsNeeded: r.positions_needed as string | undefined,
    season: r.season as string, description: r.description as string | undefined,
    format: r.format as string,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    ...mapProfileFields(r),
  };
}

// ── Blog Posts ───────────────────────────────────────────────
export async function getBlogPosts(): Promise<BlogPost[]> {
  const rows = await sql`SELECT * FROM blog_posts ORDER BY date DESC`;
  return rows.map(mapBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ? mapBlogPost(rows[0]) : null;
}

export async function getBlogPostSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM blog_posts`;
  return rows.map((r) => r.slug as string);
}

function mapBlogPost(r: Record<string, unknown>): BlogPost {
  return {
    id: r.id as string, slug: r.slug as string, title: r.title as string,
    excerpt: r.excerpt as string, content: r.content as string,
    category: r.category as string, date: r.date as string,
    readTime: r.read_time as string, featured: r.featured as boolean,
    coverImage: r.cover_image as string | undefined,
  };
}

// ── Users ────────────────────────────────────────────────────
export interface DbUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  if (!rows[0]) return null;
  const r = rows[0];
  return { id: r.id as string, email: r.email as string, name: r.name as string, passwordHash: r.password_hash as string, role: r.role as string };
}

export async function createUser(id: string, email: string, name: string, passwordHash: string): Promise<void> {
  await sql`INSERT INTO users (id, email, name, password_hash, role) VALUES (${id}, ${email}, ${name}, ${passwordHash}, 'user')`;
}

export async function updateUserProfile(userId: string, name: string, email: string): Promise<void> {
  await sql`UPDATE users SET name = ${name}, email = ${email} WHERE id = ${userId}`;
}

export async function deleteUserAccount(userId: string): Promise<void> {
  await sql`DELETE FROM teams WHERE user_id = ${userId}`;
  await sql`DELETE FROM clubs WHERE user_id = ${userId}`;
  await sql`DELETE FROM trainers WHERE user_id = ${userId}`;
  await sql`DELETE FROM camps WHERE user_id = ${userId}`;
  await sql`DELETE FROM guest_opportunities WHERE user_id = ${userId}`;
  await sql`DELETE FROM tournaments WHERE user_id = ${userId}`;
  await sql`DELETE FROM futsal_teams WHERE user_id = ${userId}`;
  await sql`DELETE FROM international_trips WHERE user_id = ${userId}`;
  await sql`DELETE FROM marketplace WHERE user_id = ${userId}`;
  await sql`DELETE FROM player_profiles WHERE user_id = ${userId}`;
  await sql`DELETE FROM services WHERE user_id = ${userId}`;
  await sql`DELETE FROM users WHERE id = ${userId}`;
}

// ── Admin ─────────────────────────────────────────────────────
export async function getAllUsers() {
  const rows = await sql`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    role: r.role as string,
    createdAt: r.created_at as string,
  }));
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`;
}

export async function getAllListings() {
  const [clubs, teams, trainers, camps, guests, tournaments, futsals, trips, marketplace, players, podcasts, fbgroups, services] = await Promise.all([
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'club' as type FROM clubs ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'team' as type FROM teams ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'trainer' as type FROM trainers ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, CASE WHEN camp_type = 'College Showcase' THEN 'showcase' ELSE 'camp' END as type FROM camps ORDER BY created_at DESC`,
    sql`SELECT id, slug, team_name as name, status, featured, user_id, created_at, 'guest' as type FROM guest_opportunities ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'tournament' as type FROM tournaments ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'futsal' as type FROM futsal_teams ORDER BY created_at DESC`,
    sql`SELECT id, slug, trip_name as name, status, featured, user_id, created_at, 'trip' as type FROM international_trips ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, CASE WHEN category = 'Books' THEN 'books' ELSE 'equipment' END as type FROM marketplace ORDER BY created_at DESC`,
    sql`SELECT id, slug, player_name as name, status, featured, user_id, created_at, 'player' as type FROM player_profiles ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'podcast' as type FROM podcasts ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'fbgroup' as type FROM facebook_groups ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'service' as type FROM services ORDER BY created_at DESC`,
  ]);
  return [...clubs, ...teams, ...trainers, ...camps, ...guests, ...tournaments, ...futsals, ...trips, ...marketplace, ...players, ...podcasts, ...fbgroups, ...services].map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    status: r.status as string,
    featured: r.featured as boolean,
    userId: r.user_id as string,
    createdAt: r.created_at as string,
    type: r.type as string,
  }));
}

export async function updateListingStatus(type: string, id: string, status: string): Promise<void> {
  type = normalizeType(type);
  switch (type) {
    case "club": await sql`UPDATE clubs SET status = ${status} WHERE id = ${id}`; break;
    case "team": await sql`UPDATE teams SET status = ${status} WHERE id = ${id}`; break;
    case "trainer": await sql`UPDATE trainers SET status = ${status} WHERE id = ${id}`; break;
    case "camp": await sql`UPDATE camps SET status = ${status} WHERE id = ${id}`; break;
    case "guest": await sql`UPDATE guest_opportunities SET status = ${status} WHERE id = ${id}`; break;
    case "tournament": await sql`UPDATE tournaments SET status = ${status} WHERE id = ${id}`; break;
    case "futsal": await sql`UPDATE futsal_teams SET status = ${status} WHERE id = ${id}`; break;
    case "trip": await sql`UPDATE international_trips SET status = ${status} WHERE id = ${id}`; break;
    case "marketplace": await sql`UPDATE marketplace SET status = ${status} WHERE id = ${id}`; break;
    case "player": await sql`UPDATE player_profiles SET status = ${status} WHERE id = ${id}`; break;
    case "podcast": await sql`UPDATE podcasts SET status = ${status} WHERE id = ${id}`; break;
    case "fbgroup": await sql`UPDATE facebook_groups SET status = ${status} WHERE id = ${id}`; break;
    case "service": await sql`UPDATE services SET status = ${status} WHERE id = ${id}`; break;
  }
}

export async function updateListingFeatured(type: string, id: string, featured: boolean): Promise<void> {
  type = normalizeType(type);
  switch (type) {
    case "club": await sql`UPDATE clubs SET featured = ${featured} WHERE id = ${id}`; break;
    case "team": await sql`UPDATE teams SET featured = ${featured} WHERE id = ${id}`; break;
    case "trainer": await sql`UPDATE trainers SET featured = ${featured} WHERE id = ${id}`; break;
    case "camp": await sql`UPDATE camps SET featured = ${featured} WHERE id = ${id}`; break;
    case "guest": await sql`UPDATE guest_opportunities SET featured = ${featured} WHERE id = ${id}`; break;
    case "tournament": await sql`UPDATE tournaments SET featured = ${featured} WHERE id = ${id}`; break;
    case "futsal": await sql`UPDATE futsal_teams SET featured = ${featured} WHERE id = ${id}`; break;
    case "trip": await sql`UPDATE international_trips SET featured = ${featured} WHERE id = ${id}`; break;
    case "marketplace": await sql`UPDATE marketplace SET featured = ${featured} WHERE id = ${id}`; break;
    case "player": await sql`UPDATE player_profiles SET featured = ${featured} WHERE id = ${id}`; break;
    case "podcast": await sql`UPDATE podcasts SET featured = ${featured} WHERE id = ${id}`; break;
    case "fbgroup": await sql`UPDATE facebook_groups SET featured = ${featured} WHERE id = ${id}`; break;
    case "service": await sql`UPDATE services SET featured = ${featured} WHERE id = ${id}`; break;
  }
}

// ── Listings by User ─────────────────────────────────────────
export async function getListingsByUserId(userId: string) {
  const [clubRows, teamRows, trainerRows, campRows, guestRows, tournamentRows, futsalRows, tripRows, marketplaceRows, playerRows, podcastRows, fbgroupRows, serviceRows] = await Promise.all([
    sql`SELECT id, slug, name, status, 'club' as type FROM clubs WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'team' as type FROM teams WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'trainer' as type FROM trainers WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, CASE WHEN camp_type = 'College Showcase' THEN 'showcase' ELSE 'camp' END as type FROM camps WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, team_name as name, status, 'guest' as type FROM guest_opportunities WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'tournament' as type FROM tournaments WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'futsal' as type FROM futsal_teams WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, trip_name as name, status, 'trip' as type FROM international_trips WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, CASE WHEN category = 'Books' THEN 'books' ELSE 'equipment' END as type FROM marketplace WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, player_name as name, status, 'player' as type FROM player_profiles WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'podcast' as type FROM podcasts WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'fbgroup' as type FROM facebook_groups WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'service' as type FROM services WHERE user_id = ${userId} ORDER BY created_at DESC`,
  ]);
  return [...clubRows, ...teamRows, ...trainerRows, ...campRows, ...guestRows, ...tournamentRows, ...futsalRows, ...tripRows, ...marketplaceRows, ...playerRows, ...podcastRows, ...fbgroupRows, ...serviceRows] as { id: string; slug: string; name: string; status: string; type: string }[];
}

// ── Create Listings ──────────────────────────────────────────
function profileFields(data: Record<string, string>) {
  return {
    teamPhoto: data.teamPhoto || null,
    photos: data.photos || null,
    videoUrl: data.videoUrl !== undefined ? (data.videoUrl || "") : null,
    practiceSchedule: data.practiceSchedule || null,
    address: data.address || null,
    mediaLinks: data.mediaLinks || null,
  };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function genId(): string {
  return "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function createClubListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO clubs (id, slug, name, city, country, state, level, league, league_url, age_groups, gender, team_count, description, website, email, phone, social_media, logo, image_url, team_photo, photos, video_url, practice_schedule, address, media_links, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.league || null}, ${data.leagueUrl || null}, ${data.ageGroups}, ${data.gender}, ${Number(data.teamCount) || 0}, ${data.description}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, ${pf.practiceSchedule}, ${pf.address}, ${pf.mediaLinks}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTeamListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO teams (id, slug, name, club_name, city, country, state, level, age_group, gender, coach, looking_for_players, positions_needed, season, description, phone, social_media, logo, image_url, team_photo, photos, video_url, practice_schedule, address, events, annual_tournaments, media_links, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.clubName || null}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.ageGroup}, ${data.gender}, ${data.coach}, ${data.lookingForPlayers === "true"}, ${data.positionsNeeded || null}, ${data.season}, ${data.description || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, ${pf.practiceSchedule}, ${pf.address}, ${data.events || null}, ${data.annualTournaments || null}, ${pf.mediaLinks}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTrainerListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO trainers (id, slug, name, city, country, state, specialty, experience, credentials, price_range, service_area, description, phone, social_media, logo, image_url, team_photo, photos, video_url, practice_schedule, address, rating, review_count, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.specialty}, ${data.experience}, ${data.credentials}, ${data.priceRange}, ${data.serviceArea}, ${data.description || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, ${pf.practiceSchedule}, ${pf.address}, 0, 0, false, ${userId}, 'approved')`;
  return slug;
}

export async function createCampListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO camps (id, slug, name, organizer_name, city, country, state, camp_type, age_range, dates, price, gender, location, description, registration_url, email, phone, social_media, logo, image_url, team_photo, photos, video_url, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.organizerName}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.campType}, ${data.ageRange}, ${data.dates}, ${data.price}, ${data.gender}, ${data.location || null}, ${data.description}, ${data.registrationUrl || null}, ${data.email || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createGuestListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.teamName + "-" + data.tournament);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO guest_opportunities (id, slug, team_name, city, country, state, level, age_group, gender, dates, tournament, positions_needed, contact_email, description, phone, social_media, logo, image_url, team_photo, photos, video_url, featured, user_id, status) VALUES (${id}, ${slug}, ${data.teamName}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.ageGroup}, ${data.gender}, ${data.dates}, ${data.tournament}, ${data.positionsNeeded}, ${data.contactEmail}, ${data.description || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTournamentListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO tournaments (id, slug, name, organizer, city, country, state, dates, age_groups, gender, level, entry_fee, format, description, registration_url, email, region, phone, social_media, logo, image_url, team_photo, photos, video_url, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.organizer}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.dates}, ${data.ageGroups}, ${data.gender}, ${data.level}, ${data.entryFee}, ${data.format}, ${data.description}, ${data.registrationUrl || null}, ${data.email || null}, ${data.region || 'US'}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createFutsalListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO futsal_teams (id, slug, name, club_name, city, country, state, level, age_group, gender, coach, looking_for_players, positions_needed, season, description, format, phone, social_media, logo, image_url, team_photo, photos, video_url, practice_schedule, address, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.clubName || null}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.ageGroup}, ${data.gender}, ${data.coach}, ${data.lookingForPlayers === "true"}, ${data.positionsNeeded || null}, ${data.season}, ${data.description || null}, ${data.format || '5v5'}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, ${pf.practiceSchedule}, ${pf.address}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTripListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.tripName + "-" + data.destination);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO international_trips (id, slug, trip_name, organizer, destination, city, country, state, dates, age_group, gender, level, price, spots_available, contact_email, description, phone, social_media, logo, image_url, team_photo, photos, video_url, featured, user_id, status) VALUES (${id}, ${slug}, ${data.tripName}, ${data.organizer}, ${data.destination}, ${data.city}, ${data.country || 'International'}, ${data.state || ''}, ${data.dates}, ${data.ageGroup}, ${data.gender}, ${data.level}, ${data.price || null}, ${data.spotsAvailable || null}, ${data.contactEmail}, ${data.description || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createMarketplaceListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  await sql`INSERT INTO marketplace (id, slug, name, category, description, price, condition, city, country, state, contact_email, phone, image_url, photos, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.category}, ${data.description}, ${data.price}, ${data.condition}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.contactEmail}, ${data.phone || null}, ${data.imageUrl || null}, ${data.photos || null}, false, ${userId}, 'pending')`;
  return slug;
}

export async function createPlayerProfile(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.playerName + "-" + data.birthYear);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO player_profiles (id, slug, player_name, position, secondary_position, birth_year, height, preferred_foot, current_club, city, country, state, level, gender, gpa, description, looking_for, contact_email, phone, social_media, logo, image_url, team_photo, photos, video_url, video_url_2, video_url_3, featured, user_id, status) VALUES (${id}, ${slug}, ${data.playerName}, ${data.position}, ${data.secondaryPosition || null}, ${data.birthYear}, ${data.height || null}, ${data.preferredFoot || null}, ${data.currentClub || null}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.gender}, ${data.gpa || null}, ${data.description || null}, ${data.lookingFor || null}, ${data.contactEmail}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, ${data.videoUrl2 || null}, ${data.videoUrl3 || null}, false, ${userId}, 'pending')`;
  return slug;
}

export async function createPodcastListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO podcasts (id, slug, name, host_name, category, city, country, state, description, website, rss_feed_url, follow_url, email, phone, top_episodes, social_media, logo, image_url, team_photo, photos, video_url, video_url_2, video_url_3, media_links, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.hostName}, ${data.category}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.description || null}, ${data.website || null}, ${data.rssFeedUrl || null}, ${data.followUrl || null}, ${data.email || null}, ${data.phone || null}, ${data.topEpisodes || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, ${data.videoUrl2 || null}, ${data.videoUrl3 || null}, ${pf.mediaLinks}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createFacebookGroupListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO facebook_groups (id, slug, name, admin_name, category, group_url, member_count, privacy, city, country, state, description, email, phone, social_media, logo, image_url, team_photo, photos, video_url, media_links, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.adminName}, ${data.category}, ${data.groupUrl}, ${data.memberCount || null}, ${data.privacy || 'Public'}, ${data.city || ''}, ${data.country || ''}, ${data.state || ''}, ${data.description || null}, ${data.email || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.photos}, ${pf.videoUrl}, ${pf.mediaLinks}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createServiceListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const pf = profileFields(data);
  await sql`INSERT INTO services (id, slug, name, provider_name, category, city, country, state, price, description, website, email, phone, image_url, photos, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.providerName}, ${data.category}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.price || null}, ${data.description || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${data.imageUrl || null}, ${pf.photos}, false, ${userId}, 'approved')`;
  return slug;
}

// ── Services ─────────────────────────────────────────────────
export async function getServices(): Promise<Service[]> {
  const rows = await sql`SELECT * FROM services WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapService);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const rows = await sql`SELECT * FROM services WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapService(rows[0]) : null;
}

export async function getServiceSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM services WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapService(r: Record<string, unknown>): Service {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    providerName: r.provider_name as string, category: r.category as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    price: r.price as string | undefined, description: r.description as string | undefined,
    website: r.website as string | undefined, email: r.email as string | undefined,
    featured: r.featured as boolean, status: r.status as string | undefined,
    userId: r.user_id as string | undefined, createdAt: r.created_at as string,
    updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── Get Listing Data (for editing) ───────────────────────────
export async function getListingData(type: string, id: string, userId: string): Promise<Record<string, string> | null> {
  type = normalizeType(type);
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club":
      rows = await sql`SELECT * FROM clubs WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapClubToForm(rows[0]);
    case "team":
      rows = await sql`SELECT * FROM teams WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapTeamToForm(rows[0]);
    case "trainer":
      rows = await sql`SELECT * FROM trainers WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapTrainerToForm(rows[0]);
    case "camp":
      rows = await sql`SELECT * FROM camps WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapCampToForm(rows[0]);
    case "guest":
      rows = await sql`SELECT * FROM guest_opportunities WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapGuestToForm(rows[0]);
    case "tournament":
      rows = await sql`SELECT * FROM tournaments WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapTournamentToForm(rows[0]);
    case "futsal":
      rows = await sql`SELECT * FROM futsal_teams WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapFutsalToForm(rows[0]);
    case "trip":
      rows = await sql`SELECT * FROM international_trips WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapTripToForm(rows[0]);
    case "marketplace":
      rows = await sql`SELECT * FROM marketplace WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapMarketplaceToForm(rows[0]);
    case "player":
      rows = await sql`SELECT * FROM player_profiles WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapPlayerToForm(rows[0]);
    case "podcast":
      rows = await sql`SELECT * FROM podcasts WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapPodcastToForm(rows[0]);
    case "fbgroup":
      rows = await sql`SELECT * FROM facebook_groups WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapFacebookGroupToForm(rows[0]);
    case "service":
      rows = await sql`SELECT * FROM services WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapServiceToForm(rows[0]);
    default:
      return null;
  }
}

// Admin version — no user_id check
export async function getListingDataAdmin(type: string, id: string): Promise<Record<string, string> | null> {
  type = normalizeType(type);
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club": rows = await sql`SELECT * FROM clubs WHERE id = ${id} LIMIT 1`; break;
    case "team": rows = await sql`SELECT * FROM teams WHERE id = ${id} LIMIT 1`; break;
    case "trainer": rows = await sql`SELECT * FROM trainers WHERE id = ${id} LIMIT 1`; break;
    case "camp": rows = await sql`SELECT * FROM camps WHERE id = ${id} LIMIT 1`; break;
    case "guest": rows = await sql`SELECT * FROM guest_opportunities WHERE id = ${id} LIMIT 1`; break;
    case "tournament": rows = await sql`SELECT * FROM tournaments WHERE id = ${id} LIMIT 1`; break;
    case "futsal": rows = await sql`SELECT * FROM futsal_teams WHERE id = ${id} LIMIT 1`; break;
    case "trip": rows = await sql`SELECT * FROM international_trips WHERE id = ${id} LIMIT 1`; break;
    case "marketplace": rows = await sql`SELECT * FROM marketplace WHERE id = ${id} LIMIT 1`; break;
    case "player": rows = await sql`SELECT * FROM player_profiles WHERE id = ${id} LIMIT 1`; break;
    case "podcast": rows = await sql`SELECT * FROM podcasts WHERE id = ${id} LIMIT 1`; break;
    case "fbgroup": rows = await sql`SELECT * FROM facebook_groups WHERE id = ${id} LIMIT 1`; break;
    case "service": rows = await sql`SELECT * FROM services WHERE id = ${id} LIMIT 1`; break;
    default: return null;
  }
  if (!rows[0]) return null;
  switch (type) {
    case "club": return mapClubToForm(rows[0]);
    case "team": return mapTeamToForm(rows[0]);
    case "trainer": return mapTrainerToForm(rows[0]);
    case "camp": return mapCampToForm(rows[0]);
    case "guest": return mapGuestToForm(rows[0]);
    case "tournament": return mapTournamentToForm(rows[0]);
    case "futsal": return mapFutsalToForm(rows[0]);
    case "trip": return mapTripToForm(rows[0]);
    case "marketplace": return mapMarketplaceToForm(rows[0]);
    case "player": return mapPlayerToForm(rows[0]);
    case "podcast": return mapPodcastToForm(rows[0]);
    case "fbgroup": return mapFacebookGroupToForm(rows[0]);
    case "service": return mapServiceToForm(rows[0]);
    default: return null;
  }
}

function parseSocial(raw: unknown): { facebook: string; instagram: string; youtube: string } {
  if (!raw) return { facebook: "", instagram: "", youtube: "" };
  try {
    const sm = typeof raw === "string" ? JSON.parse(raw) : raw;
    return { facebook: sm.facebook || "", instagram: sm.instagram || "", youtube: sm.youtube || "" };
  } catch { return { facebook: "", instagram: "", youtube: "" }; }
}

function s(v: unknown): string { return (v as string) || ""; }

function profileFormFields(r: Record<string, unknown>): Record<string, string> {
  return { teamPhoto: s(r.team_photo), photos: s(r.photos), videoUrl: s(r.video_url), practiceSchedule: s(r.practice_schedule), address: s(r.address) };
}
function mapClubToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), level: s(r.level), league: s(r.league), leagueUrl: s(r.league_url), ageGroups: s(r.age_groups), gender: s(r.gender), teamCount: String(r.team_count || ""), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapTeamToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), clubName: s(r.club_name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), level: s(r.level), ageGroup: s(r.age_group), gender: s(r.gender), coach: s(r.coach), lookingForPlayers: r.looking_for_players ? "true" : "false", positionsNeeded: s(r.positions_needed), season: s(r.season), description: s(r.description), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), events: s(r.events), annualTournaments: s(r.annual_tournaments), ...profileFormFields(r) };
}
function mapTrainerToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), specialty: s(r.specialty), experience: s(r.experience), credentials: s(r.credentials), priceRange: s(r.price_range), serviceArea: s(r.service_area), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapCampToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), organizerName: s(r.organizer_name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), campType: s(r.camp_type), ageRange: s(r.age_range), dates: s(r.dates), price: s(r.price), gender: s(r.gender), location: s(r.location), description: s(r.description), registrationUrl: s(r.registration_url), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapGuestToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { teamName: s(r.team_name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), level: s(r.level), ageGroup: s(r.age_group), gender: s(r.gender), dates: s(r.dates), tournament: s(r.tournament), positionsNeeded: s(r.positions_needed), contactEmail: s(r.contact_email), description: s(r.description), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapTournamentToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), organizer: s(r.organizer), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), dates: s(r.dates), ageGroups: s(r.age_groups), gender: s(r.gender), level: s(r.level), entryFee: s(r.entry_fee), format: s(r.format), description: s(r.description), registrationUrl: s(r.registration_url), email: s(r.email), region: s(r.region) || "US", phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapFutsalToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), clubName: s(r.club_name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), level: s(r.level), ageGroup: s(r.age_group), gender: s(r.gender), coach: s(r.coach), lookingForPlayers: r.looking_for_players ? "true" : "false", positionsNeeded: s(r.positions_needed), season: s(r.season), description: s(r.description), format: s(r.format), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}

function mapTripToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { tripName: s(r.trip_name), organizer: s(r.organizer), destination: s(r.destination), city: s(r.city), country: s(r.country) || "International", state: s(r.state), dates: s(r.dates), ageGroup: s(r.age_group), gender: s(r.gender), level: s(r.level), price: s(r.price), spotsAvailable: s(r.spots_available), contactEmail: s(r.contact_email), description: s(r.description), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}

function mapMarketplaceToForm(r: Record<string, unknown>): Record<string, string> {
  return { name: s(r.name), category: s(r.category), description: s(r.description), price: s(r.price), condition: s(r.condition), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), contactEmail: s(r.contact_email), phone: s(r.phone), imageUrl: s(r.image_url), photos: s(r.photos) };
}
function mapPlayerToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { playerName: s(r.player_name), position: s(r.position), secondaryPosition: s(r.secondary_position), birthYear: s(r.birth_year), height: s(r.height), preferredFoot: s(r.preferred_foot), currentClub: s(r.current_club), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), level: s(r.level), gender: s(r.gender), gpa: s(r.gpa), description: s(r.description), lookingFor: s(r.looking_for), contactEmail: s(r.contact_email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), videoUrl2: s(r.video_url_2), videoUrl3: s(r.video_url_3), ...profileFormFields(r) };
}
function mapPodcastToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), hostName: s(r.host_name), category: s(r.category), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), description: s(r.description), website: s(r.website), rssFeedUrl: s(r.rss_feed_url), followUrl: s(r.follow_url), email: s(r.email), phone: s(r.phone), topEpisodes: s(r.top_episodes), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), videoUrl2: s(r.video_url_2), videoUrl3: s(r.video_url_3), ...profileFormFields(r) };
}
function mapFacebookGroupToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), adminName: s(r.admin_name), category: s(r.category), groupUrl: s(r.group_url), memberCount: s(r.member_count), privacy: s(r.privacy), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), description: s(r.description), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapServiceToForm(r: Record<string, unknown>): Record<string, string> {
  return { name: s(r.name), providerName: s(r.provider_name), category: s(r.category), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), price: s(r.price), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), imageUrl: s(r.image_url), photos: s(r.photos) };
}

// ── Update Listing ──────────────────────────────────────────
function buildSocialMedia(data: Record<string, string>): string | null {
  const sm = { facebook: data.facebook || null, instagram: data.instagram || null, youtube: data.youtube || null };
  return (sm.facebook || sm.instagram || sm.youtube) ? JSON.stringify(sm) : null;
}

export async function updateListing(type: string, id: string, data: Record<string, string>, userId: string): Promise<boolean> {
  type = normalizeType(type);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club":
      rows = await sql`UPDATE clubs SET name=${data.name}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, league=${data.league || null}, league_url=${data.leagueUrl || null}, age_groups=${data.ageGroups}, gender=${data.gender}, team_count=${Number(data.teamCount) || 0}, description=${data.description}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, media_links=${pf.mediaLinks}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "team":
      rows = await sql`UPDATE teams SET name=${data.name}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, coach=${data.coach}, looking_for_players=${data.lookingForPlayers === "true"}, positions_needed=${data.positionsNeeded || null}, season=${data.season}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, events=${data.events || null}, annual_tournaments=${data.annualTournaments || null}, media_links=${pf.mediaLinks}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "trainer":
      rows = await sql`UPDATE trainers SET name=${data.name}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, specialty=${data.specialty}, experience=${data.experience}, credentials=${data.credentials}, price_range=${data.priceRange}, service_area=${data.serviceArea}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "camp":
      rows = await sql`UPDATE camps SET name=${data.name}, organizer_name=${data.organizerName}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, camp_type=${data.campType}, age_range=${data.ageRange}, dates=${data.dates}, price=${data.price}, gender=${data.gender}, location=${data.location || null}, description=${data.description}, registration_url=${data.registrationUrl || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "guest":
      rows = await sql`UPDATE guest_opportunities SET team_name=${data.teamName}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, dates=${data.dates}, tournament=${data.tournament}, positions_needed=${data.positionsNeeded}, contact_email=${data.contactEmail}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "tournament":
      rows = await sql`UPDATE tournaments SET name=${data.name}, organizer=${data.organizer}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, dates=${data.dates}, age_groups=${data.ageGroups}, gender=${data.gender}, level=${data.level}, entry_fee=${data.entryFee}, format=${data.format}, description=${data.description}, registration_url=${data.registrationUrl || null}, email=${data.email || null}, region=${data.region || 'US'}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "futsal":
      rows = await sql`UPDATE futsal_teams SET name=${data.name}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, coach=${data.coach}, looking_for_players=${data.lookingForPlayers === "true"}, positions_needed=${data.positionsNeeded || null}, season=${data.season}, description=${data.description || null}, format=${data.format || '5v5'}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "trip":
      rows = await sql`UPDATE international_trips SET trip_name=${data.tripName}, organizer=${data.organizer}, destination=${data.destination}, city=${data.city}, country=${data.country || 'International'}, state=${data.state || ''}, dates=${data.dates}, age_group=${data.ageGroup}, gender=${data.gender}, level=${data.level}, price=${data.price || null}, spots_available=${data.spotsAvailable || null}, contact_email=${data.contactEmail}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "marketplace":
      rows = await sql`UPDATE marketplace SET name=${data.name}, category=${data.category}, description=${data.description}, price=${data.price}, condition=${data.condition}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, contact_email=${data.contactEmail}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, photos=${data.photos || null} WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "player":
      rows = await sql`UPDATE player_profiles SET player_name=${data.playerName}, position=${data.position}, secondary_position=${data.secondaryPosition || null}, birth_year=${data.birthYear}, height=${data.height || null}, preferred_foot=${data.preferredFoot || null}, current_club=${data.currentClub || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, gender=${data.gender}, gpa=${data.gpa || null}, description=${data.description || null}, looking_for=${data.lookingFor || null}, contact_email=${data.contactEmail}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null} WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "podcast":
      rows = await sql`UPDATE podcasts SET name=${data.name}, host_name=${data.hostName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, description=${data.description || null}, website=${data.website || null}, rss_feed_url=${data.rssFeedUrl || null}, follow_url=${data.followUrl || null}, email=${data.email || null}, phone=${data.phone || null}, top_episodes=${data.topEpisodes || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "fbgroup":
      rows = await sql`UPDATE facebook_groups SET name=${data.name}, admin_name=${data.adminName}, category=${data.category}, group_url=${data.groupUrl}, member_count=${data.memberCount || null}, privacy=${data.privacy || 'Public'}, city=${data.city || ''}, country=${data.country || ''}, state=${data.state || ''}, description=${data.description || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, media_links=${pf.mediaLinks}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "service":
      rows = await sql`UPDATE services SET name=${data.name}, provider_name=${data.providerName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, price=${data.price || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, photos=${data.photos || null}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    default:
      return false;
  }
  return rows.length > 0;
}

// Admin version — no user_id check
export async function updateListingAdmin(type: string, id: string, data: Record<string, string>): Promise<boolean> {
  type = normalizeType(type);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club":
      rows = await sql`UPDATE clubs SET name=${data.name}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, league=${data.league || null}, league_url=${data.leagueUrl || null}, age_groups=${data.ageGroups}, gender=${data.gender}, team_count=${Number(data.teamCount) || 0}, description=${data.description}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, media_links=${pf.mediaLinks}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "team":
      rows = await sql`UPDATE teams SET name=${data.name}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, coach=${data.coach}, looking_for_players=${data.lookingForPlayers === "true"}, positions_needed=${data.positionsNeeded || null}, season=${data.season}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, events=${data.events || null}, annual_tournaments=${data.annualTournaments || null}, media_links=${pf.mediaLinks}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "trainer":
      rows = await sql`UPDATE trainers SET name=${data.name}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, specialty=${data.specialty}, experience=${data.experience}, credentials=${data.credentials}, price_range=${data.priceRange}, service_area=${data.serviceArea}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "camp":
      rows = await sql`UPDATE camps SET name=${data.name}, organizer_name=${data.organizerName}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, camp_type=${data.campType}, age_range=${data.ageRange}, dates=${data.dates}, price=${data.price}, gender=${data.gender}, location=${data.location || null}, description=${data.description}, registration_url=${data.registrationUrl || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "guest":
      rows = await sql`UPDATE guest_opportunities SET team_name=${data.teamName}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, dates=${data.dates}, tournament=${data.tournament}, positions_needed=${data.positionsNeeded}, contact_email=${data.contactEmail}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "tournament":
      rows = await sql`UPDATE tournaments SET name=${data.name}, organizer=${data.organizer}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, dates=${data.dates}, age_groups=${data.ageGroups}, gender=${data.gender}, level=${data.level}, entry_fee=${data.entryFee}, format=${data.format}, description=${data.description}, registration_url=${data.registrationUrl || null}, email=${data.email || null}, region=${data.region || 'US'}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "futsal":
      rows = await sql`UPDATE futsal_teams SET name=${data.name}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, coach=${data.coach}, looking_for_players=${data.lookingForPlayers === "true"}, positions_needed=${data.positionsNeeded || null}, season=${data.season}, description=${data.description || null}, format=${data.format || '5v5'}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "trip":
      rows = await sql`UPDATE international_trips SET trip_name=${data.tripName}, organizer=${data.organizer}, destination=${data.destination}, city=${data.city}, country=${data.country || 'International'}, state=${data.state || ''}, dates=${data.dates}, age_group=${data.ageGroup}, gender=${data.gender}, level=${data.level}, price=${data.price || null}, spots_available=${data.spotsAvailable || null}, contact_email=${data.contactEmail}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "marketplace":
      rows = await sql`UPDATE marketplace SET name=${data.name}, category=${data.category}, description=${data.description}, price=${data.price}, condition=${data.condition}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, contact_email=${data.contactEmail}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, photos=${data.photos || null} WHERE id=${id} RETURNING id`;
      break;
    case "player":
      rows = await sql`UPDATE player_profiles SET player_name=${data.playerName}, position=${data.position}, secondary_position=${data.secondaryPosition || null}, birth_year=${data.birthYear}, height=${data.height || null}, preferred_foot=${data.preferredFoot || null}, current_club=${data.currentClub || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, gender=${data.gender}, gpa=${data.gpa || null}, description=${data.description || null}, looking_for=${data.lookingFor || null}, contact_email=${data.contactEmail}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null} WHERE id=${id} RETURNING id`;
      break;
    case "podcast":
      rows = await sql`UPDATE podcasts SET name=${data.name}, host_name=${data.hostName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, description=${data.description || null}, website=${data.website || null}, rss_feed_url=${data.rssFeedUrl || null}, follow_url=${data.followUrl || null}, email=${data.email || null}, phone=${data.phone || null}, top_episodes=${data.topEpisodes || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "fbgroup":
      rows = await sql`UPDATE facebook_groups SET name=${data.name}, admin_name=${data.adminName}, category=${data.category}, group_url=${data.groupUrl}, member_count=${data.memberCount || null}, privacy=${data.privacy || 'Public'}, city=${data.city || ''}, country=${data.country || ''}, state=${data.state || ''}, description=${data.description || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, photos=${pf.photos}, video_url=${pf.videoUrl}, media_links=${pf.mediaLinks}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "service":
      rows = await sql`UPDATE services SET name=${data.name}, provider_name=${data.providerName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, price=${data.price || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, photos=${data.photos || null}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    default:
      return false;
  }
  return rows.length > 0;
}

// ── Archive Listing (soft-hide) ──────────────────────────────
export async function archiveListing(type: string, id: string, userId: string, isAdmin = false): Promise<boolean> {
  type = normalizeType(type);
  let rows: Record<string, unknown>[];
  if (isAdmin) {
    switch (type) {
      case "club": rows = await sql`UPDATE clubs SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "team": rows = await sql`UPDATE teams SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "trainer": rows = await sql`UPDATE trainers SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "camp": rows = await sql`UPDATE camps SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "guest": rows = await sql`UPDATE guest_opportunities SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "tournament": rows = await sql`UPDATE tournaments SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "futsal": rows = await sql`UPDATE futsal_teams SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "trip": rows = await sql`UPDATE international_trips SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "marketplace": rows = await sql`UPDATE marketplace SET status = 'archived' WHERE id = ${id} RETURNING id`; break;
      case "player": rows = await sql`UPDATE player_profiles SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "podcast": rows = await sql`UPDATE podcasts SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "fbgroup": rows = await sql`UPDATE facebook_groups SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "service": rows = await sql`UPDATE services SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      default: return false;
    }
  } else {
    switch (type) {
      case "club": rows = await sql`UPDATE clubs SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "team": rows = await sql`UPDATE teams SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trainer": rows = await sql`UPDATE trainers SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "camp": rows = await sql`UPDATE camps SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "guest": rows = await sql`UPDATE guest_opportunities SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tournament": rows = await sql`UPDATE tournaments SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "futsal": rows = await sql`UPDATE futsal_teams SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trip": rows = await sql`UPDATE international_trips SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "marketplace": rows = await sql`UPDATE marketplace SET status = 'archived' WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "player": rows = await sql`UPDATE player_profiles SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "podcast": rows = await sql`UPDATE podcasts SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "fbgroup": rows = await sql`UPDATE facebook_groups SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "service": rows = await sql`UPDATE services SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      default: return false;
    }
  }
  return rows.length > 0;
}

// ── Delete Listing ───────────────────────────────────────────
export async function deleteListing(type: string, id: string, userId: string, isAdmin = false): Promise<boolean> {
  type = normalizeType(type);
  let rows: Record<string, unknown>[];
  if (isAdmin) {
    switch (type) {
      case "club": rows = await sql`DELETE FROM clubs WHERE id = ${id} RETURNING id`; break;
      case "team": rows = await sql`DELETE FROM teams WHERE id = ${id} RETURNING id`; break;
      case "trainer": rows = await sql`DELETE FROM trainers WHERE id = ${id} RETURNING id`; break;
      case "camp": rows = await sql`DELETE FROM camps WHERE id = ${id} RETURNING id`; break;
      case "guest": rows = await sql`DELETE FROM guest_opportunities WHERE id = ${id} RETURNING id`; break;
      case "tournament": rows = await sql`DELETE FROM tournaments WHERE id = ${id} RETURNING id`; break;
      case "futsal": rows = await sql`DELETE FROM futsal_teams WHERE id = ${id} RETURNING id`; break;
      case "trip": rows = await sql`DELETE FROM international_trips WHERE id = ${id} RETURNING id`; break;
      case "marketplace": rows = await sql`DELETE FROM marketplace WHERE id = ${id} RETURNING id`; break;
      case "player": rows = await sql`DELETE FROM player_profiles WHERE id = ${id} RETURNING id`; break;
      case "podcast": rows = await sql`DELETE FROM podcasts WHERE id = ${id} RETURNING id`; break;
      case "fbgroup": rows = await sql`DELETE FROM facebook_groups WHERE id = ${id} RETURNING id`; break;
      case "service": rows = await sql`DELETE FROM services WHERE id = ${id} RETURNING id`; break;
      default: return false;
    }
  } else {
    switch (type) {
      case "club": rows = await sql`DELETE FROM clubs WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "team": rows = await sql`DELETE FROM teams WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trainer": rows = await sql`DELETE FROM trainers WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "camp": rows = await sql`DELETE FROM camps WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "guest": rows = await sql`DELETE FROM guest_opportunities WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tournament": rows = await sql`DELETE FROM tournaments WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "futsal": rows = await sql`DELETE FROM futsal_teams WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trip": rows = await sql`DELETE FROM international_trips WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "marketplace": rows = await sql`DELETE FROM marketplace WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "player": rows = await sql`DELETE FROM player_profiles WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "podcast": rows = await sql`DELETE FROM podcasts WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "fbgroup": rows = await sql`DELETE FROM facebook_groups WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "service": rows = await sql`DELETE FROM services WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      default: return false;
    }
  }
  return rows.length > 0;
}

// ── Get listing contact info (public) ────────────────────────
export async function getListingContact(type: string, slug: string): Promise<{ name: string; email: string | null; userId: string } | null> {
  type = normalizeType(type);
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club": rows = await sql`SELECT name, email, user_id FROM clubs WHERE slug = ${slug} LIMIT 1`; break;
    case "team": rows = await sql`SELECT name, NULL as email, user_id FROM teams WHERE slug = ${slug} LIMIT 1`; break;
    case "trainer": rows = await sql`SELECT name, email, user_id FROM trainers WHERE slug = ${slug} LIMIT 1`; break;
    case "camp": rows = await sql`SELECT name, email, user_id FROM camps WHERE slug = ${slug} LIMIT 1`; break;
    case "guest": rows = await sql`SELECT team_name as name, contact_email as email, user_id FROM guest_opportunities WHERE slug = ${slug} LIMIT 1`; break;
    case "tournament": rows = await sql`SELECT name, email, user_id FROM tournaments WHERE slug = ${slug} LIMIT 1`; break;
    case "futsal": rows = await sql`SELECT name, NULL as email, user_id FROM futsal_teams WHERE slug = ${slug} LIMIT 1`; break;
    case "trip": rows = await sql`SELECT trip_name as name, contact_email as email, user_id FROM international_trips WHERE slug = ${slug} LIMIT 1`; break;
    case "marketplace": rows = await sql`SELECT name, contact_email as email, user_id FROM marketplace WHERE slug = ${slug} LIMIT 1`; break;
    case "player": rows = await sql`SELECT player_name as name, contact_email as email, user_id FROM player_profiles WHERE slug = ${slug} LIMIT 1`; break;
    case "podcast": rows = await sql`SELECT name, email, user_id FROM podcasts WHERE slug = ${slug} LIMIT 1`; break;
    case "fbgroup": rows = await sql`SELECT name, email, user_id FROM facebook_groups WHERE slug = ${slug} LIMIT 1`; break;
    case "service": rows = await sql`SELECT name, email, user_id FROM services WHERE slug = ${slug} LIMIT 1`; break;
    default: return null;
  }
  if (!rows[0]) return null;
  const r = rows[0];
  // Get the owner's email for notification
  const userRows = await sql`SELECT email FROM users WHERE id = ${r.user_id} LIMIT 1`;
  const ownerEmail = userRows[0]?.email as string | null;
  return { name: r.name as string, email: ownerEmail || (r.email as string | null), userId: r.user_id as string };
}

// ── Get listing owner ────────────────────────────────────────
export async function getListingOwner(type: string, slug: string): Promise<string | null> {
  type = normalizeType(type);
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club": rows = await sql`SELECT user_id FROM clubs WHERE slug = ${slug} LIMIT 1`; break;
    case "team": rows = await sql`SELECT user_id FROM teams WHERE slug = ${slug} LIMIT 1`; break;
    case "trainer": rows = await sql`SELECT user_id FROM trainers WHERE slug = ${slug} LIMIT 1`; break;
    case "camp": rows = await sql`SELECT user_id FROM camps WHERE slug = ${slug} LIMIT 1`; break;
    case "guest": rows = await sql`SELECT user_id FROM guest_opportunities WHERE slug = ${slug} LIMIT 1`; break;
    case "tournament": rows = await sql`SELECT user_id FROM tournaments WHERE slug = ${slug} LIMIT 1`; break;
    case "futsal": rows = await sql`SELECT user_id FROM futsal_teams WHERE slug = ${slug} LIMIT 1`; break;
    case "trip": rows = await sql`SELECT user_id FROM international_trips WHERE slug = ${slug} LIMIT 1`; break;
    case "marketplace": rows = await sql`SELECT user_id FROM marketplace WHERE slug = ${slug} LIMIT 1`; break;
    case "player": rows = await sql`SELECT user_id FROM player_profiles WHERE slug = ${slug} LIMIT 1`; break;
    case "podcast": rows = await sql`SELECT user_id FROM podcasts WHERE slug = ${slug} LIMIT 1`; break;
    case "fbgroup": rows = await sql`SELECT user_id FROM facebook_groups WHERE slug = ${slug} LIMIT 1`; break;
    case "service": rows = await sql`SELECT user_id FROM services WHERE slug = ${slug} LIMIT 1`; break;
    default: return null;
  }
  return rows[0]?.user_id as string | null;
}

// ── Reviews ─────────────────────────────────────────────────

export async function createReview(listingType: string, listingId: string, reviewerName: string, reviewerRole: string, rating: number, reviewText: string): Promise<{ id: string; approvalToken: string }> {
  const id = genId();
  const approvalToken = id + "-" + Math.random().toString(36).slice(2, 10);
  await sql`INSERT INTO reviews (id, listing_type, listing_id, reviewer_name, reviewer_role, rating, review_text, status, approval_token) VALUES (${id}, ${listingType}, ${listingId}, ${reviewerName}, ${reviewerRole}, ${rating}, ${reviewText}, 'pending', ${approvalToken})`;
  return { id, approvalToken };
}

export async function getApprovedReviews(listingType: string, listingId: string): Promise<Review[]> {
  const rows = await sql`SELECT * FROM reviews WHERE listing_type = ${listingType} AND listing_id = ${listingId} AND status = 'approved' ORDER BY created_at DESC`;
  return rows.map(mapReview);
}

export async function getReviewSummary(listingType: string, listingId: string): Promise<{ averageRating: number; reviewCount: number }> {
  const rows = await sql`SELECT COUNT(*)::int as count, COALESCE(AVG(rating), 0) as avg FROM reviews WHERE listing_type = ${listingType} AND listing_id = ${listingId} AND status = 'approved'`;
  return { averageRating: Number(Number(rows[0].avg).toFixed(1)), reviewCount: Number(rows[0].count) };
}

export async function getReviewByToken(token: string): Promise<{ id: string; listingType: string; listingId: string; status: string } | null> {
  const rows = await sql`SELECT id, listing_type, listing_id, status FROM reviews WHERE approval_token = ${token} LIMIT 1`;
  if (!rows[0]) return null;
  return { id: rows[0].id as string, listingType: rows[0].listing_type as string, listingId: rows[0].listing_id as string, status: rows[0].status as string };
}

export async function updateReviewStatus(token: string, status: string): Promise<boolean> {
  const rows = await sql`UPDATE reviews SET status = ${status} WHERE approval_token = ${token} RETURNING id`;
  return rows.length > 0;
}

export async function getListingNameById(type: string, id: string): Promise<string | null> {
  type = normalizeType(type);
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club": rows = await sql`SELECT name FROM clubs WHERE id = ${id} LIMIT 1`; break;
    case "team": rows = await sql`SELECT name FROM teams WHERE id = ${id} LIMIT 1`; break;
    case "trainer": rows = await sql`SELECT name FROM trainers WHERE id = ${id} LIMIT 1`; break;
    case "camp": rows = await sql`SELECT name FROM camps WHERE id = ${id} LIMIT 1`; break;
    default: return null;
  }
  return (rows[0]?.name as string) || null;
}

export async function getListingOwnerEmailById(type: string, id: string): Promise<string | null> {
  type = normalizeType(type);
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club": rows = await sql`SELECT user_id FROM clubs WHERE id = ${id} LIMIT 1`; break;
    case "team": rows = await sql`SELECT user_id FROM teams WHERE id = ${id} LIMIT 1`; break;
    case "trainer": rows = await sql`SELECT user_id FROM trainers WHERE id = ${id} LIMIT 1`; break;
    case "camp": rows = await sql`SELECT user_id FROM camps WHERE id = ${id} LIMIT 1`; break;
    default: return null;
  }
  if (!rows[0]?.user_id) return null;
  const userRows = await sql`SELECT email FROM users WHERE id = ${rows[0].user_id} LIMIT 1`;
  return (userRows[0]?.email as string) || null;
}

function mapReview(r: Record<string, unknown>): Review {
  return {
    id: r.id as string, listingType: r.listing_type as string, listingId: r.listing_id as string,
    reviewerName: r.reviewer_name as string, reviewerRole: r.reviewer_role as ReviewerRole,
    rating: Number(r.rating), reviewText: r.review_text as string,
    status: r.status as ReviewStatus, createdAt: r.created_at as string,
  };
}

// ── Forum ───────────────────────────────────────────────────

export async function createForumTopic(title: string, category: string, body: string, userId: string): Promise<string> {
  const id = genId();
  const slug = slugify(title) + "-" + id.slice(-4);
  await sql`INSERT INTO forum_topics (id, title, slug, category, body, user_id) VALUES (${id}, ${title}, ${slug}, ${category}, ${body}, ${userId})`;
  return slug;
}

export async function getForumTopics(category?: string): Promise<ForumTopic[]> {
  let rows: Record<string, unknown>[];
  if (category) {
    rows = await sql`SELECT t.*, u.name as user_name, (SELECT COUNT(*)::int FROM forum_comments c WHERE c.topic_id = t.id) as comment_count FROM forum_topics t JOIN users u ON u.id = t.user_id WHERE t.category = ${category} ORDER BY t.is_pinned DESC, t.updated_at DESC`;
  } else {
    rows = await sql`SELECT t.*, u.name as user_name, (SELECT COUNT(*)::int FROM forum_comments c WHERE c.topic_id = t.id) as comment_count FROM forum_topics t JOIN users u ON u.id = t.user_id ORDER BY t.is_pinned DESC, t.updated_at DESC`;
  }
  return rows.map(mapForumTopic);
}

export async function getForumTopicBySlug(slug: string): Promise<ForumTopic | null> {
  const rows = await sql`SELECT t.*, u.name as user_name, (SELECT COUNT(*)::int FROM forum_comments c WHERE c.topic_id = t.id) as comment_count FROM forum_topics t JOIN users u ON u.id = t.user_id WHERE t.slug = ${slug} LIMIT 1`;
  return rows[0] ? mapForumTopic(rows[0]) : null;
}

export async function incrementTopicViewCount(slug: string): Promise<void> {
  await sql`UPDATE forum_topics SET view_count = view_count + 1 WHERE slug = ${slug}`;
}

export async function deleteForumTopic(id: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM forum_topics WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

export async function createForumComment(topicId: string, body: string, userId: string): Promise<string> {
  const id = genId();
  await sql`INSERT INTO forum_comments (id, topic_id, body, user_id) VALUES (${id}, ${topicId}, ${body}, ${userId})`;
  await sql`UPDATE forum_topics SET updated_at = NOW() WHERE id = ${topicId}`;
  return id;
}

export async function getForumComments(topicId: string): Promise<ForumComment[]> {
  const rows = await sql`SELECT c.*, u.name as user_name FROM forum_comments c JOIN users u ON u.id = c.user_id WHERE c.topic_id = ${topicId} ORDER BY c.created_at ASC`;
  return rows.map(mapForumComment);
}

export async function deleteForumComment(id: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM forum_comments WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

function mapForumTopic(r: Record<string, unknown>): ForumTopic {
  return {
    id: r.id as string, title: r.title as string, slug: r.slug as string,
    category: r.category as ForumCategory, body: r.body as string,
    userId: r.user_id as string, userName: r.user_name as string,
    viewCount: Number(r.view_count), isPinned: r.is_pinned as boolean,
    commentCount: Number(r.comment_count),
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  };
}

function mapForumComment(r: Record<string, unknown>): ForumComment {
  return {
    id: r.id as string, topicId: r.topic_id as string, body: r.body as string,
    userId: r.user_id as string, userName: r.user_name as string,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  };
}

// ── Guest Posts (Guest Play Forum) ──────────────────────────

export async function createGuestPost(title: string, category: string, body: string, userId: string): Promise<string> {
  const id = genId();
  const slug = slugify(title) + "-" + id.slice(-4);
  await sql`INSERT INTO guest_posts (id, title, slug, category, body, user_id) VALUES (${id}, ${title}, ${slug}, ${category}, ${body}, ${userId})`;
  return slug;
}

export async function getGuestPosts(category?: string): Promise<GuestPost[]> {
  let rows: Record<string, unknown>[];
  if (category) {
    rows = await sql`SELECT t.*, u.name as user_name, (SELECT COUNT(*)::int FROM guest_post_comments c WHERE c.post_id = t.id) as comment_count FROM guest_posts t JOIN users u ON u.id = t.user_id WHERE t.category = ${category} ORDER BY t.is_pinned DESC, t.updated_at DESC`;
  } else {
    rows = await sql`SELECT t.*, u.name as user_name, (SELECT COUNT(*)::int FROM guest_post_comments c WHERE c.post_id = t.id) as comment_count FROM guest_posts t JOIN users u ON u.id = t.user_id ORDER BY t.is_pinned DESC, t.updated_at DESC`;
  }
  return rows.map(mapGuestPost);
}

export async function getGuestPostBySlug(slug: string): Promise<GuestPost | null> {
  const rows = await sql`SELECT t.*, u.name as user_name, (SELECT COUNT(*)::int FROM guest_post_comments c WHERE c.post_id = t.id) as comment_count FROM guest_posts t JOIN users u ON u.id = t.user_id WHERE t.slug = ${slug} LIMIT 1`;
  return rows[0] ? mapGuestPost(rows[0]) : null;
}

export async function incrementGuestPostViewCount(slug: string): Promise<void> {
  await sql`UPDATE guest_posts SET view_count = view_count + 1 WHERE slug = ${slug}`;
}

export async function deleteGuestPost(id: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM guest_posts WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

export async function createGuestPostComment(postId: string, body: string, userId: string): Promise<string> {
  const id = genId();
  await sql`INSERT INTO guest_post_comments (id, post_id, body, user_id) VALUES (${id}, ${postId}, ${body}, ${userId})`;
  await sql`UPDATE guest_posts SET updated_at = NOW() WHERE id = ${postId}`;
  return id;
}

export async function getGuestPostComments(postId: string): Promise<GuestPostComment[]> {
  const rows = await sql`SELECT c.*, u.name as user_name FROM guest_post_comments c JOIN users u ON u.id = c.user_id WHERE c.post_id = ${postId} ORDER BY c.created_at ASC`;
  return rows.map(mapGuestPostComment);
}

export async function deleteGuestPostComment(id: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM guest_post_comments WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

function mapGuestPost(r: Record<string, unknown>): GuestPost {
  return {
    id: r.id as string, title: r.title as string, slug: r.slug as string,
    category: r.category as GuestPostCategory, body: r.body as string,
    userId: r.user_id as string, userName: r.user_name as string,
    viewCount: Number(r.view_count), isPinned: r.is_pinned as boolean,
    commentCount: Number(r.comment_count),
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  };
}

function mapGuestPostComment(r: Record<string, unknown>): GuestPostComment {
  return {
    id: r.id as string, postId: r.post_id as string, body: r.body as string,
    userId: r.user_id as string, userName: r.user_name as string,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  };
}
