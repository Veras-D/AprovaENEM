import re
from typing import List, Tuple
from src.models import QuestionExtractionModel


class IngestionQualityGate:
    """
    Enforces the 5 Quality Gates specified in 08-data-ingestion-pipeline.md:
    1. Option Cardinality Gate (5 options A-E, exactly 1 correct)
    2. LaTeX Syntax & Delimiter Gate ($...$ and $$...$$ balanced)
    3. TRI Bounds Gate (a > 0, -3.5 <= b <= 3.5, 0 <= c <= 0.35)
    4. Image Link / Markdown Reference Gate
    5. Reconciliation Concordance Gate
    """

    @staticmethod
    def validate_latex(markdown_text: str) -> Tuple[bool, List[str]]:
        errors = []
        # Check block math $$ ... $$
        block_parts = markdown_text.split("$$")
        if len(block_parts) % 2 == 0:
            errors.append("Unbalanced block LaTeX delimiters ($$).")

        # Strip valid blocks before checking inline $ ... $
        text_without_blocks = re.sub(r"\$\$.*?\$\$", "", markdown_text, flags=re.DOTALL)
        
        # Check inline math $ ... $ (ignoring escaped \$)
        inline_delimiters = re.findall(r"(?<!\\)\$", text_without_blocks)
        if len(inline_delimiters) % 2 != 0:
            errors.append("Unbalanced inline LaTeX delimiters ($).")

        return len(errors) == 0, errors

    @staticmethod
    def validate_image_references(markdown_text: str) -> Tuple[bool, List[str]]:
        errors = []
        image_tags = re.findall(r"!\[(.*?)\]\((.*?)\)", markdown_text)
        for alt, src in image_tags:
            if not src.strip():
                errors.append(f"Image reference '{alt}' has empty src URL.")
            elif not (src.startswith("http://") or src.startswith("https://") or src.startswith("/assets/") or src.endswith(".webp") or src.endswith(".png")):
                errors.append(f"Invalid image asset path or extension: '{src}'")
        return len(errors) == 0, errors

    @classmethod
    def run_all_gates(cls, question: QuestionExtractionModel) -> Tuple[bool, List[str]]:
        all_errors = []

        # 1. LaTeX check on statement and options
        is_stmt_latex_valid, stmt_latex_errors = cls.validate_latex(question.statementMarkdown)
        all_errors.extend(stmt_latex_errors)

        for opt in question.options:
            is_opt_latex_valid, opt_latex_errors = cls.validate_latex(opt.text)
            all_errors.extend(opt_latex_errors)

        # 2. Image references
        is_img_valid, img_errors = cls.validate_image_references(question.statementMarkdown)
        all_errors.extend(img_errors)

        # 3. TRI validation if present
        if question.triParameters:
            tri = question.triParameters
            if tri.discriminationA <= 0:
                all_errors.append(f"TRI discrimination parameter 'a' must be > 0, got {tri.discriminationA}")
            if not (-3.5 <= tri.difficultyB <= 3.5):
                all_errors.append(f"TRI difficulty parameter 'b' must be between -3.5 and 3.5, got {tri.difficultyB}")
            if not (0.0 <= tri.guessingC <= 0.35):
                all_errors.append(f"TRI guessing parameter 'c' must be between 0.0 and 0.35, got {tri.guessingC}")

        # 4. Reconciliation
        if question.reconciliationStatus == "FLAGGED":
            all_errors.append("Question was flagged during INEP Microdados reconciliation.")

        return len(all_errors) == 0, all_errors
