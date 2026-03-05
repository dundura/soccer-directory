import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  // Add invite columns to fundraiser_roster
  await sql`ALTER TABLE fundraiser_roster ADD COLUMN IF NOT EXISTS email TEXT`;
  await sql`ALTER TABLE fundraiser_roster ADD COLUMN IF NOT EXISTS invite_token TEXT`;
  await sql`ALTER TABLE fundraiser_roster ADD COLUMN IF NOT EXISTS invite_status TEXT DEFAULT 'pending'`;
  await sql`ALTER TABLE fundraiser_roster ADD COLUMN IF NOT EXISTS user_id TEXT`;
  console.log("Added invite columns to fundraiser_roster");

  // Add player_id to donations
  await sql`ALTER TABLE donations ADD COLUMN IF NOT EXISTS player_id TEXT`;
  console.log("Added player_id to donations");

  // Mark any existing roster entries as accepted (they were manually added)
  await sql`UPDATE fundraiser_roster SET invite_status = 'accepted' WHERE invite_status IS NULL OR invite_status = 'pending'`;
  console.log("Marked existing roster entries as accepted");

  console.log("Migration complete!");
}

migrate().catch(console.error);
