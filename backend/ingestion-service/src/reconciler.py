import csv
import logging
from pathlib import Path
from typing import Dict, Optional
from src.models import (
    QuestionExtractionModel,
    QuestionStatusEnum,
    ReconciliationStatusEnum,
    TriParametersModel,
)

logger = logging.getLogger(__name__)


class MicrodadosReconciler:
    """
    Reconciles extracted questions with INEP Microdados (ITENS_PROVA.csv).
    1. Audits extracted correct answer against official TX_GABARITO.
    2. Hydrates Item Response Theory (TRI) parameters: discrimination (a), difficulty (b), guessing (c).
    3. Tags official INEP competency and skill codes (CO_HABILIDADE).
    4. Detects annulled / abandoned questions.
    """

    def __init__(self, csv_path: Optional[Path] = None):
        self.items_data: Dict[str, Dict] = {}
        if csv_path and csv_path.exists():
            self.load_microdados(csv_path)

    def load_microdados(self, csv_path: Path):
        logger.info(f"Loading INEP Microdados from: {csv_path}")
        with open(csv_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter=";")
            for row in reader:
                # Key format: {year}_{color}_{item_number}
                year = row.get("NU_ANO", "").strip()
                color = row.get("TX_COR", "").strip().upper()
                pos = row.get("CO_POSICAO", "").strip()
                if year and color and pos:
                    key = f"{year}_{color}_{pos}"
                    self.items_data[key] = row

        logger.info(f"Loaded {len(self.items_data)} benchmark items from INEP Microdados.")

    def reconcile(self, question: QuestionExtractionModel, color: str = "AZUL") -> QuestionExtractionModel:
        key = f"{question.examYear}_{color.upper()}_{question.itemNumber}"
        record = self.items_data.get(key)

        if not record:
            logger.warning(f"No INEP Microdados record found for item [{key}]. Preserving extracted state.")
            question.reconciliationStatus = ReconciliationStatusEnum.PENDING
            return question

        # 1. Annulment / Abandonment check
        is_abandoned = record.get("IN_ITEM_ABANDONADO", "0").strip() == "1"
        official_gabarito = record.get("TX_GABARITO", "").strip().upper()

        if is_abandoned or official_gabarito in ("*", "X", ""):
            logger.info(f"Item [{key}] was ANNULLED/ABANDONED by INEP.")
            question.status = QuestionStatusEnum.ANNULLED
            question.reconciliationStatus = ReconciliationStatusEnum.VERIFIED
            return question

        # 2. Gabarito Audit
        extracted_correct = next((opt.letter for opt in question.options if opt.isCorrect), None)
        if extracted_correct != official_gabarito:
            logger.error(
                f"GABARITO MISMATCH for item [{key}]: Extracted [{extracted_correct}] != Official [{official_gabarito}]."
            )
            question.reconciliationStatus = ReconciliationStatusEnum.FLAGGED
            question.status = QuestionStatusEnum.NEEDS_REVIEW
        else:
            question.reconciliationStatus = ReconciliationStatusEnum.VERIFIED

        # 3. TRI Parameter Hydration
        try:
            param_a = float(record.get("NU_PARAM_A", "0").replace(",", "."))
            param_b = float(record.get("NU_PARAM_B", "0").replace(",", "."))
            param_c = float(record.get("NU_PARAM_C", "0").replace(",", "."))
            if param_a > 0:
                question.triParameters = TriParametersModel(
                    discriminationA=param_a,
                    difficultyB=param_b,
                    guessingC=param_c,
                )
        except (ValueError, TypeError) as e:
            logger.warning(f"Could not parse TRI parameters for item [{key}]: {e}")

        # 4. INEP Skill Hydration (CO_HABILIDADE)
        habilidade = record.get("CO_HABILIDADE", "").strip()
        if habilidade:
            if not habilidade.startswith("H"):
                habilidade = f"H{habilidade}"
            question.inepHabilidade = habilidade

        return question
