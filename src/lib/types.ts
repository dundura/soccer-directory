export interface MediaLink {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface Sponsor {
  image: string;
  title: string;
  description: string;
  link: string;
  ctaText: string;
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
  tagline?: string;
  sponsors?: Sponsor[];
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
  announcementCta?: string;
  announcementCtaUrl?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementCta2?: string;
  announcementCtaUrl2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  announcementCta3?: string;
  announcementCtaUrl3?: string;
  openPositions?: { title: string; description?: string; applyUrl?: string }[];
  scholarshipsAvailable?: string;
  guestPlayersWelcomed?: string;
  fundraiserSlug?: string;
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
  announcementCta?: string;
  announcementCtaUrl?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementCta2?: string;
  announcementCtaUrl2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  announcementCta3?: string;
  announcementCtaUrl3?: string;
  scholarshipsAvailable?: string;
  guestPlayersWelcomed?: string;
  fundraiserSlug?: string;
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

export interface Recruiter extends ProfileFields {
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
  announcementHeading?: string;
  announcementText?: string;
  announcementImage?: string;
  announcementCta?: string;
  announcementCtaUrl?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementCta2?: string;
  announcementCtaUrl2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  announcementCta3?: string;
  announcementCtaUrl3?: string;
}

export interface Tryout extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  organizerName: string;
  clubName?: string;
  city: string;
  state: string;
  country?: string;
  tryoutType: string;
  ageGroup: string;
  gender: string;
  dates: string;
  time?: string;
  location?: string;
  cost?: string;
  description: string;
  registrationUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  isPast: boolean;
  featured: boolean;
  announcementHeading?: string;
  announcementText?: string;
  announcementImage?: string;
  announcementCta?: string;
  announcementCtaUrl?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementCta2?: string;
  announcementCtaUrl2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  announcementCta3?: string;
  announcementCtaUrl3?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialEvent extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  organizerName: string;
  clubName?: string;
  city: string;
  state: string;
  country?: string;
  eventType: string;
  ageGroup: string;
  gender: string;
  dates: string;
  time?: string;
  location?: string;
  cost?: string;
  description: string;
  registrationUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  isPast: boolean;
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
  aboutAuthor?: string;
  tagline?: string;
  sponsors?: Sponsor[];
  featured: boolean;
  createdAt: string;
}

export interface GameHighlight {
  title: string;
  url: string;
}

export interface HighlightVideo {
  url: string;
  title: string;
  showOnHighlights: boolean;
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
  league?: string;
  teamName?: string;
  favoriteTeam?: string;
  favoritePlayer?: string;
  gameHighlights?: GameHighlight[];
  highlightVideos?: HighlightVideo[];
  cvUrl?: string;
  availableForGuestPlay?: boolean;
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

export interface FeaturedVideo {
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
  hostHeading?: string;
  hostImage?: string;
  hostBio?: string;
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
  website?: string;
  email?: string;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface InstagramPage extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  category: string;
  pageUrl: string;
  followerCount?: string;
  privacy: string;
  city: string;
  state: string;
  country?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  tagline?: string;
  videoUrl2?: string;
  videoUrl3?: string;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TikTokPage extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  category: string;
  pageUrl: string;
  followerCount?: string;
  privacy: string;
  city: string;
  state: string;
  country?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  tagline?: string;
  videoUrl2?: string;
  videoUrl3?: string;
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
  announcementCta?: string;
  announcementCtaUrl?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementCta2?: string;
  announcementCtaUrl2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  announcementCta3?: string;
  announcementCtaUrl3?: string;
  aboutAuthor?: string;
  featured: boolean;
  status?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TrainingApp extends ProfileFields {
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
  announcementCta?: string;
  announcementCtaUrl?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementCta2?: string;
  announcementCtaUrl2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  announcementCta3?: string;
  announcementCtaUrl3?: string;
  aboutAuthor?: string;
  featured: boolean;
  status?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FeaturedPost {
  title: string;
  description?: string;
  url: string;
}

export interface Blog extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  authorName: string;
  category: string;
  city: string;
  state: string;
  country?: string;
  description?: string;
  website?: string;
  rssFeedUrl?: string;
  subscribeUrl?: string;
  email?: string;
  featuredPosts?: FeaturedPost[];
  videoUrl2?: string;
  videoUrl3?: string;
  authorHeading?: string;
  authorImage?: string;
  authorBio?: string;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface YoutubeChannel extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  creatorName: string;
  category: string;
  city: string;
  state: string;
  country?: string;
  description?: string;
  website?: string;
  channelUrl?: string;
  subscribeUrl?: string;
  email?: string;
  featuredVideos?: FeaturedVideo[];
  videoUrl2?: string;
  videoUrl3?: string;
  creatorHeading?: string;
  creatorImage?: string;
  creatorBio?: string;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Scrimmage extends ProfileFields {
  id: string;
  slug: string;
  teamName: string;
  city: string;
  state: string;
  country?: string;
  level: string;
  ageGroup: string;
  gender: string;
  availability: string;
  contactEmail: string;
  description?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SoccerBook extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  author: string;
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
  announcementCta?: string;
  announcementCtaUrl?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementCta2?: string;
  announcementCtaUrl2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  announcementCta3?: string;
  announcementCtaUrl3?: string;
  aboutAuthor?: string;
  featured: boolean;
  status?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PhotoVideoService extends ProfileFields {
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
  announcementCta?: string;
  announcementCtaUrl?: string;
  announcementHeading2?: string;
  announcementText2?: string;
  announcementImage2?: string;
  announcementCta2?: string;
  announcementCtaUrl2?: string;
  announcementHeading3?: string;
  announcementText3?: string;
  announcementImage3?: string;
  announcementCta3?: string;
  announcementCtaUrl3?: string;
  aboutAuthor?: string;
  featured: boolean;
  status?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ListingType = "club" | "team" | "trainer" | "camp" | "guest" | "tournament" | "futsal" | "trip" | "marketplace" | "equipment" | "books" | "showcase" | "player" | "podcast" | "fbgroup" | "instagrampage" | "tiktokpage" | "service" | "tryout" | "trainingapp" | "ebook" | "giveaway" | "blog" | "youtube" | "specialevent" | "recruiter" | "fundraiser" | "scrimmage" | "soccerbook" | "photovideo";

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
  isInvited?: boolean;
}

export interface ReviewInvitation {
  id: string;
  listingType: string;
  listingId: string;
  email: string;
  name?: string;
  token: string;
  status: string;
  invitedBy: string;
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
