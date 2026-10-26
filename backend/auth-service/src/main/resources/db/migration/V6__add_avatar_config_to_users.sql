-- ==============================================================================
-- AprovaENEM — Auth & Gamification Database Schema Migration V6
-- Target: auth_db | PostgreSQL 16
-- Description: Add avatar_config column to users table for custom student avatars
-- ==============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_config TEXT;
