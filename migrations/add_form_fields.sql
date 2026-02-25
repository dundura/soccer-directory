-- Migration: Add new form fields for listing improvements
-- Run this before deploying the updated listing form

-- Clubs (already has: phone, logo, social_media)
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS social_media TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Trainers (already has: phone)
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS social_media TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Camps
ALTER TABLE camps ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
ALTER TABLE camps ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE camps ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE camps ADD COLUMN IF NOT EXISTS social_media TEXT;
ALTER TABLE camps ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE camps ADD COLUMN IF NOT EXISTS location TEXT;

-- Guest Opportunities
ALTER TABLE guest_opportunities ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
ALTER TABLE guest_opportunities ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE guest_opportunities ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE guest_opportunities ADD COLUMN IF NOT EXISTS social_media TEXT;
ALTER TABLE guest_opportunities ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Tournaments
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS social_media TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Futsal Teams
ALTER TABLE futsal_teams ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
ALTER TABLE futsal_teams ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE futsal_teams ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE futsal_teams ADD COLUMN IF NOT EXISTS social_media TEXT;
ALTER TABLE futsal_teams ADD COLUMN IF NOT EXISTS image_url TEXT;
