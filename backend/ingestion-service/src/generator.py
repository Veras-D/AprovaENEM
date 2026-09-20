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
            "-- Target: exam_db | PostgreSQL 16",
            "-- ==============================================================================\n"
        ]

        for q in questions:
            stmt_escaped = q.statementMarkdown.replace("'", "''")
            tri_a = q.triParameters.discriminationA if q.triParameters else "NULL"
            tri_b = q.triParameters.difficultyB if q.triParameters else "NULL"
            tri_c = q.triParameters.guessingC if q.triParameters else "NULL"
            hab = f"'{q.inepHabilidade}'" if q.inepHabilidade else "NULL"

            statements.append(f"""
-- Item {q.itemNumber} ({q.editionTitle})
DO $$
DECLARE
    v_exam_id UUID;
    v_topic_id UUID;
    v_question_id UUID;
BEGIN
    SELECT id INTO v_exam_id FROM exams WHERE year = {q.examYear} LIMIT 1;
    SELECT id INTO v_topic_id FROM topics WHERE name = '{q.topicName}' LIMIT 1;
    IF v_topic_id IS NULL THEN
        INSERT INTO topics (name, discipline, subject_area)
        VALUES ('{q.topicName}', '{q.discipline}', '{q.subjectArea.value}')
        RETURNING id INTO v_topic_id;
    END IF;

    INSERT INTO questions (
        exam_id, topic_id, item_number, statement_markdown,
        difficulty_level, discrimination_a, difficulty_b, guessing_c, inep_habilidade, status
    ) VALUES (
        v_exam_id, v_topic_id, {q.itemNumber}, '{stmt_escaped}',
        '{q.difficultyLevel.value}', {tri_a}, {tri_b}, {tri_c}, {hab}, '{q.status.value}'
    ) RETURNING id INTO v_question_id;
""")

            for opt in q.options:
                opt_escaped = opt.text.replace("'", "''")
                is_correct = "TRUE" if opt.isCorrect else "FALSE"
                statements.append(f"""
    INSERT INTO question_options (question_id, letter, text_markdown, is_correct)
    VALUES (v_question_id, '{opt.letter}', '{opt_escaped}', {is_correct});
""")

            if q.resolution:
                res_step = q.resolution.stepByStep.replace("'", "''")
                if q.resolution.pedagogicalTip:
                    escaped_tip = q.resolution.pedagogicalTip.replace("'", "''")
                    res_tip = f"'{escaped_tip}'"
                else:
                    res_tip = "NULL"
                statements.append(f"""
    INSERT INTO question_resolutions (question_id, step_by_step, pedagogical_tip)
    VALUES (v_question_id, '{res_step}', {res_tip});
""")

            statements.append("END $$;\n")

        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(statements))
        logger.info(f"Generated SQL seed migration at {output_path}")
