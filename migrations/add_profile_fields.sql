-- Migration: Add profile fields for TeamPlayr-style detail pages

-- Clubs (already has: address)
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS team_photo TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS photos TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS practice_schedule TEXT;

-- Teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_photo TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS photos TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS practice_schedule TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS address TEXT;

-- Trainers
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS team_photo TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS photos TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS practice_schedule TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS address TEXT;

-- Camps
ALTER TABLE camps ADD COLUMN IF NOT EXISTS team_photo TEXT;
ALTER TABLE camps ADD COLUMN IF NOT EXISTS photos TEXT;
ALTER TABLE camps ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Guest Opportunities
ALTER TABLE guest_opportunities ADD COLUMN IF NOT EXISTS team_photo TEXT;
ALTER TABLE guest_opportunities ADD COLUMN IF NOT EXISTS photos TEXT;
ALTER TABLE guest_opportunities ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Tournaments
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS team_photo TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS photos TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Futsal Teams
ALTER TABLE futsal_teams ADD COLUMN IF NOT EXISTS team_photo TEXT;
ALTER TABLE futsal_teams ADD COLUMN IF NOT EXISTS photos TEXT;
ALTER TABLE futsal_teams ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE futsal_teams ADD COLUMN IF NOT EXISTS practice_schedule TEXT;
ALTER TABLE futsal_teams ADD COLUMN IF NOT EXISTS address TEXT;
