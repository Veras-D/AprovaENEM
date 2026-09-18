-- ==============================================================================
-- AprovaENEM — Examination & Assessment Database Schema Migration V1
-- Target: exam_db | PostgreSQL 16 + pgvector
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Exam Editions (e.g., ENEM 2023 Regular)
CREATE TABLE exam_editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    exam_color VARCHAR(30) NOT NULL DEFAULT 'BLUE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_exam_year_color UNIQUE (year, exam_color)
);

-- 2. Subject Areas (e.g., MATHEMATICS, NATURAL_SCIENCES)
CREATE TABLE subject_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 3. Topics & Disciplines (e.g., Physics -> Optics)
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subject_areas(id) ON DELETE RESTRICT,
    discipline VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Questions (The Core Examination Asset)
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_edition_id UUID NOT NULL REFERENCES exam_editions(id) ON DELETE RESTRICT,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
    item_number INT NOT NULL,
    statement TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D', 'E')),
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
    tri_param_a NUMERIC(5, 3), -- Discrimination parameter
    tri_param_b NUMERIC(5, 3), -- Difficulty parameter
    tri_param_c NUMERIC(5, 3), -- Guessing parameter
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'NEEDS_REVIEW', 'DRAFT', 'ANNULLED')),
    suspension_reason TEXT,
    content_language VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_edition_item UNIQUE (exam_edition_id, item_number)
);

-- 5. Multiple Choice Options (A, B, C, D, E)
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_letter CHAR(1) NOT NULL CHECK (option_letter IN ('A', 'B', 'C', 'D', 'E')),
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_question_option UNIQUE (question_id, option_letter)
);

-- 6. Curated Explanations & Step-by-Step Resolutions
CREATE TABLE question_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL UNIQUE REFERENCES questions(id) ON DELETE CASCADE,
    base_explanation TEXT NOT NULL,
    key_concepts TEXT,
    author_attribution VARCHAR(100) DEFAULT 'INEP Official Guidelines / Open Educational Resource',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Practice Sessions (Exam Simulations or Custom Quizzes)
CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    anonymous_session_id VARCHAR(64) NOT NULL,
    session_type VARCHAR(30) NOT NULL CHECK (session_type IN ('TOPIC_PRACTICE', 'EXAM_SIMULATION', 'DIAGNOSTIC_QUICK')),
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    total_questions INT NOT NULL,
    correct_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. Questions Included in a Specific Session
CREATE TABLE session_questions (
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    display_order INT NOT NULL,
    PRIMARY KEY (session_id, question_id)
);

-- 9. Student Answers per Question Attempt
CREATE TABLE student_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    selected_option CHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D', 'E')),
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_question_attempt UNIQUE (session_id, question_id)
);

-- 10. Generated Diagnostic Summaries & Skill Radar
CREATE TABLE diagnostic_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE REFERENCES practice_sessions(id) ON DELETE CASCADE,
    score_percentage NUMERIC(5, 2) NOT NULL,
    topic_breakdown JSONB NOT NULL,
    recommended_topics JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Phase 2: Essay Prompts (Redação)
CREATE TABLE essay_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INT NOT NULL,
    theme VARCHAR(255) NOT NULL,
    motivating_texts JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Phase 2: Student Essays
CREATE TABLE student_essays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    essay_prompt_id UUID NOT NULL REFERENCES essay_prompts(id) ON DELETE RESTRICT,
    image_storage_url VARCHAR(500) NOT NULL,
    transcribed_text TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PROCESSING', -- PROCESSING, EVALUATED, FAILED
    total_score INT CHECK (total_score BETWEEN 0 AND 1000),
    general_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Phase 2: Essay Competency Evaluations (1 to 5)
CREATE TABLE essay_competency_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    essay_id UUID NOT NULL REFERENCES student_essays(id) ON DELETE CASCADE,
    competency_number INT NOT NULL CHECK (competency_number BETWEEN 1 AND 5),
    score INT NOT NULL CHECK (score BETWEEN 0 AND 200 AND score % 40 = 0),
    feedback TEXT NOT NULL,
    actionable_tips TEXT,
    CONSTRAINT uq_essay_competency UNIQUE (essay_id, competency_number)
);

-- 14. RAG Pedagogical Reference Knowledge Documents
CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'INEP_MATRIZ', 'STEP_RESOLUTION', 'DISTRACTOR_CATALOG', 'REDAÇÃO_RUBRIC'
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. RAG Vector Knowledge Chunks (768-dim embeddings for Gemini)
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding vector(768) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_document_chunk UNIQUE (document_id, chunk_index)
);
