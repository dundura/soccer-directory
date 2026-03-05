const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Add open_positions column to clubs table
  await sql`ALTER TABLE clubs ADD COLUMN IF NOT EXISTS open_positions TEXT`;
  console.log("Added open_positions column to clubs table");
}

main().catch(console.error);
