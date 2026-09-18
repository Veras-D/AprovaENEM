-- ==============================================================================
-- AprovaENEM — Auth Database Specialized Performance Indexes V2
-- Target: auth_db | PostgreSQL 16
-- ==============================================================================

-- 1. Partial Index for Email Verification Token Lookup
CREATE INDEX IF NOT EXISTS idx_users_email_verification 
ON users(email_verification_token) 
WHERE email_verification_token IS NOT NULL;

-- 2. Partial Index for Password Reset Token Lookup
CREATE INDEX IF NOT EXISTS idx_users_password_reset 
ON users(password_reset_token) 
WHERE password_reset_token IS NOT NULL;

-- 3. Transactional Outbox Worker Polling Index (SKIP LOCKED optimization)
CREATE INDEX IF NOT EXISTS idx_outbox_pending 
ON outbox_events(status, created_at) 
WHERE status = 'PENDING';

-- 4. Anonymous Session Token Lookup
CREATE INDEX IF NOT EXISTS idx_anonymous_session_uuid 
ON anonymous_sessions(session_uuid);

-- 5. Socratic AI Chat Threads Compound Lookup (Drawer rendering)
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_question 
ON tutor_chat_threads(user_id, question_id, status);

-- 6. Chat Thread Daily Unlock Timestamp Lookup
CREATE INDEX IF NOT EXISTS idx_chat_threads_unlocked_at 
ON tutor_chat_threads(unlocked_at);

-- 7. Chat Messages Sequence Index for Chronological Bubbles
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_created 
ON tutor_chat_messages(thread_id, created_at ASC);

-- 8. Gamification 19:00 BRT Push Streak Reminder Optimization
CREATE INDEX IF NOT EXISTS idx_gamification_streak_reminder 
ON user_gamification_profiles (streak_days, opt_in_reminders) 
WHERE opt_in_reminders = TRUE;

-- 9. Weekly Leaderboard League Tier Standings Index
CREATE INDEX IF NOT EXISTS idx_weekly_leaderboards_rank 
ON weekly_leaderboards(week_number, year, league_tier, weekly_xp DESC);
