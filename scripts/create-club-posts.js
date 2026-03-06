const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql`CREATE TABLE IF NOT EXISTS listing_posts (
    id TEXT PRIMARY KEY,
    listing_type TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  console.log("listing_posts table created");

  await sql`CREATE INDEX IF NOT EXISTS idx_listing_posts_lookup ON listing_posts(listing_type, listing_id, created_at DESC)`;
  console.log("index created");

  console.log("Done!");
}

main().catch(console.error);
