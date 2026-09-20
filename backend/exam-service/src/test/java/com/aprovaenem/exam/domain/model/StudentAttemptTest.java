package com.aprovaenem.exam.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("StudentAttempt Domain Model Unit Tests")
class StudentAttemptTest {

    @Test
    @DisplayName("Should create valid student attempt with normalized uppercase option")
    void shouldCreateValidStudentAttempt() {
        UUID id = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();

        StudentAttempt attempt = new StudentAttempt(
                id,
                sessionId,
                questionId,
                'd', // lowercase
                true,
                65
        );

        assertThat(attempt.getId()).isEqualTo(id);
        assertThat(attempt.getSessionId()).isEqualTo(sessionId);
        assertThat(attempt.getQuestionId()).isEqualTo(questionId);
        assertThat(attempt.getSelectedOption()).isEqualTo('D');
        assertThat(attempt.isCorrect()).isTrue();
        assertThat(attempt.getTimeSpentSeconds()).isEqualTo(65);
        assertThat(attempt.getSubmittedAt()).isNotNull();
    }

    @ParameterizedTest(name = "Valid option: {0}")
    @ValueSource(chars = {'a', 'b', 'c', 'd', 'e', 'A', 'B', 'C', 'D', 'E'})
    @DisplayName("Should accept valid option letters from A to E")
    void shouldAcceptValidOptionLetters(char option) {
        StudentAttempt attempt = new StudentAttempt();
        attempt.setSelectedOption(option);

        assertThat(attempt.getSelectedOption()).isEqualTo(Character.toUpperCase(option));
    }

    @ParameterizedTest(name = "Invalid option: {0}")
    @ValueSource(chars = {'f', 'F', '0', 'z', '?', ' '})
    @DisplayName("Should reject invalid options outside A-E range with IllegalArgumentException")
    void shouldRejectInvalidOptionLetters(char option) {
        StudentAttempt attempt = new StudentAttempt();

        assertThatThrownBy(() -> attempt.setSelectedOption(option))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Selected option must be between A and E");
    }

    @Test
    @DisplayName("Should clamp negative time spent to zero")
    void shouldClampNegativeTimeSpentToZero() {
        StudentAttempt attempt = new StudentAttempt(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                'A',
                false,
                -30 // negative seconds
        );

        assertThat(attempt.getTimeSpentSeconds()).isZero();

        attempt.setTimeSpentSeconds(-100);
        assertThat(attempt.getTimeSpentSeconds()).isZero();
    }

    @Test
    @DisplayName("Should update correctness flag accurately")
    void shouldUpdateCorrectnessFlag() {
        StudentAttempt attempt = new StudentAttempt();
        assertThat(attempt.isCorrect()).isFalse();

        attempt.setCorrect(true);
        assertThat(attempt.isCorrect()).isTrue();

        attempt.setCorrect(false);
        assertThat(attempt.isCorrect()).isFalse();
    }
}
