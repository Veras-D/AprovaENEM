from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class SubjectAreaEnum(str, Enum):
    NATURAL_SCIENCES = "NATURAL_SCIENCES"
    HUMAN_SCIENCES = "HUMAN_SCIENCES"
    LANGUAGES_CODES = "LANGUAGES_CODES"
    MATHEMATICS = "MATHEMATICS"


class DifficultyLevelEnum(str, Enum):
    VERY_EASY = "VERY_EASY"
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    VERY_HARD = "VERY_HARD"


class QuestionStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    DRAFT = "DRAFT"
    ANNULLED = "ANNULLED"


class ReconciliationStatusEnum(str, Enum):
    VERIFIED = "VERIFIED"
    FLAGGED = "FLAGGED"
    PENDING = "PENDING"


class OptionModel(BaseModel):
    letter: str = Field(..., pattern="^[A-E]$")
    text: str = Field(..., min_length=1)
    isCorrect: bool = False


class TriParametersModel(BaseModel):
    discriminationA: float = Field(..., gt=0.0, description="Item discrimination parameter (a > 0)")
    difficultyB: float = Field(..., ge=-3.5, le=3.5, description="Item difficulty parameter (-3.5 <= b <= 3.5)")
    guessingC: float = Field(..., ge=0.0, le=0.35, description="Item pseudo-guessing parameter (0 <= c <= 0.35)")


class ResolutionModel(BaseModel):
    stepByStep: str = Field(..., min_length=1)
    pedagogicalTip: Optional[str] = None


class QuestionExtractionModel(BaseModel):
    examYear: int = Field(..., ge=2009, le=2026)
    editionTitle: str = Field(..., min_length=1)
    itemNumber: int = Field(..., ge=1, le=180)
    subjectArea: SubjectAreaEnum
    discipline: str = Field(..., min_length=1)
    topicName: str = Field(..., min_length=1)
    difficultyLevel: DifficultyLevelEnum = DifficultyLevelEnum.MEDIUM
    status: QuestionStatusEnum = QuestionStatusEnum.ACTIVE
    statementMarkdown: str = Field(..., min_length=1)
    options: List[OptionModel] = Field(..., min_length=5, max_length=5)
    triParameters: Optional[TriParametersModel] = None
    inepHabilidade: Optional[str] = Field(None, pattern="^H([1-9]|[12][0-9]|30)$")
    resolution: Optional[ResolutionModel] = None
    reconciliationStatus: ReconciliationStatusEnum = ReconciliationStatusEnum.PENDING

    @field_validator("options")
    @classmethod
    def validate_options_cardinality_and_correctness(cls, options: List[OptionModel]):
        if len(options) != 5:
            raise ValueError("Every ENEM question must have exactly 5 options (A, B, C, D, E).")
        letters = [opt.letter for opt in options]
        if letters != ["A", "B", "C", "D", "E"]:
            raise ValueError(f"Options must be ordered A through E, got: {letters}")
        correct_count = sum(1 for opt in options if opt.isCorrect)
        if correct_count != 1:
            raise ValueError(f"Exactly one option must be marked correct, found {correct_count}.")
        return options
