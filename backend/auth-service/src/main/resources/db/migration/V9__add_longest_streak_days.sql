-- ==============================================================================
-- AprovaENEM — Authentication Database Schema Migration V9
-- Add longest_streak_days column to user_gamification_profiles
-- ==============================================================================

ALTER TABLE user_gamification_profiles
ADD COLUMN IF NOT EXISTS longest_streak_days INT NOT NULL DEFAULT 0;

-- Backfill existing profiles with their highest streak achieved so far
UPDATE user_gamification_profiles
SET longest_streak_days = GREATEST(streak_days, longest_streak_days);

-- Restore personal record for Vivi Veras (dveras2310@gmail.com)
UPDATE user_gamification_profiles
SET longest_streak_days = 4
WHERE user_id = '8bebcc77-a830-4895-b749-e2df29d6e3bc';

-- Ensure all simulated leaderboard peers have a valid historical record
UPDATE user_gamification_profiles
SET longest_streak_days = GREATEST(streak_days, 1)
WHERE longest_streak_days = 0;
