const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  await sql`CREATE TABLE IF NOT EXISTS fundraisers (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    user_id TEXT,
    club_id TEXT,
    team_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    goal INTEGER,
    coach_name TEXT,
    coach_email TEXT,
    coach_phone TEXT,
    website_url TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    hero_image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("Created fundraisers table");

  await sql`CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    fundraiser_id TEXT NOT NULL,
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    amount INTEGER NOT NULL,
    platform_fee INTEGER,
    net_amount INTEGER,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    donor_message TEXT,
    on_behalf_of TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("Created donations table");

  await sql`ALTER TABLE clubs ADD COLUMN IF NOT EXISTS fundraiser_slug TEXT`;
  await sql`ALTER TABLE teams ADD COLUMN IF NOT EXISTS fundraiser_slug TEXT`;
  console.log("Added fundraiser_slug to clubs and teams");
}

main().catch(console.error);
