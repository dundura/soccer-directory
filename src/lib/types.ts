export interface Club {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  level: string;
  ageGroups: string;
  gender: string;
  teamCount: number;
  description: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialMedia?: { facebook?: string; instagram?: string; twitter?: string };
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  clubId?: string;
  clubName?: string;
  city: string;
  state: string;
  level: string;
  ageGroup: string;
  gender: string;
  coach: string;
  lookingForPlayers: boolean;
  positionsNeeded?: string;
  season: string;
  description?: string;
  practiceSchedule?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Trainer {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
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
  phone?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Camp {
  id: string;
  slug: string;
  name: string;
  organizerName: string;
  city: string;
  state: string;
  campType: "Elite ID Camp" | "Recreational Camp" | "Position-Specific Clinic" | "College Showcase" | "Specialty Clinic" | "Day Camp";
  ageRange: string;
  dates: string;
  price: string;
  gender: string;
  description: string;
  registrationUrl?: string;
  email?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GuestOpportunity {
  id: string;
  slug: string;
  teamName: string;
  city: string;
  state: string;
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

export type ListingType = "club" | "team" | "trainer" | "camp" | "guest";
