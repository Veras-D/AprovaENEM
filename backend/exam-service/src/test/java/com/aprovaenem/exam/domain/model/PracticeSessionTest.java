package com.aprovaenem.exam.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("PracticeSession Domain Model Unit Tests")
class PracticeSessionTest {

    @Test
    @DisplayName("Should initialize PracticeSession in IN_PROGRESS state with zero correct count")
    void shouldInitializeWithInProgressStatus() {
        PracticeSession session = new PracticeSession();

        assertThat(session.getStatus()).isEqualTo(SessionStatus.IN_PROGRESS);
        assertThat(session.getCorrectCount()).isZero();
        assertThat(session.getStartedAt()).isNotNull();
        assertThat(session.getCompletedAt()).isNull();
        assertThat(session.canAcceptAttempt()).isTrue();
    }

    @Test
    @DisplayName("Should instantiate full PracticeSession with assigned total questions and session type")
    void shouldCreateFullPracticeSession() {
        UUID sessionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        PracticeSession session = new PracticeSession(
                sessionId,
                userId,
                null,
                SessionType.TOPIC_PRACTICE,
                15
        );

        assertThat(session.getId()).isEqualTo(sessionId);
        assertThat(session.getUserId()).isEqualTo(userId);
        assertThat(session.getAnonymousSessionId()).isNull();
        assertThat(session.getSessionType()).isEqualTo(SessionType.TOPIC_PRACTICE);
        assertThat(session.getTotalQuestions()).isEqualTo(15);
        assertThat(session.getCorrectCount()).isZero();
        assertThat(session.canAcceptAttempt()).isTrue();
    }

    @Test
    @DisplayName("Should complete an in-progress session and record completedAt timestamp")
    void shouldCompleteSession() {
        PracticeSession session = new PracticeSession();
        assertThat(session.canAcceptAttempt()).isTrue();

        session.complete();

        assertThat(session.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        assertThat(session.getCompletedAt()).isNotNull();
        assertThat(session.canAcceptAttempt()).isFalse();
    }

    @Test
    @DisplayName("Should throw IllegalStateException when attempting to complete an already finished session")
    void shouldThrowExceptionWhenCompletingFinishedSession() {
        PracticeSession session = new PracticeSession();
        session.complete();

        assertThatThrownBy(session::complete)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Session is not in progress");
    }

    @Test
    @DisplayName("Should abandon an in-progress session and disallow future attempts")
    void shouldAbandonSession() {
        PracticeSession session = new PracticeSession();
        session.abandon();

        assertThat(session.getStatus()).isEqualTo(SessionStatus.ABANDONED);
        assertThat(session.getCompletedAt()).isNotNull();
        assertThat(session.canAcceptAttempt()).isFalse();
    }

    @Test
    @DisplayName("Should increment correct questions counter monotonically")
    void shouldIncrementCorrectCount() {
        PracticeSession session = new PracticeSession();
        assertThat(session.getCorrectCount()).isZero();

        session.incrementCorrectCount();
        session.incrementCorrectCount();
        session.incrementCorrectCount();

        assertThat(session.getCorrectCount()).isEqualTo(3);
    }

    @ParameterizedTest(name = "{0} correct out of {1} total = {2}% score")
    @CsvSource({
            "0, 10, 0.00",
            "5, 10, 50.00",
            "10, 10, 100.00",
            "1, 3, 33.33",
            "2, 3, 66.67",
            "7, 9, 77.78",
            "0, 0, 0"
    })
    @DisplayName("Should calculate score percentage with half-up rounding and 2-decimal precision")
    void shouldCalculateScorePercentage(int correctCount, int totalQuestions, String expectedPercentage) {
        PracticeSession session = new PracticeSession();
        session.setTotalQuestions(totalQuestions);
        session.setCorrectCount(correctCount);

        BigDecimal scorePercentage = session.getScorePercentage();

        assertThat(scorePercentage).isEqualByComparingTo(expectedPercentage);
    }

    @Test
    @DisplayName("Should collect questions and student attempts in order")
    void shouldCollectQuestionsAndAttempts() {
        PracticeSession session = new PracticeSession();
        Question q1 = new Question();
        q1.setId(UUID.randomUUID());

        StudentAttempt attempt1 = new StudentAttempt(
                UUID.randomUUID(),
                session.getId(),
                q1.getId(),
                'B',
                true,
                45
        );

        session.addQuestion(q1);
        session.addAttempt(attempt1);

        assertThat(session.getQuestions()).containsExactly(q1);
        assertThat(session.getAttempts()).containsExactly(attempt1);
    }
}
