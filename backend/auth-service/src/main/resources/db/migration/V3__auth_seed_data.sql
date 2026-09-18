-- ==============================================================================
-- AprovaENEM — Auth Database Initial Seed Data V3
-- Target: auth_db | PostgreSQL 16
-- Default test password for seed users: 'Password123!' (BCrypt strength 10)
-- $2a$10$w3Z0Z7b4m9S0q6C.aQ0cK.O01M67d2P.5eR1eK7A1K7u3G1F8H5S6
-- ==============================================================================

-- 1. Administrator User
INSERT INTO users (
    id, email, password_hash, full_name, school_type, role, is_active, is_email_verified, created_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@aprovaenem.com.br',
    '$2a$10$w3Z0Z7b4m9S0q6C.aQ0cK.O01M67d2P.5eR1eK7A1K7u3G1F8H5S6',
    'Administrador AprovaENEM',
    'OTHER',
    'ROLE_ADMIN',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- 2. Regular Student User (Free Tier)
INSERT INTO users (
    id, email, password_hash, full_name, school_type, target_degree, role, is_active, is_email_verified, created_at
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'student@aprovaenem.com.br',
    '$2a$10$w3Z0Z7b4m9S0q6C.aQ0cK.O01M67d2P.5eR1eK7A1K7u3G1F8H5S6',
    'Lucas Silva (Estudante Escola Pública)',
    'PUBLIC_SCHOOL',
    'Engenharia de Software',
    'ROLE_STUDENT',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Initialize Gamification Profile for Student
INSERT INTO user_gamification_profiles (
    user_id, current_level, current_xp, streak_days, daily_goal_questions, daily_questions_completed, opt_in_reminders
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    1,
    50,
    3,
    10,
    4,
    TRUE
) ON CONFLICT (user_id) DO NOTHING;

-- 3. Pro Student User (Premium Tier)
INSERT INTO users (
    id, email, password_hash, full_name, school_type, target_degree, role, is_active, is_email_verified, created_at
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'pro.student@aprovaenem.com.br',
    '$2a$10$w3Z0Z7b4m9S0q6C.aQ0cK.O01M67d2P.5eR1eK7A1K7u3G1F8H5S6',
    'Mariana Costa (AprovaENEM Pro)',
    'COMMUNITY_PREP',
    'Medicina',
    'ROLE_PREMIUM_STUDENT',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Initialize Gamification Profile for Pro Student
INSERT INTO user_gamification_profiles (
    user_id, current_level, current_xp, streak_days, daily_goal_questions, daily_questions_completed, opt_in_reminders
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    5,
    1250,
    14,
    20,
    15,
    TRUE
) ON CONFLICT (user_id) DO NOTHING;
