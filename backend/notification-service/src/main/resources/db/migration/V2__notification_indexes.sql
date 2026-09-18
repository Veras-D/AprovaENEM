-- ==============================================================================
-- AprovaENEM — Notification Database Performance Indexes V2
-- Target: notification_db | PostgreSQL 16
-- ==============================================================================

-- 1. Active User Device Token Lookup for Broadcasts & Push
CREATE INDEX IF NOT EXISTS idx_user_device_tokens_user 
ON user_device_tokens (user_id, is_active);

-- 2. User Inbox & Notification Feed Chronological Lookup
CREATE INDEX IF NOT EXISTS idx_notifications_user_inbox 
ON notification_logs (user_id, status, created_at DESC);
