-- ==============================================================================
-- AprovaENEM — Auth & Gamification Database Schema Migration V1
-- Target: auth_db | PostgreSQL 16
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    school_type VARCHAR(50) NOT NULL DEFAULT 'PUBLIC_SCHOOL', -- 'PUBLIC_SCHOOL', 'PRIVATE_SCHOOL', 'COMMUNITY_PREP', 'OTHER'
    target_degree VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_STUDENT',         -- 'ROLE_STUDENT', 'ROLE_PREMIUM_STUDENT', 'ROLE_ADMIN'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Transactional Outbox Pattern Table (Ensures Dual-Write Consistency to RabbitMQ)
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(100) NOT NULL,     -- 'USER', 'GAMIFICATION_PROFILE'
    aggregate_id UUID NOT NULL,                -- Logical entity ID (e.g. users.id)
    event_type VARCHAR(100) NOT NULL,          -- 'UserRegisteredEvent', 'EmailVerificationRequestedEvent'
    payload JSONB NOT NULL,                    -- Event payload serialized as JSON
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PUBLISHED', 'FAILED'
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Anonymous Session Linkage
CREATE TABLE anonymous_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_uuid VARCHAR(64) NOT NULL UNIQUE,
    claimed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Gamification Profiles (Level, XP, Daily Goals & Streaks)
CREATE TABLE user_gamification_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_level INT NOT NULL DEFAULT 1,
    current_xp INT NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 0,
    streak_freeze_available INT NOT NULL DEFAULT 1, -- 1 emergency streak freeze per month
    last_activity_date DATE,
    daily_goal_questions INT NOT NULL DEFAULT 10,
    daily_questions_completed INT NOT NULL DEFAULT 0,
    daily_goal_reached_at TIMESTAMP WITH TIME ZONE,
    opt_in_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Weekly Leaderboard Tiers (Resets every Sunday at 23:59 BRT)
CREATE TABLE weekly_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    year INT NOT NULL,
    league_tier VARCHAR(20) NOT NULL DEFAULT 'BRONZE', -- BRONZE, SILVER, GOLD, DIAMOND
    weekly_xp INT NOT NULL DEFAULT 0,
    questions_solved INT NOT NULL DEFAULT 0,
    rank_position INT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_week UNIQUE (user_id, week_number, year)
);

-- Student Badges & Achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_code VARCHAR(50) NOT NULL, -- 'STREAK_7_DAYS', 'MATH_WIZARD_50', 'FIRST_SIMULADO', 'LEVEL_10'
    unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_code)
);

-- Socratic AI Tutor Chat Threads (Per-Question Multi-Turn Conversation)
CREATE TABLE tutor_chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL, -- Logical reference to exam_db.questions(id)
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'ARCHIVED', 'RESET'
    turn_count INT NOT NULL DEFAULT 0,
    max_turns INT NOT NULL DEFAULT 6, -- Multi-turn safeguard per question consultation
    unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Socratic AI Tutor Chat Messages (90-day hot retention for student review)
CREATE TABLE tutor_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES tutor_chat_threads(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'STUDENT', 'AI_TUTOR'
    content TEXT NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    model_used VARCHAR(50) DEFAULT 'gemini-1.5-flash',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
