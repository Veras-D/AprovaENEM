-- Migration V6: Add figure_url to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS figure_url VARCHAR(500);
