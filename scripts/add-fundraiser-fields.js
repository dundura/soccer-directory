const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS tags TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS photos TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS video_url TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS team_photo TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_heading TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_text TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_image TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_cta TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_cta_url TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_heading_2 TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_text_2 TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_image_2 TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_cta_2 TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_cta_url_2 TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_heading_3 TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_text_3 TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_image_3 TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_cta_3 TEXT`;
  await sql`ALTER TABLE fundraisers ADD COLUMN IF NOT EXISTS announcement_cta_url_3 TEXT`;
  console.log("Added new columns to fundraisers");

  await sql`CREATE TABLE IF NOT EXISTS fundraiser_roster (
    id TEXT PRIMARY KEY,
    fundraiser_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    position TEXT,
    age_group TEXT,
    photo_url TEXT,
    bio TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("Created fundraiser_roster table");

  await sql`CREATE INDEX IF NOT EXISTS idx_fundraiser_roster_fid ON fundraiser_roster(fundraiser_id)`;
  console.log("Done!");
}

main().catch(console.error);
