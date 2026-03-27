import { neon } from "@neondatabase/serverless";
import type { Club, Team, TeamEvent, Trainer, Recruiter, Camp, Tryout, SpecialEvent, GuestOpportunity, BlogPost, Tournament, FutsalTeam, InternationalTrip, MarketplaceItem, PlayerProfile, Podcast, TopEpisode, FacebookGroup, InstagramPage, TikTokPage, Service, TrainingApp, Blog, FeaturedPost, YoutubeChannel, FeaturedVideo, ProfileFields, MediaLink, Sponsor, Review, ReviewerRole, ReviewStatus, ForumTopic, ForumCategory, ForumComment, GuestPost, GuestPostCategory, GuestPostComment, Scrimmage, SoccerBook, PhotoVideoService } from "./types";

const sql = neon(process.env.DATABASE_URL!);

// ── Type normalization (virtual → DB) ────────────────────────
function normalizeType(type: string): string {
  if (type === "equipment" || type === "books" || type === "ebook" || type === "giveaway") return "marketplace";
  if (type === "showcase") return "camp";
  if (type === "instagrampage" || type === "instagram") return "instagrampage";
  if (type === "tiktokpage" || type === "tiktok") return "tiktokpage";
  return type;
}

// ── Site Settings ────────────────────────────────────────────
export async function getSetting(key: string): Promise<string> {
  const rows = await sql`SELECT value FROM site_settings WHERE key = ${key} LIMIT 1`;
  return (rows[0]?.value as string) || "";
}

export async function updateSetting(key: string, value: string) {
  await sql`INSERT INTO site_settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = ${value}`;
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
    try { sm = typeof r.social_media === 'string' ? JSON.parse(r.social_media) : r.social_media as ProfileFields["socialMedia"]; } catch { sm = undefined; }
  }
  let mediaLinks: MediaLink[] | undefined;
  if (r.media_links) {
    try { mediaLinks = JSON.parse(r.media_links as string); } catch { mediaLinks = undefined; }
  }
  let sponsors: Sponsor[] | undefined;
  if (r.sponsors) {
    try { sponsors = JSON.parse(r.sponsors as string); } catch { sponsors = undefined; }
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
    sponsors,
    imagePosition: typeof r.image_position === "number" ? r.image_position : 50,
    heroImagePosition: typeof r.hero_image_position === "number" ? r.hero_image_position : 50,
    tagline: r.tagline as string | undefined,
    previewImage: r.preview_image as string | undefined,
  };
}

// ── Clubs ────────────────────────────────────────────────────
export async function getClubs(): Promise<Club[]> {
  const rows = await sql`SELECT * FROM clubs WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapClub);
}

export async function searchClubsForReview(query: string): Promise<{ id: string; name: string; city: string; state: string; slug: string }[]> {
  const pattern = `%${query}%`;
  const rows = await sql`SELECT id, name, city, state, slug FROM clubs WHERE status = 'approved' AND (name ILIKE ${pattern} OR city ILIKE ${pattern}) ORDER BY name ASC LIMIT 10`;
  return rows.map(r => ({ id: r.id as string, name: r.name as string, city: r.city as string, state: r.state as string, slug: r.slug as string }));
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
    announcementHeading: r.announcement_heading as string | undefined,
    announcementText: r.announcement_text as string | undefined,
    announcementImage: r.announcement_image as string | undefined,
    announcementCta: r.announcement_cta as string | undefined,
    announcementCtaUrl: r.announcement_cta_url as string | undefined,
    announcementHeading2: r.announcement_heading_2 as string | undefined,
    announcementText2: r.announcement_text_2 as string | undefined,
    announcementImage2: r.announcement_image_2 as string | undefined,
    announcementCta2: r.announcement_cta_2 as string | undefined,
    announcementCtaUrl2: r.announcement_cta_url_2 as string | undefined,
    announcementHeading3: r.announcement_heading_3 as string | undefined,
    announcementText3: r.announcement_text_3 as string | undefined,
    announcementImage3: r.announcement_image_3 as string | undefined,
    announcementCta3: r.announcement_cta_3 as string | undefined,
    announcementCtaUrl3: r.announcement_cta_url_3 as string | undefined,
    openPositions: r.open_positions ? (() => { try { return JSON.parse(r.open_positions as string); } catch { return undefined; } })() : undefined,
    scholarshipsAvailable: r.scholarships_available as string | undefined,
    guestPlayersWelcomed: r.guest_players_welcomed as string | undefined,
    fundraiserSlug: r.fundraiser_slug as string | undefined,
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
    coach: r.coach as string, lookingForPlayers: r.looking_for_players as boolean, guestPlayersWelcome: r.guest_players_welcomed !== false,
    positionsNeeded: r.positions_needed as string | undefined,
    season: r.season as string, description: r.description as string | undefined,
    events: r.events ? (() => { try { return JSON.parse(r.events as string) as TeamEvent[]; } catch { return undefined; } })() : undefined,
    annualTournaments: r.annual_tournaments ? (() => { try { return JSON.parse(r.annual_tournaments as string) as string[]; } catch { return undefined; } })() : undefined,
    announcementHeading: r.announcement_heading as string | undefined,
    announcementText: r.announcement_text as string | undefined,
    announcementImage: r.announcement_image as string | undefined,
    announcementCta: r.announcement_cta as string | undefined,
    announcementCtaUrl: r.announcement_cta_url as string | undefined,
    announcementHeading2: r.announcement_heading_2 as string | undefined,
    announcementText2: r.announcement_text_2 as string | undefined,
    announcementImage2: r.announcement_image_2 as string | undefined,
    announcementCta2: r.announcement_cta_2 as string | undefined,
    announcementCtaUrl2: r.announcement_cta_url_2 as string | undefined,
    announcementHeading3: r.announcement_heading_3 as string | undefined,
    announcementText3: r.announcement_text_3 as string | undefined,
    announcementImage3: r.announcement_image_3 as string | undefined,
    announcementCta3: r.announcement_cta_3 as string | undefined,
    announcementCtaUrl3: r.announcement_cta_url_3 as string | undefined,
    scholarshipsAvailable: r.scholarships_available as string | undefined,
    guestPlayersWelcomed: r.guest_players_welcomed as string | undefined,
    fundraiserSlug: r.fundraiser_slug as string | undefined,
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

// ── Recruiters ────────────────────────────────────────────────
export async function getRecruiters(): Promise<Recruiter[]> {
  const rows = await sql`SELECT * FROM recruiters WHERE status != 'archived' ORDER BY featured DESC, created_at DESC`;
  return rows.map(mapRecruiter);
}

export async function getRecruiterBySlug(slug: string): Promise<Recruiter | null> {
  const rows = await sql`SELECT * FROM recruiters WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ? mapRecruiter(rows[0]) : null;
}

export async function getRecruiterSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM recruiters WHERE status != 'archived'`;
  return rows.map((r) => r.slug as string);
}

function mapRecruiter(r: Record<string, unknown>): Recruiter {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    city: r.city as string, state: r.state as string, country: (r.country as string) || "United States",
    specialty: r.specialty as string, experience: r.experience as string,
    credentials: r.credentials as string, priceRange: r.price_range as string,
    serviceArea: r.service_area as string, description: r.description as string | undefined,
    rating: Number(r.rating) || 0, reviewCount: Number(r.review_count) || 0,
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
    announcementHeading: r.announcement_heading as string | undefined,
    announcementText: r.announcement_text as string | undefined,
    announcementImage: r.announcement_image as string | undefined,
    announcementCta: r.announcement_cta as string | undefined,
    announcementCtaUrl: r.announcement_cta_url as string | undefined,
    announcementHeading2: r.announcement_heading_2 as string | undefined,
    announcementText2: r.announcement_text_2 as string | undefined,
    announcementImage2: r.announcement_image_2 as string | undefined,
    announcementCta2: r.announcement_cta_2 as string | undefined,
    announcementCtaUrl2: r.announcement_cta_url_2 as string | undefined,
    announcementHeading3: r.announcement_heading_3 as string | undefined,
    announcementText3: r.announcement_text_3 as string | undefined,
    announcementImage3: r.announcement_image_3 as string | undefined,
    announcementCta3: r.announcement_cta_3 as string | undefined,
    announcementCtaUrl3: r.announcement_cta_url_3 as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── Tryouts ───────────────────────────────────────────────────
export async function getTryouts(): Promise<Tryout[]> {
  const rows = await sql`SELECT * FROM tryouts WHERE status = 'approved' ORDER BY featured DESC, created_at DESC`;
  return rows.map(mapTryout);
}

export async function getTryoutBySlug(slug: string): Promise<Tryout | null> {
  const rows = await sql`SELECT * FROM tryouts WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapTryout(rows[0]) : null;
}

export async function getTryoutSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM tryouts WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapTryout(r: Record<string, unknown>): Tryout {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    organizerName: r.organizer_name as string,
    clubName: r.club_name as string | undefined,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    tryoutType: r.tryout_type as string,
    ageGroup: r.age_group as string, gender: r.gender as string,
    dates: r.dates as string, time: r.time as string | undefined,
    location: r.location as string | undefined, cost: r.cost as string | undefined,
    description: r.description as string,
    registrationUrl: r.registration_url as string | undefined,
    website: r.website as string | undefined,
    email: r.email as string | undefined, phone: r.phone as string | undefined,
    isPast: !!r.is_past,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    announcementHeading: r.announcement_heading as string | undefined,
    announcementText: r.announcement_text as string | undefined,
    announcementImage: r.announcement_image as string | undefined,
    announcementCta: r.announcement_cta as string | undefined,
    announcementCtaUrl: r.announcement_cta_url as string | undefined,
    announcementHeading2: r.announcement_heading_2 as string | undefined,
    announcementText2: r.announcement_text_2 as string | undefined,
    announcementImage2: r.announcement_image_2 as string | undefined,
    announcementCta2: r.announcement_cta_2 as string | undefined,
    announcementCtaUrl2: r.announcement_cta_url_2 as string | undefined,
    announcementHeading3: r.announcement_heading_3 as string | undefined,
    announcementText3: r.announcement_text_3 as string | undefined,
    announcementImage3: r.announcement_image_3 as string | undefined,
    announcementCta3: r.announcement_cta_3 as string | undefined,
    announcementCtaUrl3: r.announcement_cta_url_3 as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── Special Events ──────────────────────────────────────────
export async function getSpecialEvents(): Promise<SpecialEvent[]> {
  const rows = await sql`SELECT * FROM special_events WHERE status = 'approved' ORDER BY featured DESC, created_at DESC`;
  return rows.map(mapSpecialEvent);
}

export async function getSpecialEventBySlug(slug: string): Promise<SpecialEvent | null> {
  const rows = await sql`SELECT * FROM special_events WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapSpecialEvent(rows[0]) : null;
}

export async function getSpecialEventSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM special_events WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapSpecialEvent(r: Record<string, unknown>): SpecialEvent {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    organizerName: r.organizer_name as string,
    clubName: r.club_name as string | undefined,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    eventType: r.event_type as string,
    ageGroup: r.age_group as string, gender: r.gender as string,
    dates: r.dates as string, time: r.time as string | undefined,
    location: r.location as string | undefined, cost: r.cost as string | undefined,
    description: r.description as string,
    registrationUrl: r.registration_url as string | undefined,
    website: r.website as string | undefined,
    email: r.email as string | undefined, phone: r.phone as string | undefined,
    isPast: !!r.is_past,
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

export async function getPlayersWithHighlightVideos(): Promise<PlayerProfile[]> {
  const rows = await sql`SELECT * FROM player_profiles WHERE status = 'approved' AND highlight_videos IS NOT NULL AND highlight_videos != '[]'::jsonb ORDER BY player_name ASC`;
  return rows.map(mapPlayerProfile);
}

function mapPlayerProfile(r: Record<string, unknown>): PlayerProfile {
  let gameHighlights: PlayerProfile["gameHighlights"];
  if (r.game_highlights) {
    try { gameHighlights = JSON.parse(r.game_highlights as string); } catch { gameHighlights = undefined; }
  }
  let highlightVideos: PlayerProfile["highlightVideos"];
  if (r.highlight_videos) {
    try { highlightVideos = typeof r.highlight_videos === 'string' ? JSON.parse(r.highlight_videos) : r.highlight_videos as PlayerProfile["highlightVideos"]; } catch { highlightVideos = undefined; }
  }
  return {
    id: r.id as string, slug: r.slug as string, playerName: r.player_name as string,
    position: r.position as string, secondaryPosition: r.secondary_position as string | undefined,
    birthYear: r.birth_year as string, birthMonth: r.birth_month as string | undefined, height: r.height as string | undefined,
    preferredFoot: r.preferred_foot as string | undefined,
    currentClub: r.current_club as string | undefined,
    league: r.league as string | undefined,
    teamName: r.team_name as string | undefined,
    favoriteTeam: r.favorite_team as string | undefined,
    favoritePlayer: r.favorite_player as string | undefined,
    gameHighlights,
    highlightVideos,
    cvUrl: r.cv_url as string | undefined,
    availableForGuestPlay: r.available_for_guest_play as boolean | undefined,
    lookingForTeam: r.looking_for_team as boolean | undefined,
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
    hostHeading: r.host_heading as string | undefined,
    hostImage: r.host_image as string | undefined,
    hostBio: r.host_bio as string | undefined,
    previewImage: r.preview_image as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── YouTube Channels ────────────────────────────────────────
export async function getYoutubeChannels(): Promise<YoutubeChannel[]> {
  const rows = await sql`SELECT * FROM youtube_channels WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapYoutubeChannel);
}

export async function getYoutubeChannelBySlug(slug: string): Promise<YoutubeChannel | null> {
  const rows = await sql`SELECT * FROM youtube_channels WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapYoutubeChannel(rows[0]) : null;
}

export async function getYoutubeChannelSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM youtube_channels WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapYoutubeChannel(r: Record<string, unknown>): YoutubeChannel {
  let featuredVideos: FeaturedVideo[] | undefined;
  if (r.featured_videos) {
    try {
      featuredVideos = typeof r.featured_videos === "string" ? JSON.parse(r.featured_videos) : r.featured_videos as FeaturedVideo[];
    } catch { featuredVideos = undefined; }
  }
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    creatorName: r.creator_name as string, category: r.category as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    description: r.description as string | undefined,
    website: r.website as string | undefined,
    channelUrl: r.channel_url as string | undefined,
    subscribeUrl: r.subscribe_url as string | undefined,
    email: r.email as string | undefined,
    featuredVideos,
    videoUrl2: r.video_url_2 as string | undefined,
    videoUrl3: r.video_url_3 as string | undefined,
    creatorHeading: r.creator_heading as string | undefined,
    creatorImage: r.creator_image as string | undefined,
    creatorBio: r.creator_bio as string | undefined,
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
    website: r.website as string | undefined,
    email: r.email as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── Instagram Pages ─────────────────────────────────────────
export async function getInstagramPages(): Promise<InstagramPage[]> {
  const rows = await sql`SELECT * FROM instagram_pages WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapInstagramPage);
}

export async function getInstagramPageBySlug(slug: string): Promise<InstagramPage | null> {
  const rows = await sql`SELECT * FROM instagram_pages WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapInstagramPage(rows[0]) : null;
}

export async function getInstagramPageSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM instagram_pages WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapInstagramPage(r: Record<string, unknown>): InstagramPage {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    ownerName: r.owner_name as string, category: r.category as string,
    pageUrl: r.page_url as string,
    followerCount: r.follower_count as string | undefined,
    privacy: r.privacy as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    description: r.description as string | undefined,
    website: r.website as string | undefined,
    email: r.email as string | undefined,
    phone: r.phone as string | undefined,
    tagline: r.tagline as string | undefined,
    videoUrl2: r.video_url_2 as string | undefined,
    videoUrl3: r.video_url_3 as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── TikTok Pages ────────────────────────────────────────────
export async function getTikTokPages(): Promise<TikTokPage[]> {
  const rows = await sql`SELECT * FROM tiktok_pages WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapTikTokPage);
}

export async function getTikTokPageBySlug(slug: string): Promise<TikTokPage | null> {
  const rows = await sql`SELECT * FROM tiktok_pages WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapTikTokPage(rows[0]) : null;
}

export async function getTikTokPageSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM tiktok_pages WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapTikTokPage(r: Record<string, unknown>): TikTokPage {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    ownerName: r.owner_name as string, category: r.category as string,
    pageUrl: r.page_url as string,
    followerCount: r.follower_count as string | undefined,
    privacy: r.privacy as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    description: r.description as string | undefined,
    website: r.website as string | undefined,
    email: r.email as string | undefined,
    phone: r.phone as string | undefined,
    tagline: r.tagline as string | undefined,
    videoUrl2: r.video_url_2 as string | undefined,
    videoUrl3: r.video_url_3 as string | undefined,
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
    aboutAuthor: r.about_author as string | undefined,
    tagline: r.tagline as string | undefined,
    sponsors: r.sponsors ? (() => { try { return JSON.parse(r.sponsors as string); } catch { return undefined; } })() : undefined,
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

// ── Scrimmages ──────────────────────────────────────────────
export async function getScrimmages(): Promise<Scrimmage[]> {
  const rows = await sql`SELECT * FROM scrimmages WHERE status = 'approved' ORDER BY featured DESC, created_at DESC`;
  return rows.map(mapScrimmage);
}

export async function getScrimmageBySlug(slug: string): Promise<Scrimmage | null> {
  const rows = await sql`SELECT * FROM scrimmages WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapScrimmage(rows[0]) : null;
}

export async function getScrimmageSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM scrimmages WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapScrimmage(r: Record<string, unknown>): Scrimmage {
  return {
    id: r.id as string, slug: r.slug as string, teamName: r.team_name as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    level: r.level as string, ageGroup: r.age_group as string, gender: r.gender as string,
    availability: r.availability as string, contactEmail: r.contact_email as string,
    description: r.description as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    ...mapProfileFields(r),
  };
}

// ── Blog Posts ───────────────────────────────────────────────
export async function getBlogPosts(): Promise<BlogPost[]> {
  const rows = await sql`SELECT * FROM blog_posts ORDER BY created_at DESC`;
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
  await sql`DELETE FROM recruiters WHERE user_id = ${userId}`;
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
  const [clubs, teams, trainers, recruiters, camps, guests, tournaments, futsals, trips, marketplace, players, podcasts, fbgroups, services, tryouts, specialEvents, trainingApps, blogRows, youtubeRows, scrimmageRows, soccerBookRows, photoVideoRows] = await Promise.all([
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'club' as type FROM clubs ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'team' as type FROM teams ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'trainer' as type FROM trainers ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'recruiter' as type FROM recruiters ORDER BY created_at DESC`,
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
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'tryout' as type FROM tryouts ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'specialevent' as type FROM special_events ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'trainingapp' as type FROM training_apps ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'blog' as type FROM blogs ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'youtube' as type FROM youtube_channels ORDER BY created_at DESC`,
    sql`SELECT id, slug, team_name as name, status, featured, user_id, created_at, 'scrimmage' as type FROM scrimmages ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'soccerbook' as type FROM books ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, featured, user_id, created_at, 'photovideo' as type FROM photo_video_services ORDER BY created_at DESC`,
  ]);
  return [...clubs, ...teams, ...trainers, ...recruiters, ...camps, ...guests, ...tournaments, ...futsals, ...trips, ...marketplace, ...players, ...podcasts, ...fbgroups, ...services, ...tryouts, ...specialEvents, ...trainingApps, ...blogRows, ...youtubeRows, ...scrimmageRows, ...soccerBookRows, ...photoVideoRows].map((r) => ({
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
    case "recruiter": await sql`UPDATE recruiters SET status = ${status} WHERE id = ${id}`; break;
    case "camp": await sql`UPDATE camps SET status = ${status} WHERE id = ${id}`; break;
    case "guest": await sql`UPDATE guest_opportunities SET status = ${status} WHERE id = ${id}`; break;
    case "tournament": await sql`UPDATE tournaments SET status = ${status} WHERE id = ${id}`; break;
    case "futsal": await sql`UPDATE futsal_teams SET status = ${status} WHERE id = ${id}`; break;
    case "trip": await sql`UPDATE international_trips SET status = ${status} WHERE id = ${id}`; break;
    case "marketplace": await sql`UPDATE marketplace SET status = ${status} WHERE id = ${id}`; break;
    case "player": await sql`UPDATE player_profiles SET status = ${status} WHERE id = ${id}`; break;
    case "podcast": await sql`UPDATE podcasts SET status = ${status} WHERE id = ${id}`; break;
    case "fbgroup": await sql`UPDATE facebook_groups SET status = ${status} WHERE id = ${id}`; break;
    case "instagrampage": await sql`UPDATE instagram_pages SET status = ${status} WHERE id = ${id}`; break;
    case "tiktokpage": await sql`UPDATE tiktok_pages SET status = ${status} WHERE id = ${id}`; break;
    case "service": await sql`UPDATE services SET status = ${status} WHERE id = ${id}`; break;
    case "tryout": await sql`UPDATE tryouts SET status = ${status} WHERE id = ${id}`; break;
    case "specialevent": await sql`UPDATE special_events SET status = ${status} WHERE id = ${id}`; break;
    case "trainingapp": await sql`UPDATE training_apps SET status = ${status} WHERE id = ${id}`; break;
    case "blog": await sql`UPDATE blogs SET status = ${status} WHERE id = ${id}`; break;
    case "youtube": await sql`UPDATE youtube_channels SET status = ${status} WHERE id = ${id}`; break;
    case "scrimmage": await sql`UPDATE scrimmages SET status = ${status} WHERE id = ${id}`; break;
    case "soccerbook": await sql`UPDATE books SET status = ${status} WHERE id = ${id}`; break;
    case "photovideo": await sql`UPDATE photo_video_services SET status = ${status} WHERE id = ${id}`; break;
  }
}

export async function updateListingFeatured(type: string, id: string, featured: boolean): Promise<void> {
  type = normalizeType(type);
  switch (type) {
    case "club": await sql`UPDATE clubs SET featured = ${featured} WHERE id = ${id}`; break;
    case "team": await sql`UPDATE teams SET featured = ${featured} WHERE id = ${id}`; break;
    case "trainer": await sql`UPDATE trainers SET featured = ${featured} WHERE id = ${id}`; break;
    case "recruiter": await sql`UPDATE recruiters SET featured = ${featured} WHERE id = ${id}`; break;
    case "camp": await sql`UPDATE camps SET featured = ${featured} WHERE id = ${id}`; break;
    case "guest": await sql`UPDATE guest_opportunities SET featured = ${featured} WHERE id = ${id}`; break;
    case "tournament": await sql`UPDATE tournaments SET featured = ${featured} WHERE id = ${id}`; break;
    case "futsal": await sql`UPDATE futsal_teams SET featured = ${featured} WHERE id = ${id}`; break;
    case "trip": await sql`UPDATE international_trips SET featured = ${featured} WHERE id = ${id}`; break;
    case "marketplace": await sql`UPDATE marketplace SET featured = ${featured} WHERE id = ${id}`; break;
    case "player": await sql`UPDATE player_profiles SET featured = ${featured} WHERE id = ${id}`; break;
    case "podcast": await sql`UPDATE podcasts SET featured = ${featured} WHERE id = ${id}`; break;
    case "fbgroup": await sql`UPDATE facebook_groups SET featured = ${featured} WHERE id = ${id}`; break;
    case "instagrampage": await sql`UPDATE instagram_pages SET featured = ${featured} WHERE id = ${id}`; break;
    case "tiktokpage": await sql`UPDATE tiktok_pages SET featured = ${featured} WHERE id = ${id}`; break;
    case "service": await sql`UPDATE services SET featured = ${featured} WHERE id = ${id}`; break;
    case "tryout": await sql`UPDATE tryouts SET featured = ${featured} WHERE id = ${id}`; break;
    case "specialevent": await sql`UPDATE special_events SET featured = ${featured} WHERE id = ${id}`; break;
    case "trainingapp": await sql`UPDATE training_apps SET featured = ${featured} WHERE id = ${id}`; break;
    case "blog": await sql`UPDATE blogs SET featured = ${featured} WHERE id = ${id}`; break;
    case "youtube": await sql`UPDATE youtube_channels SET featured = ${featured} WHERE id = ${id}`; break;
    case "scrimmage": await sql`UPDATE scrimmages SET featured = ${featured} WHERE id = ${id}`; break;
    case "soccerbook": await sql`UPDATE books SET featured = ${featured} WHERE id = ${id}`; break;
    case "photovideo": await sql`UPDATE photo_video_services SET featured = ${featured} WHERE id = ${id}`; break;
  }
}

// ── Inline Patch (single field) ──────────────────────────────

const TYPE_TO_TABLE: Record<string, string> = {
  club: "clubs", team: "teams", trainer: "trainers", recruiter: "recruiters", camp: "camps",
  guest: "guest_opportunities", tournament: "tournaments", futsal: "futsal_teams",
  trip: "international_trips", marketplace: "marketplace", player: "player_profiles",
  podcast: "podcasts", fbgroup: "facebook_groups", instagrampage: "instagram_pages", tiktokpage: "tiktok_pages", service: "services",
  tryout: "tryouts", specialevent: "special_events", trainingapp: "training_apps", blog: "blogs", youtube: "youtube_channels",
  scrimmage: "scrimmages", soccerbook: "books", photovideo: "photo_video_services",
};

const FIELD_TO_COLUMN: Record<string, string> = {
  name: "name", description: "description", tagline: "tagline",
  aboutAuthor: "about_author", price: "price", website: "website",
  email: "email", phone: "phone", providerName: "provider_name",
  hostName: "host_name", creatorName: "creator_name", ownerName: "owner_name",
  organizerName: "organizer_name", organizer: "organizer",
  coach: "coach", specialty: "specialty", experience: "experience",
  credentials: "credentials", priceRange: "price_range",
  serviceArea: "service_area", category: "category",
  teamName: "team_name", tripName: "trip_name", playerName: "player_name",
  hostBio: "host_bio", creatorBio: "creator_bio", authorBio: "author_bio",
  hostHeading: "host_heading", creatorHeading: "creator_heading",
};

export async function patchListingField(
  type: string, id: string, field: string, value: string, userId?: string
): Promise<boolean> {
  type = normalizeType(type);
  const table = TYPE_TO_TABLE[type];
  const column = FIELD_TO_COLUMN[field];
  if (!table || !column) return false;

  const val = value || null;
  // table and column come from hardcoded maps — safe to build tagged template
  // neon() only supports tagged templates, so we construct TemplateStringsArray manually
  const strings = userId
    ? [`UPDATE ${table} SET ${column} = `, `, updated_at = NOW() WHERE id = `, ` AND user_id = `, ` RETURNING id`]
    : [`UPDATE ${table} SET ${column} = `, `, updated_at = NOW() WHERE id = `, ` RETURNING id`];
  Object.defineProperty(strings, "raw", { value: strings });
  const rows = userId
    ? await sql(strings as unknown as TemplateStringsArray, val, id, userId)
    : await sql(strings as unknown as TemplateStringsArray, val, id);
  return rows.length > 0;
}

// ── Listings by User ─────────────────────────────────────────
export async function getListingsByUserId(userId: string) {
  const [clubRows, teamRows, trainerRows, recruiterRows, campRows, guestRows, tournamentRows, futsalRows, tripRows, marketplaceRows, playerRows, podcastRows, fbgroupRows, instagramRows, tiktokRows, serviceRows, tryoutRows, specialEventRows, trainingAppRows, blogRows, youtubeRows, fundraiserRows, scrimmageRows, soccerBookRows, photoVideoRows] = await Promise.all([
    sql`SELECT id, slug, name, status, 'club' as type FROM clubs WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'team' as type FROM teams WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'trainer' as type FROM trainers WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'recruiter' as type FROM recruiters WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, CASE WHEN camp_type = 'College Showcase' THEN 'showcase' ELSE 'camp' END as type FROM camps WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, team_name as name, status, 'guest' as type FROM guest_opportunities WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'tournament' as type FROM tournaments WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'futsal' as type FROM futsal_teams WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, trip_name as name, status, 'trip' as type FROM international_trips WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, CASE WHEN category = 'Books' THEN 'books' WHEN category = 'Ebook' THEN 'ebook' WHEN category = 'Giveaway' THEN 'giveaway' ELSE 'equipment' END as type FROM marketplace WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, player_name as name, status, 'player' as type FROM player_profiles WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'podcast' as type FROM podcasts WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'fbgroup' as type FROM facebook_groups WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'instagrampage' as type FROM instagram_pages WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'tiktokpage' as type FROM tiktok_pages WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'service' as type FROM services WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'tryout' as type FROM tryouts WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'specialevent' as type FROM special_events WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'trainingapp' as type FROM training_apps WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'blog' as type FROM blogs WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'youtube' as type FROM youtube_channels WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, title as name, CASE WHEN active THEN 'approved' ELSE 'archived' END as status, 'fundraiser' as type FROM fundraisers WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, team_name as name, status, 'scrimmage' as type FROM scrimmages WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'soccerbook' as type FROM books WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT id, slug, name, status, 'photovideo' as type FROM photo_video_services WHERE user_id = ${userId} ORDER BY created_at DESC`,
  ]);
  return [...clubRows, ...teamRows, ...trainerRows, ...recruiterRows, ...campRows, ...guestRows, ...tournamentRows, ...futsalRows, ...tripRows, ...marketplaceRows, ...playerRows, ...podcastRows, ...fbgroupRows, ...instagramRows, ...tiktokRows, ...serviceRows, ...tryoutRows, ...specialEventRows, ...trainingAppRows, ...blogRows, ...youtubeRows, ...fundraiserRows, ...scrimmageRows, ...soccerBookRows, ...photoVideoRows] as { id: string; slug: string; name: string; status: string; type: string }[];
}

// ── Create Listings ──────────────────────────────────────────
function parsePhotos(raw: string | undefined | null): string[] | null {
  if (!raw) return null;
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) return arr.filter(Boolean);
  } catch { /* not JSON, try as-is */ }
  return raw ? [raw] : null;
}

function profileFields(data: Record<string, string>) {
  return {
    teamPhoto: data.teamPhoto || null,
    photos: data.photos || null,
    videoUrl: data.videoUrl !== undefined ? (data.videoUrl || "") : null,
    practiceSchedule: data.practiceSchedule || null,
    address: data.address || null,
    mediaLinks: data.mediaLinks || null,
    imagePosition: data.imagePosition ? Number(data.imagePosition) : 50,
    heroImagePosition: data.heroImagePosition ? Number(data.heroImagePosition) : 50,
    tagline: data.tagline || null,
    previewImage: data.previewImage || null,
    sponsors: data.sponsors || null,
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
  await sql`INSERT INTO clubs (id, slug, name, city, country, state, level, league, league_url, age_groups, gender, team_count, description, website, email, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, practice_schedule, address, media_links, open_positions, scholarships_available, guest_players_welcomed, announcement_heading, announcement_text, announcement_image, announcement_heading_2, announcement_text_2, announcement_image_2, announcement_heading_3, announcement_text_3, announcement_image_3, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.league || null}, ${data.leagueUrl || null}, ${data.ageGroups}, ${data.gender}, ${Number(data.teamCount) || 0}, ${data.description}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.practiceSchedule}, ${pf.address}, ${pf.mediaLinks}, ${data.openPositions || null}, ${data.scholarshipsAvailable || null}, ${data.guestPlayersWelcomed || null}, ${data.announcementHeading || null}, ${data.announcementText || null}, ${data.announcementImage || null}, ${data.announcementHeading2 || null}, ${data.announcementText2 || null}, ${data.announcementImage2 || null}, ${data.announcementHeading3 || null}, ${data.announcementText3 || null}, ${data.announcementImage3 || null}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTeamListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO teams (id, slug, name, club_name, city, country, state, level, age_group, gender, coach, looking_for_players, positions_needed, season, description, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, practice_schedule, address, events, annual_tournaments, media_links, scholarships_available, guest_players_welcomed, announcement_heading, announcement_text, announcement_image, announcement_heading_2, announcement_text_2, announcement_image_2, announcement_heading_3, announcement_text_3, announcement_image_3, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.clubName || null}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.ageGroup}, ${data.gender}, ${data.coach}, ${data.lookingForPlayers === "true"}, ${data.positionsNeeded || null}, ${data.season}, ${data.description || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.practiceSchedule}, ${pf.address}, ${data.events || null}, ${data.annualTournaments || null}, ${pf.mediaLinks}, ${data.scholarshipsAvailable || null}, ${data.guestPlayersWelcomed || null}, ${data.announcementHeading || null}, ${data.announcementText || null}, ${data.announcementImage || null}, ${data.announcementHeading2 || null}, ${data.announcementText2 || null}, ${data.announcementImage2 || null}, ${data.announcementHeading3 || null}, ${data.announcementText3 || null}, ${data.announcementImage3 || null}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTrainerListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO trainers (id, slug, name, city, country, state, specialty, experience, credentials, price_range, service_area, description, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, practice_schedule, address, rating, review_count, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.specialty}, ${data.experience}, ${data.credentials}, ${data.priceRange}, ${data.serviceArea}, ${data.description || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.practiceSchedule}, ${pf.address}, 0, 0, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createRecruiterListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO recruiters (id, slug, name, city, country, state, specialty, experience, credentials, price_range, service_area, description, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, practice_schedule, address, rating, review_count, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.specialty}, ${data.experience}, ${data.credentials}, ${data.priceRange}, ${data.serviceArea}, ${data.description || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.practiceSchedule}, ${pf.address}, 0, 0, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createCampListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO camps (id, slug, name, organizer_name, city, country, state, camp_type, age_range, dates, price, gender, location, description, registration_url, email, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, sponsors, announcement_heading, announcement_text, announcement_image, announcement_cta, announcement_cta_url, announcement_heading_2, announcement_text_2, announcement_image_2, announcement_cta_2, announcement_cta_url_2, announcement_heading_3, announcement_text_3, announcement_image_3, announcement_cta_3, announcement_cta_url_3, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.organizerName}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.campType}, ${data.ageRange}, ${data.dates}, ${data.price}, ${data.gender}, ${data.location || null}, ${data.description}, ${data.registrationUrl || null}, ${data.email || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.sponsors}, ${data.announcementHeading || null}, ${data.announcementText || null}, ${data.announcementImage || null}, ${data.announcementCta || null}, ${data.announcementCtaUrl || null}, ${data.announcementHeading2 || null}, ${data.announcementText2 || null}, ${data.announcementImage2 || null}, ${data.announcementCta2 || null}, ${data.announcementCtaUrl2 || null}, ${data.announcementHeading3 || null}, ${data.announcementText3 || null}, ${data.announcementImage3 || null}, ${data.announcementCta3 || null}, ${data.announcementCtaUrl3 || null}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTryoutListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO tryouts (id, slug, name, organizer_name, club_name, city, country, state, tryout_type, age_group, gender, dates, time, location, cost, description, registration_url, website, email, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, sponsors, announcement_heading, announcement_text, announcement_image, announcement_cta, announcement_cta_url, announcement_heading_2, announcement_text_2, announcement_image_2, announcement_cta_2, announcement_cta_url_2, announcement_heading_3, announcement_text_3, announcement_image_3, announcement_cta_3, announcement_cta_url_3, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.organizerName}, ${data.clubName || null}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.tryoutType}, ${data.ageGroup}, ${data.gender}, ${data.dates}, ${data.time || null}, ${data.location || null}, ${data.cost || null}, ${data.description}, ${data.registrationUrl || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.sponsors}, ${data.announcementHeading || null}, ${data.announcementText || null}, ${data.announcementImage || null}, ${data.announcementCta || null}, ${data.announcementCtaUrl || null}, ${data.announcementHeading2 || null}, ${data.announcementText2 || null}, ${data.announcementImage2 || null}, ${data.announcementCta2 || null}, ${data.announcementCtaUrl2 || null}, ${data.announcementHeading3 || null}, ${data.announcementText3 || null}, ${data.announcementImage3 || null}, ${data.announcementCta3 || null}, ${data.announcementCtaUrl3 || null}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createSpecialEventListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO special_events (id, slug, name, organizer_name, club_name, city, country, state, event_type, age_group, gender, dates, time, location, cost, description, registration_url, website, email, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, tagline, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.organizerName}, ${data.clubName || null}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.eventType}, ${data.ageGroup}, ${data.gender}, ${data.dates}, ${data.time || null}, ${data.location || null}, ${data.cost || null}, ${data.description || null}, ${data.registrationUrl || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.tagline}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createGuestListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.teamName + "-" + data.tournament);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO guest_opportunities (id, slug, team_name, city, country, state, level, age_group, gender, dates, tournament, positions_needed, contact_email, description, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.teamName}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.ageGroup}, ${data.gender}, ${data.dates}, ${data.tournament}, ${data.positionsNeeded}, ${data.contactEmail}, ${data.description || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTournamentListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO tournaments (id, slug, name, organizer, city, country, state, dates, age_groups, gender, level, entry_fee, format, description, registration_url, email, region, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.organizer}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.dates}, ${data.ageGroups}, ${data.gender}, ${data.level}, ${data.entryFee}, ${data.format}, ${data.description}, ${data.registrationUrl || null}, ${data.email || null}, ${data.region || 'US'}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createFutsalListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO futsal_teams (id, slug, name, club_name, city, country, state, level, age_group, gender, coach, looking_for_players, positions_needed, season, description, format, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, practice_schedule, address, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.clubName || null}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.ageGroup}, ${data.gender}, ${data.coach}, ${data.lookingForPlayers === "true"}, ${data.positionsNeeded || null}, ${data.season}, ${data.description || null}, ${data.format || '5v5'}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.practiceSchedule}, ${pf.address}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createScrimmageListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.teamName + "-" + data.city);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO scrimmages (id, slug, team_name, city, country, state, level, age_group, gender, availability, contact_email, description, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, tagline, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.teamName}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.ageGroup}, ${data.gender}, ${data.availability || 'Looking for Scrimmage'}, ${data.contactEmail}, ${data.description || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.tagline}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTripListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.tripName + "-" + data.destination);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO international_trips (id, slug, trip_name, organizer, destination, city, country, state, dates, age_group, gender, level, price, spots_available, contact_email, description, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.tripName}, ${data.organizer}, ${data.destination}, ${data.city}, ${data.country || 'International'}, ${data.state || ''}, ${data.dates}, ${data.ageGroup}, ${data.gender}, ${data.level}, ${data.price || null}, ${data.spotsAvailable || null}, ${data.contactEmail}, ${data.description || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createMarketplaceListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  await sql`INSERT INTO marketplace (id, slug, name, category, description, price, condition, city, country, state, contact_email, phone, image_url, image_position, hero_image_position, photos, about_author, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.category}, ${data.description}, ${data.price}, ${data.condition}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.contactEmail}, ${data.phone || null}, ${data.imageUrl || null}, ${Number(data.imagePosition) || 50}, ${Number(data.heroImagePosition) || 50}, ${parsePhotos(data.photos)}, ${data.aboutAuthor || null}, ${data.sponsors || null}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createPlayerProfile(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.playerName + "-" + data.birthYear);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO player_profiles (id, slug, player_name, position, secondary_position, birth_year, birth_month, height, preferred_foot, current_club, league, team_name, favorite_team, favorite_player, game_highlights, highlight_videos, cv_url, available_for_guest_play, looking_for_team, city, country, state, level, gender, gpa, description, looking_for, contact_email, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, video_url_2, video_url_3, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.playerName}, ${data.position}, ${data.secondaryPosition || null}, ${data.birthYear}, ${data.birthMonth || null}, ${data.height || null}, ${data.preferredFoot || null}, ${data.currentClub || null}, ${data.league || null}, ${data.teamName || null}, ${data.favoriteTeam || null}, ${data.favoritePlayer || null}, ${data.gameHighlights || null}, ${data.highlightVideos || '[]'}, ${data.cvUrl || null}, ${data.availableForGuestPlay === "true"}, ${data.lookingForTeam === "true"}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.level}, ${data.gender}, ${data.gpa || null}, ${data.description || null}, ${data.lookingFor || null}, ${data.contactEmail}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${data.videoUrl2 || null}, ${data.videoUrl3 || null}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createPodcastListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO podcasts (id, slug, name, host_name, category, city, country, state, description, website, rss_feed_url, follow_url, email, phone, top_episodes, host_heading, host_image, host_bio, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, video_url_2, video_url_3, media_links, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.hostName}, ${data.category}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.description || null}, ${data.website || null}, ${data.rssFeedUrl || null}, ${data.followUrl || null}, ${data.email || null}, ${data.phone || null}, ${data.topEpisodes || null}, ${data.hostHeading || null}, ${data.hostImage || null}, ${data.hostBio || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${data.videoUrl2 || null}, ${data.videoUrl3 || null}, ${pf.mediaLinks}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createFacebookGroupListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO facebook_groups (id, slug, name, admin_name, category, group_url, member_count, privacy, city, country, state, description, website, email, phone, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, media_links, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.adminName}, ${data.category}, ${data.groupUrl}, ${data.memberCount || null}, ${data.privacy || 'Public'}, ${data.city || ''}, ${data.country || ''}, ${data.state || ''}, ${data.description || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.mediaLinks}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createInstagramPageListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO instagram_pages (id, slug, name, owner_name, category, page_url, follower_count, privacy, city, country, state, description, website, email, phone, tagline, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, media_links, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.ownerName}, ${data.category}, ${data.pageUrl}, ${data.followerCount || null}, ${data.privacy || 'Public'}, ${data.city || ''}, ${data.country || ''}, ${data.state || ''}, ${data.description || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${data.tagline || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.mediaLinks}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTikTokPageListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO tiktok_pages (id, slug, name, owner_name, category, page_url, follower_count, privacy, city, country, state, description, website, email, phone, tagline, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, media_links, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.ownerName}, ${data.category}, ${data.pageUrl}, ${data.followerCount || null}, ${data.privacy || 'Public'}, ${data.city || ''}, ${data.country || ''}, ${data.state || ''}, ${data.description || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${data.tagline || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${pf.mediaLinks}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createServiceListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const pf = profileFields(data);
  await sql`INSERT INTO services (id, slug, name, provider_name, category, city, country, state, price, description, website, email, phone, image_url, video_url, image_position, hero_image_position, photos, announcement_heading, announcement_text, announcement_image, announcement_heading_2, announcement_text_2, announcement_image_2, announcement_heading_3, announcement_text_3, announcement_image_3, about_author, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.providerName}, ${data.category}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.price || null}, ${data.description || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${data.imageUrl || null}, ${data.videoUrl || null}, ${Number(data.imagePosition) || 50}, ${Number(data.heroImagePosition) || 50}, ${pf.photos}, ${data.announcementHeading || null}, ${data.announcementText || null}, ${data.announcementImage || null}, ${data.announcementHeading2 || null}, ${data.announcementText2 || null}, ${data.announcementImage2 || null}, ${data.announcementHeading3 || null}, ${data.announcementText3 || null}, ${data.announcementImage3 || null}, ${data.aboutAuthor || null}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createSoccerBookListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const pf = profileFields(data);
  await sql`INSERT INTO books (id, slug, name, author, category, city, country, state, price, description, website, email, phone, image_url, video_url, image_position, hero_image_position, photos, tagline, sponsors, about_author, announcement_heading, announcement_text, announcement_image, announcement_cta, announcement_cta_url, announcement_heading_2, announcement_text_2, announcement_image_2, announcement_cta_2, announcement_cta_url_2, announcement_heading_3, announcement_text_3, announcement_image_3, announcement_cta_3, announcement_cta_url_3, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.author || null}, ${data.category}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.price || null}, ${data.description || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${data.imageUrl || null}, ${data.videoUrl || null}, ${Number(data.imagePosition) || 50}, ${Number(data.heroImagePosition) || 50}, ${pf.photos}, ${pf.tagline}, ${pf.sponsors}, ${data.aboutAuthor || null}, ${data.announcementHeading || null}, ${data.announcementText || null}, ${data.announcementImage || null}, ${data.announcementCta || null}, ${data.announcementCtaUrl || null}, ${data.announcementHeading2 || null}, ${data.announcementText2 || null}, ${data.announcementImage2 || null}, ${data.announcementCta2 || null}, ${data.announcementCtaUrl2 || null}, ${data.announcementHeading3 || null}, ${data.announcementText3 || null}, ${data.announcementImage3 || null}, ${data.announcementCta3 || null}, ${data.announcementCtaUrl3 || null}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createPhotoVideoServiceListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const pf = profileFields(data);
  await sql`INSERT INTO photo_video_services (id, slug, name, provider_name, category, city, country, state, price, description, website, email, phone, image_url, video_url, image_position, hero_image_position, photos, tagline, sponsors, about_author, announcement_heading, announcement_text, announcement_image, announcement_cta, announcement_cta_url, announcement_heading_2, announcement_text_2, announcement_image_2, announcement_cta_2, announcement_cta_url_2, announcement_heading_3, announcement_text_3, announcement_image_3, announcement_cta_3, announcement_cta_url_3, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.providerName}, ${data.category}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.price || null}, ${data.description || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${data.imageUrl || null}, ${data.videoUrl || null}, ${Number(data.imagePosition) || 50}, ${Number(data.heroImagePosition) || 50}, ${pf.photos}, ${pf.tagline}, ${pf.sponsors}, ${data.aboutAuthor || null}, ${data.announcementHeading || null}, ${data.announcementText || null}, ${data.announcementImage || null}, ${data.announcementCta || null}, ${data.announcementCtaUrl || null}, ${data.announcementHeading2 || null}, ${data.announcementText2 || null}, ${data.announcementImage2 || null}, ${data.announcementCta2 || null}, ${data.announcementCtaUrl2 || null}, ${data.announcementHeading3 || null}, ${data.announcementText3 || null}, ${data.announcementImage3 || null}, ${data.announcementCta3 || null}, ${data.announcementCtaUrl3 || null}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createTrainingAppListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  await sql`INSERT INTO training_apps (id, slug, name, provider_name, category, city, country, state, price, description, website, email, phone, image_url, video_url, image_position, hero_image_position, photos, announcement_heading, announcement_text, announcement_image, announcement_cta, announcement_cta_url, announcement_heading_2, announcement_text_2, announcement_image_2, announcement_cta_2, announcement_cta_url_2, announcement_heading_3, announcement_text_3, announcement_image_3, announcement_cta_3, announcement_cta_url_3, about_author, tagline, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.providerName}, ${data.category}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.price || null}, ${data.description || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null}, ${data.imageUrl || null}, ${data.videoUrl || null}, ${Number(data.imagePosition) || 50}, ${Number(data.heroImagePosition) || 50}, ${parsePhotos(data.photos)}, ${data.announcementHeading || null}, ${data.announcementText || null}, ${data.announcementImage || null}, ${data.announcementCta || null}, ${data.announcementCtaUrl || null}, ${data.announcementHeading2 || null}, ${data.announcementText2 || null}, ${data.announcementImage2 || null}, ${data.announcementCta2 || null}, ${data.announcementCtaUrl2 || null}, ${data.announcementHeading3 || null}, ${data.announcementText3 || null}, ${data.announcementImage3 || null}, ${data.announcementCta3 || null}, ${data.announcementCtaUrl3 || null}, ${data.aboutAuthor || null}, ${data.tagline || null}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createBlogListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO blogs (id, slug, name, author_name, category, city, country, state, description, website, rss_feed_url, subscribe_url, email, phone, featured_posts, author_heading, author_image, author_bio, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, video_url_2, video_url_3, media_links, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.authorName}, ${data.category}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.description || null}, ${data.website || null}, ${data.rssFeedUrl || null}, ${data.subscribeUrl || null}, ${data.email || null}, ${data.phone || null}, ${data.featuredPosts || null}, ${data.authorHeading || null}, ${data.authorImage || null}, ${data.authorBio || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${data.videoUrl2 || null}, ${data.videoUrl3 || null}, ${pf.mediaLinks}, ${pf.sponsors}, false, ${userId}, 'approved')`;
  return slug;
}

export async function createYoutubeChannelListing(data: Record<string, string>, userId: string) {
  const id = genId();
  const slug = slugify(data.name);
  const sm = buildSocialMedia(data);
  const pf = profileFields(data);
  await sql`INSERT INTO youtube_channels (id, slug, name, creator_name, category, city, country, state, description, website, channel_url, subscribe_url, email, phone, featured_videos, creator_heading, creator_image, creator_bio, social_media, logo, image_url, team_photo, image_position, hero_image_position, photos, video_url, video_url_2, video_url_3, media_links, sponsors, featured, user_id, status) VALUES (${id}, ${slug}, ${data.name}, ${data.creatorName}, ${data.category}, ${data.city}, ${data.country || 'United States'}, ${data.state}, ${data.description || null}, ${data.website || null}, ${data.channelUrl || null}, ${data.subscribeUrl || null}, ${data.email || null}, ${data.phone || null}, ${data.featuredVideos || null}, ${data.creatorHeading || null}, ${data.creatorImage || null}, ${data.creatorBio || null}, ${sm}, ${data.logo || null}, ${data.imageUrl || null}, ${pf.teamPhoto}, ${pf.imagePosition}, ${pf.heroImagePosition}, ${pf.photos}, ${pf.videoUrl}, ${data.videoUrl2 || null}, ${data.videoUrl3 || null}, ${pf.mediaLinks}, ${pf.sponsors}, false, ${userId}, 'approved')`;
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
    announcementHeading: r.announcement_heading as string | undefined,
    announcementText: r.announcement_text as string | undefined,
    announcementImage: r.announcement_image as string | undefined,
    announcementCta: r.announcement_cta as string | undefined,
    announcementCtaUrl: r.announcement_cta_url as string | undefined,
    announcementHeading2: r.announcement_heading_2 as string | undefined,
    announcementText2: r.announcement_text_2 as string | undefined,
    announcementImage2: r.announcement_image_2 as string | undefined,
    announcementCta2: r.announcement_cta_2 as string | undefined,
    announcementCtaUrl2: r.announcement_cta_url_2 as string | undefined,
    announcementHeading3: r.announcement_heading_3 as string | undefined,
    announcementText3: r.announcement_text_3 as string | undefined,
    announcementImage3: r.announcement_image_3 as string | undefined,
    announcementCta3: r.announcement_cta_3 as string | undefined,
    announcementCtaUrl3: r.announcement_cta_url_3 as string | undefined,
    aboutAuthor: r.about_author as string | undefined,
    featured: r.featured as boolean, status: r.status as string | undefined,
    userId: r.user_id as string | undefined, createdAt: r.created_at as string,
    updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── Soccer Books ─────────────────────────────────────────────
export async function getSoccerBooks(): Promise<SoccerBook[]> {
  const rows = await sql`SELECT * FROM books WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapSoccerBook);
}

export async function getSoccerBookBySlug(slug: string): Promise<SoccerBook | null> {
  const rows = await sql`SELECT * FROM books WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapSoccerBook(rows[0]) : null;
}

export async function getSoccerBookSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM books WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapSoccerBook(r: Record<string, unknown>): SoccerBook {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    author: r.author as string, category: r.category as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    price: r.price as string | undefined, description: r.description as string | undefined,
    website: r.website as string | undefined, email: r.email as string | undefined,
    announcementHeading: r.announcement_heading as string | undefined,
    announcementText: r.announcement_text as string | undefined,
    announcementImage: r.announcement_image as string | undefined,
    announcementCta: r.announcement_cta as string | undefined,
    announcementCtaUrl: r.announcement_cta_url as string | undefined,
    announcementHeading2: r.announcement_heading_2 as string | undefined,
    announcementText2: r.announcement_text_2 as string | undefined,
    announcementImage2: r.announcement_image_2 as string | undefined,
    announcementCta2: r.announcement_cta_2 as string | undefined,
    announcementCtaUrl2: r.announcement_cta_url_2 as string | undefined,
    announcementHeading3: r.announcement_heading_3 as string | undefined,
    announcementText3: r.announcement_text_3 as string | undefined,
    announcementImage3: r.announcement_image_3 as string | undefined,
    announcementCta3: r.announcement_cta_3 as string | undefined,
    announcementCtaUrl3: r.announcement_cta_url_3 as string | undefined,
    aboutAuthor: r.about_author as string | undefined,
    featured: r.featured as boolean, status: r.status as string | undefined,
    userId: r.user_id as string | undefined, createdAt: r.created_at as string,
    updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── Photo/Video Services ─────────────────────────────────────
export async function getPhotoVideoServices(): Promise<PhotoVideoService[]> {
  const rows = await sql`SELECT * FROM photo_video_services WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapPhotoVideoService);
}

export async function getPhotoVideoServiceBySlug(slug: string): Promise<PhotoVideoService | null> {
  const rows = await sql`SELECT * FROM photo_video_services WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapPhotoVideoService(rows[0]) : null;
}

export async function getPhotoVideoServiceSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM photo_video_services WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapPhotoVideoService(r: Record<string, unknown>): PhotoVideoService {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    providerName: r.provider_name as string, category: r.category as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    price: r.price as string | undefined, description: r.description as string | undefined,
    website: r.website as string | undefined, email: r.email as string | undefined,
    announcementHeading: r.announcement_heading as string | undefined,
    announcementText: r.announcement_text as string | undefined,
    announcementImage: r.announcement_image as string | undefined,
    announcementCta: r.announcement_cta as string | undefined,
    announcementCtaUrl: r.announcement_cta_url as string | undefined,
    announcementHeading2: r.announcement_heading_2 as string | undefined,
    announcementText2: r.announcement_text_2 as string | undefined,
    announcementImage2: r.announcement_image_2 as string | undefined,
    announcementCta2: r.announcement_cta_2 as string | undefined,
    announcementCtaUrl2: r.announcement_cta_url_2 as string | undefined,
    announcementHeading3: r.announcement_heading_3 as string | undefined,
    announcementText3: r.announcement_text_3 as string | undefined,
    announcementImage3: r.announcement_image_3 as string | undefined,
    announcementCta3: r.announcement_cta_3 as string | undefined,
    announcementCtaUrl3: r.announcement_cta_url_3 as string | undefined,
    aboutAuthor: r.about_author as string | undefined,
    featured: r.featured as boolean, status: r.status as string | undefined,
    userId: r.user_id as string | undefined, createdAt: r.created_at as string,
    updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── Training Apps ─────────────────────────────────────────────
export async function getTrainingApps(): Promise<TrainingApp[]> {
  const rows = await sql`SELECT * FROM training_apps WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapTrainingApp);
}

export async function getTrainingAppBySlug(slug: string): Promise<TrainingApp | null> {
  const rows = await sql`SELECT * FROM training_apps WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapTrainingApp(rows[0]) : null;
}

export async function getTrainingAppSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM training_apps WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapTrainingApp(r: Record<string, unknown>): TrainingApp {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    providerName: r.provider_name as string, category: r.category as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    price: r.price as string | undefined, description: r.description as string | undefined,
    website: r.website as string | undefined, email: r.email as string | undefined,
    announcementHeading: r.announcement_heading as string | undefined,
    announcementText: r.announcement_text as string | undefined,
    announcementImage: r.announcement_image as string | undefined,
    announcementCta: r.announcement_cta as string | undefined,
    announcementCtaUrl: r.announcement_cta_url as string | undefined,
    announcementHeading2: r.announcement_heading_2 as string | undefined,
    announcementText2: r.announcement_text_2 as string | undefined,
    announcementImage2: r.announcement_image_2 as string | undefined,
    announcementCta2: r.announcement_cta_2 as string | undefined,
    announcementCtaUrl2: r.announcement_cta_url_2 as string | undefined,
    announcementHeading3: r.announcement_heading_3 as string | undefined,
    announcementText3: r.announcement_text_3 as string | undefined,
    announcementImage3: r.announcement_image_3 as string | undefined,
    announcementCta3: r.announcement_cta_3 as string | undefined,
    announcementCtaUrl3: r.announcement_cta_url_3 as string | undefined,
    aboutAuthor: r.about_author as string | undefined,
    featured: r.featured as boolean, status: r.status as string | undefined,
    userId: r.user_id as string | undefined, createdAt: r.created_at as string,
    updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── Blogs ─────────────────────────────────────────────
export async function getBlogs(): Promise<Blog[]> {
  const rows = await sql`SELECT * FROM blogs WHERE status = 'approved' ORDER BY featured DESC, name ASC`;
  return rows.map(mapBlog);
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const rows = await sql`SELECT * FROM blogs WHERE slug = ${slug} AND status = 'approved' LIMIT 1`;
  return rows[0] ? mapBlog(rows[0]) : null;
}

export async function getBlogSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM blogs WHERE status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

function mapBlog(r: Record<string, unknown>): Blog {
  let featuredPosts: FeaturedPost[] | undefined;
  if (r.featured_posts) {
    try { featuredPosts = JSON.parse(r.featured_posts as string); } catch { featuredPosts = undefined; }
  }
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    authorName: r.author_name as string, category: r.category as string,
    city: r.city as string, state: r.state as string, country: r.country as string | undefined,
    description: r.description as string | undefined,
    website: r.website as string | undefined,
    rssFeedUrl: r.rss_feed_url as string | undefined,
    subscribeUrl: r.subscribe_url as string | undefined,
    email: r.email as string | undefined,
    featuredPosts,
    videoUrl2: r.video_url_2 as string | undefined,
    videoUrl3: r.video_url_3 as string | undefined,
    authorHeading: r.author_heading as string | undefined,
    authorImage: r.author_image as string | undefined,
    authorBio: r.author_bio as string | undefined,
    featured: r.featured as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string | undefined,
    ...mapProfileFields(r),
  };
}

// ── Ebooks ─────────────────────────────────────────────
export async function getEbooks(): Promise<MarketplaceItem[]> {
  const rows = await sql`SELECT * FROM marketplace WHERE category = 'Ebook' AND status = 'approved' ORDER BY featured DESC, created_at DESC`;
  return rows.map(mapMarketplaceItem);
}

export async function getEbookSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM marketplace WHERE category = 'Ebook' AND status = 'approved'`;
  return rows.map((r) => r.slug as string);
}

// ── Giveaways ─────────────────────────────────────────────
export async function getGiveaways(): Promise<MarketplaceItem[]> {
  const rows = await sql`SELECT * FROM marketplace WHERE category = 'Giveaway' AND status = 'approved' ORDER BY featured DESC, created_at DESC`;
  return rows.map(mapMarketplaceItem);
}

export async function getGiveawaySlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM marketplace WHERE category = 'Giveaway' AND status = 'approved'`;
  return rows.map((r) => r.slug as string);
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
    case "recruiter":
      rows = await sql`SELECT * FROM recruiters WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapRecruiterToForm(rows[0]);
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
    case "scrimmage":
      rows = await sql`SELECT * FROM scrimmages WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapScrimmageToForm(rows[0]);
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
    case "instagrampage":
      rows = await sql`SELECT * FROM instagram_pages WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapInstagramPageToForm(rows[0]);
    case "tiktokpage":
      rows = await sql`SELECT * FROM tiktok_pages WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapTikTokPageToForm(rows[0]);
    case "service":
      rows = await sql`SELECT * FROM services WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapServiceToForm(rows[0]);
    case "soccerbook":
      rows = await sql`SELECT * FROM books WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapSoccerBookToForm(rows[0]);
    case "photovideo":
      rows = await sql`SELECT * FROM photo_video_services WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapPhotoVideoServiceToForm(rows[0]);
    case "tryout":
      rows = await sql`SELECT * FROM tryouts WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapTryoutToForm(rows[0]);
    case "specialevent":
      rows = await sql`SELECT * FROM special_events WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapSpecialEventToForm(rows[0]);
    case "trainingapp":
      rows = await sql`SELECT * FROM training_apps WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapTrainingAppToForm(rows[0]);
    case "blog":
      rows = await sql`SELECT * FROM blogs WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapBlogToForm(rows[0]);
    case "youtube":
      rows = await sql`SELECT * FROM youtube_channels WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapYoutubeChannelToForm(rows[0]);
    case "fundraiser":
      rows = await sql`SELECT f.*, (SELECT json_agg(json_build_object('playerName', r.player_name, 'position', r.position, 'ageGroup', r.age_group, 'photoUrl', r.photo_url, 'bio', r.bio) ORDER BY r.sort_order) FROM fundraiser_roster r WHERE r.fundraiser_id = f.id) as roster_json FROM fundraisers f WHERE f.id = ${id} AND f.user_id = ${userId} LIMIT 1`;
      if (!rows[0]) return null;
      return mapFundraiserToForm(rows[0]);
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
    case "recruiter": rows = await sql`SELECT * FROM recruiters WHERE id = ${id} LIMIT 1`; break;
    case "camp": rows = await sql`SELECT * FROM camps WHERE id = ${id} LIMIT 1`; break;
    case "guest": rows = await sql`SELECT * FROM guest_opportunities WHERE id = ${id} LIMIT 1`; break;
    case "tournament": rows = await sql`SELECT * FROM tournaments WHERE id = ${id} LIMIT 1`; break;
    case "futsal": rows = await sql`SELECT * FROM futsal_teams WHERE id = ${id} LIMIT 1`; break;
    case "scrimmage": rows = await sql`SELECT * FROM scrimmages WHERE id = ${id} LIMIT 1`; break;
    case "trip": rows = await sql`SELECT * FROM international_trips WHERE id = ${id} LIMIT 1`; break;
    case "marketplace": rows = await sql`SELECT * FROM marketplace WHERE id = ${id} LIMIT 1`; break;
    case "player": rows = await sql`SELECT * FROM player_profiles WHERE id = ${id} LIMIT 1`; break;
    case "podcast": rows = await sql`SELECT * FROM podcasts WHERE id = ${id} LIMIT 1`; break;
    case "fbgroup": rows = await sql`SELECT * FROM facebook_groups WHERE id = ${id} LIMIT 1`; break;
    case "instagrampage": rows = await sql`SELECT * FROM instagram_pages WHERE id = ${id} LIMIT 1`; break;
    case "tiktokpage": rows = await sql`SELECT * FROM tiktok_pages WHERE id = ${id} LIMIT 1`; break;
    case "service": rows = await sql`SELECT * FROM services WHERE id = ${id} LIMIT 1`; break;
    case "soccerbook": rows = await sql`SELECT * FROM books WHERE id = ${id} LIMIT 1`; break;
    case "photovideo": rows = await sql`SELECT * FROM photo_video_services WHERE id = ${id} LIMIT 1`; break;
    case "tryout": rows = await sql`SELECT * FROM tryouts WHERE id = ${id} LIMIT 1`; break;
    case "specialevent": rows = await sql`SELECT * FROM special_events WHERE id = ${id} LIMIT 1`; break;
    case "trainingapp": rows = await sql`SELECT * FROM training_apps WHERE id = ${id} LIMIT 1`; break;
    case "blog": rows = await sql`SELECT * FROM blogs WHERE id = ${id} LIMIT 1`; break;
    case "youtube": rows = await sql`SELECT * FROM youtube_channels WHERE id = ${id} LIMIT 1`; break;
    case "fundraiser": rows = await sql`SELECT f.*, (SELECT json_agg(json_build_object('playerName', r.player_name, 'position', r.position, 'ageGroup', r.age_group, 'photoUrl', r.photo_url, 'bio', r.bio) ORDER BY r.sort_order) FROM fundraiser_roster r WHERE r.fundraiser_id = f.id) as roster_json FROM fundraisers f WHERE f.id = ${id} LIMIT 1`; break;
    default: return null;
  }
  if (!rows[0]) return null;
  switch (type) {
    case "club": return mapClubToForm(rows[0]);
    case "team": return mapTeamToForm(rows[0]);
    case "trainer": return mapTrainerToForm(rows[0]);
    case "recruiter": return mapRecruiterToForm(rows[0]);
    case "camp": return mapCampToForm(rows[0]);
    case "guest": return mapGuestToForm(rows[0]);
    case "tournament": return mapTournamentToForm(rows[0]);
    case "futsal": return mapFutsalToForm(rows[0]);
    case "scrimmage": return mapScrimmageToForm(rows[0]);
    case "trip": return mapTripToForm(rows[0]);
    case "marketplace": return mapMarketplaceToForm(rows[0]);
    case "player": return mapPlayerToForm(rows[0]);
    case "podcast": return mapPodcastToForm(rows[0]);
    case "fbgroup": return mapFacebookGroupToForm(rows[0]);
    case "instagrampage": return mapInstagramPageToForm(rows[0]);
    case "tiktokpage": return mapTikTokPageToForm(rows[0]);
    case "service": return mapServiceToForm(rows[0]);
    case "soccerbook": return mapSoccerBookToForm(rows[0]);
    case "photovideo": return mapPhotoVideoServiceToForm(rows[0]);
    case "tryout": return mapTryoutToForm(rows[0]);
    case "specialevent": return mapSpecialEventToForm(rows[0]);
    case "trainingapp": return mapTrainingAppToForm(rows[0]);
    case "blog": return mapBlogToForm(rows[0]);
    case "youtube": return mapYoutubeChannelToForm(rows[0]);
    case "fundraiser": return mapFundraiserToForm(rows[0]);
    default: return null;
  }
}

function mapFundraiserToForm(r: Record<string, unknown>): Record<string, string> {
  return {
    name: String(r.title || ""),
    slug: String(r.slug || ""),
    tagline: String(r.tagline || ""),
    description: String(r.description || ""),
    goal: r.goal ? String(Number(r.goal) / 100) : "",
    coachName: String(r.coach_name || ""),
    contactEmail: String(r.coach_email || ""),
    phone: String(r.coach_phone || ""),
    website: String(r.website_url || ""),
    facebookUrl: String(r.facebook_url || ""),
    instagramUrl: String(r.instagram_url || ""),
    imageUrl: String(r.hero_image_url || ""),
    tags: String(r.tags || ""),
    photos: String(r.photos || ""),
    videoUrl: String(r.video_url || ""),
    teamPhoto: String(r.team_photo || ""),
    announcementHeading: String(r.announcement_heading || ""),
    announcementText: String(r.announcement_text || ""),
    announcementImage: String(r.announcement_image || ""),
    announcementCta: String(r.announcement_cta || ""),
    announcementCtaUrl: String(r.announcement_cta_url || ""),
    announcementHeading2: String(r.announcement_heading_2 || ""),
    announcementText2: String(r.announcement_text_2 || ""),
    announcementImage2: String(r.announcement_image_2 || ""),
    announcementCta2: String(r.announcement_cta_2 || ""),
    announcementCtaUrl2: String(r.announcement_cta_url_2 || ""),
    announcementHeading3: String(r.announcement_heading_3 || ""),
    announcementText3: String(r.announcement_text_3 || ""),
    announcementImage3: String(r.announcement_image_3 || ""),
    announcementCta3: String(r.announcement_cta_3 || ""),
    announcementCtaUrl3: String(r.announcement_cta_url_3 || ""),
    roster: String(r.roster_json || ""),
  };
}

function parseSocial(raw: unknown): { facebook: string; instagram: string; youtube: string } {
  if (!raw) return { facebook: "", instagram: "", youtube: "" };
  try {
    const sm = typeof raw === "string" ? JSON.parse(raw) : raw;
    return { facebook: sm.facebook || "", instagram: sm.instagram || "", youtube: sm.youtube || "" };
  } catch { return { facebook: "", instagram: "", youtube: "" }; }
}

function s(v: unknown): string { return (v as string) || ""; }

function jsonOrStr(v: unknown): string { return !v ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); }
function profileFormFields(r: Record<string, unknown>): Record<string, string> {
  return { teamPhoto: s(r.team_photo), photos: jsonOrStr(r.photos), videoUrl: s(r.video_url), practiceSchedule: jsonOrStr(r.practice_schedule), address: s(r.address), imagePosition: String(r.image_position ?? 50), heroImagePosition: String(r.hero_image_position ?? 50), tagline: s(r.tagline), previewImage: s(r.preview_image), mediaLinks: jsonOrStr(r.media_links), sponsors: jsonOrStr(r.sponsors) };
}
function mapClubToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), level: s(r.level), league: s(r.league), leagueUrl: s(r.league_url), ageGroups: s(r.age_groups), gender: s(r.gender), teamCount: String(r.team_count || ""), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), openPositions: s(r.open_positions), scholarshipsAvailable: s(r.scholarships_available), fundraiserSlug: s(r.fundraiser_slug), announcementHeading: s(r.announcement_heading), announcementText: s(r.announcement_text), announcementImage: s(r.announcement_image), announcementCta: s(r.announcement_cta), announcementCtaUrl: s(r.announcement_cta_url), announcementHeading2: s(r.announcement_heading_2), announcementText2: s(r.announcement_text_2), announcementImage2: s(r.announcement_image_2), announcementCta2: s(r.announcement_cta_2), announcementCtaUrl2: s(r.announcement_cta_url_2), announcementHeading3: s(r.announcement_heading_3), announcementText3: s(r.announcement_text_3), announcementImage3: s(r.announcement_image_3), announcementCta3: s(r.announcement_cta_3), announcementCtaUrl3: s(r.announcement_cta_url_3), ...profileFormFields(r) };
}
function mapTeamToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), clubName: s(r.club_name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), level: s(r.level), ageGroup: s(r.age_group), gender: s(r.gender), coach: s(r.coach), lookingForPlayers: r.looking_for_players ? "true" : "false", guestPlayersWelcome: r.guest_players_welcomed !== false ? "true" : "false", positionsNeeded: s(r.positions_needed), season: s(r.season), description: s(r.description), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), events: s(r.events), annualTournaments: s(r.annual_tournaments), scholarshipsAvailable: s(r.scholarships_available), fundraiserSlug: s(r.fundraiser_slug), announcementHeading: s(r.announcement_heading), announcementText: s(r.announcement_text), announcementImage: s(r.announcement_image), announcementCta: s(r.announcement_cta), announcementCtaUrl: s(r.announcement_cta_url), announcementHeading2: s(r.announcement_heading_2), announcementText2: s(r.announcement_text_2), announcementImage2: s(r.announcement_image_2), announcementCta2: s(r.announcement_cta_2), announcementCtaUrl2: s(r.announcement_cta_url_2), announcementHeading3: s(r.announcement_heading_3), announcementText3: s(r.announcement_text_3), announcementImage3: s(r.announcement_image_3), announcementCta3: s(r.announcement_cta_3), announcementCtaUrl3: s(r.announcement_cta_url_3), ...profileFormFields(r) };
}
function mapTrainerToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), specialty: s(r.specialty), experience: s(r.experience), credentials: s(r.credentials), priceRange: s(r.price_range), serviceArea: s(r.service_area), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapRecruiterToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), specialty: s(r.specialty), experience: s(r.experience), credentials: s(r.credentials), priceRange: s(r.price_range), serviceArea: s(r.service_area), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapCampToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), organizerName: s(r.organizer_name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), campType: s(r.camp_type), ageRange: s(r.age_range), dates: s(r.dates), price: s(r.price), gender: s(r.gender), location: s(r.location), description: s(r.description), registrationUrl: s(r.registration_url), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), announcementHeading: s(r.announcement_heading), announcementText: s(r.announcement_text), announcementImage: s(r.announcement_image), announcementCta: s(r.announcement_cta), announcementCtaUrl: s(r.announcement_cta_url), announcementHeading2: s(r.announcement_heading_2), announcementText2: s(r.announcement_text_2), announcementImage2: s(r.announcement_image_2), announcementCta2: s(r.announcement_cta_2), announcementCtaUrl2: s(r.announcement_cta_url_2), announcementHeading3: s(r.announcement_heading_3), announcementText3: s(r.announcement_text_3), announcementImage3: s(r.announcement_image_3), announcementCta3: s(r.announcement_cta_3), announcementCtaUrl3: s(r.announcement_cta_url_3), ...profileFormFields(r) };
}
function mapTryoutToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), organizerName: s(r.organizer_name), clubName: s(r.club_name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), tryoutType: s(r.tryout_type), ageGroup: s(r.age_group), gender: s(r.gender), dates: s(r.dates), time: s(r.time), location: s(r.location), cost: s(r.cost), description: s(r.description), registrationUrl: s(r.registration_url), website: s(r.website), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), announcementHeading: s(r.announcement_heading), announcementText: s(r.announcement_text), announcementImage: s(r.announcement_image), announcementCta: s(r.announcement_cta), announcementCtaUrl: s(r.announcement_cta_url), announcementHeading2: s(r.announcement_heading_2), announcementText2: s(r.announcement_text_2), announcementImage2: s(r.announcement_image_2), announcementCta2: s(r.announcement_cta_2), announcementCtaUrl2: s(r.announcement_cta_url_2), announcementHeading3: s(r.announcement_heading_3), announcementText3: s(r.announcement_text_3), announcementImage3: s(r.announcement_image_3), announcementCta3: s(r.announcement_cta_3), announcementCtaUrl3: s(r.announcement_cta_url_3), ...profileFormFields(r) };
}
function mapSpecialEventToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), organizerName: s(r.organizer_name), clubName: s(r.club_name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), eventType: s(r.event_type), ageGroup: s(r.age_group), gender: s(r.gender), dates: s(r.dates), time: s(r.time), location: s(r.location), cost: s(r.cost), description: s(r.description), registrationUrl: s(r.registration_url), website: s(r.website), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
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

function mapScrimmageToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { teamName: s(r.team_name), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), level: s(r.level), ageGroup: s(r.age_group), gender: s(r.gender), availability: s(r.availability), contactEmail: s(r.contact_email), description: s(r.description), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}

function mapTripToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { tripName: s(r.trip_name), organizer: s(r.organizer), destination: s(r.destination), city: s(r.city), country: s(r.country) || "International", state: s(r.state), dates: s(r.dates), ageGroup: s(r.age_group), gender: s(r.gender), level: s(r.level), price: s(r.price), spotsAvailable: s(r.spots_available), contactEmail: s(r.contact_email), description: s(r.description), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}

function mapMarketplaceToForm(r: Record<string, unknown>): Record<string, string> {
  return { name: s(r.name), category: s(r.category), description: s(r.description), price: s(r.price), condition: s(r.condition), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), contactEmail: s(r.contact_email), phone: s(r.phone), imageUrl: s(r.image_url), photos: s(r.photos), aboutAuthor: s(r.about_author), tagline: s(r.tagline), sponsors: jsonOrStr(r.sponsors) };
}
function mapPlayerToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { playerName: s(r.player_name), position: s(r.position), secondaryPosition: s(r.secondary_position), birthYear: s(r.birth_year), birthMonth: s(r.birth_month), height: s(r.height), preferredFoot: s(r.preferred_foot), currentClub: s(r.current_club), league: s(r.league), teamName: s(r.team_name), favoriteTeam: s(r.favorite_team), favoritePlayer: s(r.favorite_player), gameHighlights: jsonOrStr(r.game_highlights), highlightVideos: jsonOrStr(r.highlight_videos), cvUrl: s(r.cv_url), availableForGuestPlay: r.available_for_guest_play ? "true" : "false", lookingForTeam: r.looking_for_team ? "true" : "false", city: s(r.city), country: s(r.country) || "United States", state: s(r.state), level: s(r.level), gender: s(r.gender), gpa: s(r.gpa), description: s(r.description), lookingFor: s(r.looking_for), contactEmail: s(r.contact_email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), videoUrl2: s(r.video_url_2), videoUrl3: s(r.video_url_3), ...profileFormFields(r) };
}
function mapPodcastToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), hostName: s(r.host_name), category: s(r.category), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), description: s(r.description), website: s(r.website), rssFeedUrl: s(r.rss_feed_url), followUrl: s(r.follow_url), email: s(r.email), phone: s(r.phone), topEpisodes: s(r.top_episodes), hostHeading: s(r.host_heading), hostImage: s(r.host_image), hostBio: s(r.host_bio), previewImage: s(r.preview_image), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), videoUrl2: s(r.video_url_2), videoUrl3: s(r.video_url_3), ...profileFormFields(r) };
}
function mapFacebookGroupToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), adminName: s(r.admin_name), category: s(r.category), groupUrl: s(r.group_url), memberCount: s(r.member_count), privacy: s(r.privacy), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapInstagramPageToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), ownerName: s(r.owner_name), category: s(r.category), pageUrl: s(r.page_url), followerCount: s(r.follower_count), privacy: s(r.privacy), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), tagline: s(r.tagline), videoUrl2: s(r.video_url_2), videoUrl3: s(r.video_url_3), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapTikTokPageToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), ownerName: s(r.owner_name), category: s(r.category), pageUrl: s(r.page_url), followerCount: s(r.follower_count), privacy: s(r.privacy), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), tagline: s(r.tagline), videoUrl2: s(r.video_url_2), videoUrl3: s(r.video_url_3), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), ...profileFormFields(r) };
}
function mapServiceToForm(r: Record<string, unknown>): Record<string, string> {
  return { name: s(r.name), providerName: s(r.provider_name), category: s(r.category), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), price: s(r.price), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), imageUrl: s(r.image_url), videoUrl: s(r.video_url), photos: s(r.photos), announcementHeading: s(r.announcement_heading), announcementText: s(r.announcement_text), announcementImage: s(r.announcement_image), announcementCta: s(r.announcement_cta), announcementCtaUrl: s(r.announcement_cta_url), announcementHeading2: s(r.announcement_heading_2), announcementText2: s(r.announcement_text_2), announcementImage2: s(r.announcement_image_2), announcementCta2: s(r.announcement_cta_2), announcementCtaUrl2: s(r.announcement_cta_url_2), announcementHeading3: s(r.announcement_heading_3), announcementText3: s(r.announcement_text_3), announcementImage3: s(r.announcement_image_3), announcementCta3: s(r.announcement_cta_3), announcementCtaUrl3: s(r.announcement_cta_url_3), aboutAuthor: s(r.about_author), tagline: s(r.tagline) };
}
function mapTrainingAppToForm(r: Record<string, unknown>): Record<string, string> {
  return { name: s(r.name), providerName: s(r.provider_name), category: s(r.category), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), price: s(r.price), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), imageUrl: s(r.image_url), videoUrl: s(r.video_url), photos: s(r.photos), announcementHeading: s(r.announcement_heading), announcementText: s(r.announcement_text), announcementImage: s(r.announcement_image), announcementCta: s(r.announcement_cta), announcementCtaUrl: s(r.announcement_cta_url), announcementHeading2: s(r.announcement_heading_2), announcementText2: s(r.announcement_text_2), announcementImage2: s(r.announcement_image_2), announcementCta2: s(r.announcement_cta_2), announcementCtaUrl2: s(r.announcement_cta_url_2), announcementHeading3: s(r.announcement_heading_3), announcementText3: s(r.announcement_text_3), announcementImage3: s(r.announcement_image_3), announcementCta3: s(r.announcement_cta_3), announcementCtaUrl3: s(r.announcement_cta_url_3), aboutAuthor: s(r.about_author), tagline: s(r.tagline) };
}
function mapSoccerBookToForm(r: Record<string, unknown>): Record<string, string> {
  return { name: s(r.name), author: s(r.author), category: s(r.category), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), price: s(r.price), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), imageUrl: s(r.image_url), videoUrl: s(r.video_url), photos: s(r.photos), tagline: s(r.tagline), aboutAuthor: s(r.about_author), announcementHeading: s(r.announcement_heading), announcementText: s(r.announcement_text), announcementImage: s(r.announcement_image), announcementCta: s(r.announcement_cta), announcementCtaUrl: s(r.announcement_cta_url), announcementHeading2: s(r.announcement_heading_2), announcementText2: s(r.announcement_text_2), announcementImage2: s(r.announcement_image_2), announcementCta2: s(r.announcement_cta_2), announcementCtaUrl2: s(r.announcement_cta_url_2), announcementHeading3: s(r.announcement_heading_3), announcementText3: s(r.announcement_text_3), announcementImage3: s(r.announcement_image_3), announcementCta3: s(r.announcement_cta_3), announcementCtaUrl3: s(r.announcement_cta_url_3) };
}
function mapPhotoVideoServiceToForm(r: Record<string, unknown>): Record<string, string> {
  return { name: s(r.name), providerName: s(r.provider_name), category: s(r.category), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), price: s(r.price), description: s(r.description), website: s(r.website), email: s(r.email), phone: s(r.phone), imageUrl: s(r.image_url), videoUrl: s(r.video_url), photos: s(r.photos), tagline: s(r.tagline), aboutAuthor: s(r.about_author), announcementHeading: s(r.announcement_heading), announcementText: s(r.announcement_text), announcementImage: s(r.announcement_image), announcementCta: s(r.announcement_cta), announcementCtaUrl: s(r.announcement_cta_url), announcementHeading2: s(r.announcement_heading_2), announcementText2: s(r.announcement_text_2), announcementImage2: s(r.announcement_image_2), announcementCta2: s(r.announcement_cta_2), announcementCtaUrl2: s(r.announcement_cta_url_2), announcementHeading3: s(r.announcement_heading_3), announcementText3: s(r.announcement_text_3), announcementImage3: s(r.announcement_image_3), announcementCta3: s(r.announcement_cta_3), announcementCtaUrl3: s(r.announcement_cta_url_3) };
}

function mapBlogToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), authorName: s(r.author_name), category: s(r.category), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), description: s(r.description), website: s(r.website), rssFeedUrl: s(r.rss_feed_url), subscribeUrl: s(r.subscribe_url), email: s(r.email), phone: s(r.phone), featuredPosts: s(r.featured_posts), authorHeading: s(r.author_heading), authorImage: s(r.author_image), authorBio: s(r.author_bio), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), videoUrl2: s(r.video_url_2), videoUrl3: s(r.video_url_3), ...profileFormFields(r) };
}
function mapYoutubeChannelToForm(r: Record<string, unknown>): Record<string, string> {
  const sm = parseSocial(r.social_media);
  return { name: s(r.name), creatorName: s(r.creator_name), category: s(r.category), city: s(r.city), country: s(r.country) || "United States", state: s(r.state), description: s(r.description), website: s(r.website), channelUrl: s(r.channel_url), subscribeUrl: s(r.subscribe_url), email: s(r.email), phone: s(r.phone), featuredVideos: r.featured_videos ? JSON.stringify(r.featured_videos) : "", creatorHeading: s(r.creator_heading), creatorImage: s(r.creator_image), creatorBio: s(r.creator_bio), facebook: sm.facebook, instagram: sm.instagram, youtube: sm.youtube, logo: s(r.logo), imageUrl: s(r.image_url), videoUrl2: s(r.video_url_2), videoUrl3: s(r.video_url_3), ...profileFormFields(r) };
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
      rows = await sql`UPDATE clubs SET name=${data.name}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, league=${data.league || null}, league_url=${data.leagueUrl || null}, age_groups=${data.ageGroups}, gender=${data.gender}, team_count=${Number(data.teamCount) || 0}, description=${data.description}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, media_links=${pf.mediaLinks}, open_positions=${data.openPositions || null}, scholarships_available=${data.scholarshipsAvailable || null}, guest_players_welcomed=${data.guestPlayersWelcome === "true"}, fundraiser_slug=${data.fundraiserSlug || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "team":
      rows = await sql`UPDATE teams SET name=${data.name}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, coach=${data.coach}, looking_for_players=${data.lookingForPlayers === "true"}, positions_needed=${data.positionsNeeded || null}, season=${data.season}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, events=${data.events || null}, annual_tournaments=${data.annualTournaments || null}, media_links=${pf.mediaLinks}, scholarships_available=${data.scholarshipsAvailable || null}, guest_players_welcomed=${data.guestPlayersWelcome === "true"}, fundraiser_slug=${data.fundraiserSlug || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "trainer":
      rows = await sql`UPDATE trainers SET name=${data.name}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, specialty=${data.specialty}, experience=${data.experience}, credentials=${data.credentials}, price_range=${data.priceRange}, service_area=${data.serviceArea}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "recruiter":
      rows = await sql`UPDATE recruiters SET name=${data.name}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, specialty=${data.specialty || null}, experience=${data.experience || null}, credentials=${data.credentials || null}, price_range=${data.priceRange || null}, service_area=${data.serviceArea || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "camp":
      rows = await sql`UPDATE camps SET name=${data.name}, organizer_name=${data.organizerName}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, camp_type=${data.campType}, age_range=${data.ageRange}, dates=${data.dates}, price=${data.price}, gender=${data.gender}, location=${data.location || null}, description=${data.description}, registration_url=${data.registrationUrl || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, sponsors=${pf.sponsors}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "guest":
      rows = await sql`UPDATE guest_opportunities SET team_name=${data.teamName}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, dates=${data.dates}, tournament=${data.tournament}, positions_needed=${data.positionsNeeded}, contact_email=${data.contactEmail}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "tournament":
      rows = await sql`UPDATE tournaments SET name=${data.name}, organizer=${data.organizer}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, dates=${data.dates}, age_groups=${data.ageGroups}, gender=${data.gender}, level=${data.level}, entry_fee=${data.entryFee}, format=${data.format}, description=${data.description}, registration_url=${data.registrationUrl || null}, email=${data.email || null}, region=${data.region || 'US'}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "futsal":
      rows = await sql`UPDATE futsal_teams SET name=${data.name}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, coach=${data.coach}, looking_for_players=${data.lookingForPlayers === "true"}, positions_needed=${data.positionsNeeded || null}, season=${data.season}, description=${data.description || null}, format=${data.format || '5v5'}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "scrimmage":
      rows = await sql`UPDATE scrimmages SET team_name=${data.teamName}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, availability=${data.availability || 'Looking for Scrimmage'}, contact_email=${data.contactEmail}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "trip":
      rows = await sql`UPDATE international_trips SET trip_name=${data.tripName}, organizer=${data.organizer}, destination=${data.destination}, city=${data.city}, country=${data.country || 'International'}, state=${data.state || ''}, dates=${data.dates}, age_group=${data.ageGroup}, gender=${data.gender}, level=${data.level}, price=${data.price || null}, spots_available=${data.spotsAvailable || null}, contact_email=${data.contactEmail}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "marketplace":
      rows = await sql`UPDATE marketplace SET name=${data.name}, category=${data.category}, description=${data.description}, price=${data.price}, condition=${data.condition}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, contact_email=${data.contactEmail}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, image_position=${Number(data.imagePosition) || 50}, hero_image_position=${Number(data.heroImagePosition) || 50}, photos=${parsePhotos(data.photos)}, about_author=${data.aboutAuthor || null}, sponsors=${data.sponsors || null} WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "player":
      rows = await sql`UPDATE player_profiles SET player_name=${data.playerName}, position=${data.position}, secondary_position=${data.secondaryPosition || null}, birth_year=${data.birthYear}, birth_month=${data.birthMonth || null}, height=${data.height || null}, preferred_foot=${data.preferredFoot || null}, current_club=${data.currentClub || null}, league=${data.league || null}, team_name=${data.teamName || null}, favorite_team=${data.favoriteTeam || null}, favorite_player=${data.favoritePlayer || null}, game_highlights=${data.gameHighlights || null}, highlight_videos=${data.highlightVideos || '[]'}, cv_url=${data.cvUrl || null}, available_for_guest_play=${data.availableForGuestPlay === "true"}, looking_for_team=${data.lookingForTeam === "true"}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, gender=${data.gender}, gpa=${data.gpa || null}, description=${data.description || null}, looking_for=${data.lookingFor || null}, contact_email=${data.contactEmail}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, sponsors=${data.sponsors || null}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "podcast":
      rows = await sql`UPDATE podcasts SET name=${data.name}, host_name=${data.hostName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, description=${data.description || null}, website=${data.website || null}, rss_feed_url=${data.rssFeedUrl || null}, follow_url=${data.followUrl || null}, email=${data.email || null}, phone=${data.phone || null}, top_episodes=${data.topEpisodes || null}, host_heading=${data.hostHeading || null}, host_image=${data.hostImage || null}, host_bio=${data.hostBio || null}, preview_image=${data.previewImage || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "fbgroup":
      rows = await sql`UPDATE facebook_groups SET name=${data.name}, admin_name=${data.adminName}, category=${data.category}, group_url=${data.groupUrl}, member_count=${data.memberCount || null}, privacy=${data.privacy || 'Public'}, city=${data.city || ''}, country=${data.country || ''}, state=${data.state || ''}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, media_links=${pf.mediaLinks}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "instagrampage":
      rows = await sql`UPDATE instagram_pages SET name=${data.name}, owner_name=${data.ownerName}, category=${data.category}, page_url=${data.pageUrl}, follower_count=${data.followerCount || null}, privacy=${data.privacy || 'Public'}, city=${data.city || ''}, country=${data.country || ''}, state=${data.state || ''}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, tagline=${data.tagline || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "tiktokpage":
      rows = await sql`UPDATE tiktok_pages SET name=${data.name}, owner_name=${data.ownerName}, category=${data.category}, page_url=${data.pageUrl}, follower_count=${data.followerCount || null}, privacy=${data.privacy || 'Public'}, city=${data.city || ''}, country=${data.country || ''}, state=${data.state || ''}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, tagline=${data.tagline || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "service":
      rows = await sql`UPDATE services SET name=${data.name}, provider_name=${data.providerName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, price=${data.price || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, video_url=${data.videoUrl || null}, image_position=${Number(data.imagePosition) || 50}, hero_image_position=${Number(data.heroImagePosition) || 50}, photos=${parsePhotos(data.photos)}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, about_author=${data.aboutAuthor || null}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "soccerbook":
      rows = await sql`UPDATE books SET name=${data.name}, author=${data.author || null}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, price=${data.price || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, video_url=${data.videoUrl || null}, image_position=${Number(data.imagePosition) || 50}, hero_image_position=${Number(data.heroImagePosition) || 50}, photos=${parsePhotos(data.photos)}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, about_author=${data.aboutAuthor || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "photovideo":
      rows = await sql`UPDATE photo_video_services SET name=${data.name}, provider_name=${data.providerName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, price=${data.price || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, video_url=${data.videoUrl || null}, image_position=${Number(data.imagePosition) || 50}, hero_image_position=${Number(data.heroImagePosition) || 50}, photos=${parsePhotos(data.photos)}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, about_author=${data.aboutAuthor || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "tryout":
      rows = await sql`UPDATE tryouts SET name=${data.name}, organizer_name=${data.organizerName}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, tryout_type=${data.tryoutType}, age_group=${data.ageGroup}, gender=${data.gender}, dates=${data.dates}, time=${data.time || null}, location=${data.location || null}, cost=${data.cost || null}, description=${data.description}, registration_url=${data.registrationUrl || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, sponsors=${pf.sponsors}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "specialevent":
      rows = await sql`UPDATE special_events SET name=${data.name}, organizer_name=${data.organizerName}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, event_type=${data.eventType}, age_group=${data.ageGroup}, gender=${data.gender}, dates=${data.dates}, time=${data.time || null}, location=${data.location || null}, cost=${data.cost || null}, description=${data.description}, registration_url=${data.registrationUrl || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "trainingapp":
      rows = await sql`UPDATE training_apps SET name=${data.name}, provider_name=${data.providerName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, price=${data.price || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, video_url=${data.videoUrl || null}, image_position=${Number(data.imagePosition) || 50}, hero_image_position=${Number(data.heroImagePosition) || 50}, photos=${parsePhotos(data.photos)}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, about_author=${data.aboutAuthor || null}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "blog":
      rows = await sql`UPDATE blogs SET name=${data.name}, author_name=${data.authorName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, description=${data.description || null}, website=${data.website || null}, rss_feed_url=${data.rssFeedUrl || null}, subscribe_url=${data.subscribeUrl || null}, email=${data.email || null}, phone=${data.phone || null}, featured_posts=${data.featuredPosts || null}, author_heading=${data.authorHeading || null}, author_image=${data.authorImage || null}, author_bio=${data.authorBio || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "youtube":
      rows = await sql`UPDATE youtube_channels SET name=${data.name}, creator_name=${data.creatorName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, description=${data.description || null}, website=${data.website || null}, channel_url=${data.channelUrl || null}, subscribe_url=${data.subscribeUrl || null}, email=${data.email || null}, phone=${data.phone || null}, featured_videos=${data.featuredVideos || null}, creator_heading=${data.creatorHeading || null}, creator_image=${data.creatorImage || null}, creator_bio=${data.creatorBio || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      break;
    case "fundraiser": {
      const newSlug = data.slug ? await resolveFundraiserSlug(data, id) : null;
      if (newSlug) {
        rows = await sql`UPDATE fundraisers SET title=${data.name}, slug=${newSlug}, tagline=${data.tagline || null}, description=${data.description || null}, goal=${data.goal && !isNaN(Number(data.goal)) ? Math.round(Number(data.goal) * 100) : null}, coach_name=${data.coachName || null}, coach_email=${data.contactEmail || null}, coach_phone=${data.phone || null}, website_url=${data.website || null}, facebook_url=${data.facebookUrl || null}, instagram_url=${data.instagramUrl || null}, hero_image_url=${data.imageUrl || null}, tags=${data.tags || null}, photos=${data.photos || null}, video_url=${data.videoUrl || null}, team_photo=${data.teamPhoto || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      } else {
        rows = await sql`UPDATE fundraisers SET title=${data.name}, tagline=${data.tagline || null}, description=${data.description || null}, goal=${data.goal && !isNaN(Number(data.goal)) ? Math.round(Number(data.goal) * 100) : null}, coach_name=${data.coachName || null}, coach_email=${data.contactEmail || null}, coach_phone=${data.phone || null}, website_url=${data.website || null}, facebook_url=${data.facebookUrl || null}, instagram_url=${data.instagramUrl || null}, hero_image_url=${data.imageUrl || null}, tags=${data.tags || null}, photos=${data.photos || null}, video_url=${data.videoUrl || null}, team_photo=${data.teamPhoto || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id`;
      }
      if (data.roster) {
        await syncFundraiserRoster(id, data.roster);
      }
      break;
    }
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
      rows = await sql`UPDATE clubs SET name=${data.name}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, league=${data.league || null}, league_url=${data.leagueUrl || null}, age_groups=${data.ageGroups}, gender=${data.gender}, team_count=${Number(data.teamCount) || 0}, description=${data.description}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, media_links=${pf.mediaLinks}, open_positions=${data.openPositions || null}, scholarships_available=${data.scholarshipsAvailable || null}, guest_players_welcomed=${data.guestPlayersWelcome === "true"}, fundraiser_slug=${data.fundraiserSlug || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "team":
      rows = await sql`UPDATE teams SET name=${data.name}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, coach=${data.coach}, looking_for_players=${data.lookingForPlayers === "true"}, positions_needed=${data.positionsNeeded || null}, season=${data.season}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, events=${data.events || null}, annual_tournaments=${data.annualTournaments || null}, media_links=${pf.mediaLinks}, scholarships_available=${data.scholarshipsAvailable || null}, guest_players_welcomed=${data.guestPlayersWelcome === "true"}, fundraiser_slug=${data.fundraiserSlug || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "trainer":
      rows = await sql`UPDATE trainers SET name=${data.name}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, specialty=${data.specialty}, experience=${data.experience}, credentials=${data.credentials}, price_range=${data.priceRange}, service_area=${data.serviceArea}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "recruiter":
      rows = await sql`UPDATE recruiters SET name=${data.name}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, specialty=${data.specialty || null}, experience=${data.experience || null}, credentials=${data.credentials || null}, price_range=${data.priceRange || null}, service_area=${data.serviceArea || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "camp":
      rows = await sql`UPDATE camps SET name=${data.name}, organizer_name=${data.organizerName}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, camp_type=${data.campType}, age_range=${data.ageRange}, dates=${data.dates}, price=${data.price}, gender=${data.gender}, location=${data.location || null}, description=${data.description}, registration_url=${data.registrationUrl || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "guest":
      rows = await sql`UPDATE guest_opportunities SET team_name=${data.teamName}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, dates=${data.dates}, tournament=${data.tournament}, positions_needed=${data.positionsNeeded}, contact_email=${data.contactEmail}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "tournament":
      rows = await sql`UPDATE tournaments SET name=${data.name}, organizer=${data.organizer}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, dates=${data.dates}, age_groups=${data.ageGroups}, gender=${data.gender}, level=${data.level}, entry_fee=${data.entryFee}, format=${data.format}, description=${data.description}, registration_url=${data.registrationUrl || null}, email=${data.email || null}, region=${data.region || 'US'}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "futsal":
      rows = await sql`UPDATE futsal_teams SET name=${data.name}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, coach=${data.coach}, looking_for_players=${data.lookingForPlayers === "true"}, positions_needed=${data.positionsNeeded || null}, season=${data.season}, description=${data.description || null}, format=${data.format || '5v5'}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, practice_schedule=${pf.practiceSchedule}, address=${pf.address}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "scrimmage":
      rows = await sql`UPDATE scrimmages SET team_name=${data.teamName}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, age_group=${data.ageGroup}, gender=${data.gender}, availability=${data.availability || 'Looking for Scrimmage'}, contact_email=${data.contactEmail}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "trip":
      rows = await sql`UPDATE international_trips SET trip_name=${data.tripName}, organizer=${data.organizer}, destination=${data.destination}, city=${data.city}, country=${data.country || 'International'}, state=${data.state || ''}, dates=${data.dates}, age_group=${data.ageGroup}, gender=${data.gender}, level=${data.level}, price=${data.price || null}, spots_available=${data.spotsAvailable || null}, contact_email=${data.contactEmail}, description=${data.description || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "marketplace":
      rows = await sql`UPDATE marketplace SET name=${data.name}, category=${data.category}, description=${data.description}, price=${data.price}, condition=${data.condition}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, contact_email=${data.contactEmail}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, image_position=${Number(data.imagePosition) || 50}, hero_image_position=${Number(data.heroImagePosition) || 50}, photos=${parsePhotos(data.photos)}, about_author=${data.aboutAuthor || null}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${data.sponsors || null} WHERE id=${id} RETURNING id`;
      break;
    case "player":
      rows = await sql`UPDATE player_profiles SET player_name=${data.playerName}, position=${data.position}, secondary_position=${data.secondaryPosition || null}, birth_year=${data.birthYear}, birth_month=${data.birthMonth || null}, height=${data.height || null}, preferred_foot=${data.preferredFoot || null}, current_club=${data.currentClub || null}, league=${data.league || null}, team_name=${data.teamName || null}, favorite_team=${data.favoriteTeam || null}, favorite_player=${data.favoritePlayer || null}, game_highlights=${data.gameHighlights || null}, highlight_videos=${data.highlightVideos || '[]'}, cv_url=${data.cvUrl || null}, available_for_guest_play=${data.availableForGuestPlay === "true"}, looking_for_team=${data.lookingForTeam === "true"}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, level=${data.level}, gender=${data.gender}, gpa=${data.gpa || null}, description=${data.description || null}, looking_for=${data.lookingFor || null}, contact_email=${data.contactEmail}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${data.sponsors || null}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "podcast":
      rows = await sql`UPDATE podcasts SET name=${data.name}, host_name=${data.hostName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, description=${data.description || null}, website=${data.website || null}, rss_feed_url=${data.rssFeedUrl || null}, follow_url=${data.followUrl || null}, email=${data.email || null}, phone=${data.phone || null}, top_episodes=${data.topEpisodes || null}, host_heading=${data.hostHeading || null}, host_image=${data.hostImage || null}, host_bio=${data.hostBio || null}, preview_image=${data.previewImage || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "fbgroup":
      rows = await sql`UPDATE facebook_groups SET name=${data.name}, admin_name=${data.adminName}, category=${data.category}, group_url=${data.groupUrl}, member_count=${data.memberCount || null}, privacy=${data.privacy || 'Public'}, city=${data.city || ''}, country=${data.country || ''}, state=${data.state || ''}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, media_links=${pf.mediaLinks}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "instagrampage":
      rows = await sql`UPDATE instagram_pages SET name=${data.name}, owner_name=${data.ownerName}, category=${data.category}, page_url=${data.pageUrl}, follower_count=${data.followerCount || null}, privacy=${data.privacy || 'Public'}, city=${data.city || ''}, country=${data.country || ''}, state=${data.state || ''}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "tiktokpage":
      rows = await sql`UPDATE tiktok_pages SET name=${data.name}, owner_name=${data.ownerName}, category=${data.category}, page_url=${data.pageUrl}, follower_count=${data.followerCount || null}, privacy=${data.privacy || 'Public'}, city=${data.city || ''}, country=${data.country || ''}, state=${data.state || ''}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "service":
      rows = await sql`UPDATE services SET name=${data.name}, provider_name=${data.providerName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, price=${data.price || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, video_url=${data.videoUrl || null}, image_position=${Number(data.imagePosition) || 50}, hero_image_position=${Number(data.heroImagePosition) || 50}, photos=${parsePhotos(data.photos)}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, about_author=${data.aboutAuthor || null}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "soccerbook":
      rows = await sql`UPDATE books SET name=${data.name}, author=${data.author || null}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, price=${data.price || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, video_url=${data.videoUrl || null}, image_position=${Number(data.imagePosition) || 50}, hero_image_position=${Number(data.heroImagePosition) || 50}, photos=${parsePhotos(data.photos)}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, about_author=${data.aboutAuthor || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "photovideo":
      rows = await sql`UPDATE photo_video_services SET name=${data.name}, provider_name=${data.providerName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, price=${data.price || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, video_url=${data.videoUrl || null}, image_position=${Number(data.imagePosition) || 50}, hero_image_position=${Number(data.heroImagePosition) || 50}, photos=${parsePhotos(data.photos)}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, about_author=${data.aboutAuthor || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "tryout":
      rows = await sql`UPDATE tryouts SET name=${data.name}, organizer_name=${data.organizerName}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, tryout_type=${data.tryoutType}, age_group=${data.ageGroup}, gender=${data.gender}, dates=${data.dates}, time=${data.time || null}, location=${data.location || null}, cost=${data.cost || null}, description=${data.description}, registration_url=${data.registrationUrl || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "specialevent":
      rows = await sql`UPDATE special_events SET name=${data.name}, organizer_name=${data.organizerName}, club_name=${data.clubName || null}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, event_type=${data.eventType}, age_group=${data.ageGroup}, gender=${data.gender}, dates=${data.dates}, time=${data.time || null}, location=${data.location || null}, cost=${data.cost || null}, description=${data.description}, registration_url=${data.registrationUrl || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "trainingapp":
      rows = await sql`UPDATE training_apps SET name=${data.name}, provider_name=${data.providerName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, price=${data.price || null}, description=${data.description || null}, website=${data.website || null}, email=${data.email || null}, phone=${data.phone || null}, image_url=${data.imageUrl || null}, video_url=${data.videoUrl || null}, image_position=${Number(data.imagePosition) || 50}, hero_image_position=${Number(data.heroImagePosition) || 50}, photos=${parsePhotos(data.photos)}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, about_author=${data.aboutAuthor || null}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "blog":
      rows = await sql`UPDATE blogs SET name=${data.name}, author_name=${data.authorName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, description=${data.description || null}, website=${data.website || null}, rss_feed_url=${data.rssFeedUrl || null}, subscribe_url=${data.subscribeUrl || null}, email=${data.email || null}, phone=${data.phone || null}, featured_posts=${data.featuredPosts || null}, author_heading=${data.authorHeading || null}, author_image=${data.authorImage || null}, author_bio=${data.authorBio || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "youtube":
      rows = await sql`UPDATE youtube_channels SET name=${data.name}, creator_name=${data.creatorName}, category=${data.category}, city=${data.city}, country=${data.country || 'United States'}, state=${data.state}, description=${data.description || null}, website=${data.website || null}, channel_url=${data.channelUrl || null}, subscribe_url=${data.subscribeUrl || null}, email=${data.email || null}, phone=${data.phone || null}, featured_videos=${data.featuredVideos || null}, creator_heading=${data.creatorHeading || null}, creator_image=${data.creatorImage || null}, creator_bio=${data.creatorBio || null}, social_media=${sm}, logo=${data.logo || null}, image_url=${data.imageUrl || null}, team_photo=${pf.teamPhoto}, image_position=${pf.imagePosition}, hero_image_position=${pf.heroImagePosition}, photos=${pf.photos}, video_url=${pf.videoUrl}, video_url_2=${data.videoUrl2 || null}, video_url_3=${data.videoUrl3 || null}, media_links=${pf.mediaLinks}, tagline=${pf.tagline}, preview_image=${pf.previewImage}, sponsors=${pf.sponsors}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      break;
    case "fundraiser": {
      const newSlug = data.slug ? await resolveFundraiserSlug(data, id) : null;
      if (newSlug) {
        rows = await sql`UPDATE fundraisers SET title=${data.name}, slug=${newSlug}, tagline=${data.tagline || null}, description=${data.description || null}, goal=${data.goal && !isNaN(Number(data.goal)) ? Math.round(Number(data.goal) * 100) : null}, coach_name=${data.coachName || null}, coach_email=${data.contactEmail || null}, coach_phone=${data.phone || null}, website_url=${data.website || null}, facebook_url=${data.facebookUrl || null}, instagram_url=${data.instagramUrl || null}, hero_image_url=${data.imageUrl || null}, tags=${data.tags || null}, photos=${data.photos || null}, video_url=${data.videoUrl || null}, team_photo=${data.teamPhoto || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      } else {
        rows = await sql`UPDATE fundraisers SET title=${data.name}, tagline=${data.tagline || null}, description=${data.description || null}, goal=${data.goal && !isNaN(Number(data.goal)) ? Math.round(Number(data.goal) * 100) : null}, coach_name=${data.coachName || null}, coach_email=${data.contactEmail || null}, coach_phone=${data.phone || null}, website_url=${data.website || null}, facebook_url=${data.facebookUrl || null}, instagram_url=${data.instagramUrl || null}, hero_image_url=${data.imageUrl || null}, tags=${data.tags || null}, photos=${data.photos || null}, video_url=${data.videoUrl || null}, team_photo=${data.teamPhoto || null}, announcement_heading=${data.announcementHeading || null}, announcement_text=${data.announcementText || null}, announcement_image=${data.announcementImage || null}, announcement_cta=${data.announcementCta || null}, announcement_cta_url=${data.announcementCtaUrl || null}, announcement_heading_2=${data.announcementHeading2 || null}, announcement_text_2=${data.announcementText2 || null}, announcement_image_2=${data.announcementImage2 || null}, announcement_cta_2=${data.announcementCta2 || null}, announcement_cta_url_2=${data.announcementCtaUrl2 || null}, announcement_heading_3=${data.announcementHeading3 || null}, announcement_text_3=${data.announcementText3 || null}, announcement_image_3=${data.announcementImage3 || null}, announcement_cta_3=${data.announcementCta3 || null}, announcement_cta_url_3=${data.announcementCtaUrl3 || null}, updated_at=NOW() WHERE id=${id} RETURNING id`;
      }
      if (data.roster) {
        await syncFundraiserRoster(id, data.roster);
      }
      break;
    }
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
      case "recruiter": rows = await sql`UPDATE recruiters SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "camp": rows = await sql`UPDATE camps SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "guest": rows = await sql`UPDATE guest_opportunities SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "tournament": rows = await sql`UPDATE tournaments SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "futsal": rows = await sql`UPDATE futsal_teams SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "scrimmage": rows = await sql`UPDATE scrimmages SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "trip": rows = await sql`UPDATE international_trips SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "marketplace": rows = await sql`UPDATE marketplace SET status = 'archived' WHERE id = ${id} RETURNING id`; break;
      case "player": rows = await sql`UPDATE player_profiles SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "podcast": rows = await sql`UPDATE podcasts SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "fbgroup": rows = await sql`UPDATE facebook_groups SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "instagrampage": rows = await sql`UPDATE instagram_pages SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "tiktokpage": rows = await sql`UPDATE tiktok_pages SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "service": rows = await sql`UPDATE services SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "soccerbook": rows = await sql`UPDATE books SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "photovideo": rows = await sql`UPDATE photo_video_services SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "tryout": rows = await sql`UPDATE tryouts SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "specialevent": rows = await sql`UPDATE special_events SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "trainingapp": rows = await sql`UPDATE training_apps SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "blog": rows = await sql`UPDATE blogs SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "youtube": rows = await sql`UPDATE youtube_channels SET status = 'archived', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "fundraiser": rows = await sql`UPDATE fundraisers SET active = false, updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      default: return false;
    }
  } else {
    switch (type) {
      case "club": rows = await sql`UPDATE clubs SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "team": rows = await sql`UPDATE teams SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trainer": rows = await sql`UPDATE trainers SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "recruiter": rows = await sql`UPDATE recruiters SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "camp": rows = await sql`UPDATE camps SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "guest": rows = await sql`UPDATE guest_opportunities SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tournament": rows = await sql`UPDATE tournaments SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "futsal": rows = await sql`UPDATE futsal_teams SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "scrimmage": rows = await sql`UPDATE scrimmages SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trip": rows = await sql`UPDATE international_trips SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "marketplace": rows = await sql`UPDATE marketplace SET status = 'archived' WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "player": rows = await sql`UPDATE player_profiles SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "podcast": rows = await sql`UPDATE podcasts SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "fbgroup": rows = await sql`UPDATE facebook_groups SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "instagrampage": rows = await sql`UPDATE instagram_pages SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tiktokpage": rows = await sql`UPDATE tiktok_pages SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "service": rows = await sql`UPDATE services SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "soccerbook": rows = await sql`UPDATE books SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "photovideo": rows = await sql`UPDATE photo_video_services SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tryout": rows = await sql`UPDATE tryouts SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "specialevent": rows = await sql`UPDATE special_events SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trainingapp": rows = await sql`UPDATE training_apps SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "blog": rows = await sql`UPDATE blogs SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "youtube": rows = await sql`UPDATE youtube_channels SET status = 'archived', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "fundraiser": rows = await sql`UPDATE fundraisers SET active = false, updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      default: return false;
    }
  }
  return rows.length > 0;
}

// ── Restore (un-archive) Listing ─────────────────────────────
export async function restoreListing(type: string, id: string, userId: string, isAdmin = false): Promise<boolean> {
  type = normalizeType(type);
  let rows: Record<string, unknown>[];
  if (isAdmin) {
    switch (type) {
      case "club": rows = await sql`UPDATE clubs SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "team": rows = await sql`UPDATE teams SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "trainer": rows = await sql`UPDATE trainers SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "recruiter": rows = await sql`UPDATE recruiters SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "camp": rows = await sql`UPDATE camps SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "guest": rows = await sql`UPDATE guest_opportunities SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "tournament": rows = await sql`UPDATE tournaments SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "futsal": rows = await sql`UPDATE futsal_teams SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "trip": rows = await sql`UPDATE international_trips SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "marketplace": rows = await sql`UPDATE marketplace SET status = 'approved' WHERE id = ${id} RETURNING id`; break;
      case "player": rows = await sql`UPDATE player_profiles SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "podcast": rows = await sql`UPDATE podcasts SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "fbgroup": rows = await sql`UPDATE facebook_groups SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "instagrampage": rows = await sql`UPDATE instagram_pages SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "tiktokpage": rows = await sql`UPDATE tiktok_pages SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "service": rows = await sql`UPDATE services SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "tryout": rows = await sql`UPDATE tryouts SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "specialevent": rows = await sql`UPDATE special_events SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "trainingapp": rows = await sql`UPDATE training_apps SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "blog": rows = await sql`UPDATE blogs SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "youtube": rows = await sql`UPDATE youtube_channels SET status = 'approved', updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      case "fundraiser": rows = await sql`UPDATE fundraisers SET active = true, updated_at = NOW() WHERE id = ${id} RETURNING id`; break;
      default: return false;
    }
  } else {
    switch (type) {
      case "club": rows = await sql`UPDATE clubs SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "team": rows = await sql`UPDATE teams SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trainer": rows = await sql`UPDATE trainers SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "recruiter": rows = await sql`UPDATE recruiters SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "camp": rows = await sql`UPDATE camps SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "guest": rows = await sql`UPDATE guest_opportunities SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tournament": rows = await sql`UPDATE tournaments SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "futsal": rows = await sql`UPDATE futsal_teams SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trip": rows = await sql`UPDATE international_trips SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "marketplace": rows = await sql`UPDATE marketplace SET status = 'approved' WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "player": rows = await sql`UPDATE player_profiles SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "podcast": rows = await sql`UPDATE podcasts SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "fbgroup": rows = await sql`UPDATE facebook_groups SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "instagrampage": rows = await sql`UPDATE instagram_pages SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tiktokpage": rows = await sql`UPDATE tiktok_pages SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "service": rows = await sql`UPDATE services SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tryout": rows = await sql`UPDATE tryouts SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "specialevent": rows = await sql`UPDATE special_events SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trainingapp": rows = await sql`UPDATE training_apps SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "blog": rows = await sql`UPDATE blogs SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "youtube": rows = await sql`UPDATE youtube_channels SET status = 'approved', updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "fundraiser": rows = await sql`UPDATE fundraisers SET active = true, updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
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
      case "recruiter": rows = await sql`DELETE FROM recruiters WHERE id = ${id} RETURNING id`; break;
      case "camp": rows = await sql`DELETE FROM camps WHERE id = ${id} RETURNING id`; break;
      case "guest": rows = await sql`DELETE FROM guest_opportunities WHERE id = ${id} RETURNING id`; break;
      case "tournament": rows = await sql`DELETE FROM tournaments WHERE id = ${id} RETURNING id`; break;
      case "futsal": rows = await sql`DELETE FROM futsal_teams WHERE id = ${id} RETURNING id`; break;
      case "scrimmage": rows = await sql`DELETE FROM scrimmages WHERE id = ${id} RETURNING id`; break;
      case "trip": rows = await sql`DELETE FROM international_trips WHERE id = ${id} RETURNING id`; break;
      case "marketplace": rows = await sql`DELETE FROM marketplace WHERE id = ${id} RETURNING id`; break;
      case "player": rows = await sql`DELETE FROM player_profiles WHERE id = ${id} RETURNING id`; break;
      case "podcast": rows = await sql`DELETE FROM podcasts WHERE id = ${id} RETURNING id`; break;
      case "fbgroup": rows = await sql`DELETE FROM facebook_groups WHERE id = ${id} RETURNING id`; break;
      case "instagrampage": rows = await sql`DELETE FROM instagram_pages WHERE id = ${id} RETURNING id`; break;
      case "tiktokpage": rows = await sql`DELETE FROM tiktok_pages WHERE id = ${id} RETURNING id`; break;
      case "service": rows = await sql`DELETE FROM services WHERE id = ${id} RETURNING id`; break;
      case "tryout": rows = await sql`DELETE FROM tryouts WHERE id = ${id} RETURNING id`; break;
      case "specialevent": rows = await sql`DELETE FROM special_events WHERE id = ${id} RETURNING id`; break;
      case "trainingapp": rows = await sql`DELETE FROM training_apps WHERE id = ${id} RETURNING id`; break;
      case "blog": rows = await sql`DELETE FROM blogs WHERE id = ${id} RETURNING id`; break;
      case "youtube": rows = await sql`DELETE FROM youtube_channels WHERE id = ${id} RETURNING id`; break;
      case "fundraiser": rows = await sql`DELETE FROM fundraisers WHERE id = ${id} RETURNING id`; break;
      default: return false;
    }
  } else {
    switch (type) {
      case "club": rows = await sql`DELETE FROM clubs WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "team": rows = await sql`DELETE FROM teams WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trainer": rows = await sql`DELETE FROM trainers WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "recruiter": rows = await sql`DELETE FROM recruiters WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "camp": rows = await sql`DELETE FROM camps WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "guest": rows = await sql`DELETE FROM guest_opportunities WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tournament": rows = await sql`DELETE FROM tournaments WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "futsal": rows = await sql`DELETE FROM futsal_teams WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "scrimmage": rows = await sql`DELETE FROM scrimmages WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trip": rows = await sql`DELETE FROM international_trips WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "marketplace": rows = await sql`DELETE FROM marketplace WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "player": rows = await sql`DELETE FROM player_profiles WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "podcast": rows = await sql`DELETE FROM podcasts WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "fbgroup": rows = await sql`DELETE FROM facebook_groups WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "instagrampage": rows = await sql`DELETE FROM instagram_pages WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tiktokpage": rows = await sql`DELETE FROM tiktok_pages WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "service": rows = await sql`DELETE FROM services WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "tryout": rows = await sql`DELETE FROM tryouts WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "specialevent": rows = await sql`DELETE FROM special_events WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "trainingapp": rows = await sql`DELETE FROM training_apps WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "blog": rows = await sql`DELETE FROM blogs WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "youtube": rows = await sql`DELETE FROM youtube_channels WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
      case "fundraiser": rows = await sql`DELETE FROM fundraisers WHERE id = ${id} AND user_id = ${userId} RETURNING id`; break;
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
    case "recruiter": rows = await sql`SELECT name, email, user_id FROM recruiters WHERE slug = ${slug} LIMIT 1`; break;
    case "camp": rows = await sql`SELECT name, email, user_id FROM camps WHERE slug = ${slug} LIMIT 1`; break;
    case "guest": rows = await sql`SELECT team_name as name, contact_email as email, user_id FROM guest_opportunities WHERE slug = ${slug} LIMIT 1`; break;
    case "tournament": rows = await sql`SELECT name, email, user_id FROM tournaments WHERE slug = ${slug} LIMIT 1`; break;
    case "futsal": rows = await sql`SELECT name, NULL as email, user_id FROM futsal_teams WHERE slug = ${slug} LIMIT 1`; break;
    case "scrimmage": rows = await sql`SELECT team_name as name, contact_email as email, user_id FROM scrimmages WHERE slug = ${slug} LIMIT 1`; break;
    case "trip": rows = await sql`SELECT trip_name as name, contact_email as email, user_id FROM international_trips WHERE slug = ${slug} LIMIT 1`; break;
    case "marketplace": rows = await sql`SELECT name, contact_email as email, user_id FROM marketplace WHERE slug = ${slug} LIMIT 1`; break;
    case "player": rows = await sql`SELECT player_name as name, contact_email as email, user_id FROM player_profiles WHERE slug = ${slug} LIMIT 1`; break;
    case "podcast": rows = await sql`SELECT name, email, user_id FROM podcasts WHERE slug = ${slug} LIMIT 1`; break;
    case "fbgroup": rows = await sql`SELECT name, email, user_id FROM facebook_groups WHERE slug = ${slug} LIMIT 1`; break;
    case "instagrampage": rows = await sql`SELECT name, email, user_id FROM instagram_pages WHERE slug = ${slug} LIMIT 1`; break;
    case "tiktokpage": rows = await sql`SELECT name, email, user_id FROM tiktok_pages WHERE slug = ${slug} LIMIT 1`; break;
    case "service": rows = await sql`SELECT name, email, user_id FROM services WHERE slug = ${slug} LIMIT 1`; break;
    case "tryout": rows = await sql`SELECT name, email, user_id FROM tryouts WHERE slug = ${slug} LIMIT 1`; break;
    case "specialevent": rows = await sql`SELECT name, email, user_id FROM special_events WHERE slug = ${slug} LIMIT 1`; break;
    case "trainingapp": rows = await sql`SELECT name, email, user_id FROM training_apps WHERE slug = ${slug} LIMIT 1`; break;
    case "blog": rows = await sql`SELECT name, email, user_id FROM blogs WHERE slug = ${slug} LIMIT 1`; break;
    case "youtube": rows = await sql`SELECT name, email, user_id FROM youtube_channels WHERE slug = ${slug} LIMIT 1`; break;
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
    case "recruiter": rows = await sql`SELECT user_id FROM recruiters WHERE slug = ${slug} LIMIT 1`; break;
    case "camp": rows = await sql`SELECT user_id FROM camps WHERE slug = ${slug} LIMIT 1`; break;
    case "guest": rows = await sql`SELECT user_id FROM guest_opportunities WHERE slug = ${slug} LIMIT 1`; break;
    case "tournament": rows = await sql`SELECT user_id FROM tournaments WHERE slug = ${slug} LIMIT 1`; break;
    case "futsal": rows = await sql`SELECT user_id FROM futsal_teams WHERE slug = ${slug} LIMIT 1`; break;
    case "scrimmage": rows = await sql`SELECT user_id FROM scrimmages WHERE slug = ${slug} LIMIT 1`; break;
    case "trip": rows = await sql`SELECT user_id FROM international_trips WHERE slug = ${slug} LIMIT 1`; break;
    case "marketplace": rows = await sql`SELECT user_id FROM marketplace WHERE slug = ${slug} LIMIT 1`; break;
    case "player": rows = await sql`SELECT user_id FROM player_profiles WHERE slug = ${slug} LIMIT 1`; break;
    case "podcast": rows = await sql`SELECT user_id FROM podcasts WHERE slug = ${slug} LIMIT 1`; break;
    case "fbgroup": rows = await sql`SELECT user_id FROM facebook_groups WHERE slug = ${slug} LIMIT 1`; break;
    case "instagrampage": rows = await sql`SELECT user_id FROM instagram_pages WHERE slug = ${slug} LIMIT 1`; break;
    case "tiktokpage": rows = await sql`SELECT user_id FROM tiktok_pages WHERE slug = ${slug} LIMIT 1`; break;
    case "service": rows = await sql`SELECT user_id FROM services WHERE slug = ${slug} LIMIT 1`; break;
    case "tryout": rows = await sql`SELECT user_id FROM tryouts WHERE slug = ${slug} LIMIT 1`; break;
    case "specialevent": rows = await sql`SELECT user_id FROM special_events WHERE slug = ${slug} LIMIT 1`; break;
    case "trainingapp": rows = await sql`SELECT user_id FROM training_apps WHERE slug = ${slug} LIMIT 1`; break;
    case "blog": rows = await sql`SELECT user_id FROM blogs WHERE slug = ${slug} LIMIT 1`; break;
    case "youtube": rows = await sql`SELECT user_id FROM youtube_channels WHERE slug = ${slug} LIMIT 1`; break;
    default: return null;
  }
  return rows[0]?.user_id as string | null;
}

// ── Reviews ─────────────────────────────────────────────────

export async function createReview(listingType: string, listingId: string, reviewerName: string, reviewerRole: string, rating: number, reviewText: string, invitationToken?: string): Promise<{ id: string; approvalToken: string; autoApproved: boolean }> {
  const id = genId();
  const approvalToken = id + "-" + Math.random().toString(36).slice(2, 10);
  const autoApproved = !!invitationToken;
  const status = autoApproved ? "approved" : "pending";
  await sql`INSERT INTO reviews (id, listing_type, listing_id, reviewer_name, reviewer_role, rating, review_text, status, approval_token, invitation_token) VALUES (${id}, ${listingType}, ${listingId}, ${reviewerName}, ${reviewerRole}, ${rating}, ${reviewText}, ${status}, ${approvalToken}, ${invitationToken || null})`;
  if (invitationToken) {
    await sql`UPDATE review_invitations SET status = 'completed' WHERE token = ${invitationToken}`;
  }
  return { id, approvalToken, autoApproved };
}

export async function getApprovedReviews(listingType: string, listingId: string): Promise<Review[]> {
  const rows = await sql`SELECT *, (invitation_token IS NOT NULL) as is_invited FROM reviews WHERE listing_type = ${listingType} AND listing_id = ${listingId} AND status = 'approved' ORDER BY created_at DESC`;
  return rows.map(mapReview);
}

export async function getListingOwnerIdById(type: string, id: string): Promise<string | null> {
  const t = normalizeType(type);
  let rows: Record<string, unknown>[];
  switch (t) {
    case "club": rows = await sql`SELECT user_id FROM clubs WHERE id = ${id} LIMIT 1`; break;
    case "team": rows = await sql`SELECT user_id FROM teams WHERE id = ${id} LIMIT 1`; break;
    case "trainer": rows = await sql`SELECT user_id FROM trainers WHERE id = ${id} LIMIT 1`; break;
    case "recruiter": rows = await sql`SELECT user_id FROM recruiters WHERE id = ${id} LIMIT 1`; break;
    case "camp":
    case "showcase": rows = await sql`SELECT user_id FROM camps WHERE id = ${id} LIMIT 1`; break;
    case "tryout": rows = await sql`SELECT user_id FROM tryouts WHERE id = ${id} LIMIT 1`; break;
    case "specialevent": rows = await sql`SELECT user_id FROM special_events WHERE id = ${id} LIMIT 1`; break;
    case "tournament": rows = await sql`SELECT user_id FROM tournaments WHERE id = ${id} LIMIT 1`; break;
    case "futsal": rows = await sql`SELECT user_id FROM futsal_teams WHERE id = ${id} LIMIT 1`; break;
    case "scrimmage": rows = await sql`SELECT user_id FROM scrimmages WHERE id = ${id} LIMIT 1`; break;
    case "trip": rows = await sql`SELECT user_id FROM international_trips WHERE id = ${id} LIMIT 1`; break;
    case "guest": rows = await sql`SELECT user_id FROM guest_opportunities WHERE id = ${id} LIMIT 1`; break;
    case "podcast": rows = await sql`SELECT user_id FROM podcasts WHERE id = ${id} LIMIT 1`; break;
    case "service": rows = await sql`SELECT user_id FROM services WHERE id = ${id} LIMIT 1`; break;
    case "blog": rows = await sql`SELECT user_id FROM blogs WHERE id = ${id} LIMIT 1`; break;
    case "youtube": rows = await sql`SELECT user_id FROM youtube_channels WHERE id = ${id} LIMIT 1`; break;
    case "trainingapp": rows = await sql`SELECT user_id FROM training_apps WHERE id = ${id} LIMIT 1`; break;
    case "fbgroup": rows = await sql`SELECT user_id FROM facebook_groups WHERE id = ${id} LIMIT 1`; break;
    case "instagrampage": rows = await sql`SELECT user_id FROM instagram_pages WHERE id = ${id} LIMIT 1`; break;
    case "tiktokpage": rows = await sql`SELECT user_id FROM tiktok_pages WHERE id = ${id} LIMIT 1`; break;
    default: return null;
  }
  return (rows[0]?.user_id as string) || null;
}

export async function getListingSlugById(type: string, id: string): Promise<string | null> {
  const t = normalizeType(type);
  let rows: Record<string, unknown>[];
  switch (t) {
    case "club": rows = await sql`SELECT slug FROM clubs WHERE id = ${id} LIMIT 1`; break;
    case "team": rows = await sql`SELECT slug FROM teams WHERE id = ${id} LIMIT 1`; break;
    case "trainer": rows = await sql`SELECT slug FROM trainers WHERE id = ${id} LIMIT 1`; break;
    case "recruiter": rows = await sql`SELECT slug FROM recruiters WHERE id = ${id} LIMIT 1`; break;
    case "camp":
    case "showcase": rows = await sql`SELECT slug FROM camps WHERE id = ${id} LIMIT 1`; break;
    case "tryout": rows = await sql`SELECT slug FROM tryouts WHERE id = ${id} LIMIT 1`; break;
    case "specialevent": rows = await sql`SELECT slug FROM special_events WHERE id = ${id} LIMIT 1`; break;
    case "tournament": rows = await sql`SELECT slug FROM tournaments WHERE id = ${id} LIMIT 1`; break;
    case "futsal": rows = await sql`SELECT slug FROM futsal_teams WHERE id = ${id} LIMIT 1`; break;
    case "scrimmage": rows = await sql`SELECT slug FROM scrimmages WHERE id = ${id} LIMIT 1`; break;
    case "trip": rows = await sql`SELECT slug FROM international_trips WHERE id = ${id} LIMIT 1`; break;
    case "guest": rows = await sql`SELECT slug FROM guest_opportunities WHERE id = ${id} LIMIT 1`; break;
    case "marketplace": rows = await sql`SELECT slug FROM marketplace WHERE id = ${id} LIMIT 1`; break;
    case "player": rows = await sql`SELECT slug FROM player_profiles WHERE id = ${id} LIMIT 1`; break;
    case "podcast": rows = await sql`SELECT slug FROM podcasts WHERE id = ${id} LIMIT 1`; break;
    case "service": rows = await sql`SELECT slug FROM services WHERE id = ${id} LIMIT 1`; break;
    case "soccerbook": rows = await sql`SELECT slug FROM books WHERE id = ${id} LIMIT 1`; break;
    case "photovideo": rows = await sql`SELECT slug FROM photo_video_services WHERE id = ${id} LIMIT 1`; break;
    case "blog": rows = await sql`SELECT slug FROM blogs WHERE id = ${id} LIMIT 1`; break;
    case "youtube": rows = await sql`SELECT slug FROM youtube_channels WHERE id = ${id} LIMIT 1`; break;
    case "trainingapp": rows = await sql`SELECT slug FROM training_apps WHERE id = ${id} LIMIT 1`; break;
    case "fbgroup": rows = await sql`SELECT slug FROM facebook_groups WHERE id = ${id} LIMIT 1`; break;
    case "instagrampage": rows = await sql`SELECT slug FROM instagram_pages WHERE id = ${id} LIMIT 1`; break;
    case "tiktokpage": rows = await sql`SELECT slug FROM tiktok_pages WHERE id = ${id} LIMIT 1`; break;
    case "ebook": rows = await sql`SELECT slug FROM ebooks WHERE id = ${id} LIMIT 1`; break;
    case "giveaway": rows = await sql`SELECT slug FROM giveaways WHERE id = ${id} LIMIT 1`; break;
    case "fundraiser": rows = await sql`SELECT slug FROM fundraisers WHERE id = ${id} LIMIT 1`; break;
    default: return null;
  }
  return (rows[0]?.slug as string) || null;
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
    case "recruiter": rows = await sql`SELECT name FROM recruiters WHERE id = ${id} LIMIT 1`; break;
    case "camp": rows = await sql`SELECT name FROM camps WHERE id = ${id} LIMIT 1`; break;
    case "tryout": rows = await sql`SELECT name FROM tryouts WHERE id = ${id} LIMIT 1`; break;
    case "specialevent": rows = await sql`SELECT name FROM special_events WHERE id = ${id} LIMIT 1`; break;
    case "instagrampage": rows = await sql`SELECT name FROM instagram_pages WHERE id = ${id} LIMIT 1`; break;
    case "tiktokpage": rows = await sql`SELECT name FROM tiktok_pages WHERE id = ${id} LIMIT 1`; break;
    default: return null;
  }
  return (rows[0]?.name as string) || null;
}

export async function getListingImages(type: string, id: string): Promise<string[]> {
  try {
    type = normalizeType(type);
    const table = TYPE_TO_TABLE[type];
    if (!table) return [];
    const rows: Record<string, unknown>[] = await sql.query(`SELECT photos, team_photo, image_url, logo FROM ${table} WHERE id = $1 LIMIT 1`, [id]);
    if (!rows[0]) return [];
    const images: string[] = [];
    const row = rows[0];
    if (row.photos) {
      try {
        const parsed = JSON.parse(row.photos as string);
        if (Array.isArray(parsed)) {
          for (const url of parsed) {
            if (typeof url === "string" && url.trim()) images.push(url.trim());
          }
        }
      } catch { /* ignore */ }
    }
    if (row.team_photo && typeof row.team_photo === "string") images.push(row.team_photo);
    if (row.image_url && typeof row.image_url === "string" && !images.includes(row.image_url)) images.push(row.image_url);
    if (row.logo && typeof row.logo === "string" && !images.includes(row.logo)) images.push(row.logo);
    return images;
  } catch {
    return [];
  }
}

export async function getListingImageById(type: string, id: string): Promise<string | null> {
  type = normalizeType(type);
  const table = TYPE_TO_TABLE[type];
  if (!table) return null;
  const raw = [`SELECT image_url, team_photo FROM ${table} WHERE id = `, " LIMIT 1"] as unknown as TemplateStringsArray;
  const rows: Record<string, unknown>[] = await sql(raw, id);
  return (rows[0]?.image_url as string) || (rows[0]?.team_photo as string) || null;
}

export async function getListingOwnerEmailById(type: string, id: string): Promise<string | null> {
  type = normalizeType(type);
  let rows: Record<string, unknown>[];
  switch (type) {
    case "club": rows = await sql`SELECT user_id FROM clubs WHERE id = ${id} LIMIT 1`; break;
    case "team": rows = await sql`SELECT user_id FROM teams WHERE id = ${id} LIMIT 1`; break;
    case "trainer": rows = await sql`SELECT user_id FROM trainers WHERE id = ${id} LIMIT 1`; break;
    case "recruiter": rows = await sql`SELECT user_id FROM recruiters WHERE id = ${id} LIMIT 1`; break;
    case "camp":
    case "showcase": rows = await sql`SELECT user_id FROM camps WHERE id = ${id} LIMIT 1`; break;
    case "tryout": rows = await sql`SELECT user_id FROM tryouts WHERE id = ${id} LIMIT 1`; break;
    case "specialevent": rows = await sql`SELECT user_id FROM special_events WHERE id = ${id} LIMIT 1`; break;
    case "tournament": rows = await sql`SELECT user_id FROM tournaments WHERE id = ${id} LIMIT 1`; break;
    case "futsal": rows = await sql`SELECT user_id FROM futsal_teams WHERE id = ${id} LIMIT 1`; break;
    case "scrimmage": rows = await sql`SELECT user_id FROM scrimmages WHERE id = ${id} LIMIT 1`; break;
    case "trip": rows = await sql`SELECT user_id FROM international_trips WHERE id = ${id} LIMIT 1`; break;
    case "marketplace":
    case "equipment":
    case "books": rows = await sql`SELECT user_id FROM marketplace WHERE id = ${id} LIMIT 1`; break;
    case "guest": rows = await sql`SELECT user_id FROM guest_opportunities WHERE id = ${id} LIMIT 1`; break;
    case "player": rows = await sql`SELECT user_id FROM player_profiles WHERE id = ${id} LIMIT 1`; break;
    case "service": rows = await sql`SELECT user_id FROM services WHERE id = ${id} LIMIT 1`; break;
    case "podcast": rows = await sql`SELECT user_id FROM podcasts WHERE id = ${id} LIMIT 1`; break;
    case "fbgroup": rows = await sql`SELECT user_id FROM facebook_groups WHERE id = ${id} LIMIT 1`; break;
    case "instagrampage": rows = await sql`SELECT user_id FROM instagram_pages WHERE id = ${id} LIMIT 1`; break;
    case "tiktokpage": rows = await sql`SELECT user_id FROM tiktok_pages WHERE id = ${id} LIMIT 1`; break;
    case "trainingapp": rows = await sql`SELECT user_id FROM training_apps WHERE id = ${id} LIMIT 1`; break;
    case "blog": rows = await sql`SELECT user_id FROM blogs WHERE id = ${id} LIMIT 1`; break;
    case "youtube": rows = await sql`SELECT user_id FROM youtube_channels WHERE id = ${id} LIMIT 1`; break;
    default: return null;
  }
  const userId = rows[0]?.user_id;
  if (!userId) return null;
  const userRows = await sql`SELECT email FROM users WHERE id = ${userId} LIMIT 1`;
  return (userRows[0]?.email as string) || null;
}

function mapReview(r: Record<string, unknown>): Review {
  return {
    id: r.id as string, listingType: r.listing_type as string, listingId: r.listing_id as string,
    reviewerName: r.reviewer_name as string, reviewerRole: r.reviewer_role as ReviewerRole,
    rating: Number(r.rating), reviewText: r.review_text as string,
    status: r.status as ReviewStatus, createdAt: r.created_at as string,
    isInvited: r.is_invited === true || r.invitation_token != null,
  };
}

// ── Review Invitations ─────────────────────────────────────

export async function createReviewInvitation(listingType: string, listingId: string, email: string, name: string | undefined, invitedBy: string): Promise<{ id: string; token: string }> {
  const id = genId();
  const token = genId();
  await sql`INSERT INTO review_invitations (id, listing_type, listing_id, email, name, token, status, invited_by) VALUES (${id}, ${listingType}, ${listingId}, ${email}, ${name || null}, ${token}, 'pending', ${invitedBy})`;
  return { id, token };
}

export async function getReviewInvitation(token: string): Promise<{ id: string; listingType: string; listingId: string; email: string; name: string | null; status: string } | null> {
  const rows = await sql`SELECT id, listing_type, listing_id, email, name, status FROM review_invitations WHERE token = ${token} LIMIT 1`;
  if (!rows[0]) return null;
  return { id: rows[0].id as string, listingType: rows[0].listing_type as string, listingId: rows[0].listing_id as string, email: rows[0].email as string, name: rows[0].name as string | null, status: rows[0].status as string };
}

export async function getInvitationsByListing(listingType: string, listingId: string): Promise<{ email: string; name: string | null; status: string; createdAt: string }[]> {
  const rows = await sql`SELECT email, name, status, created_at FROM review_invitations WHERE listing_type = ${listingType} AND listing_id = ${listingId} ORDER BY created_at DESC LIMIT 50`;
  return rows.map(r => ({ email: r.email as string, name: r.name as string | null, status: r.status as string, createdAt: r.created_at as string }));
}

// ── Club Reviews ────────────────────────────────────────────

export interface ClubReview {
  id: string;
  userId: string;
  clubId?: string;
  clubSlug?: string;
  clubName: string;
  city: string;
  state: string;
  ratingPrice: number;
  ratingQuality: number;
  ratingCoaching: number;
  overallRating: number;
  reviewerName: string;
  reviewerRole: string;
  reviewText: string;
  status: string;
  createdAt: string;
  likes: number;
  dislikes: number;
}

export interface ClubReviewComment {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
}

export async function createClubReview(data: {
  clubName: string; city: string; state: string;
  ratingPrice: number; ratingQuality: number; ratingCoaching: number;
  reviewerName: string; reviewerRole: string; reviewText: string;
  clubId?: string;
}, userId?: string): Promise<{ id: string; approvalToken: string }> {
  const id = genId();
  const approvalToken = id + "-" + Math.random().toString(36).slice(2, 10);
  const overall = Number(((data.ratingPrice + data.ratingQuality + data.ratingCoaching) / 3).toFixed(1));
  await sql`INSERT INTO club_reviews (id, user_id, club_id, club_name, city, state, rating_price, rating_quality, rating_coaching, overall_rating, reviewer_name, reviewer_role, review_text, status, approval_token)
    VALUES (${id}, ${userId || null}, ${data.clubId || null}, ${data.clubName}, ${data.city || null}, ${data.state || null}, ${data.ratingPrice}, ${data.ratingQuality}, ${data.ratingCoaching}, ${overall}, ${data.reviewerName}, ${data.reviewerRole || null}, ${data.reviewText || null}, 'pending', ${approvalToken})`;
  return { id, approvalToken };
}

export async function getApprovedClubReviews(): Promise<ClubReview[]> {
  const rows = await sql`SELECT cr.*, c.slug as club_slug,
    COALESCE((SELECT COUNT(*)::int FROM club_review_votes WHERE review_id = cr.id AND vote_type = 'like'), 0) as likes,
    COALESCE((SELECT COUNT(*)::int FROM club_review_votes WHERE review_id = cr.id AND vote_type = 'dislike'), 0) as dislikes
    FROM club_reviews cr
    LEFT JOIN clubs c ON c.id = cr.club_id AND c.status = 'approved'
    WHERE cr.status = 'approved' ORDER BY cr.created_at DESC`;
  return rows.map(mapClubReview);
}

export async function getClubReviewByToken(token: string): Promise<{ id: string; status: string } | null> {
  const rows = await sql`SELECT id, status FROM club_reviews WHERE approval_token = ${token} LIMIT 1`;
  if (!rows[0]) return null;
  return { id: rows[0].id as string, status: rows[0].status as string };
}

export async function updateClubReviewStatus(token: string, status: string): Promise<boolean> {
  const rows = await sql`UPDATE club_reviews SET status = ${status} WHERE approval_token = ${token} RETURNING id`;
  return rows.length > 0;
}

export async function updateClubReview(id: string, userId: string, data: {
  clubName: string; city: string; state: string;
  ratingPrice: number; ratingQuality: number; ratingCoaching: number;
  reviewerName: string; reviewerRole: string; reviewText: string;
}): Promise<boolean> {
  const overall = Number(((data.ratingPrice + data.ratingQuality + data.ratingCoaching) / 3).toFixed(1));
  const rows = await sql`UPDATE club_reviews SET
    club_name=${data.clubName}, city=${data.city || null}, state=${data.state || null},
    rating_price=${data.ratingPrice}, rating_quality=${data.ratingQuality}, rating_coaching=${data.ratingCoaching},
    overall_rating=${overall}, reviewer_name=${data.reviewerName}, reviewer_role=${data.reviewerRole || null},
    review_text=${data.reviewText || null}, status='pending'
    WHERE id=${id} AND user_id=${userId} RETURNING id`;
  return rows.length > 0;
}

export async function deleteClubReview(id: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM club_reviews WHERE id=${id} AND user_id=${userId} RETURNING id`;
  return rows.length > 0;
}

// Club review comments
export async function getClubReviewComments(reviewId: string): Promise<ClubReviewComment[]> {
  const rows = await sql`SELECT * FROM club_review_comments WHERE review_id = ${reviewId} ORDER BY created_at ASC`;
  return rows.map((r) => ({
    id: r.id as string, reviewId: r.review_id as string, userId: r.user_id as string,
    userName: r.user_name as string, body: r.body as string, createdAt: r.created_at as string,
  }));
}

export interface AdminClubReviewComment {
  id: string;
  reviewId: string;
  clubName: string;
  userId: string;
  userName: string;
  userEmail: string;
  accountName: string;
  body: string;
  createdAt: string;
}

export async function getAllClubReviewComments(): Promise<AdminClubReviewComment[]> {
  const rows = await sql`SELECT c.*, cr.club_name, u.email as user_email, u.name as account_name
    FROM club_review_comments c
    LEFT JOIN club_reviews cr ON c.review_id = cr.id
    LEFT JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC`;
  return rows.map((r) => ({
    id: r.id as string, reviewId: r.review_id as string, clubName: r.club_name as string || "",
    userId: r.user_id as string, userName: r.user_name as string, userEmail: r.user_email as string || "",
    accountName: r.account_name as string || "", body: r.body as string, createdAt: r.created_at as string,
  }));
}

export async function createClubReviewComment(reviewId: string, userId: string, userName: string, body: string): Promise<string> {
  const id = genId();
  await sql`INSERT INTO club_review_comments (id, review_id, user_id, user_name, body) VALUES (${id}, ${reviewId}, ${userId}, ${userName}, ${body})`;
  return id;
}

export async function deleteClubReviewComment(commentId: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM club_review_comments WHERE id = ${commentId} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

export async function adminDeleteClubReviewComment(commentId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM club_review_comments WHERE id = ${commentId} RETURNING id`;
  return rows.length > 0;
}

// Club review votes
export async function voteClubReview(reviewId: string, userId: string, voteType: "like" | "dislike"): Promise<{ likes: number; dislikes: number }> {
  const existing = await sql`SELECT id, vote_type FROM club_review_votes WHERE review_id = ${reviewId} AND user_id = ${userId} LIMIT 1`;
  if (existing.length > 0) {
    if (existing[0].vote_type === voteType) {
      // Same vote = remove it (toggle off)
      await sql`DELETE FROM club_review_votes WHERE id = ${existing[0].id}`;
    } else {
      // Different vote = switch it
      await sql`UPDATE club_review_votes SET vote_type = ${voteType} WHERE id = ${existing[0].id}`;
    }
  } else {
    const id = genId();
    await sql`INSERT INTO club_review_votes (id, review_id, user_id, vote_type) VALUES (${id}, ${reviewId}, ${userId}, ${voteType})`;
  }
  // Return updated counts
  const counts = await sql`SELECT
    COALESCE((SELECT COUNT(*)::int FROM club_review_votes WHERE review_id = ${reviewId} AND vote_type = 'like'), 0) as likes,
    COALESCE((SELECT COUNT(*)::int FROM club_review_votes WHERE review_id = ${reviewId} AND vote_type = 'dislike'), 0) as dislikes`;
  return { likes: Number(counts[0].likes), dislikes: Number(counts[0].dislikes) };
}

export async function getUserVotesForReviews(userId: string): Promise<Record<string, string>> {
  const rows = await sql`SELECT review_id, vote_type FROM club_review_votes WHERE user_id = ${userId}`;
  const map: Record<string, string> = {};
  for (const r of rows) map[r.review_id as string] = r.vote_type as string;
  return map;
}

// Get review owner info for email notifications
export async function getClubReviewById(reviewId: string): Promise<{ userId: string; clubName: string; reviewerName: string } | null> {
  const rows = await sql`SELECT user_id, club_name, reviewer_name FROM club_reviews WHERE id = ${reviewId} LIMIT 1`;
  if (!rows[0]) return null;
  return { userId: rows[0].user_id as string, clubName: rows[0].club_name as string, reviewerName: rows[0].reviewer_name as string };
}

export async function getUserEmailById(userId: string): Promise<string | null> {
  const rows = await sql`SELECT email FROM users WHERE id = ${userId} LIMIT 1`;
  return (rows[0]?.email as string) || null;
}

function mapClubReview(r: Record<string, unknown>): ClubReview {
  return {
    id: r.id as string, userId: r.user_id as string || "",
    clubId: r.club_id as string | undefined, clubSlug: r.club_slug as string | undefined,
    clubName: r.club_name as string,
    city: r.city as string || "", state: r.state as string || "",
    ratingPrice: Number(r.rating_price), ratingQuality: Number(r.rating_quality),
    ratingCoaching: Number(r.rating_coaching), overallRating: Number(r.overall_rating),
    reviewerName: r.reviewer_name as string, reviewerRole: r.reviewer_role as string || "",
    reviewText: r.review_text as string || "", status: r.status as string,
    createdAt: r.created_at as string,
    likes: Number(r.likes) || 0, dislikes: Number(r.dislikes) || 0,
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

// ── Listing Posts ────────────────────────────────────────────
export interface ListingPost {
  id: string;
  slug?: string;
  title?: string;
  listingType: string;
  listingId: string;
  userId: string;
  userName: string;
  body: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaUrl?: string;
  ctaLabel?: string;
  ctaUrl2?: string;
  ctaLabel2?: string;
  ctaUrl3?: string;
  ctaLabel3?: string;
  ogImageUrl?: string;
  hidden: boolean;
  createdAt: string;
}

function mapListingPost(r: Record<string, unknown>): ListingPost {
  return {
    id: r.id as string,
    slug: r.slug as string | undefined,
    title: r.title as string | undefined,
    listingType: r.listing_type as string,
    listingId: r.listing_id as string,
    userId: r.user_id as string,
    userName: r.user_name as string,
    body: r.body as string,
    imageUrl: r.image_url as string | undefined,
    videoUrl: r.video_url as string | undefined,
    ctaUrl: r.cta_url as string | undefined,
    ctaLabel: r.cta_label as string | undefined,
    ctaUrl2: r.cta_url_2 as string | undefined,
    ctaLabel2: r.cta_label_2 as string | undefined,
    ctaUrl3: r.cta_url_3 as string | undefined,
    ctaLabel3: r.cta_label_3 as string | undefined,
    ogImageUrl: r.og_image_url as string | undefined,
    hidden: r.hidden as boolean,
    createdAt: r.created_at as string,
  };
}

export async function getMemberArticles(): Promise<(ListingPost & { listingName?: string; listingSlug?: string })[]> {
  const rows = await sql`SELECT p.*, u.name as user_name FROM listing_posts p JOIN users u ON u.id = p.user_id WHERE p.title IS NOT NULL AND p.title != '' AND p.hidden = false ORDER BY p.created_at DESC LIMIT 50`;
  return rows.map(mapListingPost);
}

export async function getListingPosts(listingType: string, listingId: string, includeHidden = false): Promise<ListingPost[]> {
  const rows = includeHidden
    ? await sql`SELECT p.*, u.name as user_name FROM listing_posts p JOIN users u ON u.id = p.user_id WHERE p.listing_type = ${listingType} AND p.listing_id = ${listingId} ORDER BY p.created_at DESC LIMIT 50`
    : await sql`SELECT p.*, u.name as user_name FROM listing_posts p JOIN users u ON u.id = p.user_id WHERE p.listing_type = ${listingType} AND p.listing_id = ${listingId} AND p.hidden = false ORDER BY p.created_at DESC LIMIT 50`;
  return rows.map(mapListingPost);
}

export async function getListingPostById(id: string): Promise<ListingPost | null> {
  const rows = await sql`SELECT p.*, u.name as user_name FROM listing_posts p JOIN users u ON u.id = p.user_id WHERE p.id = ${id} LIMIT 1`;
  return rows[0] ? mapListingPost(rows[0]) : null;
}

export async function getListingPostBySlug(slug: string): Promise<ListingPost | null> {
  const rows = await sql`SELECT p.*, u.name as user_name FROM listing_posts p JOIN users u ON u.id = p.user_id WHERE p.slug = ${slug} LIMIT 1`;
  return rows[0] ? mapListingPost(rows[0]) : null;
}

function generatePostSlug(body: string): string {
  const text = body.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ");
  return text.slice(0, 60).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || genId();
}

export async function createListingPost(listingType: string, listingId: string, userId: string, body: string, imageUrl?: string, videoUrl?: string, ctaUrl?: string, ctaLabel?: string, ogImageUrl?: string, title?: string): Promise<{ id: string; slug: string }> {
  const id = genId();
  const slugSource = title || body;
  const baseSlug = generatePostSlug(slugSource);
  let slug = baseSlug;
  const existing = await sql`SELECT id FROM listing_posts WHERE slug = ${slug} LIMIT 1`;
  if (existing.length > 0) slug = `${baseSlug}-${id.slice(0, 6)}`;
  await sql`INSERT INTO listing_posts (id, slug, listing_type, listing_id, user_id, body, image_url, video_url, cta_url, cta_label, og_image_url, title) VALUES (${id}, ${slug}, ${listingType}, ${listingId}, ${userId}, ${body}, ${imageUrl || null}, ${videoUrl || null}, ${ctaUrl || null}, ${ctaLabel || null}, ${ogImageUrl || null}, ${title || null})`;
  return { id, slug };
}

export async function updateListingPostBody(id: string, userId: string, body: string, title?: string): Promise<boolean> {
  const rows = await sql`UPDATE listing_posts SET body = ${body}, title = ${title || null} WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

export async function updateListingPostBodyAdmin(id: string, body: string, title?: string): Promise<boolean> {
  const rows = await sql`UPDATE listing_posts SET body = ${body}, title = ${title || null} WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function updateListingPostMedia(id: string, userId: string, imageUrl: string | null, videoUrl: string | null, ctaUrl?: string | null, ctaLabel?: string | null, ogImageUrl?: string | null, ctaUrl2?: string | null, ctaLabel2?: string | null, ctaUrl3?: string | null, ctaLabel3?: string | null): Promise<boolean> {
  const rows = await sql`UPDATE listing_posts SET image_url = ${imageUrl}, video_url = ${videoUrl}, cta_url = ${ctaUrl ?? null}, cta_label = ${ctaLabel ?? null}, cta_url_2 = ${ctaUrl2 ?? null}, cta_label_2 = ${ctaLabel2 ?? null}, cta_url_3 = ${ctaUrl3 ?? null}, cta_label_3 = ${ctaLabel3 ?? null}, og_image_url = ${ogImageUrl ?? null} WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

export async function updateListingPostMediaAdmin(id: string, imageUrl: string | null, videoUrl: string | null, ctaUrl?: string | null, ctaLabel?: string | null, ogImageUrl?: string | null, ctaUrl2?: string | null, ctaLabel2?: string | null, ctaUrl3?: string | null, ctaLabel3?: string | null): Promise<boolean> {
  const rows = await sql`UPDATE listing_posts SET image_url = ${imageUrl}, video_url = ${videoUrl}, cta_url = ${ctaUrl ?? null}, cta_label = ${ctaLabel ?? null}, cta_url_2 = ${ctaUrl2 ?? null}, cta_label_2 = ${ctaLabel2 ?? null}, cta_url_3 = ${ctaUrl3 ?? null}, cta_label_3 = ${ctaLabel3 ?? null}, og_image_url = ${ogImageUrl ?? null} WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function updateListingPostSlug(id: string, userId: string, slug: string): Promise<boolean> {
  const s = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!s) return false;
  const existing = await sql`SELECT id FROM listing_posts WHERE slug = ${s} AND id != ${id} LIMIT 1`;
  if (existing.length > 0) return false;
  const rows = await sql`UPDATE listing_posts SET slug = ${s} WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

export async function updateListingPostSlugAdmin(id: string, slug: string): Promise<boolean> {
  const s = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!s) return false;
  const existing = await sql`SELECT id FROM listing_posts WHERE slug = ${s} AND id != ${id} LIMIT 1`;
  if (existing.length > 0) return false;
  const rows = await sql`UPDATE listing_posts SET slug = ${s} WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function toggleListingPostHidden(id: string, userId: string): Promise<boolean> {
  const rows = await sql`UPDATE listing_posts SET hidden = NOT hidden WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

export async function deleteListingPost(id: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM listing_posts WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

export async function deleteListingPostAdmin(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM listing_posts WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function toggleListingPostHiddenAdmin(id: string): Promise<boolean> {
  const rows = await sql`UPDATE listing_posts SET hidden = NOT hidden WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

// ── Food Tracker ─────────────────────────────────────────────
export async function getFoodLog(date: string) {
  const rows = await sql`SELECT id, entry_date, meal_type, kind, description, created_at FROM food_log WHERE entry_date = ${date} ORDER BY created_at ASC`;
  return rows as { id: number; entry_date: string; meal_type: string; kind: string; description: string; created_at: string }[];
}

export async function addFoodEntry(date: string, mealType: string, kind: string, description: string) {
  await sql`INSERT INTO food_log (entry_date, meal_type, kind, description) VALUES (${date}, ${mealType}, ${kind}, ${description})`;
}

export async function deleteFoodEntry(id: number) {
  await sql`DELETE FROM food_log WHERE id = ${id}`;
}

// ── CRM ──────────────────────────────────────────────────────
export async function getCrmContacts() {
  return await sql`SELECT * FROM crm_contacts ORDER BY created_at DESC`;
}
export async function addCrmContact(data: Record<string, string>) {
  await sql`INSERT INTO crm_contacts (first_name, last_name, email, phone, team, onboarding_date, group_name, notes) VALUES (${data.firstName || ''}, ${data.lastName || ''}, ${data.email || ''}, ${data.phone || ''}, ${data.team || ''}, ${data.onboardingDate || ''}, ${data.groupName || ''}, ${data.notes || ''})`;
}
export async function updateCrmContact(id: number, data: Record<string, string>) {
  await sql`UPDATE crm_contacts SET first_name=${data.firstName || ''}, last_name=${data.lastName || ''}, email=${data.email || ''}, phone=${data.phone || ''}, team=${data.team || ''}, onboarding_date=${data.onboardingDate || ''}, group_name=${data.groupName || ''}, notes=${data.notes || ''}, updated_at=NOW() WHERE id=${id}`;
}
export async function deleteCrmContact(id: number) {
  await sql`DELETE FROM crm_contacts WHERE id = ${id}`;
}
export async function getCrmGroups() {
  return await sql`SELECT * FROM crm_groups ORDER BY sort_order ASC`;
}
export async function addCrmGroup(name: string) {
  const max = await sql`SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM crm_groups`;
  await sql`INSERT INTO crm_groups (name, sort_order) VALUES (${name}, ${Number(max[0].next)})`;
}
export async function updateCrmGroupOrder(groups: { id: number; sort_order: number }[]) {
  for (const g of groups) {
    await sql`UPDATE crm_groups SET sort_order=${g.sort_order} WHERE id=${g.id}`;
  }
}
export async function deleteCrmGroup(id: number) {
  await sql`DELETE FROM crm_groups WHERE id = ${id}`;
}

// ── CRM Comments ──────────────────────────────────────────────

export async function getCrmComments() {
  return await sql`SELECT * FROM crm_comments ORDER BY created_at ASC`;
}

export async function addCrmComment(contactId: number, body: string, authorName: string, authorEmail: string) {
  await sql`INSERT INTO crm_comments (contact_id, body, author_name, author_email) VALUES (${contactId}, ${body}, ${authorName}, ${authorEmail})`;
}

export async function deleteCrmComment(id: number) {
  await sql`DELETE FROM crm_comments WHERE id = ${id}`;
}

// ── Admin Todos ──────────────────────────────────────────────
export async function getAdminTodos() {
  return await sql`SELECT * FROM admin_todos ORDER BY project ASC, created_at DESC`;
}
export async function addAdminTodo(item: string, notes: string, project: string) {
  await sql`INSERT INTO admin_todos (item, notes, project) VALUES (${item}, ${notes || ''}, ${project || ''})`;
}
export async function updateAdminTodo(id: number, data: Record<string, string | boolean>) {
  await sql`UPDATE admin_todos SET item=${data.item}, notes=${data.notes || ''}, status=${data.status || 'pending'}, project=${data.project ?? ''}, hidden=${data.hidden === true || data.hidden === 'true'} WHERE id=${id}`;
}
export async function deleteAdminTodo(id: number) {
  await sql`DELETE FROM admin_todos WHERE id = ${id}`;
}

// ── Admin Resources ──────────────────────────────────────────
export async function getAdminResources() {
  return await sql`SELECT * FROM admin_resources ORDER BY created_at DESC`;
}
export async function addAdminResource(item: string, description: string) {
  await sql`INSERT INTO admin_resources (item, description) VALUES (${item}, ${description || ''})`;
}
export async function updateAdminResource(id: number, data: Record<string, string>) {
  await sql`UPDATE admin_resources SET item=${data.item}, description=${data.description || ''} WHERE id=${id}`;
}
export async function deleteAdminResource(id: number) {
  await sql`DELETE FROM admin_resources WHERE id = ${id}`;
}

// ── Admin Contacts (Address Book) ────────────────────────────
export async function getAdminContacts() {
  return await sql`SELECT * FROM admin_contacts ORDER BY created_at DESC`;
}
export async function addAdminContact(data: Record<string, string>) {
  await sql`INSERT INTO admin_contacts (name, email, social, phone, notes, action_item, group_name) VALUES (${data.name}, ${data.email || ''}, ${data.social || ''}, ${data.phone || ''}, ${data.notes || ''}, ${data.actionItem || ''}, ${data.groupName || ''})`;
}
export async function updateAdminContact(id: number, data: Record<string, string>) {
  await sql`UPDATE admin_contacts SET name=${data.name}, email=${data.email || ''}, social=${data.social || ''}, phone=${data.phone || ''}, notes=${data.notes || ''}, action_item=${data.actionItem || ''}, group_name=${data.groupName || ''} WHERE id=${id}`;
}
export async function deleteAdminContact(id: number) {
  await sql`DELETE FROM admin_contacts WHERE id = ${id}`;
}

// ── Fundraisers ─────────────────────────────────────────────
export interface FundraiserRosterEntry {
  id: string; fundraiserId: string; playerName: string;
  position?: string; ageGroup?: string; photoUrl?: string; bio?: string;
  sortOrder: number; createdAt: string;
  email?: string; inviteToken?: string; inviteStatus?: string; userId?: string;
  amountRaised?: number;
}

export interface Fundraiser {
  id: string; slug: string; userId: string;
  clubId?: string; teamId?: string;
  title: string; description?: string; goal?: number;
  coachName?: string; coachEmail?: string; coachPhone?: string;
  websiteUrl?: string; facebookUrl?: string; instagramUrl?: string;
  heroImageUrl?: string; active: boolean; tagline?: string;
  tags?: string[]; photos?: string[]; videoUrl?: string; teamPhoto?: string;
  announcementHeading?: string; announcementText?: string; announcementImage?: string;
  announcementCta?: string; announcementCtaUrl?: string;
  announcementHeading2?: string; announcementText2?: string; announcementImage2?: string;
  announcementCta2?: string; announcementCtaUrl2?: string;
  announcementHeading3?: string; announcementText3?: string; announcementImage3?: string;
  announcementCta3?: string; announcementCtaUrl3?: string;
  createdAt: string; updatedAt: string;
  totalRaised?: number; donorCount?: number;
  roster?: FundraiserRosterEntry[];
}

function parseJsonArray(val: unknown): string[] | undefined {
  if (!val) return undefined;
  try { const arr = JSON.parse(val as string); return Array.isArray(arr) ? arr : undefined; } catch { return undefined; }
}

function mapFundraiser(r: Record<string, unknown>): Fundraiser {
  return {
    id: r.id as string, slug: r.slug as string, userId: r.user_id as string,
    clubId: r.club_id as string | undefined, teamId: r.team_id as string | undefined,
    title: r.title as string, description: r.description as string | undefined,
    goal: r.goal as number | undefined,
    coachName: r.coach_name as string | undefined, coachEmail: r.coach_email as string | undefined,
    coachPhone: r.coach_phone as string | undefined,
    websiteUrl: r.website_url as string | undefined, facebookUrl: r.facebook_url as string | undefined,
    instagramUrl: r.instagram_url as string | undefined,
    heroImageUrl: r.hero_image_url as string | undefined,
    active: r.active as boolean, tagline: r.tagline as string | undefined,
    tags: parseJsonArray(r.tags), photos: parseJsonArray(r.photos),
    videoUrl: r.video_url as string | undefined, teamPhoto: r.team_photo as string | undefined,
    announcementHeading: r.announcement_heading as string | undefined,
    announcementText: r.announcement_text as string | undefined,
    announcementImage: r.announcement_image as string | undefined,
    announcementCta: r.announcement_cta as string | undefined,
    announcementCtaUrl: r.announcement_cta_url as string | undefined,
    announcementHeading2: r.announcement_heading_2 as string | undefined,
    announcementText2: r.announcement_text_2 as string | undefined,
    announcementImage2: r.announcement_image_2 as string | undefined,
    announcementCta2: r.announcement_cta_2 as string | undefined,
    announcementCtaUrl2: r.announcement_cta_url_2 as string | undefined,
    announcementHeading3: r.announcement_heading_3 as string | undefined,
    announcementText3: r.announcement_text_3 as string | undefined,
    announcementImage3: r.announcement_image_3 as string | undefined,
    announcementCta3: r.announcement_cta_3 as string | undefined,
    announcementCtaUrl3: r.announcement_cta_url_3 as string | undefined,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    totalRaised: r.total_raised ? Number(r.total_raised) : undefined,
    donorCount: r.donor_count ? Number(r.donor_count) : undefined,
  };
}

export async function getActiveFundraisers(): Promise<Fundraiser[]> {
  const rows = await sql`
    SELECT f.*,
      COALESCE((SELECT SUM(amount) FROM donations WHERE fundraiser_id = f.id AND status = 'completed'), 0) as total_raised,
      COALESCE((SELECT COUNT(*) FROM donations WHERE fundraiser_id = f.id AND status = 'completed'), 0) as donor_count
    FROM fundraisers f WHERE f.active = true ORDER BY f.created_at DESC`;
  return rows.map(mapFundraiser);
}

export async function getFundraiserById(id: string): Promise<Fundraiser | null> {
  const rows = await sql`SELECT * FROM fundraisers WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapFundraiser(rows[0]) : null;
}

export async function getFundraiserBySlug(slug: string): Promise<Fundraiser | null> {
  const rows = await sql`
    SELECT f.*,
      COALESCE((SELECT SUM(amount) FROM donations WHERE fundraiser_id = f.id AND status = 'completed'), 0) as total_raised,
      COALESCE((SELECT COUNT(*) FROM donations WHERE fundraiser_id = f.id AND status = 'completed'), 0) as donor_count
    FROM fundraisers f WHERE f.slug = ${slug} LIMIT 1`;
  return rows[0] ? mapFundraiser(rows[0]) : null;
}

export async function getFundraisersByUserId(userId: string): Promise<Fundraiser[]> {
  const rows = await sql`
    SELECT f.*,
      COALESCE((SELECT SUM(amount) FROM donations WHERE fundraiser_id = f.id AND status = 'completed'), 0) as total_raised,
      COALESCE((SELECT COUNT(*) FROM donations WHERE fundraiser_id = f.id AND status = 'completed'), 0) as donor_count
    FROM fundraisers f WHERE f.user_id = ${userId} ORDER BY f.created_at DESC`;
  return rows.map(mapFundraiser);
}

export async function createFundraiser(data: Record<string, string>, userId: string): Promise<string> {
  const id = genId();
  const slug = data.slug || (data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  await sql`INSERT INTO fundraisers (id, slug, user_id, club_id, team_id, title, description, goal, coach_name, coach_email, coach_phone, website_url, facebook_url, instagram_url, hero_image_url, tags, photos, video_url, team_photo, announcement_heading, announcement_text, announcement_image, announcement_cta, announcement_cta_url, announcement_heading_2, announcement_text_2, announcement_image_2, announcement_cta_2, announcement_cta_url_2, announcement_heading_3, announcement_text_3, announcement_image_3, announcement_cta_3, announcement_cta_url_3, active)
    VALUES (${id}, ${slug}, ${userId}, ${data.clubId || null}, ${data.teamId || null}, ${data.title}, ${data.description || null}, ${data.goal && !isNaN(Number(data.goal)) ? Number(data.goal) : null}, ${data.coachName || null}, ${data.coachEmail || null}, ${data.coachPhone || null}, ${data.websiteUrl || null}, ${data.facebookUrl || null}, ${data.instagramUrl || null}, ${data.heroImageUrl || null}, ${data.tags || null}, ${data.photos || null}, ${data.videoUrl || null}, ${data.teamPhoto || null}, ${data.announcementHeading || null}, ${data.announcementText || null}, ${data.announcementImage || null}, ${data.announcementCta || null}, ${data.announcementCtaUrl || null}, ${data.announcementHeading2 || null}, ${data.announcementText2 || null}, ${data.announcementImage2 || null}, ${data.announcementCta2 || null}, ${data.announcementCtaUrl2 || null}, ${data.announcementHeading3 || null}, ${data.announcementText3 || null}, ${data.announcementImage3 || null}, ${data.announcementCta3 || null}, ${data.announcementCtaUrl3 || null}, true)`;
  if (data.roster) {
    await syncFundraiserRoster(id, data.roster);
  }
  return slug;
}

export async function updateFundraiser(slug: string, data: Record<string, string>, userId: string): Promise<boolean> {
  const rows = await sql`UPDATE fundraisers SET
    title=${data.title}, description=${data.description || null},
    goal=${data.goal && !isNaN(Number(data.goal)) ? Number(data.goal) : null},
    club_id=${data.clubId || null}, team_id=${data.teamId || null},
    coach_name=${data.coachName || null}, coach_email=${data.coachEmail || null}, coach_phone=${data.coachPhone || null},
    website_url=${data.websiteUrl || null}, facebook_url=${data.facebookUrl || null}, instagram_url=${data.instagramUrl || null},
    hero_image_url=${data.heroImageUrl || null},
    active=${data.active === "true"},
    updated_at=NOW()
    WHERE slug=${slug} AND user_id=${userId} RETURNING id`;
  return rows.length > 0;
}

export async function deleteFundraiser(slug: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM fundraisers WHERE slug=${slug} AND user_id=${userId} RETURNING id`;
  return rows.length > 0;
}

// ── Fundraiser Roster ────────────────────────────────────────
function mapRosterEntry(r: Record<string, unknown>): FundraiserRosterEntry {
  return {
    id: r.id as string, fundraiserId: r.fundraiser_id as string,
    playerName: r.player_name as string, position: r.position as string | undefined,
    ageGroup: r.age_group as string | undefined, photoUrl: r.photo_url as string | undefined,
    bio: r.bio as string | undefined, sortOrder: r.sort_order as number,
    createdAt: r.created_at as string,
    email: r.email as string | undefined, inviteToken: r.invite_token as string | undefined,
    inviteStatus: r.invite_status as string | undefined, userId: r.user_id as string | undefined,
    amountRaised: r.amount_raised ? Number(r.amount_raised) : 0,
  };
}

export async function getRosterByFundraiserId(fundraiserId: string): Promise<FundraiserRosterEntry[]> {
  const rows = await sql`SELECT r.*,
    COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.player_id = r.id AND d.status = 'completed'), 0) as amount_raised
    FROM fundraiser_roster r WHERE r.fundraiser_id = ${fundraiserId} AND r.invite_status = 'accepted'
    ORDER BY r.sort_order ASC, r.created_at ASC`;
  return rows.map(mapRosterEntry);
}

export async function getRosterWithPendingByFundraiserId(fundraiserId: string): Promise<FundraiserRosterEntry[]> {
  const rows = await sql`SELECT r.*,
    COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.player_id = r.id AND d.status = 'completed'), 0) as amount_raised
    FROM fundraiser_roster r WHERE r.fundraiser_id = ${fundraiserId}
    ORDER BY r.sort_order ASC, r.created_at ASC`;
  return rows.map(mapRosterEntry);
}

export async function invitePlayerToRoster(fundraiserId: string, email: string): Promise<{ id: string; token: string }> {
  // Check if already invited
  const existing = await sql`SELECT id, invite_token FROM fundraiser_roster WHERE fundraiser_id = ${fundraiserId} AND email = ${email.toLowerCase()} LIMIT 1`;
  if (existing[0]) {
    return { id: existing[0].id as string, token: existing[0].invite_token as string };
  }
  const id = genId();
  const token = genId();
  await sql`INSERT INTO fundraiser_roster (id, fundraiser_id, player_name, email, invite_token, invite_status, sort_order)
    VALUES (${id}, ${fundraiserId}, ${email.toLowerCase()}, ${email.toLowerCase()}, ${token}, 'pending', 999)`;
  return { id, token };
}

export async function getRosterEntryByToken(token: string): Promise<(FundraiserRosterEntry & { fundraiserTitle?: string; fundraiserSlug?: string }) | null> {
  const rows = await sql`SELECT r.*, f.title as fundraiser_title, f.slug as fundraiser_slug
    FROM fundraiser_roster r LEFT JOIN fundraisers f ON r.fundraiser_id = f.id
    WHERE r.invite_token = ${token} LIMIT 1`;
  if (!rows[0]) return null;
  return { ...mapRosterEntry(rows[0]), fundraiserTitle: rows[0].fundraiser_title as string, fundraiserSlug: rows[0].fundraiser_slug as string };
}

export async function acceptRosterInvite(token: string, userId: string, data: { playerName: string; position?: string; ageGroup?: string; photoUrl?: string; bio?: string }): Promise<boolean> {
  const rows = await sql`UPDATE fundraiser_roster SET
    invite_status = 'accepted', user_id = ${userId}, player_name = ${data.playerName},
    position = ${data.position || null}, age_group = ${data.ageGroup || null},
    photo_url = ${data.photoUrl || null}, bio = ${data.bio || null}
    WHERE invite_token = ${token} RETURNING id`;
  return rows.length > 0;
}

export async function requestToJoinRoster(fundraiserId: string, userId: string, data: { playerName: string; position?: string; ageGroup?: string; photoUrl?: string; bio?: string }): Promise<string> {
  // Check if already on roster
  const existing = await sql`SELECT id FROM fundraiser_roster WHERE fundraiser_id = ${fundraiserId} AND user_id = ${userId} LIMIT 1`;
  if (existing[0]) return existing[0].id as string;
  const id = genId();
  const token = genId();
  await sql`INSERT INTO fundraiser_roster (id, fundraiser_id, player_name, position, age_group, photo_url, bio, invite_token, invite_status, user_id, sort_order)
    VALUES (${id}, ${fundraiserId}, ${data.playerName}, ${data.position || null}, ${data.ageGroup || null}, ${data.photoUrl || null}, ${data.bio || null}, ${token}, 'requested', ${userId}, 999)`;
  return id;
}

export async function approveRosterRequest(entryId: string, fundraiserId: string): Promise<boolean> {
  const rows = await sql`UPDATE fundraiser_roster SET invite_status = 'accepted' WHERE id = ${entryId} AND fundraiser_id = ${fundraiserId} AND invite_status = 'requested' RETURNING id`;
  return rows.length > 0;
}

export async function rejectRosterRequest(entryId: string, fundraiserId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM fundraiser_roster WHERE id = ${entryId} AND fundraiser_id = ${fundraiserId} AND invite_status = 'requested' RETURNING id`;
  return rows.length > 0;
}

export async function getUserRosterEntryForFundraiser(fundraiserId: string, userId: string): Promise<FundraiserRosterEntry | null> {
  const rows = await sql`SELECT r.*, 0 as amount_raised FROM fundraiser_roster r WHERE r.fundraiser_id = ${fundraiserId} AND r.user_id = ${userId} LIMIT 1`;
  return rows[0] ? mapRosterEntry(rows[0]) : null;
}

export async function updateRosterEntry(entryId: string, userId: string, data: { playerName: string; position?: string; ageGroup?: string; photoUrl?: string; bio?: string }): Promise<boolean> {
  const rows = await sql`UPDATE fundraiser_roster SET
    player_name = ${data.playerName}, position = ${data.position || null},
    age_group = ${data.ageGroup || null}, photo_url = ${data.photoUrl || null}, bio = ${data.bio || null}
    WHERE id = ${entryId} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

function sanitizeSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function resolveFundraiserSlug(data: Record<string, string>, currentId: string): Promise<string | null> {
  if (!data.slug) return null;
  const slug = sanitizeSlug(data.slug);
  if (!slug) return null;
  const existing = await sql`SELECT id FROM fundraisers WHERE slug = ${slug} AND id != ${currentId} LIMIT 1`;
  if (existing.length > 0) throw new Error("SLUG_TAKEN");
  return slug;
}

const PATCHABLE_FUNDRAISER_FIELDS: Record<string, string> = {
  title: "title", tagline: "tagline", description: "description",
  coachName: "coach_name", coachEmail: "coach_email", coachPhone: "coach_phone",
};

export async function patchFundraiserField(slug: string, userId: string, field: string, value: string): Promise<boolean> {
  const col = PATCHABLE_FUNDRAISER_FIELDS[field];
  if (!col) return false;
  let rows;
  switch (col) {
    case "title": rows = await sql`UPDATE fundraisers SET title = ${value}, updated_at = NOW() WHERE slug = ${slug} AND user_id = ${userId} RETURNING id`; break;
    case "tagline": rows = await sql`UPDATE fundraisers SET tagline = ${value}, updated_at = NOW() WHERE slug = ${slug} AND user_id = ${userId} RETURNING id`; break;
    case "description": rows = await sql`UPDATE fundraisers SET description = ${value}, updated_at = NOW() WHERE slug = ${slug} AND user_id = ${userId} RETURNING id`; break;
    case "coach_name": rows = await sql`UPDATE fundraisers SET coach_name = ${value}, updated_at = NOW() WHERE slug = ${slug} AND user_id = ${userId} RETURNING id`; break;
    case "coach_email": rows = await sql`UPDATE fundraisers SET coach_email = ${value}, updated_at = NOW() WHERE slug = ${slug} AND user_id = ${userId} RETURNING id`; break;
    case "coach_phone": rows = await sql`UPDATE fundraisers SET coach_phone = ${value}, updated_at = NOW() WHERE slug = ${slug} AND user_id = ${userId} RETURNING id`; break;
    default: return false;
  }
  return rows.length > 0;
}

export async function removeRosterEntry(entryId: string, fundraiserId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM fundraiser_roster WHERE id = ${entryId} AND fundraiser_id = ${fundraiserId} RETURNING id`;
  return rows.length > 0;
}

async function syncFundraiserRoster(fundraiserId: string, rosterJson: string) {
  try {
    const entries = JSON.parse(rosterJson);
    if (!Array.isArray(entries)) return;
    // Only delete non-invited entries (manually added ones)
    await sql`DELETE FROM fundraiser_roster WHERE fundraiser_id = ${fundraiserId} AND email IS NULL`;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e.playerName) continue;
      const id = genId();
      await sql`INSERT INTO fundraiser_roster (id, fundraiser_id, player_name, position, age_group, photo_url, bio, sort_order, invite_status)
        VALUES (${id}, ${fundraiserId}, ${e.playerName}, ${e.position || null}, ${e.ageGroup || null}, ${e.photoUrl || null}, ${e.bio || null}, ${i}, 'accepted')`;
    }
  } catch { /* ignore bad JSON */ }
}

export interface Donation {
  id: number; fundraiserId: string;
  donorName: string; donorEmail: string;
  amount: number; platformFee: number; netAmount: number;
  stripeSessionId?: string; stripePaymentIntentId?: string;
  donorMessage?: string; onBehalfOf?: string;
  playerId?: string;
  status: string; createdAt: string;
}

export async function getDonationsByFundraiserId(fundraiserId: string): Promise<Donation[]> {
  const rows = await sql`SELECT * FROM donations WHERE fundraiser_id = ${fundraiserId} AND status = 'completed' ORDER BY created_at DESC`;
  return rows.map((r) => ({
    id: r.id as number, fundraiserId: r.fundraiser_id as string,
    donorName: r.donor_name as string, donorEmail: r.donor_email as string,
    amount: r.amount as number, platformFee: r.platform_fee as number, netAmount: r.net_amount as number,
    stripeSessionId: r.stripe_session_id as string | undefined,
    stripePaymentIntentId: r.stripe_payment_intent_id as string | undefined,
    donorMessage: r.donor_message as string | undefined, onBehalfOf: r.on_behalf_of as string | undefined,
    status: r.status as string, createdAt: r.created_at as string,
  }));
}

export async function createDonation(data: { fundraiserId: string; donorName: string; donorEmail: string; amount: number; platformFee: number; netAmount: number; stripeSessionId: string; donorMessage?: string; onBehalfOf?: string; playerId?: string }) {
  await sql`INSERT INTO donations (fundraiser_id, donor_name, donor_email, amount, platform_fee, net_amount, stripe_session_id, donor_message, on_behalf_of, player_id, status)
    VALUES (${data.fundraiserId}, ${data.donorName}, ${data.donorEmail}, ${data.amount}, ${data.platformFee}, ${data.netAmount}, ${data.stripeSessionId}, ${data.donorMessage || null}, ${data.onBehalfOf || null}, ${data.playerId || null}, 'pending')`;
}

export async function completeDonation(stripeSessionId: string, paymentIntentId: string): Promise<{ fundraiserId: string; donorName: string; donorEmail: string; amount: number; donorMessage?: string; onBehalfOf?: string } | null> {
  const rows = await sql`UPDATE donations SET status='completed', stripe_payment_intent_id=${paymentIntentId} WHERE stripe_session_id=${stripeSessionId} AND status='pending' RETURNING fundraiser_id, donor_name, donor_email, amount, donor_message, on_behalf_of`;
  if (!rows[0]) return null;
  return {
    fundraiserId: rows[0].fundraiser_id as string,
    donorName: rows[0].donor_name as string,
    donorEmail: rows[0].donor_email as string,
    amount: rows[0].amount as number,
    donorMessage: rows[0].donor_message as string | undefined,
    onBehalfOf: rows[0].on_behalf_of as string | undefined,
  };
}

// ── Podcast Topics & Episodes ──────────────────────────────────

export interface PodcastTopic {
  id: string;
  podcastId: string;
  title: string;
  slug?: string;
  description?: string;
  previewImage?: string;
  pinned: boolean;
  sortOrder: number;
  episodes: PodcastEpisode[];
}

export interface PodcastEpisode {
  id: string;
  topicId: string;
  title?: string;
  slug?: string;
  description?: string;
  embedUrl?: string;
  embedHtml?: string;
  previewImage?: string;
  sortOrder: number;
}

export async function getPodcastTopics(podcastId: string): Promise<PodcastTopic[]> {
  const topicRows = await sql`SELECT * FROM podcast_topics WHERE podcast_id = ${podcastId} ORDER BY sort_order ASC, created_at ASC`;
  const topics: PodcastTopic[] = [];
  for (const t of topicRows) {
    const episodeRows = await sql`SELECT * FROM podcast_episodes WHERE topic_id = ${t.id} ORDER BY sort_order ASC, created_at ASC`;
    topics.push({
      id: t.id as string, podcastId: t.podcast_id as string, title: t.title as string,
      slug: t.slug as string | undefined, description: t.description as string | undefined,
      previewImage: t.preview_image as string | undefined, pinned: !!t.pinned, sortOrder: t.sort_order as number,
      episodes: episodeRows.map((e) => ({
        id: e.id as string, topicId: e.topic_id as string, title: e.title as string | undefined,
        description: e.description as string | undefined, embedUrl: e.embed_url as string | undefined,
        embedHtml: e.embed_html as string | undefined, previewImage: e.preview_image as string | undefined, slug: e.slug as string | undefined, sortOrder: e.sort_order as number,
      })),
    });
  }
  return topics;
}

export async function createPodcastTopic(podcastId: string, title: string, description?: string, previewImage?: string): Promise<string> {
  const id = genId();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await sql`INSERT INTO podcast_topics (id, podcast_id, title, slug, description, preview_image) VALUES (${id}, ${podcastId}, ${title}, ${slug}, ${description || null}, ${previewImage || null})`;
  return id;
}

export async function updatePodcastTopic(id: string, data: { title?: string; slug?: string; description?: string; previewImage?: string }): Promise<boolean> {
  const rows = await sql`UPDATE podcast_topics SET title = COALESCE(${data.title || null}, title), slug = COALESCE(${data.slug || null}, slug), description = ${data.description ?? null}, preview_image = ${data.previewImage ?? null}, updated_at = NOW() WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getPodcastTopicBySlug(podcastId: string, topicSlug: string): Promise<PodcastTopic | null> {
  let topicRows = await sql`SELECT * FROM podcast_topics WHERE podcast_id = ${podcastId} AND slug = ${topicSlug} LIMIT 1`;
  if (!topicRows[0]) topicRows = await sql`SELECT * FROM podcast_topics WHERE id = ${topicSlug} LIMIT 1`;
  if (!topicRows[0]) return null;
  const t = topicRows[0];
  const episodeRows = await sql`SELECT * FROM podcast_episodes WHERE topic_id = ${t.id} ORDER BY sort_order ASC, created_at ASC`;
  return {
    id: t.id as string, podcastId: t.podcast_id as string, title: t.title as string,
    slug: t.slug as string | undefined, description: t.description as string | undefined,
    previewImage: t.preview_image as string | undefined, pinned: !!t.pinned, sortOrder: t.sort_order as number,
    episodes: episodeRows.map((e) => ({
      id: e.id as string, topicId: e.topic_id as string, title: e.title as string | undefined,
      description: e.description as string | undefined, embedUrl: e.embed_url as string | undefined,
      embedHtml: e.embed_html as string | undefined, sortOrder: e.sort_order as number,
    })),
  };
}

export async function deletePodcastTopic(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM podcast_topics WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function createPodcastEpisode(topicId: string, data: { title?: string; description?: string; embedUrl?: string; embedHtml?: string }): Promise<string> {
  const id = genId();
  const slug = data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : id;
  await sql`INSERT INTO podcast_episodes (id, topic_id, title, slug, description, embed_url, embed_html) VALUES (${id}, ${topicId}, ${data.title || null}, ${slug}, ${data.description || null}, ${data.embedUrl || null}, ${data.embedHtml || null})`;
  return id;
}

export async function getPodcastEpisodeBySlug(episodeSlug: string): Promise<(PodcastEpisode & { podcastId: string; topicTitle: string }) | null> {
  let rows = await sql`SELECT e.*, t.podcast_id, t.title as topic_title FROM podcast_episodes e JOIN podcast_topics t ON t.id = e.topic_id WHERE e.slug = ${episodeSlug} LIMIT 1`;
  if (!rows[0]) rows = await sql`SELECT e.*, t.podcast_id, t.title as topic_title FROM podcast_episodes e JOIN podcast_topics t ON t.id = e.topic_id WHERE e.id = ${episodeSlug} LIMIT 1`;
  if (!rows[0]) return null;
  const e = rows[0];
  return {
    id: e.id as string, topicId: e.topic_id as string, title: e.title as string | undefined,
    slug: e.slug as string | undefined, description: e.description as string | undefined,
    embedUrl: e.embed_url as string | undefined, embedHtml: e.embed_html as string | undefined,
    previewImage: e.preview_image as string | undefined,
    sortOrder: e.sort_order as number, podcastId: e.podcast_id as string, topicTitle: e.topic_title as string,
  };
}

export async function updatePodcastEpisode(id: string, data: { title?: string; description?: string; embedUrl?: string; embedHtml?: string; slug?: string; previewImage?: string }): Promise<boolean> {
  const rows = await sql`UPDATE podcast_episodes SET title = ${data.title ?? null}, description = ${data.description ?? null}, slug = COALESCE(${data.slug || null}, slug), embed_url = COALESCE(${data.embedUrl || null}, embed_url), embed_html = COALESCE(${data.embedHtml || null}, embed_html), preview_image = ${data.previewImage ?? null} WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function deletePodcastEpisode(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM podcast_episodes WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

// ── Listing Events (for all listing types) ──────────────────────

export interface ListingEvent {
  id: string;
  listingType: string;
  listingId: string;
  title: string;
  slug?: string;
  description?: string;
  previewImage?: string;
  eventDate?: string;
  eventTime?: string;
  address?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  sortOrder: number;
  createdAt: string;
}

function mapListingEvent(r: Record<string, unknown>): ListingEvent {
  return {
    id: r.id as string, listingType: r.listing_type as string, listingId: r.listing_id as string,
    title: r.title as string, slug: r.slug as string | undefined,
    description: r.description as string | undefined, previewImage: r.preview_image as string | undefined,
    eventDate: r.event_date as string | undefined, eventTime: r.event_time as string | undefined,
    address: r.address as string | undefined, location: r.location as string | undefined,
    website: r.website as string | undefined, contactEmail: r.contact_email as string | undefined,
    sortOrder: r.sort_order as number, createdAt: r.created_at as string,
  };
}

export async function getListingEvents(listingType: string, listingId: string): Promise<ListingEvent[]> {
  const rows = await sql`SELECT * FROM listing_events WHERE listing_type = ${listingType} AND listing_id = ${listingId} ORDER BY sort_order ASC, created_at DESC`;
  return rows.map(mapListingEvent);
}

export async function getListingEventBySlug(listingType: string, listingId: string, eventSlug: string): Promise<ListingEvent | null> {
  let rows = await sql`SELECT * FROM listing_events WHERE listing_type = ${listingType} AND listing_id = ${listingId} AND slug = ${eventSlug} LIMIT 1`;
  if (!rows[0]) rows = await sql`SELECT * FROM listing_events WHERE id = ${eventSlug} LIMIT 1`;
  return rows[0] ? mapListingEvent(rows[0]) : null;
}

export async function createListingEvent(listingType: string, listingId: string, data: { title: string; description?: string; previewImage?: string; eventDate?: string; eventTime?: string; address?: string; location?: string; website?: string; contactEmail?: string }): Promise<string> {
  const id = genId();
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await sql`INSERT INTO listing_events (id, listing_type, listing_id, title, slug, description, preview_image, event_date, event_time, address, location, website, contact_email) VALUES (${id}, ${listingType}, ${listingId}, ${data.title}, ${slug}, ${data.description || null}, ${data.previewImage || null}, ${data.eventDate || null}, ${data.eventTime || null}, ${data.address || null}, ${data.location || null}, ${data.website || null}, ${data.contactEmail || null})`;
  return id;
}

export async function updateListingEvent(id: string, data: { title?: string; slug?: string; description?: string; previewImage?: string; eventDate?: string; eventTime?: string; address?: string; location?: string; website?: string; contactEmail?: string }): Promise<boolean> {
  const rows = await sql`UPDATE listing_events SET title = COALESCE(${data.title || null}, title), slug = COALESCE(${data.slug || null}, slug), description = ${data.description ?? null}, preview_image = ${data.previewImage ?? null}, event_date = ${data.eventDate ?? null}, event_time = ${data.eventTime ?? null}, address = ${data.address ?? null}, location = ${data.location ?? null}, website = ${data.website ?? null}, contact_email = ${data.contactEmail ?? null}, updated_at = NOW() WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function deleteListingEvent(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM listing_events WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
