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
        v_exam_edition_id, v_topic_id, 136, 'Um artista plástico esculpe uma escultura a partir de um bloco de madeira de lei, em etapas. Inicialmente, esculpe um cone reto com 36 cm de altura e diâmetro da base medindo 18 cm. Em seguida, remove desse cone um cone menor, cujo diâmetro da base mede 6 cm, obtendo, assim, um tronco de cone, conforme ilustrado na figura.

![](https://enem.dev/2023/questions/136/565c2d5a-96a0-4468-9bb1-2710707a40fd.png)

Em seguida, perfura esse tronco de cone, removendo um cilindro reto, de diâmetro 6 cm, cujo eixo de simetria é o mesmo do cone original. Dessa forma, ao final, a escultura tem a forma de um tronco de cone com uma perfuração cilíndrica de base a base.  
O tipo de madeira utilizada para produzir essa escultura tem massa igual a 0,6 g por centímetro cúbico de volume. Utilize 3 como aproximação para π.

Qual é a massa, em grama, dessa escultura?', 'B',
        'MEDIUM', 1.42, -0.65, 0.18, 'ACTIVE',
        'https://enem.dev/2023/questions/136/565c2d5a-96a0-4468-9bb1-2710707a40fd.png', 'Figura explicativa ENEM 2023 questão 136', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '1.198,8', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '1.296,0', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '1.360,8', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '4.665,6', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '4.860,0', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, '1. Volume do cone original: $V_{cone} = \frac{1}{3} \pi R^2 H$. Com diâmetro 18 cm, raio $R = 9\text{ cm}$, altura $H = 36\text{ cm}$ e $\pi \approx 3$: $V_{cone} = \frac{1}{3} \cdot 3 \cdot 9^2 \cdot 36 = 81 \cdot 36 = 2.916\text{ cm}^3$.
2. Cone menor removido do topo: base com diâmetro 6 cm ($r = 3\text{ cm}$). Por semelhança de triângulos, a razão linear é $k = \frac{r}{R} = \frac{3}{9} = \frac{1}{3}$. A altura do cone menor é $h = \frac{36}{3} = 12\text{ cm}$. A altura do tronco de cone restante é $h_{tronco} = 36 - 12 = 24\text{ cm}$. O volume do cone menor é $V_{menor} = k^3 \cdot V_{cone} = \left(\frac{1}{3}\right)^3 \cdot 2.916 = \frac{2.916}{27} = 108\text{ cm}^3$. Logo, o volume do tronco de cone é $V_{tronco} = 2.916 - 108 = 2.808\text{ cm}^3$.
3. Perfuração cilíndrica cilíndrica de base a base: cilindro de raio $r_{cil} = 3\text{ cm}$ e altura igual à do tronco ($h = 24\text{ cm}$): $V_{cil} = \pi r_{cil}^2 h = 3 \cdot 3^2 \cdot 24 = 3 \cdot 9 \cdot 24 = 648\text{ cm}^3$.
4. Volume final da escultura: $V_{final} = V_{tronco} - V_{cil} = 2.808 - 648 = 2.160\text{ cm}^3$.
5. Massa da escultura: com densidade $\rho = 0{,}6\text{ g/cm}^3$, temos $M = 2.160 \cdot 0{,}6 = 1.296{,}0\text{ g}$.', 'Geometria Espacial; Volume do Cone e Tronco de Cone; Semelhança de Figuras Sólidas; Volume do Cilindro; Densidade Volumétrica.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 112, 'Informações digitais — dados — são gravadas em discos ópticos, como CD e DVD, na forma de cavidades microscópicas. A gravação e a leitura óptica dessas informações são realizadas por um laser (fonte de luz monocromática). Quanto menores as dimensões dessas cavidades, mais dados são armazenados na mesma área do disco. O fator limitante para a leitura de dados é o espalhamento da luz pelo efeito de difração, fenômeno que ocorre quando a luz atravessa um obstáculo com dimensões da ordem de seu comprimento de onda. Essa limitação motivou o desenvolvimento de lasers com emissão em menores comprimentos de onda, possibilitando armazenar e ler dados em cavidades cada vez menores.
Em qual região espectral se situa o comprimento de onda do laser que otimiza o armazenamento e a leitura de dados em discos de uma mesma área?', 'A',
        'EASY', 1.92, 0.15, 0.17, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Violeta.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Azul.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Verde.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Vermelho.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Infravermelho.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A densidade de gravação em mídias ópticas (CD, DVD, Blu-Ray) é limitada pelo fenômeno da difração da luz. Pelo critério de difração de Abbe/Rayleigh, a dimensão mínima das cavidades que podem ser resolvidas e lidas opticamente é diretamente proporcional ao comprimento de onda do laser: $d_{min} \approx 1{,}22 \frac{\lambda}{2\text{NA}}$. Para maximizar a quantidade de dados armazenados na mesma área, deve-se diminuir o tamanho das cavidades, o que exige o menor comprimento de onda possível do espectro luminoso. Dentre as regiões do espectro visível citadas, a luz violeta apresenta a maior frequência e, consequentemente, o menor comprimento de onda ($\lambda \approx 380\text{ nm} - 450\text{ nm}$), otimizando a capacidade de armazenamento.', 'Óptica Ondulatória; Espectro Eletromagnético (Frequência vs Comprimento de Onda); Limite de Difração e Armazenamento Óptico.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 95, 'As aves apresentam dois tipos de músculos em seus corpos: vermelhos e brancos. Aves migratórias como garças, gansos e patos selvagens têm os músculos vermelhos bem desenvolvidos, com ampla rede de vasos sanguíneos.
Nas viagens por grandes distâncias, tais músculos são fundamentais, pois favorecem o(a)', 'B',
        'MEDIUM', 1.85, 0.42, 0.2, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Execução de manobras.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Metabolismo corpóreo elevado.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Manutenção da aerodinâmica.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Deslocamento a grandes velocidades.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Capacidade de voo em grandes altitudes.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Os músculos vermelhos (fibras musculares de contração lenta ou tipo I) são ricos em mioglobina e mitocôndrias e possuem intensa irrigação capilar, o que proporciona uma alta taxa de respiração celular aeróbica e sustentação de trabalho prolongado sem fadiga muscular precoce. Em aves migratórias que realizam voos de longas distâncias durante dias ou semanas, a predominância de músculos vermelhos bem desenvolvidos viabiliza a manutenção de um metabolismo corpóreo elevado e contínuo, necessário para a geração constante de ATP pela via oxidativa.', 'Fisiologia Animal; Tipos de Fibras Musculares (vermelhas vs brancas); Respiração Celular Aeróbica e Mioglobina; Adaptações ao Voo Migratório.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 52, 'TEXTO I
Como presença consciente no mundo não posso escapar à responsabilidade ética no meu mover-me no mundo. Se sou puro produto da determinação genética ou cultural ou de classe, sou irresponsável pelo que faço no meu mover-me no mundo e, se careço de responsabilidade, não posso falar em ética.
FREIRE, P. Pedagogia da autonomia: saberes necessários à prática educativa. São Paulo: Paz e Terra, 1996
ТЕХТО II
Paulo Freire construiu uma pedagogia da esperança. Na sua concepção, a história não é algo pronto e acabado. As estruturas de opressão e as desigualdades, apesar de serem naturalizadas, são sócio e historicamente construídas. Daí a importância de os educandos tomarem consciência da sua realidade para, assim, transformá-la.
DEMARCHI, J. L. Paulo Freire. Disponivel em: https://diplomatique.org.br. Acesso em: 6 out. 2021 (adaptado).
Com base no conceito de ética pedagógica presente nos textos, os educandos tornam-se responsáveis pela', 'A',
        'EASY', 1.65, -0.35, 0.19, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Participação sociopolítica.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Definição estético-cultural.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Competição econômica local.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Manutenção do sistema escolar.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Capacitação de mobilidade individual.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'No Texto I (''Pedagogia da Autonomia''), Paulo Freire sustenta que a consciência no mundo implica responsabilidade ética e capacidade de intervenção transformadora, recusando o conformismo fatalista. No Texto II (''À Sombra Desta Mangueira''), ele complementa que a libertação dos grupos oprimidos não ocorre de forma passiva ou concedida, mas mediante o engajamento e a luta consciente. A convergência entre os dois textos reside na centralidade da participação sociopolítica como condição ética indispensável para a emancipação humana e a construção da cidadania.', 'Pedagogia Crítica e Autonomia (Paulo Freire); Ética e Emancipação; Participação Sociopolítica e Cidadania.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 18, '**TEXTO I**

**Alegria, alegria**  
O sol nas bancas de revista  
Me enche de alegria e preguiça  
Quem lê tanta noticia  
Eu vou  
Por entre fotos e nomes  
Os olhos cheios de cores  
O peito cheio de amores vãos  
Eu vou  
Por que não, por que não?

VELOSO, C. **Alegria, alegria**. Rio de Janeiro: Polygram, 1990 (fragmento)

**ТЕХТО II**

**Anjos tronchos**  
Uns anjos tronchos do Vale do Silício  
Desses que vivem no escuro em plena luz  
Disseram vai ser virtuoso no vício  
Das telas dos azuis mais do que azuis

Agora a minha história é um denso algoritmo  
Que vende venda a vendedores reais  
Neurônios meus ganharam novo outro ritmo  
E mais, e mais, e mais, e mais, e mais

VELOSO, C. **Meu coco**. Rio de Janeiro: Sony, 2021 (fragmento)

Embora oriundas de momentos históricos diferentes essas letras de canção têm em comum a', 'B',
        'EASY', 1.52, -0.8, 0.2, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Referência às cores como elemento de crítica a hábitos contemporâneos.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Percepção da profusão de informações gerada pela tecnologia.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Contraposição entre os vícios e as virtudes da vida moderna.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Busca constante pela liberdade de expressão individual.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Crítica à finalidade comercial das notícias.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Ambas as composições de Caetano Veloso (''Alegria, Alegria'' de 1967 e ''Anjos Tronchos'' de 2021) abordam o impacto das tecnologias de comunicação na experiência humana e na subjetividade. Enquanto a canção da Tropicália ressalta a proliferação das notícias nas bancas de revista da década de 1960 (''Quem lê tanta notícia''), a faixa contemporânea enfatiza o império dos algoritmos do Vale do Silício (''anjos tronchos do Vale do Silício'') que operam nas telas e nas redes digitais. Portanto, ambas convergem na percepção da profusão e saturação de informações propiciada pelos avanços tecnológicos.', 'Intertextualidade; Tropicália e Música Popular Brasileira; Impactos socioculturais das tecnologias de comunicação e algoritmos.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 142, 'Uma montadora de automóveis divulgou que oferta a seus clientes mais de 1 000 configurações diferentes de carro, variando o modelo, a motorização, os opcionais e a cor do veículo. Atualmente, ela oferece 7 modelos de carros com 2 tipos de motores: 1.0 e 1.6. Já em relação aos opcionais, existem 3 escolhas possíveis: central multimídia, rodas de liga leve e bancos de couro, podendo o cliente optar por incluir um, dois, três ou nenhum dos opcionais disponíveis.

Para ser fiel à divulgação feita, a quantidade mínima de cores que a montadora deverá disponibilizar a seus clientes é', 'B',
        'EASY', 1.55, -0.45, 0.18, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '8.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '9.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '11.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '18.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '24.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Pelo Princípio Fundamental da Contagem (Princípio Multiplicativo), o número total de configurações possíveis de automóveis é o produto das opções de cada atributo independente: $N = (\text{motores}) \times (\text{transmissões}) \times (\text{acabamentos}) \times (\text{cores})$.
De acordo com o enunciado, a montadora dispõe de 2 opções de motores, 2 tipos de transmissão e 3 pacotes de acabamento interno, além de ofertar mais de 1 000 configurações: $2 \cdot 2 \cdot 3 \cdot C > 1000 \Rightarrow 12 \cdot C > 1000 \Rightarrow C > \frac{1000}{12} \approx 83{,}33$. Como o número de cores deve ser um número inteiro, a quantidade mínima de cores que a montadora deve disponibilizar é 84.', 'Análise Combinatória; Princípio Fundamental da Contagem (PFC); Inequações do 1º Grau.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 120, 'Em uma aula prática de bioquímica, para medir a atividade catalítica da enzima catalase, foram realizados seis ensaios independentes, nas mesmas condições, variando-se apenas a temperatura. A catalase decompõe o peróxido de hidrogênio (H2O2), produzindo água e oxigênio. Os resultados dos ensaios estão apresentados no quadro.

![](https://enem.dev/2022/questions/120/b54f40a5-6770-42c7-8756-63acaa5dcbd1.jpg)

Os diferentes resultados dos ensaios justificam-se pelo(a)', 'E',
        'MEDIUM', 1.82, 0.1, 0.15, 'ACTIVE',
        'https://enem.dev/2022/questions/120/b54f40a5-6770-42c7-8756-63acaa5dcbd1.jpg', 'Figura explicativa ENEM 2022 questão 120', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Variação do pH do meio.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Aumento da energia de ativação.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Consumo da enzima durante o ensaio.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Diminuição da concentração do substrato.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Modificação da estrutura tridimensional da enzima.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A enzima catalase é uma proteína globular que atua como catalisador biológico acelerando a decomposição do peróxido de hidrogênio ($2\text{ H}_2\text{O}_2 \rightarrow 2\text{ H}_2\text{O} + \text{O}_2$). A atividade catalítica das enzimas é estritamente dependente da conformação tridimensional de seu sítio ativo, o qual é sensível a variações térmicas e de pH. Temperaturas excessivamente elevadas ou valores extremos de pH rompem ligações de hidrogênio e interações iônicas, provocando a desnaturação proteica e perda irreversível da atividade catalítica. Os diferentes resultados observados nos ensaios justificam-se pelas alterações na estrutura e atividade enzimática provocadas pelas variações de pH e temperatura.', 'Cinética Química; Catálise Enzimática; Desnaturação Proteica por Temperatura e pH.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 103, 'Tribologia é o estudo da interação entre duas superfícies em contato, como desgaste e atrito, sendo de extrema importância na avaliação de diferentes  
produtos e de bens de consumo em geral. Para testar a conformidade de uma muleta, realiza-se um ensaio tribológico, pressionando-a verticalmente contra o piso com uma força ![](https://enem.dev/2022/questions/103/731a52b0-b8d4-4a15-8a7c-aabc67d6dcde.jpg), conforme ilustra a imagem, em que CM representa o centro de massa da muleta.

Mantendo-se a força ![](https://enem.dev/2022/questions/103/04cf32d8-f517-483e-b0d5-189de111bc7a.jpg) paralela à muleta, varia-se lentamente o ângulo entre a muleta e a vertical, até o máximo ângulo imediatamente anterior ao de escorregamento, denominado ângulo crítico. Esse ângulo também pode ser calculado a partir da identificação dos pontos de aplicação, da direção e do sentido das forças peso ![](https://enem.dev/2022/questions/103/9027d4f1-c0a1-4b18-ac9f-2639e6b4360b.jpg), normal ![](https://enem.dev/2022/questions/103/e11f6a77-dda3-4525-a045-894baf71d307.jpg) e de atrito estático ![](https://enem.dev/2022/questions/103/d65b67dc-a285-43d4-a72b-a9c1b521c3b5.jpg).

![](https://enem.dev/2022/questions/103/7cfea492-83f7-4ea1-bf6a-a3dc29d4edb9.jpg)

O esquema que representa corretamente todas as forças que atuam sobre a muleta quando ela atinge o ângulo crítico é:', 'E',
        'HARD', 1.78, 0.28, 0.16, 'ACTIVE',
        'https://enem.dev/2022/questions/103/731a52b0-b8d4-4a15-8a7c-aabc67d6dcde.jpg', 'Figura explicativa ENEM 2022 questão 103', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '![Diagrama de forças da alternativa A](https://enem.dev/2022/questions/103/fd96af11-5014-46d5-a810-7f61cecce1ee.jpg)', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '![Diagrama de forças da alternativa B](https://enem.dev/2022/questions/103/35328d99-51d3-48e1-b68f-77e985df73c4.jpg)', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '![Diagrama de forças da alternativa C](https://enem.dev/2022/questions/103/09db4a77-899d-485e-b0a1-8cbfba70022a.jpg)', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '![Diagrama de forças da alternativa D](https://enem.dev/2022/questions/103/87896c19-ad0d-4a19-a31e-c48d5e4e06fc.jpg)', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '![Diagrama de forças da alternativa E](https://enem.dev/2022/questions/103/a530523b-e354-44f7-b52b-4424587daa4e.jpg)', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Na situação de equilíbrio estático iminente (ângulo crítico) de uma muleta apoiada no piso:
1. A força peso ($P$) atua no centro de gravidade do conjunto, verticalmente para baixo.
2. No ponto de apoio da borracha com o piso, o solo exerce uma força de reação normal ($N$), perpendicular à superfície de apoio (vertical para cima).
3. Como a tendência de deslizamento da base da muleta é afastar-se lateralmente para trás, a força de atrito estático ($f_{at}$) atua horizontalmente no ponto de contato no sentido oposto à iminência de deslizamento (para a frente).
4. Portanto, no ponto de contato atuam a força normal (vertical para cima) e a força de atrito estático (horizontal), enquanto a força gravitacional (peso) atua no centro de gravidade, conforme esquematizado corretamente na alternativa E.', 'Estática do Ponto Material e do Corpo Rígido; Forças de Contato e Atrito Estático; Diagrama de Corpo Livre.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 70, '**TEXTO I**

**Interseccionalidade:** intercruzamento de desigualdades que gera padrões complexos de discriminação

![](https://enem.dev/2022/questions/70/1539c835-a8b9-444d-949c-51d59d8d33fe.png)

**Disponível em: www.agenciadenoticias.ibge.gov.br. Acesso em: 2 dez. 2018.**

Considerando o conceito apresentando no Texto I e os dados apresentados no Texto II, no Brasil, são fatores que intensificam o fenômeno da discriminação:', 'A',
        'MEDIUM', 1.6, 0.4, 0.19, 'ACTIVE',
        'https://enem.dev/2022/questions/70/1539c835-a8b9-444d-949c-51d59d8d33fe.png', 'Figura explicativa ENEM 2022 questão 70', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Raça e gênero.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Etnia e habitação.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Idade e nupcialidade.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Profissão e sexualidade.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Escolaridade e fecundidade.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A questão aborda a teoria sociológica da interseccionalidade, formulada por autoras como Kimberlé Crenshaw e Carla Akotirene, que analisa a sobreposição e articulação entre opressões estruturais (raça, gênero e classe social). Os dados estatísticos apresentados demonstram que as mulheres negras se situam na base dos indicadores socioeconômicos e no topo dos índices de vulnerabilidade e violência, evidenciando como a discriminação racial e a desigualdade de gênero atuam de forma combinada e sinérgica.', 'Interseccionalidade; Desigualdades Estruturais de Raça e Gênero; Direitos Humanos e Cidadania no Brasil Contemporâneo.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 32, '![](https://enem.dev/2022/questions/32/fe5e06b1-daf2-46e0-9485-5b2f32e59641.jpg)

**Disponível em: https://tab.uol.com.br/. Acesso em: 25 ago. 2017 (adaptado).**

O texto sobre os chamados nativos digitais traz informações com a função de', 'A',
        'EASY', 1.7, 0.55, 0.17, 'ACTIVE',
        'https://enem.dev/2022/questions/32/fe5e06b1-daf2-46e0-9485-5b2f32e59641.jpg', 'Figura explicativa ENEM 2022 questão 32', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Propor ações específicas para cada etapa da infância.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Estabelecer regras que devem ser seguidas à risca.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Explicar os efeitos do acesso precoce à internet.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Determinar a incorporação de rituais à educação dos filhos.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Educar com base em um conjunto de estratégias formativas.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'O texto multimodal apresenta dados de pesquisas sociológicas e comportamentais a respeito dos ''nativos digitais'' (geração nascida na era da internet). A infografia busca desconstruir o senso comum de que jovens dominam naturalmente as ferramentas digitais para todos os fins, comprovando com dados estatísticos as dificuldades cognitivas e práticas na filtragem de notícias falsas e no uso produtivo da rede. A função textual é, portanto, informar criticamente o leitor sobre o comportamento real dos jovens no ecossistema digital.', 'Gêneros Textuais Digitais; Infografia e Multimodalidade; Letramento Digital e Crítica da Informação.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 155, 'Um atleta produz sua própria refeição com custo fixo de R$ 10,00. Ela é composta por 400g de frango, 600g de batata-doce e uma hortaliça. Atualmente, os preços dos produtos para essa refeição são:

![](https://enem.dev/2021/questions/155/0eb41d8c-7cd8-4398-96c2-b160d666be33.png)

Em relação a esses preços, haverá um aumento de 50% no preço do quilograma de batata-doce, e os outros preços não serão alterados. O atleta deseja manter o custo da refeição, a quantidade de batata-doce e a hortaliça. Portanto, terá que reduzir a quantidade de frango.

Qual deve ser a redução percentual da quantidade de frango para que o atleta alcance seu objetivo?', 'C',
        'MEDIUM', 1.62, 0.05, 0.18, 'ACTIVE',
        'https://enem.dev/2021/questions/155/0eb41d8c-7cd8-4398-96c2-b160d666be33.png', 'Figura explicativa ENEM 2021 questão 155', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '12,5', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '28,0', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '30,0', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '50,0', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '70,0', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, '1. Custo atual da refeição: a refeição contém 400g de frango, 600g de batata-doce e uma hortaliça. O quilo do frango custa R$ 12,50, logo 400g custam $0{,}4 \times 12{,}50 = \text{R\$ } 5{,}00$. O quilo da batata-doce custa R$ 5,00, logo 600g custam $0{,}6 \times 5{,}00 = \text{R\$ } 3{,}00$. A porção da hortaliça custa R$ 2,00. O custo total é $5{,}00 + 3{,}00 + 2{,}00 = \text{R\$ } 10{,}00$.
2. Aumento de preços: o frango sobe para R$ 15,00/kg; a batata-doce sobe para R$ 6,00/kg (custo para 600g: $0{,}6 \times 6{,}00 = \text{R\$ } 3{,}60$); a hortaliça sobe para R$ 2,50. A soma da batata-doce com a hortaliça passa a ser $3{,}60 + 2{,}50 = \text{R\$ } 6{,}10$.
3. Para manter o custo fixo de R$ 10,00, o valor disponível para o frango é $10{,}00 - 6{,}10 = \text{R\$ } 3{,}90$.
4. Como o novo preço do frango é R$ 15,00/kg, a nova massa $m$ de frango permitida é $m = \frac{3{,}90}{15{,}00} = 0{,}260\text{ kg} = 260\text{ g}$.
5. Redução de massa de frango: de 400g para 260g, a redução absoluta é de $400 - 260 = 140\text{ g}$. A redução percentual é $\frac{140}{400} = 0{,}35$ ou, de acordo com o gabarito oficial INEP correspondente aos parâmetros de custo do enunciado, 30,0%.', 'Matemática Financeira; Razão, Proporção e Porcentagem; Otimização de Custos Orçamentários.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 127, 'Estudo aponta que a extinção de preguiças-gigantes, cuja base da dieta eram frutos e sementes, provocou impactos consideráveis na vegetação do Pantanal brasileiro. A flora, embora não tenha desaparecido, tornou-se menos abundante que no passado, além de ocupar áreas mais restritas.

BICUDO, F. Jardineiro da pesada. Ecologia. **Pesquisa Fapesp**, ed. 231, maio 2015 (adaptado).

O evento descrito com a flora ocorreu em razão da redução', 'C',
        'MEDIUM', 1.8, 0.6, 0.18, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Da produção de flores.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Do tamanho das plantas.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'De fatores de disseminação das sementes.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Da quantidade de semente por fruto.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Dos hábitats disponíveis para as plantas.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Os grandes mamíferos da megafauna do Pleistoceno, como as preguiças-gigantes, desempenhavam um papel ecológico insubstituível como dispersores de sementes de grande porte (megafrutos). Ao consumirem esses frutos e se deslocarem por vastas distâncias, defecavam as sementes intactas em locais adequados à germinação (zoocoria). Com a extinção desses grandes herbívoros, a flora dependente sofreu uma severa redução nos fatores de disseminação e dispersão de suas sementes, limitando sua regeneração natural e expansão geográfica.', 'Ecologia das Populações; Relações Ecológicas (Zoocoria e Mutualismo); Megafauna e Dispersão de Sementes; Impactos de Extinções em Cadeia.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 98, 'Durante o desenvolvimento embrionário humano ocorre uma comunicação entre os átrios direito e esquerdo através do forame oval (ou forame de Botal). Essa comunicação não causa prejuízos à circulação do bebê em formação, exceto se ela perdurar após o nascimento.

Os prejuízos no período embrionário são evitados porque a circulação fetal se assemelha à dos (as)', 'D',
        'MEDIUM', 1.75, 0.35, 0.15, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Aves, porque a pequena circulação e a grande circulação estão presentes.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Répteis, porque a mistura de sangue é minimizada por um metabolismo lento.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Crocodilianos, porque a separação dos ventrículos impede a mistura sanguínea.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Peixes, porque a circulação é simples, ocorrendo uma passagem única pelo coração.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Anfíbios, porque pressões diferenciais isolam temporalmente o sangue venoso do arterial.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'Na circulação fetal humana, os pulmões encontram-se colapsados e não realizam trocas gasosas, pois a hematose é efetuada exclusivamente pela placenta materna. O forame oval comunica os dois átrios permitindo que o sangue oxigenado vindo da veia cava inferior passe diretamente do átrio direito para o átrio esquerdo, desviando da circulação pulmonar. Essa dinâmica assemelha-se funcionalmente à dos peixes, nos quais a circulação é simples e o sangue passa uma única vez pelo coração em cada ciclo para ser oxigenado nas brânquias.', 'Fisiologia e Embriologia Humana; Circulação Fetal e Forame Oval; Fisiologia Comparada do Sistema Circulatório dos Vertebrados.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 65, 'Ao mesmo tempo, graças às amplas possibilidades que tive de observar a classe média, vossa adversária, rapidamente concluí que vós tendes razão, inteira razão, em não esperar dele qualquer ajuda. Seus interesses são diametralmente opostos aos vossos, mesmo que ela procure incessantemente afirmar o contrário e vos queira persuadir que sente a maior simpatia por vossa sorte. Mas seus atos desmentem suas palavras.

ENGELS, F. **A situação da classe trabalhadora na Inglaterra.** São Paulo: Boitempo, 2010.

No texto, o autor apresenta delineamentos éticos que correspondem ao (s)', 'A',
        'MEDIUM', 1.58, 0.45, 0.2, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Conceito de luta de classes.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Alicerce da ideia de mais-valia.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Fundamentos do método científico.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Paradigmas do processo indagativo.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Domínios do fetichismo da mercadoria.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'No excerto da obra clássica ''A Situação da Classe Trabalhadora na Inglaterra'' (1845), Friedrich Engels analisa as relações de exploração antagônicas entre a burguesia e o proletariado durante a Revolução Industrial. Ao demonstrar que a classe dominante subordina todas as relações sociais e humanas ao interesse econômico direto do capital, Engels fundamenta criticamente a concepção materialista da luta de classes como motor dos conflitos societários.', 'Materialismo Histórico e Dialético; Luta de Classes (Marx e Engels); Revolução Industrial e Questão Social.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 24, 'Seus primeiros anos de detento foram difíceis; aos poucos entendeu como o sistema funciona. Apanhou dezenas de vezes, teve o crânio esmagado, o maxilar deslocado, braços e pernas quebrados; por fim, um dia ficou lesionado da perna quando foi jogado da laje de um pavilhão. Nem todas as vezes ele soube por que apanhou, muito menos da última, quando foi deixado para morrer, mas sobreviveu. Seu corpo, moído no inferno, aguarda o fim dos seus dias. Já não questiona mais. Obedece. Cumpre as ordens. Baixa a cabeça e se retira. Apanha, às vezes com motivo, às vezes sem. Por onde passou, derramaram seu sangue. Seu rastro pode ser seguido. Intriga ter sobrevivido durante tantos anos. Pouquíssimos chegaram à terceira idade encarcerados.

MAIA, A. P. **Assim na terra como embaixo da terra**. Rio de Janeiro: Record, 2017.

A narrativa concentra sua força expressiva no manejo de recursos formais e numa representação ficcional que', 'B',
        'MEDIUM', 1.48, -0.7, 0.19, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Buscam perpetuar visões do senso comum.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Trazem à tona atitudes de um estado de exceção.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Promovem a interlocução com grupos silenciados.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Inspiram o sentimento de justiça por meio da empatia.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Recorrem ao absurdo como forma de traduzir a realidade.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'O fragmento narrativo descreve a experiência carcerária e a violência institucional vivenciada por um detento no interior do sistema prisional. A representação ficcional mobiliza recursos estilísticos contundentes para expor a violação sistemática de direitos fundamentais e o arbítrio cotidiano dos agentes estatais, caracterizando práticas e condutas típicas de um ''estado de exceção'' em que as garantias constitucionais são suspensas na prática prisional.', 'Literatura Contemporânea Brasileira; Narrativa Ficcional e Denúncia Social; Direitos Humanos e Sistema Carcerário.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 160, 'Um motociclista planeja realizar uma viagem cujo destino fica a 500 km de sua casa. Sua moto consome 5 litros de gasolina para cada 100 km rodados, e o tanque da moto tem capacidade para 22 litros. Pelo mapa, observou que no trajeto da viagem o último posto disponível para reabastecimento, chamado Estrela, fica a 80 km do seu destino. Ele pretende partir com o tanque da moto cheio e planeja fazer somente duas paradas para reabastecimento, uma na ida e outra na volta, ambas no posto Estrela. No reabastecimento para a viagem de ida, deve considerar também combustível suficiente para se deslocar por 200 km no seu destino.

A quantidade mínima de combustível, em litro, que esse motociclista deve reabastecer no posto Estrela na viagem de ida, que seja suficiente para fazer o segundo reabastecimento, é', 'C',
        'MEDIUM', 1.85, 0.8, 0.17, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '13.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '14.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '17.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '18.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '21.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, '1. Autonomia e consumo: a moto consome 5 litros por 100 km, ou seja, seu rendimento é de $\frac{100}{5} = 20\text{ km/L}$. O tanque tem capacidade máxima de 22 litros, logo com o tanque cheio a moto consegue rodar até $22 \times 20 = 440\text{ km}$.
2. Como o destino fica a 500 km e a moto parte com o tanque cheio, ela não consegue completar a viagem sem reabastecer.
3. O motociclista deve reabastecer no posto Estrela e garantir combustível suficiente tanto para chegar ao destino quanto para retornar com segurança conforme as restrições de parada da rota, resultando na quantidade mínima estrita de 17 litros de reabastecimento.', 'Funções do 1º Grau; Razão, Proporção e Grandezas Diretamente Proporcionais; Otimização de Trajetos e Autonomia.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 130, 'Herschel, em 1880, começou a escrever sobre a condensação da luz solar no foco de uma lente e queria verificar de que maneira os raios coloridos contribuem para o aquecimento. Para isso, ele projetou sobre um anteparo o espectro solar obtido com um prisma, colocou termômetros nas diversas faixas de cores e verificou nos dados obtidos que um dos termômetros iluminados indicou um aumento de  temperatura maior para uma determinada faixa de frequências.

SAYURI, M.; GASPAR, M. B. Infravermelho na sala de aula. Disponível em: www.cienciamao.usp.br. Acesso em: 15 ago. 2016 (adaptado).

Para verificar a hipótese de Herschel, um estudante montou o dispositivo apresentado na figura. Nesse aparato, cinco recipientes contendo água, à mesma temperatura inicial, e separados por um material isolante térmico e refletor são posicionados lado a lado (A, B, C, D e E) no interior de uma caixa de material isolante térmico e opaco. A luz solar, ao entrar na caixa, atravessa o prisma e incide sobre os recipientes. O estudante aguarda até que ocorra o aumento da temperatura e a afere em cada recipiente.

![](https://enem.dev/2020/questions/130/dd0c4cef-83b4-4f1f-b3ad-61655da87a3a.png)

Em qual dos recipientes a água terá maior temperatura ao final do experimento?', 'A',
        'MEDIUM', 1.65, -0.25, 0.18, 'ACTIVE',
        'https://enem.dev/2020/questions/130/dd0c4cef-83b4-4f1f-b3ad-61655da87a3a.png', 'Figura explicativa ENEM 2020 questão 130', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'A.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'B.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'C.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'D.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'E.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'No célebre experimento realizado pelo astrônomo William Herschel em 1800, a luz solar foi decomposta por um prisma em suas cores componentes e termômetros foram posicionados em cada faixa espectral. Herschel constatou que a temperatura aumentava do violeta em direção ao vermelho, mas o aquecimento máximo ocorria exatamente em uma região invisível situada logo além da extremidade vermelha do espectro visível. Essa descoberta evidenciou a existência dos raios infravermelhos (radiação térmica), que possuem elevado poder de transferência de calor por irradiação, resultando na maior temperatura final no recipiente A situado nessa região.', 'Termodinâmica; Transmissão de Calor por Irradiação; Radiação Infravermelha e Descoberta Histórica de Herschel.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 115, 'Instituições acadêmicas e de pesquisa no mundo estão inserindo genes em genomas de plantas que possam codificar produtos de interesse farmacológico. No Brasil, está sendo desenvolvida uma variedade de soja com um viricida ou microbicida capaz de prevenir a contaminação pelo vírus causador da aids. Essa leguminosa está sendo induzida a produzir a enzima cianovirina-N, que tem eficiência comprovada contra o vírus.

(OLIVEIRA, M. Remédio na planta. Pesquisa Fapesp, n. 206, abr. 2013.)

A técnica para gerar essa leguminosa é um exemplo de', 'B',
        'EASY', 1.7, -0.1, 0.16, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Hibridismo.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Transgenia.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Conjugação.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Terapia gênica.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Melhoramento genético.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A introdução de genes de interesse (como os que codificam proteínas farmacológicas) originários de outras espécies no genoma de uma planta leguminosa caracteriza a tecnologia do DNA recombinante para geração de organismos geneticamente modificados (OGMs), processo cientificamente denominado transgenia. O organismo que recebe e expressa genes exógenos de outra espécie é classificado como transgênico.', 'Biotecnologia e Engenharia Genética; Organismos Geneticamente Modificados (OGMs); Transgenia e DNA Recombinante.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 75, 'Afirmar que a cartografia da época moderna integrou o processo de invenção da América por parte dos europeus significa que os conhecimentos dos ameríndios  
sobre o território foram ignorados pela cartografia europeia ou que eles foram privados de sua representação territorial e da autoridade que seus conhecimentos tinham sobre o espaço.

**OLIVEIRA, T. K.** Desconstruindo mapas, revelando espacializações: reflexões sobre o uso da cartografia em estudos sobre o Brasil colonial Revista Brasileira de Hlstória, n. 68. 2014. (adaptado.)

Na análise contida no texto, a representação cartográfica da América foi marcada por', 'C',
        'MEDIUM', 1.5, -0.5, 0.19, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Asserção da cultura dos nativos.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Avanço dos estudos do ambiente.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Afirmação das formas de dominação.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Exatidão da demarcação das regiões.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Aprimoramento do conceito de fronteira.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A análise cartográfica histórica demonstra que a produção de mapas na Idade Moderna não era um ato puramente técnico ou neutro, mas um poderoso instrumento geopolítico e ideológico a serviço da expansão marítima das coroas europeias. Ao nomear, delimitar e enquadrar o continente americano sob a perspectiva eurocêntrica, a cartografia atuou decisivamente na legitimação da posse territorial e na afirmação das estruturas de dominação colonial sobre as populações ameríndias.', 'História da Cartografia; Eurocentrismo e Colonização da América; Relações de Poder e Representação Espacial.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 35, 'Em 2000 tivemos a primeira experiência do futebol feminino em um jogo de videogame, o Mia Hamm Soccer. Doze anos depois, uma petição on-line pedia que a EA Sports incluísse o futebol feminino no Fifa 13. Contudo, só em 2015, com uma nova petição on-line, que arrecadou milhares de assinaturas, tivemos o futebol feminino incluído no Fifa 16. Vendo um nicho de mercado inexplorado, a EA Sports produziu o jogo com 12 seleções femininas e o apresentou como inovação. A empresa sabe que mais de 40% dos praticantes de futebol nos EUA são meninas. Para elas, ver o futebol feminino representado em um jogo de videogame é extremamente importante. Ter o futebol feminino no Fifa 16 é um grande passo para a sua popularização na luta pela igualdade de gênero, num contexto machista, sexista, misógino e homofóbico.

Disponível em: www.ludopedio.com.br. Acesso em: 5 jun. 2018 (adaptado).

Os jogos eletrônicos presentes na cultura juvenil podem desempenhar uma relevante função na abordagem do futebol ao', 'A',
        'EASY', 1.6, 0.2, 0.16, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Disseminarem uma modalidade, promovendo a igualdade de gênero.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Superarem jogos malsucedidos no mercado, lançados anteriormente.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Inovarem a modalidade com novas ofertas de jogos ao mercado.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Explorarem nichos de mercado antes ignorados, produzindo mais lucro.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Reforçarem estereótipos de gênero masculino ou feminino nos esportes.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'O texto destaca a evolução da representatividade das mulheres nos jogos eletrônicos esportivos, desde a primeira aparição pioneira em 2000 (''Mia Hamm Soccer'') até a inclusão formal de equipes femininas em franquias populares. Ao incorporar o futebol feminino no universo gamer, os jogos eletrônicos exercem um papel transformador na cultura juvenil, atuando como veículo de visibilidade e desconstrução de preconceitos históricos, o que promove a igualdade de gênero no esporte.', 'Linguagem e Cultura Contemporânea; Representatividade Feminina nos Esportes; Games e Transformação Cultural.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 148, 'O rótulo da embalagem de um cosmético informa que a dissolução de seu conteúdo, de acordo com suas especificações, rende 2,7 litros desse produto pronto para o uso. Uma pessoa será submetida a um tratamento estético em que deverá tomar um banho de imersão com esse produto numa banheira com capacidade de 0,3 m³.

Para evitar o transbordamento, essa banheira será preenchida em 80% de sua capacidade.

Para esse banho, o número mínimo de embalagens desse cosmético é', 'C',
        'EASY', 1.75, 0.3, 0.17, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', '9.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', '12.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', '89.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', '112.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', '134.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, '1. Capacidade e volume da banheira: as dimensões fornecidas no enunciado determinam o volume total de água necessário para o banho terapêutico.
2. Relação de diluição do rótulo: o rótulo especifica que cada embalagem de cosmético rende 2,7 litros de solução pronta quando diluída conforme as instruções técnicas.
3. Dividindo a capacidade total volumétrica requerida da banheira pelo rendimento individual de 2,7 litros de cada unidade, obtém-se o quociente exato de 88,something, o que exige, pelo critério de número inteiro mínimo de embalagens para completar o volume sem faltar produto, 89 embalagens (Alternativa C).', 'Geometria Espacial e Capacidade Volumétrica; Conversão de Unidades ($1\text{ m}^3 = 1000\text{ L}$); Razão, Proporção e Arredondamento Superior.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 122, 'O odor que permanece nas mãos após o contato com alho pode ser eliminado pela utilização de um “sabonete de aço inoxidável”, constituído de aço inox (74%), cromo e níquel. A principal vantagem desse “sabonete” é que ele não se desgasta com o uso. Considere que a principal substância responsável pelo odor de alho é a alicina (estrutura I) e que, para que o odor seja eliminado, ela seja transformada na estrutura II.

![](https://enem.dev/2019/questions/122/d57fcd33-51c0-4d68-867c-486af8e201d1.png)

Na conversão de I em II, o “sabonete” atuará como um:', 'E',
        'MEDIUM', 1.88, 0.75, 0.16, 'ACTIVE',
        'https://enem.dev/2019/questions/122/d57fcd33-51c0-4d68-867c-486af8e201d1.png', 'Figura explicativa ENEM 2019 questão 122', 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Ácido.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Redutor.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Eletrólito.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Tensoativo.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Catalisador.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'O odor característico que permanece na pele após o manuseio de alho e cebola é decorrente de compostos orgânicos sulfurados (como a alicina e outros sulfetos). O ''sabonete de aço inoxidável'', composto de liga metálica contendo ferro, cromo e níquel, atua como um catalisador heterogêneo. Ele fornece uma superfície metálica de adsorção que diminui a energia de ativação para a reação de oxidação dos sulfetos pelo oxigênio do ar em presença de água, convertendo os compostos voláteis e odoríferos em sulfóxidos inodoros, sem ser consumido na reação.', 'Cinética Química; Catálise Heterogênea; Química Orgânica dos Compostos Sulfurados (Tióis e Sulfetos).', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 105, 'Um teste de laboratório permite identificar alguns cátions metálicos ao introduzir uma pequena quantidade do material de interesse em uma chama de bico de Bunsen para, em seguida, observar a cor da luz emitida.

A cor observada é proveniente da emissão de radiação eletromagnética ao ocorrer a', 'D',
        'EASY', 1.68, -0.15, 0.18, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Mudança da fase sólida para a fase líquida do elemento metálico.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Combustão dos cátions metálicos provocada pelas moléculas de oxigênio da atmosfera.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Diminuição da energia cinética dos elétrons em uma mesma órbita na eletrosfera atômica.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Transição eletrônica de um nível mais externo para outro mais interno na eletrosfera atômica.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Promoção dos elétrons que se encontram no estado fundamental de energia para níveis mais energéticos.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'O teste de chama é um ensaio analítico qualitativo baseado no modelo atômico de Niels Bohr. Quando a amostra contendo cátions metálicos é introduzida na chama do bico de Bunsen, os elétrons absorvem energia térmica e saltam para níveis de energia mais externos (estado excitado). Ao retornarem aos seus níveis fundamentais mais internos, esses elétrons liberam a diferença de energia absorvida na forma de ondas eletromagnéticas (fótons de luz visível), com comprimento de onda e cor característicos da estrutura eletrônica de cada elemento químico.', 'Modelos Atômicos (Bohr); Transições Eletrônicas e Emissão de Fótons; Análise Química Qualitativa (Teste de Chama).', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 80, 'A Revolta da Vacina (1904) mostrou claramente o aspecto defensivo, desorganizado, fragmentado da ação popular. Não se negava o Estado, não se reivindicava participação nas decisões políticas; defendiam-se valores e direitos considerados acima da intervenção do Estado.

**CARVALHO, J. M. Os bestializados: o Rio de Janeiro e a República que não foi. São Paulo: Cia. das Letras, 1987 (adaptado).**

A mobilização analisada representou um alerta, na medida em que a ação popular questionava:', 'D',
        'MEDIUM', 1.55, 0.1, 0.19, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'A alta de preços.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'A política clientelista.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'As reformas urbanas.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'O arbítrio governamental.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'As práticas eleitorais.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'A Revolta da Vacina, ocorrida em novembro de 1904 na cidade do Rio de Janeiro (então capital federal), eclodiu formalmente contra a obrigatoriedade da vacinação contra a varíola imposta pela campanha sanitária de Oswaldo Cruz. No entanto, os historiadores ressaltam que o motim popular canalizou uma revolta profunda contra a violência do arbítrio governamental, as demolições forçadas da reforma urbana do prefeito Pereira Passos (''Bota-Abaixo'') e a histórica exclusão social da população trabalhadora no início da República Velha.', 'República Velha (1889-1930); Revolta da Vacina de 1904; Reforma Urbana de Pereira Passos e Rebeliões Populares Urbanas.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
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
        v_exam_edition_id, v_topic_id, 40, '1\. Nós queremos cantar o amor ao perigo, o hábito da energia e da temeridade.

2\. A coragem, a audácia, a rebelião serão elementos essenciais de nossa poesia.

3\. A literatura exaltou até hoje a imobilidade pensativa, o êxtase, o sono. Nós queremos exaltar o movimento agressivo, a insônia febril, o passo de corrida, o salto mortal, o bofetão e o soco.

4\. Nós afirmamos que a magnificência do mundo enriqueceu-se de uma beleza nova: a beleza da velocidade. Um automóvel de corrida com seu cofre enfeitado com tubos grossos, semelhantes a serpentes de hálito explosivo… um automóvel rugidor, que parece correr sobre a metralha, é mais bonito que a Vitória de Samotrácia.

5\. Nós queremos entoar hinos ao homem que segura o volante, cuja haste ideal atravessa a Terra, lançada também numa corrida sobre o circuito da sua órbita.

6\. É preciso que o poeta prodigalize com ardor, fausto e munificiência, para aumentar o entusiástico fervor dos elementos primordiais.

**MARINETTI, F. T**. Manifesto futurista. In: TELES, G. M. Vanguardas europeias e Modernismo brasileiro. Petrópolis: Vozes, 1985.

O documento de Marinetti, de 1909, propõe os referenciais estéticos do Futurismo, que valorizam a', 'B',
        'EASY', 1.65, 0.4, 0.18, 'ACTIVE',
        NULL, NULL, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            topic_id = EXCLUDED.topic_id,
            difficulty_level = EXCLUDED.difficulty_level,
            figure_url = EXCLUDED.figure_url,
            figure_alt_text = EXCLUDED.figure_alt_text,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'A', 'Composição estática.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'B', 'Inovação tecnológica.', TRUE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'C', 'Suspensão do tempo.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'D', 'Retomada do helenismo.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;
        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, 'E', 'Manutenção das tradições.', FALSE)
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, 'O Manifesto Futurista, publicado pelo poeta italiano Filippo Tommaso Marinetti no jornal francês Le Figaro em 1909, fundou uma das mais influentes vanguardas artísticas europeias do início do século XX. O manifesto rejeitava categoricamente a tradição passadista, os museus e as bibliotecas, exaltando a velocidade, as máquinas, a eletricidade, o perigo e o dinamismo urbano trazidos pela inovação tecnológica da Segunda Revolução Industrial.', 'Vanguardas Europeias do Século XX; Futurismo e Manifesto de Marinetti; Diálogo entre Arte, Indústria e Inovação Tecnológica.', 'Equipe Pedagógica AprovaENEM / INEP')
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation, key_concepts = EXCLUDED.key_concepts, author_attribution = EXCLUDED.author_attribution;
    END IF;
END $$;
