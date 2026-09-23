-- Migration V5: Add figure_alt_text accessibility column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS figure_alt_text TEXT;
