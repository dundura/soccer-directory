require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS league TEXT`;
  console.log("Added league");
  await sql`ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS team_name TEXT`;
  console.log("Added team_name");
  await sql`ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS favorite_team TEXT`;
  console.log("Added favorite_team");
  await sql`ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS favorite_player TEXT`;
  console.log("Added favorite_player");
  await sql`ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS game_highlights TEXT`;
  console.log("Added game_highlights");
  await sql`ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS available_for_guest_play BOOLEAN NOT NULL DEFAULT false`;
  console.log("Added available_for_guest_play");
  // updated_at may already exist
  try {
    await sql`ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`;
    console.log("Added updated_at");
  } catch (e) { console.log("updated_at already exists"); }
  console.log("Done.");
}

run();
