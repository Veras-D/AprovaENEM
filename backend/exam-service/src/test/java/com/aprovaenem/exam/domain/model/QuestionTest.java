package com.aprovaenem.exam.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.data.Offset.offset;

@DisplayName("Question Domain Model Unit Tests")
class QuestionTest {

    @Test
    @DisplayName("Should initialize Question with default active status, language, and timestamps")
    void shouldInitializeWithDefaults() {
        Question question = new Question();

        assertThat(question.getStatus()).isEqualTo(QuestionStatus.ACTIVE);
        assertThat(question.isActive()).isTrue();
        assertThat(question.getContentLanguage()).isEqualTo("pt-BR");
        assertThat(question.getCreatedAt()).isNotNull();
        assertThat(question.getUpdatedAt()).isNotNull();
        assertThat(question.getOptions()).isEmpty();
    }

    @Test
    @DisplayName("Should instantiate full Question with normalized uppercase correct option")
    void shouldCreateFullQuestionWithUppercaseOption() {
        UUID id = UUID.randomUUID();
        UUID editionId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();

        Question question = new Question(
                id,
                editionId,
                topicId,
                120,
                "Qual é a velocidade média da partícula?",
                'c', // lowercase
                DifficultyLevel.MEDIUM,
                new BigDecimal("1.842"),
                new BigDecimal("0.451"),
                new BigDecimal("0.198"),
                QuestionStatus.ACTIVE,
                "pt-BR"
        );

        assertThat(question.getId()).isEqualTo(id);
        assertThat(question.getExamEditionId()).isEqualTo(editionId);
        assertThat(question.getTopicId()).isEqualTo(topicId);
        assertThat(question.getItemNumber()).isEqualTo(120);
        assertThat(question.getCorrectOption()).isEqualTo('C');
        assertThat(question.getDifficultyLevel()).isEqualTo(DifficultyLevel.MEDIUM);
        assertThat(question.getTriParamA()).isEqualByComparingTo("1.842");
        assertThat(question.getTriParamB()).isEqualByComparingTo("0.451");
        assertThat(question.getTriParamC()).isEqualByComparingTo("0.198");
        assertThat(question.isActive()).isTrue();
    }

    @ParameterizedTest(name = "Valid option letter: {0}")
    @ValueSource(chars = {'a', 'b', 'c', 'd', 'e', 'A', 'B', 'C', 'D', 'E'})
    @DisplayName("Should accept valid ENEM multiple-choice option letters from A to E")
    void shouldAcceptValidOptionLetters(char option) {
        Question question = new Question();
        question.setCorrectOption(option);

        assertThat(question.getCorrectOption()).isEqualTo(Character.toUpperCase(option));
    }

    @ParameterizedTest(name = "Invalid option letter: {0}")
    @ValueSource(chars = {'f', 'F', '1', 'z', '!', ' '})
    @DisplayName("Should reject invalid options outside A-E range with IllegalArgumentException")
    void shouldRejectInvalidOptionLetters(char invalidOption) {
        Question question = new Question();

        assertThatThrownBy(() -> question.setCorrectOption(invalidOption))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Correct option must be between A and E");
    }

    @Test
    @DisplayName("Should reject null statement with NullPointerException")
    void shouldRejectNullStatement() {
        Question question = new Question();

        assertThatThrownBy(() -> question.setStatement(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("Statement cannot be null");
    }

    @Test
    @DisplayName("Should accurately check whether an option is correct regardless of casing")
    void shouldCheckIfOptionIsCorrect() {
        Question question = new Question();
        question.setCorrectOption('B');

        assertThat(question.isOptionCorrect('b')).isTrue();
        assertThat(question.isOptionCorrect('B')).isTrue();
        assertThat(question.isOptionCorrect('a')).isFalse();
        assertThat(question.isOptionCorrect('C')).isFalse();
    }

    @Test
    @DisplayName("Should handle question lifecycle transitions: ACTIVE -> SUSPENDED -> ACTIVE")
    void shouldTransitionBetweenActiveAndSuspended() {
        Question question = new Question();
        assertThat(question.isActive()).isTrue();

        question.suspend("Pedagogical review identified an ambiguous distractor in option D");
        assertThat(question.getStatus()).isEqualTo(QuestionStatus.SUSPENDED);
        assertThat(question.isActive()).isFalse();
        assertThat(question.getSuspensionReason()).contains("ambiguous distractor");

        question.activate();
        assertThat(question.getStatus()).isEqualTo(QuestionStatus.ACTIVE);
        assertThat(question.isActive()).isTrue();
        assertThat(question.getSuspensionReason()).isNull();
    }

    @Test
    @DisplayName("Should mark question as NEEDS_REVIEW with descriptive pedagogical note")
    void shouldMarkNeedsReview() {
        Question question = new Question();
        question.markNeedsReview("Verify KaTeX equation formatting for LaTeX expression");

        assertThat(question.getStatus()).isEqualTo(QuestionStatus.NEEDS_REVIEW);
        assertThat(question.isActive()).isFalse();
        assertThat(question.getSuspensionReason()).contains("KaTeX equation");
    }

    @Test
    @DisplayName("Should calculate Item Response Theory (TRI) 3PL probability at theta = b")
    void shouldCalculateTriProbabilityAtThetaEqualB() {
        Question question = new Question();
        question.setTriParamA(new BigDecimal("1.842")); // Discrimination
        question.setTriParamB(new BigDecimal("0.451")); // Difficulty (b)
        question.setTriParamC(new BigDecimal("0.200")); // Guessing (c)

        // When theta == b, exponent = 0, logistic = 0.5, P(b) = c + (1-c)*0.5 = 0.20 + 0.40 = 0.60
        double probability = question.calculateTriProbability(0.451);

        assertThat(probability).isCloseTo(0.600, offset(0.001));
    }

    @Test
    @DisplayName("Should calculate TRI probability asymptotically approaching 1.0 for high ability students")
    void shouldCalculateTriProbabilityForHighAbility() {
        Question question = new Question();
        question.setTriParamA(new BigDecimal("2.000"));
        question.setTriParamB(new BigDecimal("0.000"));
        question.setTriParamC(new BigDecimal("0.200"));

        double highTheta = 3.0; // Very high proficiency
        double probability = question.calculateTriProbability(highTheta);

        assertThat(probability).isGreaterThan(0.99);
        assertThat(probability).isLessThanOrEqualTo(1.0);
    }

    @Test
    @DisplayName("Should calculate TRI probability asymptotically approaching guessing parameter c for low ability")
    void shouldCalculateTriProbabilityForLowAbility() {
        Question question = new Question();
        question.setTriParamA(new BigDecimal("2.000"));
        question.setTriParamB(new BigDecimal("0.000"));
        question.setTriParamC(new BigDecimal("0.200"));

        double lowTheta = -3.0; // Very low proficiency
        double probability = question.calculateTriProbability(lowTheta);

        // Should be slightly above c (0.200) but never below c
        assertThat(probability).isGreaterThanOrEqualTo(0.200);
        assertThat(probability).isLessThan(0.210);
    }

    @Test
    @DisplayName("Should throw IllegalStateException when TRI probability is calculated with missing parameters")
    void shouldThrowExceptionWhenTriParametersMissing() {
        Question question = new Question();
        question.setTriParamA(new BigDecimal("1.500"));
        // triParamB and triParamC left null

        assertThatThrownBy(() -> question.calculateTriProbability(1.0))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("TRI parameters (a, b, c) must be set");
    }

    @Test
    @DisplayName("Should manage Question options, figure URL, and WCAG accessibility alt text")
    void shouldManageOptionsAndAccessibilityMetadata() {
        Question question = new Question();
        question.setFigureUrl("/assets/questions/2024_enem_caderno_azul_120.webp");
        question.setFigureAltText("Diagrama de circuito elétrico residencial contendo um disjuntor de proteção");

        assertThat(question.getFigureUrl()).contains("2024_enem_caderno_azul_120.webp");
        assertThat(question.getFigureAltText()).contains("Diagrama de circuito elétrico");

        QuestionOption optionA = new QuestionOption(UUID.randomUUID(), question.getId(), 'A', "25 A", false);
        QuestionOption optionB = new QuestionOption(UUID.randomUUID(), question.getId(), 'B', "30 A", true);

        question.addOption(optionA);
        question.addOption(optionB);

        assertThat(question.getOptions()).hasSize(2);
        assertThat(question.getOptions().get(0).getOptionLetter()).isEqualTo('A');
        assertThat(question.getOptions().get(1).getOptionLetter()).isEqualTo('B');
    }
}
