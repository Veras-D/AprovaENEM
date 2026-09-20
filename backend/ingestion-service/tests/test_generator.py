import json
from pathlib import Path
from src.generator import SeedGenerator
from src.models import (
    OptionModel,
    QuestionExtractionModel,
    ResolutionModel,
    SubjectAreaEnum,
    TriParametersModel,
)


def test_export_json_and_sql(tmp_path: Path):
    q = QuestionExtractionModel(
        examYear=2023,
        editionTitle="ENEM 2023 Azul",
        itemNumber=91,
        subjectArea=SubjectAreaEnum.NATURAL_SCIENCES,
        discipline="Physics",
        topicName="Circuitos Elétricos",
        statementMarkdown="Statement with formula $R = 10\\,\\Omega$.",
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
        inepHabilidade="H17",
        resolution=ResolutionModel(stepByStep="Resolução detalhada"),
    )

    json_out = tmp_path / "questions.json"
    sql_out = tmp_path / "seed.sql"

    SeedGenerator.export_json([q], json_out)
    SeedGenerator.export_sql_insert([q], sql_out)

    assert json_out.exists()
    assert sql_out.exists()

    with open(json_out, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert len(data) == 1
    assert data[0]["itemNumber"] == 91
    assert data[0]["triParameters"]["discriminationA"] == 1.84

    sql_text = sql_out.read_text(encoding="utf-8")
    assert "INSERT INTO questions" in sql_text
    assert "INSERT INTO question_options" in sql_text
    assert "Circuitos Elétricos" in sql_text
