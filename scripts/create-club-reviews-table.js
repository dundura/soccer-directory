const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  await sql`CREATE TABLE IF NOT EXISTS club_reviews (
    id TEXT PRIMARY KEY,
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
  )`;
  console.log("Created club_reviews table");

  await sql`CREATE INDEX IF NOT EXISTS idx_club_reviews_status ON club_reviews(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_club_reviews_state ON club_reviews(state)`;
  console.log("Created indexes");
  console.log("Done!");
}

main().catch(console.error);
