-- Socratic AI Tutor Chat Threads (Per-Question Multi-Turn Conversation)
CREATE TABLE IF NOT EXISTS tutor_chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Logical reference to auth_db.users(id)
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'ARCHIVED', 'RESET'
    turn_count INT NOT NULL DEFAULT 0,
    max_turns INT NOT NULL DEFAULT 6, -- Multi-turn safeguard per question consultation
    unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_user_question ON tutor_chat_threads(user_id, question_id, status);
CREATE INDEX IF NOT EXISTS idx_chat_threads_unlocked_at ON tutor_chat_threads(unlocked_at);

-- Socratic AI Tutor Chat Messages (90-day hot retention for student review)
CREATE TABLE IF NOT EXISTS tutor_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES tutor_chat_threads(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'STUDENT', 'AI_TUTOR'
    content TEXT NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    model_used VARCHAR(50) DEFAULT 'gemini-1.5-flash',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_created ON tutor_chat_messages(thread_id, created_at ASC);

-- Seed Initial Pedagogical RAG Documents & pgvector Chunks
INSERT INTO knowledge_documents (id, title, source_type, topic_id)
VALUES 
    ('66666666-0000-0000-0000-000000000001', 'Diretrizes de Eletrodinâmica e Proteção de Circuitos NBR 5410', 'CURRICULUM_GUIDE', '33333333-0000-0000-0000-000000000003'),
    ('66666666-0000-0000-0000-000000000002', 'Geometria Espacial: Cilindros e Proporcionalidade Quadrática', 'CURRICULUM_GUIDE', '33333333-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO knowledge_chunks (id, document_id, chunk_index, content, metadata, embedding)
VALUES 
    (
        '77777777-0000-0000-0000-000000000001',
        '66666666-0000-0000-0000-000000000001',
        1,
        'No dimensionamento de disjuntores para chuveiros elétricos residenciais, a corrente de operação é I = P / V. Para evitar disparos intempestivos, adiciona-se uma margem de segurança de 20% a 25% (I_disjuntor = 1,2 * I_operacao). O valor comercial padrão imediatamente superior deve ser escolhido.',
        '{"subject": "Física", "topic": "Eletrodinâmica", "keywords": ["disjuntor", "chuveiro", "corrente", "potencia"]}'::jsonb,
        ('[' || repeat('0.05,', 767) || '0.05]')::vector
    ),
    (
        '77777777-0000-0000-0000-000000000002',
        '66666666-0000-0000-0000-000000000002',
        1,
        'O volume de um cilindro circular reto é V = pi * r^2 * h. O volume possui dependência linear com a altura (h) e quadrática com o raio da base (r^2). Para triplicar o volume mantendo a mesma altura, a área da base deve triplicar, o que significa que o novo raio r_novo deve ser r * raiz(3).',
        '{"subject": "Matemática", "topic": "Geometria Espacial", "keywords": ["cilindro", "volume", "raio", "altura"]}'::jsonb,
        ('[' || repeat('0.02,', 767) || '0.02]')::vector
    )
ON CONFLICT DO NOTHING;
