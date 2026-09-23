import json
from pathlib import Path
import pytest
from src.generator import SeedGenerator
from src.models import (
    QuestionExtractionModel,
    ReconciliationStatusEnum,
    SubjectAreaEnum,
)
from src.reconciler import MicrodadosReconciler
from src.validator import IngestionQualityGate


DATA_DIR = Path(__file__).parent.parent / "data"
QUESTIONS_JSON = DATA_DIR / "historical_questions_sample.json"
MICRODADOS_CSV = DATA_DIR / "sample_itens_prova_2019_2023.csv"


def test_historical_dataset_files_exist():
    assert QUESTIONS_JSON.exists(), f"Missing {QUESTIONS_JSON}"
    assert MICRODADOS_CSV.exists(), f"Missing {MICRODADOS_CSV}"


def test_batch_historical_ingestion_and_reconciliation(tmp_path: Path):
    # 1. Load raw questions JSON
    with open(QUESTIONS_JSON, "r", encoding="utf-8") as f:
        raw_items = json.load(f)

    assert len(raw_items) == 25, f"Expected 25 sample questions, got {len(raw_items)}"
    questions = [QuestionExtractionModel(**item) for item in raw_items]

    # 2. Check coverage of all 5 years and 4 knowledge areas
    years = {q.examYear for q in questions}
    assert years == {2019, 2020, 2021, 2022, 2023}
    for y in years:
        count = sum(1 for q in questions if q.examYear == y)
        assert count == 5, f"Year {y} should have exactly 5 questions, found {count}"

    areas = {q.subjectArea for q in questions}
    assert SubjectAreaEnum.MATHEMATICS in areas
    assert SubjectAreaEnum.NATURAL_SCIENCES in areas
    assert SubjectAreaEnum.HUMANITIES in areas
    assert SubjectAreaEnum.LANGUAGES in areas

    # 3. Reconcile with INEP Microdados
    reconciler = MicrodadosReconciler(csv_path=MICRODADOS_CSV)
    reconciled = [reconciler.reconcile(q, color="AZUL") for q in questions]

    # Verify 100% concordance against official INEP gabaritos
    for q in reconciled:
        assert q.reconciliationStatus == ReconciliationStatusEnum.VERIFIED, (
            f"Question {q.examYear} item {q.itemNumber} failed reconciliation: {q.reconciliationStatus}"
        )
        assert q.triParameters is not None
        assert q.triParameters.discriminationA > 0
        assert -3.5 <= q.triParameters.difficultyB <= 3.5
        assert 0.0 <= q.triParameters.guessingC <= 0.35
        assert q.inepHabilidade is not None

        # 4. Enforce 5 Quality Gates
        is_valid, errors = IngestionQualityGate.run_all_gates(q)
        assert is_valid is True, f"Question {q.examYear} item {q.itemNumber} failed Quality Gates: {errors}"

    # 5. Export and verify SQL generation
    output_sql = tmp_path / "V7__historical_question_catalog_seed.sql"
    SeedGenerator.export_sql_insert(reconciled, output_sql)
    assert output_sql.exists()

    sql_content = output_sql.read_text(encoding="utf-8")
    assert "INSERT INTO questions" in sql_content
    assert "INSERT INTO question_options" in sql_content
    assert "INSERT INTO question_resolutions" in sql_content
    assert "2019" in sql_content
    assert "2023" in sql_content
