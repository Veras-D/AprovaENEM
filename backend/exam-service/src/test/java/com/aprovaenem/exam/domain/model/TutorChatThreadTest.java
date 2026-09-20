package com.aprovaenem.exam.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("TutorChatThread Domain Model Unit Tests")
class TutorChatThreadTest {

    @Test
    @DisplayName("Should initialize TutorChatThread with default 6 max turns and ACTIVE status")
    void shouldInitializeThreadWithDefaults() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();

        TutorChatThread thread = new TutorChatThread(
                id,
                userId,
                questionId,
                null,
                0,
                0, // should default to 6
                null,
                null,
                null,
                null
        );

        assertThat(thread.getId()).isEqualTo(id);
        assertThat(thread.getUserId()).isEqualTo(userId);
        assertThat(thread.getQuestionId()).isEqualTo(questionId);
        assertThat(thread.getStatus()).isEqualTo(ThreadStatus.ACTIVE);
        assertThat(thread.getTurnCount()).isZero();
        assertThat(thread.getMaxTurns()).isEqualTo(6);
        assertThat(thread.canAcceptTurn()).isTrue();
        assertThat(thread.getMessages()).isEmpty();
    }

    @Test
    @DisplayName("Should allow turns while under max turns and thread is ACTIVE")
    void shouldAllowTurnsUnderLimit() {
        TutorChatThread thread = new TutorChatThread(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                ThreadStatus.ACTIVE,
                0,
                6,
                Instant.now(),
                Instant.now(),
                Instant.now(),
                new ArrayList<>()
        );

        for (int i = 0; i < 5; i++) {
            assertThat(thread.canAcceptTurn()).isTrue();
            thread.incrementTurn();
        }

        assertThat(thread.getTurnCount()).isEqualTo(5);
        assertThat(thread.canAcceptTurn()).isTrue();

        thread.incrementTurn();
        assertThat(thread.getTurnCount()).isEqualTo(6);
        assertThat(thread.canAcceptTurn()).isFalse(); // limit reached
    }

    @Test
    @DisplayName("Should disallow turns when thread is marked as RESET")
    void shouldDisallowTurnsWhenReset() {
        TutorChatThread thread = new TutorChatThread(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                ThreadStatus.ACTIVE,
                1,
                6,
                Instant.now(),
                Instant.now(),
                Instant.now(),
                new ArrayList<>()
        );

        assertThat(thread.canAcceptTurn()).isTrue();

        thread.reset();

        assertThat(thread.getStatus()).isEqualTo(ThreadStatus.RESET);
        assertThat(thread.canAcceptTurn()).isFalse();
    }

    @Test
    @DisplayName("Should add chat messages to the conversation thread chronologically")
    void shouldAddMessagesToThread() {
        TutorChatThread thread = new TutorChatThread(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                ThreadStatus.ACTIVE,
                0,
                6,
                Instant.now(),
                Instant.now(),
                Instant.now(),
                new ArrayList<>()
        );

        TutorChatMessage userMsg = new TutorChatMessage(
                UUID.randomUUID(),
                thread.getId(),
                ChatRole.STUDENT,
                "Como calcular a corrente do disjuntor?",
                25,
                0,
                "gemini-1.5-flash",
                Instant.now()
        );

        TutorChatMessage aiMsg = new TutorChatMessage(
                UUID.randomUUID(),
                thread.getId(),
                ChatRole.AI_TUTOR,
                "Pense na relação entre Potência e Tensão elétrica (P = V * I). O que acontece com a corrente?",
                50,
                35,
                "gemini-1.5-flash",
                Instant.now()
        );

        thread.addMessage(userMsg);
        thread.addMessage(aiMsg);

        assertThat(thread.getMessages()).hasSize(2);
        assertThat(thread.getMessages().get(0).getContent()).contains("corrente do disjuntor");
        assertThat(thread.getMessages().get(1).getContent()).contains("Potência e Tensão");
    }
}
