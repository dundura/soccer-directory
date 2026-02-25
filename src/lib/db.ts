import { neon } from "@neondatabase/serverless";
import type { Club, Team, Trainer, Camp, GuestOpportunity, BlogPost, Tournament } from "./types";

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
