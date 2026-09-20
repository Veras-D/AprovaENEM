import pytest
from src.models import (
    DifficultyLevelEnum,
    OptionModel,
    QuestionExtractionModel,
    SubjectAreaEnum,
    TriParametersModel,
)
from src.validator import IngestionQualityGate


def create_sample_question():
    return QuestionExtractionModel(
        examYear=2023,
        editionTitle="ENEM 2023 - Caderno 1 Azul",
        itemNumber=91,
        subjectArea=SubjectAreaEnum.NATURAL_SCIENCES,
        discipline="Physics",
        topicName="Circuitos Elétricos",
        difficultyLevel=DifficultyLevelEnum.MEDIUM,
        statementMarkdown="Calcule a corrente para o resistor com $R = 10\\,\\Omega$ e ddp de $$U = 60\\text{ V}$$.",
        options=[
            OptionModel(letter="A", text="1 A", isCorrect=False),
            OptionModel(letter="B", text="2 A", isCorrect=False),
            OptionModel(letter="C", text="3 A", isCorrect=False),
            OptionModel(letter="D", text="6 A", isCorrect=True),
            OptionModel(letter="E", text="10 A", isCorrect=False),
        ],
        triParameters=TriParametersModel(
            discriminationA=1.84,
            difficultyB=0.45,
            guessingC=0.20,
        ),
    )


def test_latex_validation_success():
    valid, errors = IngestionQualityGate.validate_latex("Formula $E = mc^2$ and block: $$\\Delta H = -500\\text{ kJ}$$")
    assert valid is True
    assert len(errors) == 0


def test_latex_validation_unbalanced_inline():
    valid, errors = IngestionQualityGate.validate_latex("Unbalanced $formula here without closing delimiter.")
    assert valid is False
    assert any("inline" in e.lower() for e in errors)


def test_latex_validation_unbalanced_block():
    valid, errors = IngestionQualityGate.validate_latex("Unbalanced block $$ formula.")
    assert valid is False
    assert any("block" in e.lower() for e in errors)


def test_tri_parameters_gate_success():
    q = create_sample_question()
    valid, errors = IngestionQualityGate.run_all_gates(q)
    assert valid is True
    assert len(errors) == 0


from pydantic import ValidationError

def test_option_cardinality_rejection():
    with pytest.raises(ValidationError):
        QuestionExtractionModel(
            examYear=2023,
            editionTitle="ENEM 2023",
            itemNumber=91,
            subjectArea=SubjectAreaEnum.NATURAL_SCIENCES,
            discipline="Physics",
            topicName="Circuitos",
            statementMarkdown="Statement",
            options=[
                OptionModel(letter="A", text="1", isCorrect=True),
                OptionModel(letter="B", text="2", isCorrect=False),
            ],
        )

def test_option_multiple_correct_rejection():
    with pytest.raises(ValidationError, match="Exactly one option must be marked correct"):
        QuestionExtractionModel(
            examYear=2023,
            editionTitle="ENEM 2023",
            itemNumber=91,
            subjectArea=SubjectAreaEnum.NATURAL_SCIENCES,
            discipline="Physics",
            topicName="Circuitos",
            statementMarkdown="Statement",
            options=[
                OptionModel(letter="A", text="1", isCorrect=True),
                OptionModel(letter="B", text="2", isCorrect=True),
                OptionModel(letter="C", text="3", isCorrect=False),
                OptionModel(letter="D", text="4", isCorrect=False),
                OptionModel(letter="E", text="5", isCorrect=False),
            ],
        )
