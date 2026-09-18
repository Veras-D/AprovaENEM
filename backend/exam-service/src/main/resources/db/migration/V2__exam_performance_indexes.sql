-- ==============================================================================
-- AprovaENEM — Examination & Assessment Database Performance Indexes V2
-- Target: exam_db | PostgreSQL 16 + pgvector
-- ==============================================================================

-- 1. Portuguese Full-Text Search on Question Statements
CREATE INDEX IF NOT EXISTS idx_questions_statement_fts 
ON questions USING GIN (to_tsvector('portuguese', statement));

-- 2. Multi-Column Catalog Filter (Topic, Difficulty, Language, Status)
CREATE INDEX IF NOT EXISTS idx_questions_topic_diff_lang 
ON questions (topic_id, difficulty_level, content_language, status);

-- 3. Partial B-Tree Index for Active Serving Questions (Hot path for quiz generation)
CREATE INDEX IF NOT EXISTS idx_questions_active_serving 
ON questions (topic_id, difficulty_level) 
WHERE status = 'ACTIVE';

-- 4. Edition & Item Lookup (Exam Simulation Mode)
CREATE INDEX IF NOT EXISTS idx_questions_edition_item 
ON questions (exam_edition_id, item_number);

-- 5. Foreign Key Covering: Topic to Subject Area
CREATE INDEX IF NOT EXISTS idx_topics_subject_id 
ON topics (subject_id);

-- 6. Question Options Retrieval by Question ID
CREATE INDEX IF NOT EXISTS idx_question_options_lookup 
ON question_options (question_id, option_letter);

-- 7. Practice Session Lookup (Anonymous Session & Status)
CREATE INDEX IF NOT EXISTS idx_practice_sessions_lookup 
ON practice_sessions (anonymous_session_id, status);

-- 8. Partial Index for Registered User Practice Sessions
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user 
ON practice_sessions (user_id, started_at DESC) 
WHERE user_id IS NOT NULL;

-- 9. Reverse Index on Session Questions
CREATE INDEX IF NOT EXISTS idx_session_questions_question_id 
ON session_questions (question_id);

-- 10. Student Attempts Retrieval by Session
CREATE INDEX IF NOT EXISTS idx_student_attempts_session 
ON student_attempts (session_id, is_correct);

-- 11. Distractor & TRI IRT Analytics: Attempts by Question & Option
CREATE INDEX IF NOT EXISTS idx_student_attempts_question_distractor 
ON student_attempts (question_id, selected_option, is_correct);

-- 12. GIN Index on Diagnostic Breakdown (JSONB Path Operations)
CREATE INDEX IF NOT EXISTS idx_diagnostic_topic_breakdown_gin 
ON diagnostic_summaries USING GIN (topic_breakdown);

-- 13. HNSW Vector Index for Semantic Cosine Search (Sub-5ms RAG Retrieval)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_hnsw 
ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- 14. Student Essays by User
CREATE INDEX IF NOT EXISTS idx_student_essays_user 
ON student_essays (user_id, created_at DESC);

-- 15. Partial Index for Worker Queue (Pending Essay OCR / Grading)
CREATE INDEX IF NOT EXISTS idx_student_essays_processing 
ON student_essays (created_at) 
WHERE status = 'PROCESSING';
