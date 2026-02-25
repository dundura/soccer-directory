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
}

export interface Club extends ProfileFields {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  country?: string;
  level: string;
  ageGroups: string;
  gender: string;
  teamCount: number;
  description: string;
  website?: string;
  email?: string;
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

export type ListingType = "club" | "team" | "trainer" | "camp" | "guest" | "tournament" | "futsal";
