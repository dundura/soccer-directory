export interface MediaLink {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface ProfileFields {
  teamPhoto?: string;
  photos?: string[];
  videoUrl?: string;
  practiceSchedule?: string[];
  address?: string;
  imageUrl?: string;
  logo?: string;
  socialMedia?: { facebook?: string; instagram?: string; youtube?: string };
  phone?: string;
  mediaLinks?: MediaLink[];
  imagePosition?: number;
  heroImagePosition?: number;
}

export interface Club extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  country?: string;
  level: string;
  league?: string;
  leagueUrl?: string;
  ageGroups: string;
  gender: string;
  teamCount: number;
  description: string;
  website?: string;
  email?: string;
  blogUrl?: string;
  announcementHeading?: string;
  announcementText?: string;
  announcementImage?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamEvent {
  name: string;
  date: string;
  location: string;
  type: string;
}

export interface Team extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  clubId?: string;
  clubName?: string;
  city: string;
  state: string;
  country?: string;
  level: string;
  ageGroup: string;
  gender: string;
  coach: string;
  lookingForPlayers: boolean;
  positionsNeeded?: string;
  season: string;
  description?: string;
  events?: TeamEvent[];
  annualTournaments?: string[];
  announcementHeading?: string;
  announcementText?: string;
  announcementImage?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Trainer extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  country?: string;
  specialty: string;
  experience: string;
  credentials: string;
  priceRange: string;
  serviceArea: string;
  description?: string;
  rating: number;
  reviewCount: number;
  website?: string;
  email?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Camp extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  organizerName: string;
  city: string;
  state: string;
  country?: string;
  campType: "Elite ID Camp" | "Recreational Camp" | "Position-Specific Clinic" | "College Showcase" | "Specialty Clinic" | "Day Camp";
  ageRange: string;
  dates: string;
  price: string;
  gender: string;
  location?: string;
  description: string;
  registrationUrl?: string;
  email?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GuestOpportunity extends ProfileFields {
  id: string;
  slug: string;
  teamName: string;
  city: string;
  state: string;
  country?: string;
  level: string;
  ageGroup: string;
  gender: string;
  dates: string;
  tournament: string;
  positionsNeeded: string;
  contactEmail: string;
  description?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  featured: boolean;
  coverImage?: string;
}

export interface Tournament extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  organizer: string;
  city: string;
  state: string;
  country?: string;
  dates: string;
  ageGroups: string;
  gender: string;
  level: string;
  entryFee: string;
  format: string;
  description: string;
  registrationUrl?: string;
  email?: string;
  region: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FutsalTeam extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  clubName?: string;
  city: string;
  state: string;
  country?: string;
  level: string;
  ageGroup: string;
  gender: string;
  coach: string;
  lookingForPlayers: boolean;
  positionsNeeded?: string;
  season: string;
  description?: string;
  format: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InternationalTrip extends ProfileFields {
  id: string;
  slug: string;
  tripName: string;
  organizer: string;
  destination: string;
  city: string;
  state: string;
  country?: string;
  dates: string;
  ageGroup: string;
  gender: string;
  level: string;
  price?: string;
  spotsAvailable?: string;
  contactEmail: string;
  description?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: string;
  condition: string;
  city: string;
  state: string;
  country?: string;
  contactEmail: string;
  phone?: string;
  imageUrl?: string;
  photos?: string[];
  featured: boolean;
  createdAt: string;
}

export interface PlayerProfile extends ProfileFields {
  id: string;
  slug: string;
  playerName: string;
  position: string;
  secondaryPosition?: string;
  birthYear: string;
  height?: string;
  preferredFoot?: string;
  currentClub?: string;
  city: string;
  state: string;
  country?: string;
  level: string;
  gender: string;
  gpa?: string;
  description?: string;
  lookingFor?: string;
  contactEmail: string;
  videoUrl2?: string;
  videoUrl3?: string;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type GuestPostCategory = "Looking for Players" | "Looking for Team" | "Tournament Guest Play" | "Showcase Opportunity" | "General";

export interface GuestPost {
  id: string;
  title: string;
  slug: string;
  category: GuestPostCategory;
  body: string;
  userId: string;
  userName: string;
  viewCount: number;
  isPinned: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuestPostComment {
  id: string;
  postId: string;
  body: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopEpisode {
  title: string;
  description?: string;
  url: string;
}

export interface Podcast extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  hostName: string;
  category: string;
  city: string;
  state: string;
  country?: string;
  description?: string;
  website?: string;
  rssFeedUrl?: string;
  followUrl?: string;
  email?: string;
  topEpisodes?: TopEpisode[];
  videoUrl2?: string;
  videoUrl3?: string;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FacebookGroup extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  adminName: string;
  category: string;
  groupUrl: string;
  memberCount?: string;
  privacy: string;
  city: string;
  state: string;
  country?: string;
  description?: string;
  email?: string;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Service extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  providerName: string;
  category: string;
  city: string;
  state: string;
  country?: string;
  price?: string;
  description?: string;
  website?: string;
  email?: string;
  announcementHeading?: string;
  announcementText?: string;
  announcementImage?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  featured: boolean;
  status?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ListingType = "club" | "team" | "trainer" | "camp" | "guest" | "tournament" | "futsal" | "trip" | "marketplace" | "equipment" | "books" | "showcase" | "player" | "podcast" | "fbgroup" | "service";

// ── Reviews ─────────────────────────────────────────────────
export type ReviewerRole = "Parent" | "Player" | "Coach" | "Other";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  listingType: string;
  listingId: string;
  reviewerName: string;
  reviewerRole: ReviewerRole;
  rating: number;
  reviewText: string;
  status: ReviewStatus;
  createdAt: string;
}

// ── Forum ───────────────────────────────────────────────────
export type ForumCategory = "Questions" | "Club Feedback" | "League Feedback" | "Training" | "College Recruiting" | "Recommendation" | "General";

export interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  category: ForumCategory;
  body: string;
  userId: string;
  userName: string;
  viewCount: number;
  isPinned: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumComment {
  id: string;
  topicId: string;
  body: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}
