const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  await sql`CREATE TABLE IF NOT EXISTS review_invitations (
    id TEXT PRIMARY KEY,
    listing_type TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    invited_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("Created review_invitations table");

  await sql`CREATE INDEX IF NOT EXISTS idx_review_invitations_token ON review_invitations(token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_review_invitations_listing ON review_invitations(listing_type, listing_id)`;
  console.log("Created indexes");

  // Add invitation_token column to reviews table if not exists
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS invitation_token TEXT`;
  console.log("Added invitation_token column to reviews");

  console.log("Done!");
}

main().catch(console.error);
