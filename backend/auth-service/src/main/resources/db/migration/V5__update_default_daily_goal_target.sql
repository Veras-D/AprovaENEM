-- ==============================================================================
-- AprovaENEM — Auth Database Migration V5: Update Default Daily Goal Target to 5
-- Target: auth_db | PostgreSQL 16
-- Sets the default daily goal target questions from 10 to 5 to match the 5-question
-- diagnostic assessment and standard micro-learning pedagogical pace.
-- ==============================================================================

ALTER TABLE user_gamification_profiles
    ALTER COLUMN daily_goal_questions SET DEFAULT 5;

UPDATE user_gamification_profiles
SET daily_goal_questions = 5
WHERE daily_goal_questions = 10;
