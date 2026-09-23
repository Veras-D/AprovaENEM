-- ==============================================================================
-- AprovaENEM — Auto-Generated Ingestion Seed Migration
-- Target: exam_db | PostgreSQL 16 + pgvector
-- ==============================================================================

-- Item 136 (ENEM 2023 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2023 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2023, 'ENEM 2023 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Geometria Espacial' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'MATHEMATICS' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Matemática', 'Geometria Espacial', 'geometria-espacial')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 136, 'Uma indústria fabrica reservatórios de água com formato de cilindro circular reto com raio da base igual a 2 metros e altura de 5 metros. Com o objetivo de triplicar a capacidade volumétrica desse reservatório mantendo a mesma altura, o raio da base deve ser alterado para:', 'D',
        'EASY', 1.42, -0.65, 0.18, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '6 metros', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '4 metros', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '2 * raiz(2) metros', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '2 * raiz(3) metros', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '12 metros', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'O volume de um cilindro circular reto é dado por $V = \pi r^2 h$. O volume inicial é $V_1 = \pi (2)^2 \cdot 5 = 20\pi\text{ m}^3$. O novo volume desejado deve ser o triplo: $V_2 = 3 \cdot V_1 = 60\pi\text{ m}^3$. Mantendo a altura $h = 5\text{ m}$: $\pi (r_{novo})^2 \cdot 5 = 60\pi \Rightarrow 5(r_{novo})^2 = 60 \Rightarrow (r_{novo})^2 = 12 \Rightarrow r_{novo} = \sqrt{12} = 2\sqrt{3}\text{ metros}$.', 'Geometria Espacial; Volume do Cilindro; Proporcionalidade Quadrática do Raio.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 95 (ENEM 2023 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2023 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2023, 'ENEM 2023 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Eletrodinâmica e Circuitos' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'NATURAL_SCIENCES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Física', 'Eletrodinâmica e Circuitos', 'eletrodinâmica-e-circuitos')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 95, 'Um circuito elétrico residencial de 220 V alimenta um chuveiro elétrico de potência 5 500 W. Para proteger a instalação contra sobrecargas térmicas e riscos de curto-circuito, deve-se instalar um disjuntor termomagnético no quadro de distribuição. Considerando que o disjuntor deve ser dimensionado com uma margem de segurança de aproximadamente 20% a 25% acima da corrente nominal de operação, qual deve ser a corrente nominal mínima recomendada para esse disjuntor?', 'C',
        'MEDIUM', 1.85, 0.42, 0.2, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '16 A', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '20 A', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '30 A', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '40 A', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '50 A', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Pela relação de potência elétrica P = V * I, a corrente de operação do chuveiro é $I = P / V = 5500 / 220 = 25\text{ A}$. Com margem de segurança entre 20% e 25%: $I_{min} = 25 \times 1,20 = 30\text{ A}$. O disjuntor comercial padrão adequado é de 30 A.', 'Potência Elétrica ($P = V \cdot I$); Disjuntores Termomagnéticos; Norma NBR 5410.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 112 (ENEM 2023 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2023 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2023, 'ENEM 2023 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Estequiometria e Soluções' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'NATURAL_SCIENCES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Química', 'Estequiometria e Soluções', 'estequiometria-e-solucões')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 112, 'O hidróxido de magnésio, $\text{Mg(OH)}_2$, é comumente utilizado como antiácido estomacal na forma de suspensão aquosa conhecida como leite de magnésia. Sabendo que a reação de neutralização total com o ácido clorídrico estomacal ($\text{HCl}$) produz cloreto de magnésio ($\text{MgCl}_2$) e água, qual é a quantidade de matéria de $\text{HCl}$, em mol, neutralizada por 0,5 mol de $\text{Mg(OH)}_2$?', 'C',
        'EASY', 1.92, 0.15, 0.17, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '0,25 mol', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '0,50 mol', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '1,00 mol', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '1,50 mol', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '2,00 mol', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A equação química balanceada de neutralização é: $\text{Mg(OH)}_2 + 2\,\text{HCl} \rightarrow \text{MgCl}_2 + 2\,\text{H}_2\text{O}$. A proporção estequiométrica entre $\text{Mg(OH)}_2$ e $\text{HCl}$ é de $1 : 2$. Logo, para neutralizar 0,5 mol de $\text{Mg(OH)}_2$, são necessários $0,5 \times 2 = 1,00\text{ mol de HCl}$.', 'Estequiometria; Reação Ácido-Base; Neutralização Total.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 52 (ENEM 2023 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2023 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2023, 'ENEM 2023 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Brasil República' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'HUMANITIES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'História', 'Brasil República', 'brasil-republica')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 52, 'Durante o Estado Novo (1937–1945), o Departamento de Imprensa e Propaganda (DIP) exerceu um papel crucial na sustentação política do regime varguista. Além de exercer rigorosa censura sobre os meios de comunicação, o órgão atuava estrategicamente na construção da imagem pública de Getúlio Vargas como o ''Pai dos Pobres'' e patrono da classe trabalhadora. Essa estratégia de comunicação política fundamentava-se na:', 'B',
        'EASY', 1.65, -0.35, 0.19, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'eliminação total do sindicalismo e proibição das leis trabalhistas', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'associação personalista entre as conquistas da legislação social e a figura do governante', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'adoção irrestrita dos ideais anarcossindicais no meio operário', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'descentralização da propaganda política para os governos estaduais', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'recusa de qualquer manifestação de cultura popular pelo Estado', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'O trabalhismo varguista caracterizou-se pela vinculação direta e personalista entre a figura de Getúlio Vargas e a concessão de direitos sociais (CLT, salário mínimo, carteira de trabalho), apresentando as conquistas sindicais como uma dádiva do presidente e consolidando o fenômeno do populismo.', 'Era Vargas; Estado Novo; DIP; Trabalhismo e Populismo.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 18 (ENEM 2023 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2023 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2023, 'ENEM 2023 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Variação Linguística e Gêneros Textuais' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'LANGUAGES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Língua Portuguesa', 'Variação Linguística e Gêneros Textuais', 'variacao-linguistica-e-gêneros-textuais')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 18, 'Na comunicação digital contemporânea, o uso de recursos semióticos multimodais, como emojis, figurinhas e abreviações (internetês), desempenha um papel expressivo nas trocas interpessoais. Do ponto de vista dos estudos linguísticos modernos, esses fenômenos comunicativos devem ser compreendidos como:', 'C',
        'EASY', 1.52, -0.8, 0.2, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'empobrecimento semântico irreversível da norma culta da língua', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'inadequação gramatical que impede a transmissão eficaz de sentido', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'adaptação contextual da língua às necessidades de agilidade e economia do meio digital', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'desvio patológico resultante da falta de leitura literária clássica', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'código artificial incompatível com as regras morfológicas do português', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A linguística contemporânea compreende as linguagens digitais e variações situacionais como recursos expressivos adequados ao contexto comunicativo de rapidez, dinamismo e multimodalidade característico da internet, e não como degradação gramatical.', 'Variação Linguística Diafásica (Situacional); Multimodalidade; Gêneros Digitais.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 142 (ENEM 2022 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2022 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2022, 'ENEM 2022 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Funções e Álgebra' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'MATHEMATICS' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Matemática', 'Funções e Álgebra', 'funcões-e-algebra')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 142, 'Uma empresa de entregas expressas cobra uma taxa fixa de R\$ 12,00 adicionada de R\$ 2,50 por quilômetro rodado. Um cliente contratou esse serviço e pagou um valor total de R\$ 67,00 pelo transporte de uma encomenda. A distância percorrida pelo veículo para realizar essa entrega foi de:', 'C',
        'EASY', 1.55, -0.45, 0.18, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '18 km', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '20 km', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '22 km', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '24 km', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '26 km', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A função afim do custo em função da distância $x$ é dada por $C(x) = 12 + 2,5x$. Sabendo que o custo total foi $67$: $12 + 2,5x = 67 \Rightarrow 2,5x = 55 \Rightarrow x = 55 / 2,5 = 22\text{ km}$.', 'Função Afim (1º Grau); Modelagem Matemática; Equações Lineares.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 103 (ENEM 2022 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2022 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2022, 'ENEM 2022 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Ecologia e Meio Ambiente' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'NATURAL_SCIENCES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Biologia', 'Ecologia e Meio Ambiente', 'ecologia-e-meio-ambiente')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 103, 'A bioacumulação ou biomagnificação trófica é o fenômeno pelo qual substâncias químicas persistentes e lipossolúveis (como certos pesticidas organoclorados e metais pesados) acumulam-se progressivamente ao longo dos níveis tróficos de uma cadeia alimentar. Em um ecossistema aquático contaminado por mercúrio, a maior concentração relativa dessa substância será encontrada no tecido de:', 'D',
        'MEDIUM', 1.78, 0.28, 0.16, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'fitoplâncton', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'zooplâncton', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'peixes herbívoros', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'peixes carnívoros de topo de cadeia', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'moluscos filtradores', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Por não serem biodegradáveis e não serem excretados pelos organismos vivos, os metais pesados acumulam-se em concentrações crescentes nos níveis tróficos superiores (magnificação trófica). Portanto, os carnívoros de topo de cadeia apresentam a maior concentração.', 'Magnificação Trófica; Bioacumulação de Metais Pesados; Cadeia Alimentar.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 120 (ENEM 2022 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2022 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2022, 'ENEM 2022 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Termodinâmica e Calorimetria' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'NATURAL_SCIENCES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Física', 'Termodinâmica e Calorimetria', 'termodinâmica-e-calorimetria')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 120, 'Um bloco de gelo de 200 g à temperatura de $0^\circ\text{C}$ é colocado em um calorímetro ideal e aquecido até se transformar completamente em água líquida a $0^\circ\text{C}$. Sabendo que o calor latente de fusão do gelo é $L_f = 80\text{ cal/g}$, a quantidade total de calor necessária para essa transformação de fase é de:

![Curva de Aquecimento da Água](/assets/questions/2022_q120_calorimetria.webp)', 'C',
        'EASY', 1.82, 0.1, 0.15, 'ACTIVE',
        '/assets/questions/2022_q120_calorimetria.webp', 'Gráfico de Curva de Aquecimento da Água mostrando variação de temperatura em função do calor recebido', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '1 600 cal', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '8 000 cal', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '16 000 cal', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '24 000 cal', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '32 000 cal', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A quantidade de calor latente para mudança de fase sem variação de temperatura é dada por $Q = m \cdot L_f$. Substituindo os dados: $Q = 200\text{ g} \times 80\text{ cal/g} = 16\,000\text{ cal}$.', 'Calorimetria; Calor Latente de Fusão; Mudança de Estado Físico.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 70 (ENEM 2022 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2022 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2022, 'ENEM 2022 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Geografia Urbana e Agrária' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'HUMANITIES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Geografia', 'Geografia Urbana e Agrária', 'geografia-urbana-e-agraria')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 70, 'O processo de modernização conservadora da agricultura brasileira, intensificado a partir da década de 1970 com a expansão dos pacotes tecnológicos da Revolução Verde no Centro-Oeste, resultou em profundas transformações socioespaciais. Dentre os principais impactos socioeconômicos decorrentes dessa dinâmica no campo, destaca-se:', 'C',
        'MEDIUM', 1.6, 0.4, 0.19, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'a desconcentração fundiária e ampliação da agricultura familiar de subsistência', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'o aumento da demanda por mão de obra não qualificada no cultivo da soja', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'a intensificação do êxodo rural e a concentração de terras em grandes propriedades mecanizadas', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'a erradicação definitiva dos conflitos agrários nas áreas de fronteira agrícola', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'a redução do desmatamento e preservação integral dos ecossistemas de Cerrado', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A mecanização intensiva da lavoura e a expansão do agronegócio de grãos substituíram a mão de obra no campo, gerando desemprego estrutural, expropriação de pequenos posseiros e aceleração da migração para as periferias urbanas (êxodo rural).', 'Modernização Conservadora; Revolução Verde; Estrutura Fundiária Brasileira; Êxodo Rural.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 32 (ENEM 2022 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2022 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2022, 'ENEM 2022 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Literatura Brasileira e Arte' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'LANGUAGES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Literatura', 'Literatura Brasileira e Arte', 'literatura-brasileira-e-arte')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 32, 'O Manifesto Antropófago (1928), escrito por Oswald de Andrade, propõe metaforicamente a deglutição da cultura estrangeira e sua assimilação crítica em benefício da criação de uma arte genuinamente brasileira. Essa proposta estética modernista caracteriza-se fundamentalmente pela:', 'C',
        'MEDIUM', 1.7, 0.55, 0.17, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'rejeição purista e xenófoba a qualquer influência artística proveniente da Europa', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'imitação fidedigna dos modelos parnasianos e simbolistas portugueses', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'apropriação seletiva das vanguardas europeias ressignificadas a partir da realidade e identidade nacional', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'defesa da subordinação da arte brasileira às diretrizes culturais norte-americanas', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'recusa de temas folclóricos e indígenas na produção poética nacional', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A Antropofagia modernista não prega o isolacionismo cultural, mas sim a deglutição crítica das inovações estéticas internacionais para fundi-las à matriz identitária brasileira, criando uma arte autônoma e híbrida.', 'Modernismo de 1922; Movimento Antropofágico; Oswald de Andrade; Vanguardas Europeias.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 155 (ENEM 2021 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2021 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2021, 'ENEM 2021 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Estatística e Probabilidade' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'MATHEMATICS' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Matemática', 'Estatística e Probabilidade', 'estatistica-e-probabilidade')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 155, 'Em uma turma de 20 estudantes, as notas obtidas em uma avaliação de matemática foram: 5 alunos obtiveram nota 6,0; 8 alunos obtiveram nota 7,0; 5 alunos obtiveram nota 8,0; e 2 alunos obtiveram nota 10,0. A nota média aritmética ponderada dessa turma foi de:', 'B',
        'EASY', 1.62, 0.05, 0.18, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '7,0', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '7,3', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '7,5', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '7,8', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '8,0', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A soma ponderada das notas é: $(5 \times 6,0) + (8 \times 7,0) + (5 \times 8,0) + (2 \times 10,0) = 30 + 56 + 40 + 20 = 146$. Dividindo pelo total de 20 alunos: $\bar{x} = 146 / 20 = 7,3$.', 'Estatística Básica; Média Aritmética Ponderada; Medidas de Tendência Central.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 98 (ENEM 2021 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2021 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2021, 'ENEM 2021 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Ondulatória e Acústica' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'NATURAL_SCIENCES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Física', 'Ondulatória e Acústica', 'ondulatoria-e-acustica')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 98, 'Uma ambulância se aproxima de um observador parado com sua sirene ligada, emitindo um som de frequência constante $f_0$. Devido ao movimento relativo entre a fonte sonora e o receptor (efeito Doppler), o observador percebe o som com uma frequência $f$ que é:', 'B',
        'MEDIUM', 1.75, 0.35, 0.15, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'menor que f_0, porque o comprimento de onda aparente aumenta', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'maior que f_0, porque as frentes de onda se comprimem na direção do movimento', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'igual a f_0, pois a velocidade do som no ar permanece constante', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'nula, pois as ondas se cancelam por interferência destrutiva', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'infrassônica, independentemente da velocidade do veículo', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Na aproximação entre a fonte emissora e o observador estacionário, as frentes de onda são comprimidas espacialmente, reduzindo o comprimento de onda aparente ($\lambda'' < \lambda$). Como a velocidade de propagação no meio independe do movimento da fonte, a frequência aparente percebida pelo observador é mais alta (som mais agudo: $f'' > f_0$).', 'Ondulatória; Efeito Doppler Acústico; Frequência Aparente.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 127 (ENEM 2021 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2021 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2021, 'ENEM 2021 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Química Orgânica e Funções' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'NATURAL_SCIENCES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Química', 'Química Orgânica e Funções', 'quimica-orgânica-e-funcões')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 127, 'O paracetamol (acetaminofeno) é um dos analgésicos e antipiréticos mais consumidos no mundo. Sua estrutura molecular apresenta um anel aromático ligado a dois substituintes em posições relativas para: um grupo hidroxila ($-OH$) e um grupo acetamido ($-NH-CO-CH_3$). As funções orgânicas oxigenada e nitrogenada presentes nessa molécula são, respectivamente:

![Estrutura do Paracetamol](/assets/questions/2021_q127_quimica_organica.webp)', 'B',
        'MEDIUM', 1.8, 0.6, 0.18, 'ACTIVE',
        '/assets/questions/2021_q127_quimica_organica.webp', 'Fórmula estrutural do paracetamol destacando os grupos hidroxila fenólica e amida', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'álcool e amina', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'fenol e amida', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'éter e nitrila', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'aldeído e amida', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'ácido carboxílico e amina', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A hidroxila ($-OH$) ligada diretamente ao anel benzênico caracteriza a função Fenol (e não álcool). O nitrogênio ligado diretamente a uma carbonila ($R-CO-NH-R''$) caracteriza a função Amida (e não amina).', 'Química Orgânica; Funções Orgânicas Oxigenadas e Nitrogenadas; Fenol e Amida.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 65 (ENEM 2021 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2021 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2021, 'ENEM 2021 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Filosofia Política e Ética' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'HUMANITIES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Filosofia', 'Filosofia Política e Ética', 'filosofia-politica-e-etica')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 65, 'Na obra ''Ética a Nicômaco'', Aristóteles define a virtude moral (excelência) como uma disposição habitual de escolher o justo meio (justa medida) relativo a nós, evitando tanto o excesso quanto a falta. Segundo essa concepção filosófica, a virtude da coragem localiza-se entre quais extremos?', 'C',
        'MEDIUM', 1.58, 0.45, 0.2, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'a ambição e a apatia', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'a avareza e a prodigalidade', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'a covardia e a temeridade', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'o orgulho e a humildade', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'a inveja e o despeito', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Na ética aristotélica, a coragem é o justo meio em relação aos sentimentos de medo e audácia. A falta de coragem diante do perigo é a covardia (vício por deficiência), enquanto a audácia imprudente e excessiva é a temeridade (vício por excesso).', 'Ética Aristotélica; Teoria da Justa Medida; Virtudes Morais.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 24 (ENEM 2021 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2021 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2021, 'ENEM 2021 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Interpretação e Argumentação' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'LANGUAGES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Língua Portuguesa', 'Interpretação e Argumentação', 'interpretacao-e-argumentacao')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 24, 'Em um editorial jornalístico, o autor recorre frequentemente a operadores argumentativos (conjunções e locuções conjuntivas) para articular as teses defendidas e refutar contra-argumentos. No trecho: ''Embora os investimentos em educação básica tenham crescido na última década, os índices de proficiência leitora permanecem estagnados'', o conectivo destacado (''Embora'') estabelece entre as orações uma relação de:', 'C',
        'EASY', 1.48, -0.7, 0.19, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'consequência', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'proporcionalidade', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'concessão', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'temporalidade', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'condição', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A conjunção subordinativa ''Embora'' introduz uma oração subordinada adverbial concessiva, que expressa um fato contrário à oração principal, mas incapaz de anular ou impedir a sua realização.', 'Coesão Sequencial; Conectivos e Operadores Argumentativos; Oração Subordinada Concessiva.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 160 (ENEM 2020 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2020 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2020, 'ENEM 2020 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Matemática Financeira e Porcentagem' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'MATHEMATICS' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Matemática', 'Matemática Financeira e Porcentagem', 'matematica-financeira-e-porcentagem')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 160, 'Um consumidor deseja comprar um televisor cujo preço à vista é de R\$ 2 000,00. A loja oferece uma opção de pagamento a prazo em duas parcelas iguais: a primeira parcela de R\$ 1 000,00 é paga no ato da compra (como entrada) e a segunda parcela de R\$ 1 100,00 é paga exatamente um mês após a compra. A taxa mensal de juros simples cobrada pela loja sobre o saldo devedor financiado é de:', 'C',
        'MEDIUM', 1.85, 0.8, 0.17, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '5%', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '8%', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '10%', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '12%', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '15%', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'O preço à vista é R\$ 2 000,00. Pagando R\$ 1 000,00 de entrada, o saldo devedor real financiado é de $2000 - 1000 = 1000$ reais. Após um mês, o cliente paga R\$ 1 100,00, gerando $1100 - 1000 = 100$ reais de juros. A taxa de juros sobre o saldo devedor financiado é: $i = 100 / 1000 = 0,10 = 10\%$.', 'Matemática Financeira; Saldo Devedor Financiado; Juros Simples.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 115 (ENEM 2020 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2020 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2020, 'ENEM 2020 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Genética e Evolução' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'NATURAL_SCIENCES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Biologia', 'Genética e Evolução', 'genetica-e-evolucao')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 115, 'A teoria sintética da evolução (neodarwinismo) integra os princípios da seleção natural postulados por Charles Darwin aos conhecimentos modernos de genética mendeliana e biologia molecular. De acordo com essa teoria, a principal fonte primária geradora de nova variabilidade genética em uma população biológica é a:', 'B',
        'EASY', 1.7, -0.1, 0.16, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'deriva genética provocada por catástrofes naturais', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'mutação gênica espontânea ou induzida', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'reprodução assexuada por cissiparidade', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'migração de indivíduos entre comunidades isoladas', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'seleção artificial orientada pelo ser humano', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A mutação gênica é o único mecanismo evolutivo capaz de criar novos alelos, constituindo a fonte primária original de variabilidade genética. Os outros fatores (recombinação gênica, migração, seleção) atuam reorganizando ou selecionando a variação pré-existente.', 'Neodarwinismo; Variabilidade Genética; Mutação Gênica; Seleção Natural.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 130 (ENEM 2020 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2020 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2020, 'ENEM 2020 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Mecânica e Leis de Newton' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'NATURAL_SCIENCES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Física', 'Mecânica e Leis de Newton', 'mecânica-e-leis-de-newton')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 130, 'Um bloco homogêneo de massa $m = 4\text{ kg}$ repousa sobre uma superfície horizontal perfeitamente lisa (sem atrito). Uma força constante e horizontal $F = 12\text{ N}$ passa a atuar sobre o bloco durante um intervalo de tempo de 5 segundos. Considerando que o bloco partiu do repouso, a velocidade final atingida ao final desse intervalo é de:

![Diagrama de forças no plano](/assets/questions/2020_q130_plano_inclinado.webp)', 'C',
        'EASY', 1.65, -0.25, 0.18, 'ACTIVE',
        '/assets/questions/2020_q130_plano_inclinado.webp', 'Diagrama de corpo livre de um bloco sobre superfície horizontal submetido a força constante', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '3 m/s', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '8 m/s', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '15 m/s', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '20 m/s', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '60 m/s', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Pela Segunda Lei de Newton: $F = m \cdot a \Rightarrow a = F / m = 12 / 4 = 3\text{ m/s}^2$. Pela equação da velocidade no movimento retilíneo uniformemente variado (MRUV): $v = v_0 + a \cdot t = 0 + 3 \times 5 = 15\text{ m/s}$.', 'Dinâmica Newtoniana; 2ª Lei de Newton ($F = m \cdot a$); Cinemática Escalar (MRUV).', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 75 (ENEM 2020 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2020 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2020, 'ENEM 2020 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Cidadania e Direitos Humanos' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'HUMANITIES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'História', 'Cidadania e Direitos Humanos', 'cidadania-e-direitos-humanos')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 75, 'A promulgação da Constituição da República Federativa do Brasil de 1988, conhecida como ''Constituição Cidadã'', representou o marco jurídico e institucional da redemocratização brasileira após 21 anos de ditadura militar. Entre seus avanços democráticos fundamentais no campo dos direitos humanos e da cidadania, destaca-se:', 'B',
        'EASY', 1.5, -0.5, 0.19, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'a restrição do direito de voto exclusivamente aos cidadãos alfabetizados com renda comprovada', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'a instituição do habeas corpus e a criminalização expressa do racismo como crime inafiançável e imprescritível', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'a concentração dos poderes de emergência no Executivo federal', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'a extinção dos partidos políticos de orientação trabalhista', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'a eliminação do controle de constitucionalidade exercido pelo STF', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A Constituição de 1988 ampliou significativamente os direitos e garantias fundamentais (Art. 5º), estabelecendo o racismo como crime inafiançável e imprescritível, garantindo o sufrágio universal (incluindo o voto facultativo aos analfabetos e jovens de 16 a 17 anos) e consolidando o Estado Democrático de Direito.', 'Constituição Cidadã de 1988; Redemocratização; Direitos Fundamentais e Cidadania.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 35 (ENEM 2020 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2020 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2020, 'ENEM 2020 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Leitura e Competência Leitora' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'LANGUAGES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Língua Inglesa', 'Leitura e Competência Leitora', 'leitura-e-competência-leitora')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 35, 'In the context of modern environmental discourse, the term ''greenwashing'' refers to the deceptive marketing practice employed by corporations to persuade the public that an organization''s products, aims, and policies are environmentally friendly when, in reality, they are not. The primary objective of greenwashing is to:', 'B',
        'MEDIUM', 1.6, 0.2, 0.16, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'enhance actual environmental investments without public acknowledgment', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'mislead consumers to gain an unfair market advantage through superficial eco-claims', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'support non-profit ecological preservation projects globally', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'comply rigorously with international carbon credit protocols', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'eliminate all industrial emissions from production facilities', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'O termo ''greenwashing'' é formado pelo trocadilho com ''whitewash'' (encobrir ou disfarçar) e ''green'' (ecológico), designando a propaganda enganosa em que empresas constroem uma falsa imagem sustentável para enganar os consumidores e lucrar sem promover reais melhorias ambientais.', 'Competência Leitora em Língua Estrangeira; Vocabulário Temático; Discurso Corporativo Ambiental.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 148 (ENEM 2019 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2019 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2019, 'ENEM 2019 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Geometria Plana e Trigonometria' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'MATHEMATICS' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Matemática', 'Geometria Plana e Trigonometria', 'geometria-plana-e-trigonometria')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 148, 'Um observador situado a 60 metros de distância da base de uma torre de transmissão vertical visualiza o topo dessa torre sob um ângulo de elevação de $30^\circ$ em relação ao solo horizontal. Desprezando a altura do observador e adotando $\tan(30^\circ) \approx 0,58$, a altura estimada dessa torre é de aproximadamente:

![Torre de transmissão e triângulo retângulo](/assets/questions/2019_q148_trigonometria.webp)', 'B',
        'MEDIUM', 1.75, 0.3, 0.17, 'ACTIVE',
        '/assets/questions/2019_q148_trigonometria.webp', 'Triângulo retângulo formado por um observador, o topo de uma torre e o solo com ângulo de 30 graus', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '25,4 metros', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '34,8 metros', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '42,0 metros', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '51,9 metros', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '60,0 metros', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'No triângulo retângulo formado pela torre, o solo e a linha de visada: $\tan(30^\circ) = \text{cateto oposto} / \text{cateto adjacente} = h / 60$. Portanto: $h = 60 \times \tan(30^\circ) \approx 60 \times 0,58 = 34,8\text{ metros}$.', 'Trigonometria no Triângulo Retângulo; Razões Trigonométricas (Tangente).', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 105 (ENEM 2019 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2019 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2019, 'ENEM 2019 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Óptica Geométrica' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'NATURAL_SCIENCES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Física', 'Óptica Geométrica', 'optica-geometrica')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 105, 'A miopia é uma anomalia visual na qual a imagem de objetos distantes é focalizada antes da retina, provocando visão embaçada para objetos longe. Para corrigir essa anomalia e fazer com que os raios luminosos convirjam exatamente sobre a retina, deve-se prescrever o uso de óculos com lentes:', 'B',
        'EASY', 1.68, -0.15, 0.18, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'convergentes de bordos finos', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'divergentes', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'planas sem curvatura', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'cilíndricas reflexivas', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'bifocais convergentes', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'No olho míope, o globo ocular é excessivamente longo ou a curvatura da córnea é excessiva, fazendo com que a convergência ocorra antes da retina. O uso de lentes divergentes afasta os raios incidentes, permitindo que o foco final se forme exatamente na retina.', 'Óptica da Visão; Ametropias; Miopia e Lentes Divergentes.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 122 (ENEM 2019 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2019 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2019, 'ENEM 2019 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Físico-Química e Eletroquímica' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'NATURAL_SCIENCES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Química', 'Físico-Química e Eletroquímica', 'fisico-quimica-e-eletroquimica')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 122, 'Na clássica pilha galvânica de Daniell, eletrodos metálicos de zinco ($\text{Zn}$) e cobre ($\text{Cu}$) são imersos em soluções de seus respectivos sulfatos. Sabendo que o potencial padrão de redução do cobre ($E^\circ = +0,34\text{ V}$) é maior que o do zinco ($E^\circ = -0,76\text{ V}$), durante a descarga espontânea da pilha ocorre:

![Esquema da Pilha de Daniell](/assets/questions/2019_q122_pilha_daniel.webp)', 'C',
        'MEDIUM', 1.88, 0.75, 0.16, 'ACTIVE',
        '/assets/questions/2019_q122_pilha_daniel.webp', 'Esquema de uma pilha de Daniell com eletrodos de zinco e cobre imersos em soluções aquosas e ponte salina', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'oxidação do cobre no ânodo', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'redução dos íons Zn(2+) no cátodo', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'oxidação do zinco metálico no ânodo e redução dos íons Cu(2+) no cátodo', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'migração de elétrons do cobre para o zinco pelo circuito externo', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'aumento contínuo da massa da barra de zinco', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A espécie química de maior potencial de redução (o cobre, $E^\circ = +0,34\text{ V}$) sofre redução no cátodo (polo positivo): $\text{Cu}^{2+} + 2e^- \rightarrow \text{Cu}_{(s)}$. A de menor potencial de redução (o zinco, $E^\circ = -0,76\text{ V}$) sofre oxidação no ânodo (polo negativo): $\text{Zn}_{(s)} \rightarrow \text{Zn}^{2+} + 2e^-$.', 'Eletroquímica; Pilha de Daniell; Potenciais Padrão de Redução; Ânodo e Cátodo.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 80 (ENEM 2019 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2019 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2019, 'ENEM 2019 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Cartografia e Climatologia' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'HUMANITIES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Geografia', 'Cartografia e Climatologia', 'cartografia-e-climatologia')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 80, 'O fenômeno climático de grande escala conhecido como El Niño caracteriza-se pelo aquecimento anômalo das águas superficiais do Oceano Pacífico Equatorial. No Brasil, esse fenômeno meteorológico acarreta historicamente impactos climáticos expressivos, provocando tipicamente:', 'B',
        'EASY', 1.55, 0.1, 0.19, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'secas severas no Sul e enchentes recordes no semiárido nordestino', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'chuvas intensas e inundações na Região Sul e estiagem prolongada em partes das regiões Norte e Nordeste', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'redução generalizada das temperaturas em todo o território nacional', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'nevascas frequentes na Região Centro-Oeste', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'estabilidade climática absoluta sem alterações no regime pluvial', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A alteração na circulação atmosférica (célula de Walker) causada pelo El Niño bloqueia as frentes frias no Sul do Brasil (provocando chuvas torrenciais e cheias de rios) e inibe a formação de nuvens de chuva no Semiárido Nordestino e no leste da Amazônia.', 'Climatologia Dinâmica; Fenômeno El Niño; Regime Pluviométrico Brasileiro.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;

-- Item 40 (ENEM 2019 — Prova Regular (Caderno Azul))
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = 2019 AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES (2019, 'ENEM 2019 — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = 'Filosofia Moderna e Iluminismo' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = 'HUMANITIES' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, 'Filosofia', 'Filosofia Moderna e Iluminismo', 'filosofia-moderna-e-iluminismo')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, 40, 'No ensaio ''Resposta à pergunta: O que é o Esclarecimento?'' (1784), Immanuel Kant define o Iluminismo como a saída do ser humano de sua menoridade, da qual ele próprio é culpado. A menoridade é a incapacidade de fazer uso de seu próprio entendimento sem a direção de outro. A divisa do Iluminismo preconizada por Kant é:', 'B',
        'MEDIUM', 1.65, 0.4, 0.18, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '''Homo homini lupus'' - O homem é o lobo do homem', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '''Sapere aude!'' - Ouse saber, tenha coragem de fazer uso de seu próprio entendimento', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '''Cogito, ergo sum'' - Penso, logo existo', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '''Tabula rasa'' - A mente como uma folha em branco', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '''Panem et circenses'' - Pão e circo', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Kant conclama a humanidade a romper com a tutela intelectual e a submissão cega à autoridade religiosa ou política com a célebre divisa em latim ''Sapere aude!'' (''Ouse saber!'' ou ''Tenha a coragem de servir-te de tua própria razão!'').', 'Filosofia Iluminista; Immanuel Kant; Autonomia da Razão; Esclarecimento (Aufklärung).', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;
    END IF;
END $$;
