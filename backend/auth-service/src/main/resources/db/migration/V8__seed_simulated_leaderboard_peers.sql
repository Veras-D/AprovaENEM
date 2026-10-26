-- ==============================================================================
-- AprovaENEM — Auth & Gamification Database Schema Migration V8
-- Target: auth_db | PostgreSQL 16
-- Description: Add is_bot column and seed simulated leaderboard peers (bots)
-- ==============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_users_is_bot ON users (is_bot);

-- ------------------------------------------------------------------------------
-- 1. BRONZE TIER BOTS (6 peers)
-- ------------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, school_type, target_degree, role, is_active, is_email_verified, is_bot, avatar_config)
VALUES
('10000000-0000-0000-0000-000000000001', 'danilo.siqueira@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Danilo Siqueira', 'PUBLIC_SCHOOL', 'Engenharia Civil', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#fde8d7","hairStyle":"short","hairColor":"#1e293b","eyeExpression":"focused","mouthExpression":"smile","clothingStyle":"tshirt","clothingColor":"#0284c7","accessory":"headphones","backgroundColor":"#e0f2fe"}'),
('10000000-0000-0000-0000-000000000002', 'lorena.peixoto@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Lorena Peixoto', 'COMMUNITY_PREP', 'Pedagogia', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#d49e6d","hairStyle":"wavy","hairColor":"#451a03","eyeExpression":"cheerful","mouthExpression":"openSmile","clothingStyle":"hoodie","clothingColor":"#7c3aed","accessory":"pencil","backgroundColor":"#f3e8ff"}'),
('10000000-0000-0000-0000-000000000003', 'enzo.ramos@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Enzo Gabriel Ramos', 'PUBLIC_SCHOOL', 'Administração', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#c08250","hairStyle":"curly","hairColor":"#18181b","eyeExpression":"cheerful","mouthExpression":"grin","clothingStyle":"tshirt","clothingColor":"#16a34a","accessory":"none","backgroundColor":"#dcfce7"}'),
('10000000-0000-0000-0000-000000000004', 'isadora.cavalcanti@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Isadora Cavalcanti', 'PUBLIC_SCHOOL', 'Enfermagem', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#f7d2b7","hairStyle":"bun","hairColor":"#78350f","eyeExpression":"glasses","mouthExpression":"smile","clothingStyle":"vest","clothingColor":"#0891b2","accessory":"pencil","backgroundColor":"#cffafe"}'),
('10000000-0000-0000-0000-000000000005', 'murilo.alcantara@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Murilo Alcântara', 'PUBLIC_SCHOOL', 'Ciências Biológicas', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#a36439","hairStyle":"spiky","hairColor":"#0f172a","eyeExpression":"focused","mouthExpression":"smirk","clothingStyle":"hoodie","clothingColor":"#ea580c","accessory":"none","backgroundColor":"#ffedd5"}'),
('10000000-0000-0000-0000-000000000006', 'thais.antunes@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Thaís Antunes', 'PUBLIC_SCHOOL', 'História', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#edd0b0","hairStyle":"short","hairColor":"#3f2010","eyeExpression":"cheerful","mouthExpression":"smile","clothingStyle":"tshirt","clothingColor":"#db2777","accessory":"none","backgroundColor":"#fce7f3"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_gamification_profiles (user_id, current_level, current_xp, current_league, streak_days, daily_goal_questions, daily_questions_completed, last_activity_date)
VALUES
('10000000-0000-0000-0000-000000000001', 2, 380, 'BRONZE', 3, 10, 4, CURRENT_DATE),
('10000000-0000-0000-0000-000000000002', 3, 540, 'BRONZE', 4, 10, 6, CURRENT_DATE),
('10000000-0000-0000-0000-000000000003', 2, 290, 'BRONZE', 2, 10, 3, CURRENT_DATE),
('10000000-0000-0000-0000-000000000004', 3, 490, 'BRONZE', 5, 10, 5, CURRENT_DATE),
('10000000-0000-0000-0000-000000000005', 1, 150, 'BRONZE', 1, 10, 2, CURRENT_DATE),
('10000000-0000-0000-0000-000000000006', 2, 260, 'BRONZE', 2, 10, 3, CURRENT_DATE)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO weekly_leaderboards (user_id, week_number, year, league_tier, weekly_xp, questions_solved)
VALUES
('10000000-0000-0000-0000-000000000002', 44, 2026, 'BRONZE', 240, 16),
('10000000-0000-0000-0000-000000000004', 44, 2026, 'BRONZE', 210, 14),
('10000000-0000-0000-0000-000000000001', 44, 2026, 'BRONZE', 180, 12),
('10000000-0000-0000-0000-000000000003', 44, 2026, 'BRONZE', 140, 9),
('10000000-0000-0000-0000-000000000006', 44, 2026, 'BRONZE', 120, 8),
('10000000-0000-0000-0000-000000000005', 44, 2026, 'BRONZE', 90, 6)
ON CONFLICT (user_id, week_number, year) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. SILVER TIER BOTS (6 peers)
-- ------------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, school_type, target_degree, role, is_active, is_email_verified, is_bot, avatar_config)
VALUES
('10000000-0000-0000-0000-000000000007', 'joao.albuquerque@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'João Pedro Albuquerque', 'PUBLIC_SCHOOL', 'Direito', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#854926","hairStyle":"short","hairColor":"#1c1917","eyeExpression":"focused","mouthExpression":"openSmile","clothingStyle":"tshirt","clothingColor":"#2563eb","accessory":"headphones","backgroundColor":"#dbeafe"}'),
('10000000-0000-0000-0000-000000000008', 'beatriz.wanderley@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Beatriz Wanderley', 'COMMUNITY_PREP', 'Psicologia', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#e4b88d","hairStyle":"wavy","hairColor":"#292524","eyeExpression":"glasses","mouthExpression":"smile","clothingStyle":"hoodie","clothingColor":"#9333ea","accessory":"pencil","backgroundColor":"#f3e8ff"}'),
('10000000-0000-0000-0000-000000000009', 'samuel.nogueira@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Samuel Nogueira', 'PUBLIC_SCHOOL', 'Ciência da Computação', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#613018","hairStyle":"curly","hairColor":"#09090b","eyeExpression":"cheerful","mouthExpression":"grin","clothingStyle":"tshirt","clothingColor":"#059669","accessory":"headphones","backgroundColor":"#ecfdf5"}'),
('10000000-0000-0000-0000-000000000010', 'rebeca.linhares@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Rebeca Linhares', 'PUBLIC_SCHOOL', 'Arquitetura e Urbanismo', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#fde8d7","hairStyle":"bun","hairColor":"#713f12","eyeExpression":"cheerful","mouthExpression":"smile","clothingStyle":"vest","clothingColor":"#e11d48","accessory":"none","backgroundColor":"#ffe4e6"}'),
('10000000-0000-0000-0000-000000000011', 'caio.teles@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Caio Vinícius Teles', 'PUBLIC_SCHOOL', 'Farmácia', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#3d1c0e","hairStyle":"spiky","hairColor":"#000000","eyeExpression":"focused","mouthExpression":"smirk","clothingStyle":"hoodie","clothingColor":"#4f46e5","accessory":"none","backgroundColor":"#e0e7ff"}'),
('10000000-0000-0000-0000-000000000012', 'natalia.fontenele@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Natália Fontenele', 'COMMUNITY_PREP', 'Letras - Português', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#c08250","hairStyle":"short","hairColor":"#1c1917","eyeExpression":"glasses","mouthExpression":"smile","clothingStyle":"academic","clothingColor":"#0d9488","accessory":"pencil","backgroundColor":"#ccfbf1"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_gamification_profiles (user_id, current_level, current_xp, current_league, streak_days, daily_goal_questions, daily_questions_completed, last_activity_date)
VALUES
('10000000-0000-0000-0000-000000000007', 5, 960, 'SILVER', 8, 10, 7, CURRENT_DATE),
('10000000-0000-0000-0000-000000000008', 6, 1150, 'SILVER', 11, 10, 8, CURRENT_DATE),
('10000000-0000-0000-0000-000000000009', 4, 820, 'SILVER', 6, 10, 5, CURRENT_DATE),
('10000000-0000-0000-0000-000000000010', 5, 910, 'SILVER', 9, 10, 6, CURRENT_DATE),
('10000000-0000-0000-0000-000000000011', 4, 730, 'SILVER', 5, 10, 4, CURRENT_DATE),
('10000000-0000-0000-0000-000000000012', 4, 690, 'SILVER', 7, 10, 5, CURRENT_DATE)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO weekly_leaderboards (user_id, week_number, year, league_tier, weekly_xp, questions_solved)
VALUES
('10000000-0000-0000-0000-000000000007', 44, 2026, 'SILVER', 460, 30),
('10000000-0000-0000-0000-000000000008', 44, 2026, 'SILVER', 430, 28),
('10000000-0000-0000-0000-000000000009', 44, 2026, 'SILVER', 370, 24),
('10000000-0000-0000-0000-000000000010', 44, 2026, 'SILVER', 330, 21),
('10000000-0000-0000-0000-000000000011', 44, 2026, 'SILVER', 280, 18),
('10000000-0000-0000-0000-000000000012', 44, 2026, 'SILVER', 250, 16)
ON CONFLICT (user_id, week_number, year) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. GOLD TIER BOTS (6 peers)
-- ------------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, school_type, target_degree, role, is_active, is_email_verified, is_bot, avatar_config)
VALUES
('10000000-0000-0000-0000-000000000013', 'lucas.furtado@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Lucas Furtado', 'PUBLIC_SCHOOL', 'Medicina', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#edd0b0","hairStyle":"short","hairColor":"#172554","eyeExpression":"focused","mouthExpression":"openSmile","clothingStyle":"academic","clothingColor":"#1e40af","accessory":"graduationCap","backgroundColor":"#dbeafe"}'),
('10000000-0000-0000-0000-000000000014', 'debora.vasconcellos@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Débora Vasconcellos', 'PUBLIC_SCHOOL', 'Engenharia Química', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#a36439","hairStyle":"wavy","hairColor":"#18181b","eyeExpression":"cheerful","mouthExpression":"smile","clothingStyle":"hoodie","clothingColor":"#15803d","accessory":"headphones","backgroundColor":"#dcfce7"}'),
('10000000-0000-0000-0000-000000000015', 'yuri.takahashi@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Yuri Takahashi', 'PUBLIC_SCHOOL', 'Engenharia Mecatrônica', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#f7d2b7","hairStyle":"spiky","hairColor":"#0a0a0a","eyeExpression":"focused","mouthExpression":"grin","clothingStyle":"tshirt","clothingColor":"#b91c1c","accessory":"none","backgroundColor":"#fee2e2"}'),
('10000000-0000-0000-0000-000000000016', 'yasmin.cerqueira@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Yasmin Cerqueira', 'COMMUNITY_PREP', 'Odontologia', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#854926","hairStyle":"curly","hairColor":"#020617","eyeExpression":"glasses","mouthExpression":"smile","clothingStyle":"vest","clothingColor":"#6d28d9","accessory":"pencil","backgroundColor":"#ede9fe"}'),
('10000000-0000-0000-0000-000000000017', 'bernardo.guimaraes@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Bernardo Guimarães', 'PUBLIC_SCHOOL', 'Economia', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#d49e6d","hairStyle":"short","hairColor":"#451a03","eyeExpression":"cheerful","mouthExpression":"smirk","clothingStyle":"hoodie","clothingColor":"#c2410c","accessory":"none","backgroundColor":"#ffedd5"}'),
('10000000-0000-0000-0000-000000000018', 'leticia.salgado@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Letícia Salgado', 'PUBLIC_SCHOOL', 'Relações Internacionais', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#fde8d7","hairStyle":"bun","hairColor":"#1e1b4b","eyeExpression":"cheerful","mouthExpression":"openSmile","clothingStyle":"tshirt","clothingColor":"#0369a1","accessory":"pencil","backgroundColor":"#e0f2fe"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_gamification_profiles (user_id, current_level, current_xp, current_league, streak_days, daily_goal_questions, daily_questions_completed, last_activity_date)
VALUES
('10000000-0000-0000-0000-000000000013', 8, 1620, 'GOLD', 15, 15, 12, CURRENT_DATE),
('10000000-0000-0000-0000-000000000014', 8, 1540, 'GOLD', 16, 15, 11, CURRENT_DATE),
('10000000-0000-0000-0000-000000000015', 7, 1380, 'GOLD', 13, 10, 8, CURRENT_DATE),
('10000000-0000-0000-0000-000000000016', 7, 1290, 'GOLD', 12, 10, 7, CURRENT_DATE),
('10000000-0000-0000-0000-000000000017', 6, 1180, 'GOLD', 10, 10, 6, CURRENT_DATE),
('10000000-0000-0000-0000-000000000018', 6, 1080, 'GOLD', 9, 10, 6, CURRENT_DATE)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO weekly_leaderboards (user_id, week_number, year, league_tier, weekly_xp, questions_solved)
VALUES
('10000000-0000-0000-0000-000000000013', 44, 2026, 'GOLD', 720, 48),
('10000000-0000-0000-0000-000000000014', 44, 2026, 'GOLD', 680, 44),
('10000000-0000-0000-0000-000000000015', 44, 2026, 'GOLD', 590, 38),
('10000000-0000-0000-0000-000000000016', 44, 2026, 'GOLD', 540, 35),
('10000000-0000-0000-0000-000000000017', 44, 2026, 'GOLD', 480, 31),
('10000000-0000-0000-0000-000000000018', 44, 2026, 'GOLD', 420, 27)
ON CONFLICT (user_id, week_number, year) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. DIAMOND TIER BOTS (6 peers)
-- ------------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, school_type, target_degree, role, is_active, is_email_verified, is_bot, avatar_config)
VALUES
('10000000-0000-0000-0000-000000000019', 'gabriel.sampaio@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Gabriel Sampaio', 'PUBLIC_SCHOOL', 'Medicina - USP', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#613018","hairStyle":"short","hairColor":"#000000","eyeExpression":"focused","mouthExpression":"openSmile","clothingStyle":"academic","clothingColor":"#1e3a8a","accessory":"graduationCap","backgroundColor":"#bfdbfe"}'),
('10000000-0000-0000-0000-000000000020', 'marina.bittencourt@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Marina Bittencourt', 'COMMUNITY_PREP', 'Medicina - UFRJ', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#e4b88d","hairStyle":"wavy","hairColor":"#3b0764","eyeExpression":"focused","mouthExpression":"smile","clothingStyle":"academic","clothingColor":"#4338ca","accessory":"pencil","backgroundColor":"#e0e7ff"}'),
('10000000-0000-0000-0000-000000000021', 'rodrigo.valenca@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Rodrigo Valença', 'PUBLIC_SCHOOL', 'Engenharia Aeronáutica - ITA', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#3d1c0e","hairStyle":"curly","hairColor":"#030712","eyeExpression":"glasses","mouthExpression":"grin","clothingStyle":"hoodie","clothingColor":"#047857","accessory":"headphones","backgroundColor":"#d1fae5"}'),
('10000000-0000-0000-0000-000000000022', 'alice.campelo@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Alice Campelo', 'PUBLIC_SCHOOL', 'Direito - Largo São Francisco', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#f7d2b7","hairStyle":"bun","hairColor":"#172554","eyeExpression":"cheerful","mouthExpression":"smile","clothingStyle":"vest","clothingColor":"#701a75","accessory":"graduationCap","backgroundColor":"#fae8ff"}'),
('10000000-0000-0000-0000-000000000023', 'renan.frota@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Renan Frota', 'PUBLIC_SCHOOL', 'Ciência de Dados - Unicamp', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#c08250","hairStyle":"spiky","hairColor":"#18181b","eyeExpression":"focused","mouthExpression":"smirk","clothingStyle":"tshirt","clothingColor":"#b45309","accessory":"headphones","backgroundColor":"#fef3c7"}'),
('10000000-0000-0000-0000-000000000024', 'juliana.brandao@simulado.enem.br', '$2a$12$e8Y4V1e07bCkn0vS8bK9aegt9ZfxZ6V96P6HnI8.W2B4D7E2F3G4H', 'Juliana Brandão', 'COMMUNITY_PREP', 'Biomedicina', 'ROLE_STUDENT', true, true, true, '{"skinColor":"#edd0b0","hairStyle":"short","hairColor":"#431407","eyeExpression":"glasses","mouthExpression":"smile","clothingStyle":"hoodie","clothingColor":"#be123c","accessory":"none","backgroundColor":"#ffe4e6"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_gamification_profiles (user_id, current_level, current_xp, current_league, streak_days, daily_goal_questions, daily_questions_completed, last_activity_date)
VALUES
('10000000-0000-0000-0000-000000000019', 12, 3850, 'DIAMOND', 35, 20, 18, CURRENT_DATE),
('10000000-0000-0000-0000-000000000020', 11, 3420, 'DIAMOND', 31, 20, 16, CURRENT_DATE),
('10000000-0000-0000-0000-000000000021', 10, 2980, 'DIAMOND', 28, 15, 14, CURRENT_DATE),
('10000000-0000-0000-0000-000000000022', 10, 2750, 'DIAMOND', 24, 15, 12, CURRENT_DATE),
('10000000-0000-0000-0000-000000000023', 9, 2410, 'DIAMOND', 21, 15, 11, CURRENT_DATE),
('10000000-0000-0000-0000-000000000024', 9, 2230, 'DIAMOND', 19, 15, 10, CURRENT_DATE)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO weekly_leaderboards (user_id, week_number, year, league_tier, weekly_xp, questions_solved)
VALUES
('10000000-0000-0000-0000-000000000019', 44, 2026, 'DIAMOND', 1250, 82),
('10000000-0000-0000-0000-000000000020', 44, 2026, 'DIAMOND', 1140, 75),
('10000000-0000-0000-0000-000000000021', 44, 2026, 'DIAMOND', 990, 65),
('10000000-0000-0000-0000-000000000022', 44, 2026, 'DIAMOND', 890, 58),
('10000000-0000-0000-0000-000000000023', 44, 2026, 'DIAMOND', 790, 52),
('10000000-0000-0000-0000-000000000024', 44, 2026, 'DIAMOND', 710, 46)
ON CONFLICT (user_id, week_number, year) DO NOTHING;
