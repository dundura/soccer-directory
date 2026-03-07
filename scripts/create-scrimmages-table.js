const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS scrimmages (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      team_name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      country TEXT DEFAULT 'United States',
      level TEXT NOT NULL,
      age_group TEXT NOT NULL,
      gender TEXT NOT NULL,
      availability TEXT NOT NULL DEFAULT 'Looking for Scrimmage',
      contact_email TEXT NOT NULL,
      description TEXT,
      phone TEXT,
      social_media JSONB,
      logo TEXT,
      image_url TEXT,
      team_photo TEXT,
      image_position INT DEFAULT 50,
      hero_image_position INT DEFAULT 50,
      photos JSONB,
      video_url TEXT,
      tagline TEXT,
      sponsors JSONB,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      user_id TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'approved',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  console.log("scrimmages table created successfully");
}

main().catch(console.error);
