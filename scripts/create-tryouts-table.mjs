import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

await sql`CREATE TABLE IF NOT EXISTS tryouts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  club_name TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  tryout_type TEXT NOT NULL,
  age_group TEXT NOT NULL,
  gender TEXT NOT NULL,
  dates TEXT NOT NULL,
  time TEXT,
  location TEXT,
  cost TEXT,
  description TEXT NOT NULL DEFAULT '',
  registration_url TEXT,
  email TEXT,
  phone TEXT,
  is_past BOOLEAN NOT NULL DEFAULT FALSE,
  logo TEXT,
  image_url TEXT,
  team_photo TEXT,
  social_media JSONB DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  video_url TEXT,
  video_url2 TEXT,
  video_url3 TEXT,
  image_position INTEGER DEFAULT 50,
  hero_image_position INTEGER DEFAULT 50,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;

console.log('tryouts table created successfully');
