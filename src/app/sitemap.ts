import type { MetadataRoute } from "next";
import {
  getClubSlugs, getTeamSlugs, getTrainerSlugs, getConsultantSlugs,
  getRecruiterSlugs, getCampSlugs, getTryoutSlugs, getSpecialEventSlugs,
  getGuestSlugs, getPlayerProfileSlugs, getPodcastSlugs, getYoutubeChannelSlugs,
  getFacebookGroupSlugs, getInstagramPageSlugs, getTikTokPageSlugs, getTripSlugs,
  getTournamentSlugs, getFutsalTeamSlugs, getScrimmageSlugs, getBlogPostSlugs,
  getServiceSlugs, getSoccerBookSlugs, getPhotoVideoServiceSlugs,
  getTrainingAppSlugs, getBlogSlugs, getEbookSlugs, getGiveawaySlugs,
} from "@/lib/db";

const BASE = "https://www.soccer-near-me.com";

async function slugs(fn: () => Promise<string[]>): Promise<string[]> {
  try { return await fn(); } catch { return []; }
}

function listing(path: string, s: string[]): MetadataRoute.Sitemap {
  return s.map((slug) => ({
    url: `${BASE}/${path}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  ...[
    "clubs", "teams", "futsal", "camps", "special-events", "scrimmages",
    "tryouts", "guest-play", "guest-play/posts", "players", "international-trips",
    "tournaments", "trainers", "consultants", "college-recruiting", "training-apps",
    "books-and-authors", "photo-video-services", "services", "rankings",
    "blog", "blogs", "podcasts", "youtube-channels", "facebook-groups",
    "instagram-pages", "tiktok-pages", "forum", "fundraiser", "club-reviews",
    "ebooks", "giveaways", "shop", "why-list", "contact", "privacy", "terms", "faq", "free",
  ].map((path) => ({
    url: `${BASE}/${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  })),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    clubSlugs, teamSlugs, trainerSlugs, consultantSlugs,
    recruiterSlugs, campSlugs, tryoutSlugs, specialEventSlugs,
    guestSlugs, playerSlugs, podcastSlugs, youtubeSlugs,
    facebookSlugs, instagramSlugs, tiktokSlugs, tripSlugs,
    tournamentSlugs, futsalSlugs, scrimmageSlugs, blogPostSlugs,
    serviceSlugs, bookSlugs, photoVideoSlugs,
    trainingAppSlugs, blogSlugs, ebookSlugs, giveawaySlugs,
  ] = await Promise.all([
    slugs(getClubSlugs), slugs(getTeamSlugs), slugs(getTrainerSlugs), slugs(getConsultantSlugs),
    slugs(getRecruiterSlugs), slugs(getCampSlugs), slugs(getTryoutSlugs), slugs(getSpecialEventSlugs),
    slugs(getGuestSlugs), slugs(getPlayerProfileSlugs), slugs(getPodcastSlugs), slugs(getYoutubeChannelSlugs),
    slugs(getFacebookGroupSlugs), slugs(getInstagramPageSlugs), slugs(getTikTokPageSlugs), slugs(getTripSlugs),
    slugs(getTournamentSlugs), slugs(getFutsalTeamSlugs), slugs(getScrimmageSlugs), slugs(getBlogPostSlugs),
    slugs(getServiceSlugs), slugs(getSoccerBookSlugs), slugs(getPhotoVideoServiceSlugs),
    slugs(getTrainingAppSlugs), slugs(getBlogSlugs), slugs(getEbookSlugs), slugs(getGiveawaySlugs),
  ]);

  return [
    ...STATIC_PAGES,
    ...listing("clubs", clubSlugs),
    ...listing("teams", teamSlugs),
    ...listing("trainers", trainerSlugs),
    ...listing("consultants", consultantSlugs),
    ...listing("college-recruiting", recruiterSlugs),
    ...listing("camps", campSlugs),
    ...listing("tryouts", tryoutSlugs),
    ...listing("special-events", specialEventSlugs),
    ...listing("guest-play", guestSlugs),
    ...listing("players", playerSlugs),
    ...listing("podcasts", podcastSlugs),
    ...listing("youtube-channels", youtubeSlugs),
    ...listing("facebook-groups", facebookSlugs),
    ...listing("instagram-pages", instagramSlugs),
    ...listing("tiktok-pages", tiktokSlugs),
    ...listing("international-trips", tripSlugs),
    ...listing("tournaments", tournamentSlugs),
    ...listing("futsal", futsalSlugs),
    ...listing("scrimmages", scrimmageSlugs),
    ...listing("blog", blogPostSlugs),
    ...listing("services", serviceSlugs),
    ...listing("books-and-authors", bookSlugs),
    ...listing("photo-video-services", photoVideoSlugs),
    ...listing("training-apps", trainingAppSlugs),
    ...listing("blogs", blogSlugs),
    ...listing("ebooks", ebookSlugs),
    ...listing("giveaways", giveawaySlugs),
  ];
}
