-- V7: Add persistent current_league to user_gamification_profiles and backfill existing data
ALTER TABLE user_gamification_profiles
ADD COLUMN current_league VARCHAR(20) NOT NULL DEFAULT 'BRONZE';

CREATE INDEX idx_gamification_current_league ON user_gamification_profiles (current_league);

-- Backfill profiles based on their most recent weekly leaderboard tier
UPDATE user_gamification_profiles p
SET current_league = sub.league_tier
FROM (
    SELECT DISTINCT ON (user_id) user_id, league_tier
    FROM weekly_leaderboards
    ORDER BY user_id, year DESC, week_number DESC
) sub
WHERE p.user_id = sub.user_id;
