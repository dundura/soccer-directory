export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const LISTING_TYPE_TO_PATH: Record<string, string> = {
  club: "clubs",
  team: "teams",
  trainer: "trainers",
  recruiter: "college-recruiting",
  camp: "camps",
  showcase: "camps",
  tryout: "tryouts",
  specialevent: "special-events",
  tournament: "tournaments",
  futsal: "futsal",
  trip: "international-trips",
  guest: "guest-play",
  podcast: "podcasts",
  service: "services",
  blog: "blogs",
  youtube: "youtube-channels",
};

export function getListingPath(listingType: string, slug: string): string {
  const path = LISTING_TYPE_TO_PATH[listingType] || listingType;
  return `/${path}/${slug}`;
}
