import argparse
import logging
import sys
from pathlib import Path

from src.generator import SeedGenerator
from src.parser import DoclingExamParser
from src.reconciler import MicrodadosReconciler
from src.validator import IngestionQualityGate

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ingestion-service")


def main():
    parser = argparse.ArgumentParser(
        description="AprovaENEM Data Ingestion & Extraction Engine (IBM Docling + INEP Microdados)"
    )
    parser.add_argument("--year", type=int, default=2023, help="Exam edition year (e.g. 2023)")
    parser.add_argument("--color", type=str, default="AZUL", help="Notebook booklet color (AZUL, AMARELO, etc.)")
    parser.add_argument("--input-pdf", type=str, default=None, help="Path to input exam PDF")
    parser.add_argument("--microdados", type=str, default="data/sample_itens_prova_2023.csv", help="Path to ITENS_PROVA CSV")
    parser.add_argument("--assets-dir", type=str, default="/app/extracted_assets", help="Directory for WebP image assets")
    parser.add_argument("--output-dir", type=str, default="output", help="Directory for generated JSON and SQL fixtures")
    parser.add_argument("--run-tests", action="store_true", help="Execute test suite")

    args = parser.parse_args()

    if args.run_tests:
        import pytest
        sys.exit(pytest.main(["-v", "tests/"]))

    assets_dir = Path(args.assets_dir)
    output_dir = Path(args.output_dir)
    microdados_path = Path(args.microdados)

    edition_title = f"ENEM {args.year} - Caderno 1 {args.color.capitalize()} - Regular"
    logger.info(f"Starting ingestion pipeline for: {edition_title}")

    # Stage 1 & 2: Parse Layout, LaTeX Formulas, and WebP Diagrams
    pdf_parser = DoclingExamParser(asset_output_dir=assets_dir)
    extracted_questions = pdf_parser.parse_pdf(
        pdf_path=Path(args.input_pdf) if args.input_pdf else Path("sample.pdf"),
        year=args.year,
        edition_title=edition_title
    )
    logger.info(f"Extracted {len(extracted_questions)} raw question items.")

    # Stage 3: Ground-Truth Reconciliation with INEP Microdados
    reconciler = MicrodadosReconciler(csv_path=microdados_path if microdados_path.exists() else None)
    reconciled_questions = [reconciler.reconcile(q, color=args.color) for q in extracted_questions]

    # Stage 4: Quality Gate Verification
    logger.info("Running 5 Quality Gates across extracted dataset...")
    failed_count = 0
    for q in reconciled_questions:
        is_valid, errors = IngestionQualityGate.run_all_gates(q)
        if not is_valid:
            failed_count += 1
            logger.error(f"Item {q.itemNumber} failed quality gates: {errors}")

    if failed_count > 0:
        logger.warning(f"Quality gate warnings found in {failed_count} item(s).")
    else:
        logger.info("All questions passed 100% of Quality Gates! ✅")

    # Stage 5: Seed Export
    json_out = output_dir / f"enem_{args.year}_{args.color.lower()}_questions.json"
    sql_out = output_dir / f"enem_{args.year}_{args.color.lower()}_seed.sql"

    SeedGenerator.export_json(reconciled_questions, json_out)
    SeedGenerator.export_sql_insert(reconciled_questions, sql_out)

    logger.info("Ingestion pipeline completed successfully! 🎉")


if __name__ == "__main__":
    main()
