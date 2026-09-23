-- ==============================================================================
-- AprovaENEM — Auth Database Migration V4: Fix Seed Passwords
-- Target: auth_db | PostgreSQL 16
-- Replaces non-functional placeholder hashes with valid BCrypt hash for 'Password123!'
-- ==============================================================================

UPDATE users
SET password_hash = '$2a$10$Opn./Y4ZThoOAeoKoXnqV.7BGWOjDgOVbx4qN14cXqfyNmgGOx90S'
WHERE email IN (
    'admin@aprovaenem.com.br',
    'student@aprovaenem.com.br',
    'pro.student@aprovaenem.com.br'
);
