-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clubs
CREATE TABLE IF NOT EXISTS clubs (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  level TEXT NOT NULL,
  age_groups TEXT NOT NULL,
  gender TEXT NOT NULL,
  team_count INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  logo TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  social_media TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  club_id TEXT,
  club_name TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  level TEXT NOT NULL,
  age_group TEXT NOT NULL,
  gender TEXT NOT NULL,
  coach TEXT NOT NULL,
  looking_for_players BOOLEAN NOT NULL DEFAULT FALSE,
  positions_needed TEXT,
  season TEXT NOT NULL,
  description TEXT,
  practice_schedule TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trainers
CREATE TABLE IF NOT EXISTS trainers (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  specialty TEXT NOT NULL,
  experience TEXT NOT NULL,
  credentials TEXT NOT NULL,
  price_range TEXT NOT NULL,
  service_area TEXT NOT NULL,
  description TEXT,
  rating NUMERIC NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  website TEXT,
  email TEXT,
  phone TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Camps
CREATE TABLE IF NOT EXISTS camps (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  camp_type TEXT NOT NULL,
  age_range TEXT NOT NULL,
  dates TEXT NOT NULL,
  price TEXT NOT NULL,
  gender TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  registration_url TEXT,
  email TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guest Opportunities
CREATE TABLE IF NOT EXISTS guest_opportunities (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  team_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  level TEXT NOT NULL,
  age_group TEXT NOT NULL,
  gender TEXT NOT NULL,
  dates TEXT NOT NULL,
  tournament TEXT NOT NULL,
  positions_needed TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  description TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  dates TEXT NOT NULL,
  age_groups TEXT NOT NULL,
  gender TEXT NOT NULL,
  level TEXT NOT NULL,
  entry_fee TEXT NOT NULL,
  format TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  registration_url TEXT,
  email TEXT,
  region TEXT NOT NULL DEFAULT 'US',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Futsal Teams
CREATE TABLE IF NOT EXISTS futsal_teams (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  club_name TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  level TEXT NOT NULL,
  age_group TEXT NOT NULL,
  gender TEXT NOT NULL,
  coach TEXT NOT NULL,
  looking_for_players BOOLEAN NOT NULL DEFAULT FALSE,
  positions_needed TEXT,
  season TEXT NOT NULL,
  description TEXT,
  practice_schedule TEXT,
  format TEXT NOT NULL DEFAULT '5v5',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  read_time TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews (for individual listings)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  listing_type TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_role TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  status TEXT DEFAULT 'pending',
  approval_token TEXT,
  invitation_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_type, listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Review Invitations
CREATE TABLE IF NOT EXISTS review_invitations (
  id TEXT PRIMARY KEY,
  listing_type TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  invited_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_review_invitations_token ON review_invitations(token);
CREATE INDEX IF NOT EXISTS idx_review_invitations_listing ON review_invitations(listing_type, listing_id);

-- Club Reviews
CREATE TABLE IF NOT EXISTS club_reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  club_id TEXT,
  club_name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  rating_price INTEGER CHECK (rating_price >= 1 AND rating_price <= 5),
  rating_quality INTEGER CHECK (rating_quality >= 1 AND rating_quality <= 5),
  rating_coaching INTEGER CHECK (rating_coaching >= 1 AND rating_coaching <= 5),
  overall_rating NUMERIC(2,1),
  reviewer_name TEXT NOT NULL,
  reviewer_role TEXT,
  review_text TEXT,
  status TEXT DEFAULT 'pending',
  approval_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_club_reviews_status ON club_reviews(status);
CREATE INDEX IF NOT EXISTS idx_club_reviews_state ON club_reviews(state);

-- Club Review Votes
CREATE TABLE IF NOT EXISTS club_review_votes (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL REFERENCES club_reviews(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Club Review Comments
CREATE TABLE IF NOT EXISTS club_review_comments (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL REFERENCES club_reviews(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
