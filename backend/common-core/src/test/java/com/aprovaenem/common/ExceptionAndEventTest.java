package com.aprovaenem.common;

import com.aprovaenem.common.events.DailyGoalReminderEvent;
import com.aprovaenem.common.events.EmailVerificationRequestedEvent;
import com.aprovaenem.common.events.UserRegisteredEvent;
import com.aprovaenem.common.exception.BusinessException;
import com.aprovaenem.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Common Exceptions and Events Unit Tests")
class ExceptionAndEventTest {

    @Test
    @DisplayName("Should instantiate BusinessException with message and optional cause")
    void shouldHandleBusinessException() {
        BusinessException ex1 = new BusinessException("Quota exhausted");
        assertThat(ex1.getMessage()).isEqualTo("Quota exhausted");

        IllegalArgumentException cause = new IllegalArgumentException("Root cause");
        BusinessException ex2 = new BusinessException("Wrapping error", cause);
        assertThat(ex2.getMessage()).isEqualTo("Wrapping error");
        assertThat(ex2.getCause()).isEqualTo(cause);
    }

    @Test
    @DisplayName("Should instantiate ResourceNotFoundException with resource name and identifier")
    void shouldHandleResourceNotFoundException() {
        UUID questionId = UUID.randomUUID();
        ResourceNotFoundException ex = new ResourceNotFoundException("Question", questionId);

        assertThat(ex.getMessage()).contains("Question").contains(questionId.toString());

        ResourceNotFoundException exSimple = new ResourceNotFoundException("Session not found");
        assertThat(exSimple.getMessage()).isEqualTo("Session not found");
    }

    @Test
    @DisplayName("Should construct and inspect UserRegisteredEvent")
    void shouldConstructUserRegisteredEvent() {
        UUID userId = UUID.randomUUID();
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(userId)
                .email("student@escola.gov.br")
                .fullName("Estudante ENEM")
                .schoolType("PUBLIC_SCHOOL")
                .role("ROLE_STUDENT")
                .build();

        assertThat(event.getUserId()).isEqualTo(userId);
        assertThat(event.getEmail()).isEqualTo("student@escola.gov.br");
        assertThat(event.getFullName()).isEqualTo("Estudante ENEM");
        assertThat(event.getSchoolType()).isEqualTo("PUBLIC_SCHOOL");
        assertThat(event.getRole()).isEqualTo("ROLE_STUDENT");
        assertThat(event.getOccurredAt()).isNotNull();
    }

    @Test
    @DisplayName("Should construct and inspect DailyGoalReminderEvent")
    void shouldConstructDailyGoalReminderEvent() {
        UUID userId = UUID.randomUUID();
        DailyGoalReminderEvent event = DailyGoalReminderEvent.builder()
                .userId(userId)
                .email("student@escola.gov.br")
                .fullName("Mariana Souza")
                .streakDays(7)
                .questionsCompleted(7)
                .targetQuestions(10)
                .build();

        assertThat(event.getUserId()).isEqualTo(userId);
        assertThat(event.getEmail()).isEqualTo("student@escola.gov.br");
        assertThat(event.getFullName()).isEqualTo("Mariana Souza");
        assertThat(event.getStreakDays()).isEqualTo(7);
        assertThat(event.getQuestionsCompleted()).isEqualTo(7);
        assertThat(event.getTargetQuestions()).isEqualTo(10);
        assertThat(event.getOccurredAt()).isNotNull();
    }

    @Test
    @DisplayName("Should construct and inspect EmailVerificationRequestedEvent")
    void shouldConstructEmailVerificationRequestedEvent() {
        UUID userId = UUID.randomUUID();
        EmailVerificationRequestedEvent event = EmailVerificationRequestedEvent.builder()
                .userId(userId)
                .email("student@escola.gov.br")
                .verificationToken("token-abc")
                .build();

        assertThat(event.getUserId()).isEqualTo(userId);
        assertThat(event.getEmail()).isEqualTo("student@escola.gov.br");
        assertThat(event.getVerificationToken()).isEqualTo("token-abc");
        assertThat(event.getOccurredAt()).isNotNull();
    }

    @Test
    @DisplayName("Should instantiate AccessDeniedException with message and optional cause")
    void shouldHandleAccessDeniedException() {
        com.aprovaenem.common.exception.AccessDeniedException ex1 =
                new com.aprovaenem.common.exception.AccessDeniedException("Access denied");
        assertThat(ex1.getMessage()).isEqualTo("Access denied");

        IllegalArgumentException cause = new IllegalArgumentException("Root cause");
        com.aprovaenem.common.exception.AccessDeniedException ex2 =
                new com.aprovaenem.common.exception.AccessDeniedException("Forbidden", cause);
        assertThat(ex2.getMessage()).isEqualTo("Forbidden");
        assertThat(ex2.getCause()).isEqualTo(cause);
    }
}
