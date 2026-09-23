import json
import logging
from pathlib import Path
from typing import List
from src.models import QuestionExtractionModel

logger = logging.getLogger(__name__)


class SeedGenerator:
    """
    Generates normalized JSON fixtures and SQL migrations ready for PostgreSQL exam_db.
    """

    @staticmethod
    def export_json(questions: List[QuestionExtractionModel], output_path: Path):
        output_path.parent.mkdir(parents=True, exist_ok=True)
        data = [q.model_dump(mode="json") for q in questions]
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"Exported {len(questions)} normalized questions to {output_path}")

    @staticmethod
    def export_sql_insert(questions: List[QuestionExtractionModel], output_path: Path):
        output_path.parent.mkdir(parents=True, exist_ok=True)
        statements = [
            "-- ==============================================================================",
            "-- AprovaENEM — Auto-Generated Ingestion Seed Migration",
            "-- Target: exam_db | PostgreSQL 16 + pgvector",
            "-- ==============================================================================\n"
        ]

        for q in questions:
            stmt_escaped = q.statementMarkdown.replace("'", "''")
            tri_a = q.triParameters.discriminationA if q.triParameters else "NULL"
            tri_b = q.triParameters.difficultyB if q.triParameters else "NULL"
            tri_c = q.triParameters.guessingC if q.triParameters else "NULL"
            correct_opt = next((opt.letter for opt in q.options if opt.isCorrect), "A")

            # Map difficulty to database constraint ('EASY', 'MEDIUM', 'HARD')
            diff_raw = q.difficultyLevel.value
            if diff_raw in ("VERY_EASY", "EASY"):
                diff_mapped = "EASY"
            elif diff_raw in ("VERY_HARD", "HARD"):
                diff_mapped = "HARD"
            else:
                diff_mapped = "MEDIUM"

            fig_url = f"'{q.figureUrl}'" if q.figureUrl else "NULL"
            if q.figureAltText:
                escaped_alt = q.figureAltText.replace("'", "''")
                fig_alt = f"'{escaped_alt}'"
            else:
                fig_alt = "NULL"

            # Create topic slug
            topic_slug = q.topicName.lower().replace(" ", "-").replace("ç", "c").replace("ã", "a").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")

            statements.append(f"""-- Item {q.itemNumber} ({q.editionTitle})
DO $$
DECLARE
    v_exam_edition_id UUID;
    v_subject_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    -- 1. Ensure exam edition exists
    SELECT id INTO v_exam_edition_id FROM exam_editions WHERE year = {q.examYear} AND exam_color = 'BLUE' LIMIT 1;
    IF v_exam_edition_id IS NULL THEN
        INSERT INTO exam_editions (year, title, exam_color, is_active)
        VALUES ({q.examYear}, 'ENEM {q.examYear} — Prova Regular (Caderno Azul)', 'BLUE', TRUE)
        RETURNING id INTO v_exam_edition_id;
    END IF;

    -- 2. Ensure topic exists
    SELECT id INTO v_topic_id FROM topics WHERE name = '{q.topicName}' LIMIT 1;
    IF v_topic_id IS NULL THEN
        SELECT id INTO v_subject_id FROM subject_areas WHERE code = '{q.subjectArea.value}' LIMIT 1;
        IF v_subject_id IS NULL THEN
            SELECT id INTO v_subject_id FROM subject_areas LIMIT 1;
        END IF;
        INSERT INTO topics (subject_id, discipline, name, slug)
        VALUES (v_subject_id, '{q.discipline}', '{q.topicName}', '{topic_slug}')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_topic_id;
    END IF;

    -- 3. Insert question
    INSERT INTO questions (
        exam_edition_id, topic_id, item_number, statement, correct_option,
        difficulty_level, tri_param_a, tri_param_b, tri_param_c, status,
        figure_url, figure_alt_text, content_language
    ) VALUES (
        v_exam_edition_id, v_topic_id, {q.itemNumber}, '{stmt_escaped}', '{correct_opt}',
        '{diff_mapped}', {tri_a}, {tri_b}, {tri_c}, '{q.status.value}',
        {fig_url}, {fig_alt}, 'pt-BR'
    ) ON CONFLICT (exam_edition_id, item_number) DO UPDATE
        SET statement = EXCLUDED.statement,
            correct_option = EXCLUDED.correct_option,
            tri_param_a = EXCLUDED.tri_param_a,
            tri_param_b = EXCLUDED.tri_param_b,
            tri_param_c = EXCLUDED.tri_param_c
    RETURNING id INTO v_question_id;

    -- 4. Insert options
    IF v_question_id IS NOT NULL THEN""")

            for opt in q.options:
                opt_escaped = opt.text.replace("'", "''")
                is_correct = "TRUE" if opt.isCorrect else "FALSE"
                statements.append(f"""        INSERT INTO question_options (question_id, option_letter, option_text, is_correct)
        VALUES (v_question_id, '{opt.letter}', '{opt_escaped}', {is_correct})
        ON CONFLICT (question_id, option_letter) DO UPDATE SET option_text = EXCLUDED.option_text;""")

            if q.resolution:
                res_step = q.resolution.stepByStep.replace("'", "''")
                if q.resolution.keyConcepts:
                    escaped_conc = q.resolution.keyConcepts.replace("'", "''")
                    key_conc = f"'{escaped_conc}'"
                else:
                    key_conc = f"'{q.topicName}'"

                if q.resolution.authorAttribution:
                    escaped_author = q.resolution.authorAttribution.replace("'", "''")
                    author = f"'{escaped_author}'"
                else:
                    author = "'Equipe Pedagógica AprovaENEM / INEP'"

                statements.append(f"""
        INSERT INTO question_resolutions (question_id, base_explanation, key_concepts, author_attribution)
        VALUES (v_question_id, '{res_step}', {key_conc}, {author})
        ON CONFLICT (question_id) DO UPDATE SET base_explanation = EXCLUDED.base_explanation;""")

            statements.append("""    END IF;
END $$;
""")

        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(statements))
        logger.info(f"Generated SQL seed migration at {output_path}")
