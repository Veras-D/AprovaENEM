-- ==============================================================================
-- AprovaENEM — Examination & Assessment Database Initial Seed Data V3
-- Target: exam_db | PostgreSQL 16 + pgvector
-- ==============================================================================

-- 1. Official INEP Subject Areas (Áreas de Conhecimento do ENEM)
INSERT INTO subject_areas (id, code, name, description) VALUES
('11111111-0000-0000-0000-000000000001', 'MATHEMATICS', 'Matemática e suas Tecnologias', 'Álgebra, Geometria, Estatística, Funções e Matemática Financeira'),
('11111111-0000-0000-0000-000000000002', 'NATURAL_SCIENCES', 'Ciências da Natureza e suas Tecnologias', 'Física, Química e Biologia'),
('11111111-0000-0000-0000-000000000003', 'HUMANITIES', 'Ciências Humanas e suas Tecnologias', 'História, Geografia, Filosofia e Sociologia'),
('11111111-0000-0000-0000-000000000004', 'LANGUAGES', 'Linguagens, Códigos e suas Tecnologias', 'Língua Portuguesa, Literatura, Língua Estrangeira, Artes e Educação Física')
ON CONFLICT (code) DO NOTHING;

-- 2. Official INEP Exam Editions
INSERT INTO exam_editions (id, year, title, exam_color, is_active) VALUES
('22222222-0000-0000-0000-000000002023', 2023, 'ENEM 2023 — Prova Regular (Caderno Azul)', 'BLUE', TRUE),
('22222222-0000-0000-0000-000000002022', 2022, 'ENEM 2022 — Prova Regular (Caderno Azul)', 'BLUE', TRUE),
('22222222-0000-0000-0000-000000002021', 2021, 'ENEM 2021 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
ON CONFLICT (year, exam_color) DO NOTHING;

-- 3. Essential ENEM Curriculum Topics
INSERT INTO topics (id, subject_id, discipline, name, slug) VALUES
('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Matemática', 'Geometria Espacial', 'matematica-geometria-espacial'),
('33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Matemática', 'Funções e Álgebra', 'matematica-funcoes-algebra'),
('33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'Física', 'Eletrodinâmica e Circuitos', 'fisica-eletrodinamica-circuitos'),
('33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', 'Química', 'Estequiometria e Soluções', 'quimica-estequiometria-solucoes'),
('33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', 'Biologia', 'Ecologia e Meio Ambiente', 'biologia-ecologia-meio-ambiente'),
('33333333-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000003', 'História', 'Brasil República', 'historia-brasil-republica'),
('33333333-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000004', 'Língua Portuguesa', 'Variação Linguística e Gêneros Textuais', 'portugues-variacao-linguistica')
ON CONFLICT (slug) DO NOTHING;

-- 4. Sample Verified ENEM Questions
-- Question 1: Física (Eletrodinâmica / Disjuntores)
INSERT INTO questions (
    id, exam_edition_id, topic_id, item_number, statement, correct_option, difficulty_level,
    tri_param_a, tri_param_b, tri_param_c, status, content_language
) VALUES (
    '44444444-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000002023',
    '33333333-0000-0000-0000-000000000003',
    95,
    'Um circuito elétrico residencial de 220 V alimenta um chuveiro elétrico de potência 5 500 W. Para proteger a instalação contra sobrecargas térmicas e riscos de curto-circuito, deve-se instalar um disjuntor termomagnético no quadro de distribuição. Considerando que o disjuntor deve ser dimensionado com uma margem de segurança de aproximadamente 20% a 25% acima da corrente nominal de operação, qual deve ser a corrente nominal mínima recomendada para esse disjuntor?',
    'C',
    'MEDIUM',
    1.850, 0.420, 0.200,
    'ACTIVE',
    'pt-BR'
) ON CONFLICT (exam_edition_id, item_number) DO NOTHING;

-- Options for Question 1
INSERT INTO question_options (question_id, option_letter, option_text, is_correct) VALUES
('44444444-0000-0000-0000-000000000001', 'A', '16 A', FALSE),
('44444444-0000-0000-0000-000000000001', 'B', '20 A', FALSE),
('44444444-0000-0000-0000-000000000001', 'C', '30 A', TRUE),
('44444444-0000-0000-0000-000000000001', 'D', '40 A', FALSE),
('44444444-0000-0000-0000-000000000001', 'E', '50 A', FALSE)
ON CONFLICT (question_id, option_letter) DO NOTHING;

-- Resolution for Question 1
INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution) VALUES
(
    '44444444-0000-0000-0000-000000000001',
    'Para determinar a corrente nominal do disjuntor, primeiro calculamos a corrente elétrica de operação do chuveiro utilizando a relação fundamental de potência elétrica: P = V * I, logo I = P / V. Substituindo os valores: I = 5500 W / 220 V = 25 A. Como a questão especifica uma margem de segurança entre 20% e 25% para evitar disparos acidentais por oscilações normais da rede elétrica, temos: I_segurança = 25 A * 1,20 = 30 A. O disjuntor comercial padrão imediatamente adequado com essa tolerância é de 30 A.',
    'Potência Elétrica (P = V * I); Efeito Joule; Dimensionamento de condutores e dispositivos de proteção termomagnética (NBR 5410).',
    'Equipe Pedagógica AprovaENEM / INEP'
) ON CONFLICT (question_id) DO NOTHING;

-- Question 2: Matemática (Geometria Espacial)
INSERT INTO questions (
    id, exam_edition_id, topic_id, item_number, statement, correct_option, difficulty_level,
    tri_param_a, tri_param_b, tri_param_c, status, content_language
) VALUES (
    '44444444-0000-0000-0000-000000000002',
    '22222222-0000-0000-0000-000000002023',
    '33333333-0000-0000-0000-000000000001',
    136,
    'Uma indústria fabrica reservatórios de água com formato de cilindro circular reto com raio da base igual a 2 metros e altura de 5 metros. Com o objetivo de triplicar a capacidade volumétrica desse reservatório mantendo a mesma altura, o raio da base deve ser alterado para:',
    'D',
    'EASY',
    1.420, -0.650, 0.180,
    'ACTIVE',
    'pt-BR'
) ON CONFLICT (exam_edition_id, item_number) DO NOTHING;

-- Options for Question 2
INSERT INTO question_options (question_id, option_letter, option_text, is_correct) VALUES
('44444444-0000-0000-0000-000000000002', 'A', '6 metros', FALSE),
('44444444-0000-0000-0000-000000000002', 'B', '4 metros', FALSE),
('44444444-0000-0000-0000-000000000002', 'C', '2 * raiz(2) metros', FALSE),
('44444444-0000-0000-0000-000000000002', 'D', '2 * raiz(3) metros', TRUE),
('44444444-0000-0000-0000-000000000002', 'E', '12 metros', FALSE)
ON CONFLICT (question_id, option_letter) DO NOTHING;

-- Resolution for Question 2
INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution) VALUES
(
    '44444444-0000-0000-0000-000000000002',
    'O volume de um cilindro circular reto é dado por V = pi * r^2 * h. O volume inicial é V1 = pi * (2)^2 * 5 = 20*pi m^3. O novo volume desejado deve ser o triplo, portanto V2 = 3 * V1 = 60*pi m^3. Mantendo a altura h = 5 m: pi * (r_novo)^2 * 5 = 60*pi => 5 * (r_novo)^2 = 60 => (r_novo)^2 = 12 => r_novo = raiz(12) = 2 * raiz(3) metros.',
    'Geometria Espacial; Volume do Cilindro; Proporcionalidade Quadrática do Raio.',
    'Equipe Pedagógica AprovaENEM / INEP'
) ON CONFLICT (question_id) DO NOTHING;
