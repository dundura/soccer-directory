import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`
CREATE TABLE IF NOT EXISTS recruiters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'United States',
  specialty TEXT NOT NULL,
  experience TEXT NOT NULL,
  credentials TEXT NOT NULL,
  price_range TEXT NOT NULL,
  service_area TEXT NOT NULL,
  description TEXT,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  website TEXT,
  email TEXT,
  phone TEXT,
  social_media JSONB DEFAULT '{}',
  logo TEXT,
  image_url TEXT,
  team_photo TEXT,
  image_position INTEGER DEFAULT 50,
  hero_image_position INTEGER DEFAULT 50,
  photos JSONB DEFAULT '[]',
  video_url TEXT,
  tagline TEXT,
  practice_schedule JSONB DEFAULT '[]',
  address TEXT,
  featured BOOLEAN DEFAULT false,
  user_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)`;

console.log("recruiters table created");
