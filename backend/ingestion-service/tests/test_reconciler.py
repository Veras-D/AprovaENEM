from pathlib import Path
from src.models import (
    OptionModel,
    QuestionExtractionModel,
    QuestionStatusEnum,
    ReconciliationStatusEnum,
    SubjectAreaEnum,
)
from src.reconciler import MicrodadosReconciler


def test_reconciler_concordance_and_tri_hydration(tmp_path: Path):
    csv_content = (
        "NU_ANO;CO_POSICAO;SG_AREA;TX_COR;TX_GABARITO;NU_PARAM_A;NU_PARAM_B;NU_PARAM_C;CO_HABILIDADE;IN_ITEM_ABANDONADO\n"
        "2023;91;CN;AZUL;D;1,842;0,451;0,198;H17;0\n"
    )
    csv_file = tmp_path / "test_microdados.csv"
    csv_file.write_text(csv_content, encoding="utf-8")

    reconciler = MicrodadosReconciler(csv_path=csv_file)

    q = QuestionExtractionModel(
        examYear=2023,
        editionTitle="ENEM 2023 Azul",
        itemNumber=91,
        subjectArea=SubjectAreaEnum.NATURAL_SCIENCES,
        discipline="Physics",
        topicName="Circuitos",
        statementMarkdown="Statement",
        options=[
            OptionModel(letter="A", text="1", isCorrect=False),
            OptionModel(letter="B", text="2", isCorrect=False),
            OptionModel(letter="C", text="3", isCorrect=False),
            OptionModel(letter="D", text="4", isCorrect=True),
            OptionModel(letter="E", text="5", isCorrect=False),
        ],
    )

    reconciled = reconciler.reconcile(q, color="AZUL")

    assert reconciled.reconciliationStatus == ReconciliationStatusEnum.VERIFIED
    assert reconciled.triParameters is not None
    assert reconciled.triParameters.discriminationA == 1.842
    assert reconciled.triParameters.difficultyB == 0.451
    assert reconciled.triParameters.guessingC == 0.198
    assert reconciled.inepHabilidade == "H17"


def test_reconciler_mismatch_flagging(tmp_path: Path):
    csv_content = (
        "NU_ANO;CO_POSICAO;SG_AREA;TX_COR;TX_GABARITO;NU_PARAM_A;NU_PARAM_B;NU_PARAM_C;CO_HABILIDADE;IN_ITEM_ABANDONADO\n"
        "2023;91;CN;AZUL;A;1,842;0,451;0,198;H17;0\n"
    )
    csv_file = tmp_path / "test_microdados.csv"
    csv_file.write_text(csv_content, encoding="utf-8")

    reconciler = MicrodadosReconciler(csv_path=csv_file)

    q = QuestionExtractionModel(
        examYear=2023,
        editionTitle="ENEM 2023 Azul",
        itemNumber=91,
        subjectArea=SubjectAreaEnum.NATURAL_SCIENCES,
        discipline="Physics",
        topicName="Circuitos",
        statementMarkdown="Statement",
        options=[
            OptionModel(letter="A", text="1", isCorrect=False),
            OptionModel(letter="B", text="2", isCorrect=False),
            OptionModel(letter="C", text="3", isCorrect=False),
            OptionModel(letter="D", text="4", isCorrect=True),  # Mismatch: Extracted D, but official is A
            OptionModel(letter="E", text="5", isCorrect=False),
        ],
    )

    reconciled = reconciler.reconcile(q, color="AZUL")

    assert reconciled.reconciliationStatus == ReconciliationStatusEnum.FLAGGED
    assert reconciled.status == QuestionStatusEnum.NEEDS_REVIEW
