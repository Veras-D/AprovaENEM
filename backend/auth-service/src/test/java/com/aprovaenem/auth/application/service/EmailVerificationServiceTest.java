package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.OutboxEvent;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.port.out.OutboxRepositoryPort;
import com.aprovaenem.auth.domain.port.out.UserRepositoryPort;
import com.aprovaenem.common.exception.BusinessException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailVerificationService Application Service Unit Tests")
class EmailVerificationServiceTest {

    @Mock
    private UserRepositoryPort userRepository;

    @Mock
    private OutboxRepositoryPort outboxRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @InjectMocks
    private EmailVerificationService emailVerificationService;

    @Test
    @DisplayName("Should throw BusinessException when verification token is null or blank")
    void shouldThrowExceptionWhenTokenIsBlank() {
        assertThatThrownBy(() -> emailVerificationService.verifyEmail(null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Verification token cannot be empty");

        assertThatThrownBy(() -> emailVerificationService.verifyEmail("   "))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Verification token cannot be empty");
    }

    @Test
    @DisplayName("Should throw BusinessException when verification token does not match any user")
    void shouldThrowExceptionWhenTokenNotFound() {
        String token = "invalid-token-12345";
        when(userRepository.findByEmailVerificationToken(token)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> emailVerificationService.verifyEmail(token))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("invalid or has expired");
    }

    @Test
    @DisplayName("Should throw BusinessException when verification token is expired past 24h TTL")
    void shouldThrowExceptionWhenTokenExpired() {
        String token = "expired-token-12345";
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("student@escola.gov.br")
                .isEmailVerified(false)
                .emailVerificationToken(token)
                .emailVerificationExpiresAt(Instant.now().minus(2, ChronoUnit.HOURS)) // expired
                .build();

        when(userRepository.findByEmailVerificationToken(token)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> emailVerificationService.verifyEmail(token))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("invalid or has expired");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should successfully verify email, clear token, and persist user")
    void shouldVerifyEmailSuccessfully() {
        String token = "valid-token-12345";
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("student@escola.gov.br")
                .isEmailVerified(false)
                .emailVerificationToken(token)
                .emailVerificationExpiresAt(Instant.now().plus(12, ChronoUnit.HOURS))
                .build();

        when(userRepository.findByEmailVerificationToken(token)).thenReturn(Optional.of(user));

        boolean result = emailVerificationService.verifyEmail(token);

        assertThat(result).isTrue();
        assertThat(user.isEmailVerified()).isTrue();
        assertThat(user.getEmailVerificationToken()).isNull();
        assertThat(user.getEmailVerificationExpiresAt()).isNull();
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should return false when resending verification email with blank address")
    void shouldReturnFalseWhenResendEmailIsBlank() {
        boolean resultNull = emailVerificationService.resendVerificationEmail(null);
        assertThat(resultNull).isFalse();

        boolean resultBlank = emailVerificationService.resendVerificationEmail("   ");
        assertThat(resultBlank).isFalse();
    }

    @Test
    @DisplayName("Should return true silently when resending email for non-existent user to avoid enumeration")
    void shouldReturnTrueSilentlyWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@escola.gov.br")).thenReturn(Optional.empty());

        boolean result = emailVerificationService.resendVerificationEmail("unknown@escola.gov.br");

        assertThat(result).isTrue();
        verify(userRepository, never()).save(any());
        verify(outboxRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return true immediately without generating token when user is already verified")
    void shouldReturnTrueWhenUserAlreadyVerified() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("verified@escola.gov.br")
                .isEmailVerified(true)
                .build();

        when(userRepository.findByEmail("verified@escola.gov.br")).thenReturn(Optional.of(user));

        boolean result = emailVerificationService.resendVerificationEmail("verified@escola.gov.br");

        assertThat(result).isTrue();
        verify(userRepository, never()).save(any());
        verify(outboxRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should generate new token, update user, and publish outbox event when resending verification")
    void shouldResendVerificationSuccessfully() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("unverified@escola.gov.br")
                .fullName("Estudante Não Verificado")
                .isEmailVerified(false)
                .build();

        when(userRepository.findByEmail("unverified@escola.gov.br")).thenReturn(Optional.of(user));

        boolean result = emailVerificationService.resendVerificationEmail("unverified@escola.gov.br");

        assertThat(result).isTrue();
        assertThat(user.getEmailVerificationToken()).isNotBlank();
        assertThat(user.getEmailVerificationExpiresAt()).isAfter(Instant.now().plus(23, ChronoUnit.HOURS));
        verify(userRepository).save(user);

        ArgumentCaptor<OutboxEvent> outboxCaptor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository).save(outboxCaptor.capture());

        OutboxEvent event = outboxCaptor.getValue();
        assertThat(event.getAggregateType()).isEqualTo("USER");
        assertThat(event.getAggregateId()).isEqualTo(userId);
        assertThat(event.getEventType()).isEqualTo("EmailVerificationRequestedEvent");
        assertThat(event.getPayload()).contains(user.getEmail());
    }
}
