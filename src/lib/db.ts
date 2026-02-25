import { neon } from "@neondatabase/serverless";
import type { Club, Team, Trainer, Camp, GuestOpportunity, BlogPost, Tournament, FutsalTeam } from "./types";

const sql = neon(process.env.DATABASE_URL!);

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
    city: r.city as string, state: r.state as string, level: r.level as string,
    ageGroups: r.age_groups as string, gender: r.gender as string,
    teamCount: r.team_count as number, description: r.description as string,
    logo: r.logo as string | undefined, website: r.website as string | undefined,
    email: r.email as string | undefined, phone: r.phone as string | undefined,
    address: r.address as string | undefined,
    socialMedia: r.social_media ? JSON.parse(r.social_media as string) : undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
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

function mapTeam(r: Record<string, unknown>): Team {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    clubId: r.club_id as string | undefined, clubName: r.club_name as string | undefined,
    city: r.city as string, state: r.state as string, level: r.level as string,
    ageGroup: r.age_group as string, gender: r.gender as string,
    coach: r.coach as string, lookingForPlayers: r.looking_for_players as boolean,
    positionsNeeded: r.positions_needed as string | undefined,
    season: r.season as string, description: r.description as string | undefined,
    practiceSchedule: r.practice_schedule as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
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
    city: r.city as string, state: r.state as string, specialty: r.specialty as string,
    experience: r.experience as string, credentials: r.credentials as string,
    priceRange: r.price_range as string, serviceArea: r.service_area as string,
    description: r.description as string | undefined,
    rating: Number(r.rating), reviewCount: Number(r.review_count),
    website: r.website as string | undefined, email: r.email as string | undefined,
    phone: r.phone as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
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
    city: r.city as string, state: r.state as string,
    campType: r.camp_type as Camp["campType"],
    ageRange: r.age_range as string, dates: r.dates as string,
    price: r.price as string, gender: r.gender as string,
    description: r.description as string,
    registrationUrl: r.registration_url as string | undefined,
    email: r.email as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  };
}

// ── Guest Opportunities ──────────────────────────────────────
export async function getGuestOpportunities(): Promise<GuestOpportunity[]> {
  const rows = await sql`SELECT * FROM guest_opportunities WHERE status = 'approved' ORDER BY featured DESC, team_name ASC`;
  return rows.map(mapGuest);
}

export async function getGuestSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM guest_opportunities WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapGuest(r: Record<string, unknown>): GuestOpportunity {
  return {
    id: r.id as string, slug: r.slug as string, teamName: r.team_name as string,
    city: r.city as string, state: r.state as string, level: r.level as string,
    ageGroup: r.age_group as string, gender: r.gender as string,
    dates: r.dates as string, tournament: r.tournament as string,
    positionsNeeded: r.positions_needed as string,
    contactEmail: r.contact_email as string,
    description: r.description as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
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
    city: r.city as string, state: r.state as string,
    dates: r.dates as string, ageGroups: r.age_groups as string,
    gender: r.gender as string, level: r.level as string,
    entryFee: r.entry_fee as string, format: r.format as string,
    description: r.description as string,
    registrationUrl: r.registration_url as string | undefined,
    email: r.email as string | undefined,
    region: (r.region as string) || "US",
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
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
    city: r.city as string, state: r.state as string, level: r.level as string,
    ageGroup: r.age_group as string, gender: r.gender as string,
    coach: r.coach as string, lookingForPlayers: r.looking_for_players as boolean,
    positionsNeeded: r.positions_needed as string | undefined,
    season: r.season as string, description: r.description as string | undefined,
    practiceSchedule: r.practice_schedule as string | undefined,
    format: r.format as string,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
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

// ── Listings by User ─────────────────────────────────────────
export async function getListingsByUserId(userId: string) {
  const [clubRows, teamRows, trainerRows, campRows, guestRows, tournamentRows, futsalRows] = await Promise.all([
    sql`SELECT id, slug, name, status, 'club' as type FROM clubs WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'team' as type FROM teams WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'trainer' as type FROM trainers WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'camp' as type FROM camps WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, team_name as name, status, 'guest' as type FROM guest_opportunities WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'tournament' as type FROM tournaments WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'futsal' as type FROM futsal_teams WHERE user_id = ${userId} ORDER BY created_at DESC`,
  ]);
  return [...clubRows, ...teamRows, ...trainerRows, ...campRows, ...guestRows, ...tournamentRows, ...futsalRows] as { id: string; slug: string; name: string; status: string; type: string }[];
}

// ── Create Listings ──────────────────────────────────────────
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function genId(): string {
  return "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function createClubListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  await sql`INSERT INTO clubs (id, slug, name, city, state, level, age_groups, gender, team_count, description, website, email, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.city}, ${data.state}, ${data.level}, ${data.ageGroups}, ${data.gender}, ${Number(data.teamCount) || 0}, ${data.description}, ${data.website || null}, ${data.email || null}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTeamListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  await sql`INSERT INTO teams (id, slug, name, club_name, city, state, level, age_group, gender, coach, looking_for_players, positions_needed, season, description, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.clubName || null}, ${data.city}, ${data.state}, ${data.level}, ${data.ageGroup}, ${data.gender}, ${data.coach}, ${data.lookingForPlayers === "true"}, ${data.positionsNeeded || null}, ${data.season}, ${data.description || null}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTrainerListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  await sql`INSERT INTO trainers (id, slug, name, city, state, specialty, experience, credentials, price_range, service_area, description, rating, review_count, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.city}, ${data.state}, ${data.specialty}, ${data.experience}, ${data.credentials}, ${data.priceRange}, ${data.serviceArea}, ${data.description || null}, 0, 0, false, ${userId}, 'approved')`;
  return slug;
}

export async function createCampListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  await sql`INSERT INTO camps (id, slug, name, organizer_name, city, state, camp_type, age_range, dates, price, gender, description, registration_url, email, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.organizerName}, ${data.city}, ${data.state}, ${data.campType}, ${data.ageRange}, ${data.dates}, ${data.price}, ${data.gender}, ${data.description}, ${data.registrationUrl || null}, ${data.email || null}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createGuestListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.teamName + "-" + data.tournament);
  await sql`INSERT INTO guest_opportunities (id, slug, team_name, city, state, level, age_group, gender, dates, tournament, positions_needed, contact_email, description, featured, user_id, status) VALUES (${id}, ${slug}, ${data.teamName}, ${data.city}, ${data.state}, ${data.level}, ${data.ageGroup}, ${data.gender}, ${data.dates}, ${data.tournament}, ${data.positionsNeeded}, ${data.contactEmail}, ${data.description || null}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTournamentListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  await sql`INSERT INTO tournaments (id, slug, name, organizer, city, state, dates, age_groups, gender, level, entry_fee, format, description, registration_url, email, region, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.organizer}, ${data.city}, ${data.state}, ${data.dates}, ${data.ageGroups}, ${data.gender}, ${data.level}, ${data.entryFee}, ${data.format}, ${data.description}, ${data.registrationUrl || null}, ${data.email || null}, ${data.region || 'US'}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createFutsalListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  await sql`INSERT INTO futsal_teams (id, slug, name, club_name, city, state, level, age_group, gender, coach, looking_for_players, positions_needed, season, description, format, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.clubName || null}, ${data.city}, ${data.state}, ${data.level}, ${data.ageGroup}, ${data.gender}, ${data.coach}, ${data.lookingForPlayers === "true"}, ${data.positionsNeeded || null}, ${data.season}, ${data.description || null}, ${data.format || '5v5'}, false, ${userId}, 'approved')`;
  return slug;
}

// ── Delete Listing ───────────────────────────────────────────
export async function deleteListing(type: string, id: string, userId: string): Promise<boolean> {
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club": rows = await sql`DELETE FROM clubs WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
    case "team": rows = await sql`DELETE FROM teams WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
    case "trainer": rows = await sql`DELETE FROM trainers WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
    case "camp": rows = await sql`DELETE FROM camps WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
    case "guest": rows = await sql`DELETE FROM guest_opportunities WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
    case "tournament": rows = await sql`DELETE FROM tournaments WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
    case "futsal": rows = await sql`DELETE FROM futsal_teams WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
    default: return false;
  }
  return rows.length > 0;
}

// ── Get listing owner ────────────────────────────────────────
export async function getListingOwner(type: string, slug: string): Promise<string | null> {
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club": rows = await sql`SELECT user_id FROM clubs WHERE slug = ${slug} LIMIT 1`; break;
    case "team": rows = await sql`SELECT user_id FROM teams WHERE slug = ${slug} LIMIT 1`; break;
    case "trainer": rows = await sql`SELECT user_id FROM trainers WHERE slug = ${slug} LIMIT 1`; break;
    case "camp": rows = await sql`SELECT user_id FROM camps WHERE slug = ${slug} LIMIT 1`; break;
    case "guest": rows = await sql`SELECT user_id FROM guest_opportunities WHERE slug = ${slug} LIMIT 1`; break;
    case "tournament": rows = await sql`SELECT user_id FROM tournaments WHERE slug = ${slug} LIMIT 1`; break;
    case "futsal": rows = await sql`SELECT user_id FROM futsal_teams WHERE slug = ${slug} LIMIT 1`; break;
    default: return null;
  }
  return rows[0]?.user_id as string | null;
}
