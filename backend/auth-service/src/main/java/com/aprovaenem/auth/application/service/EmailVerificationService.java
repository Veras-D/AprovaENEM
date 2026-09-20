package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.OutboxEvent;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.port.in.EmailVerificationUseCase;
import com.aprovaenem.auth.domain.port.out.OutboxRepositoryPort;
import com.aprovaenem.auth.domain.port.out.UserRepositoryPort;
import com.aprovaenem.common.events.EmailVerificationRequestedEvent;
import com.aprovaenem.common.exception.BusinessException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService implements EmailVerificationUseCase {

    private final UserRepositoryPort userRepository;
    private final OutboxRepositoryPort outboxRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public boolean verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new BusinessException("Verification token cannot be empty.");
        }

        User user = userRepository.findByEmailVerificationToken(token.trim())
                .orElseThrow(() -> new BusinessException(
                        "The email verification token is invalid or has expired (24h TTL). Please request a new verification link."));

        if (user.getEmailVerificationExpiresAt() != null && Instant.now().isAfter(user.getEmailVerificationExpiresAt())) {
            throw new BusinessException("The email verification token is invalid or has expired (24h TTL). Please request a new verification link.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
        log.info("Email verified successfully for user [{}]", user.getId());
        return true;
    }

    @Override
    @Transactional
    public boolean resendVerificationEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isEmpty()) {
            // Return true silently to avoid account enumeration attacks
            return true;
        }

        User user = userOpt.get();
        if (user.isEmailVerified()) {
            return true;
        }

        String newToken = UUID.randomUUID().toString().replace("-", "");
        Instant now = Instant.now();
        Instant expiresAt = now.plus(24, ChronoUnit.HOURS);

        user.setEmailVerificationToken(newToken);
        user.setEmailVerificationExpiresAt(expiresAt);
        user.setUpdatedAt(now);

        userRepository.save(user);

        try {
            EmailVerificationRequestedEvent event = EmailVerificationRequestedEvent.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .verificationToken(newToken)
                    .expiresAt(expiresAt)
                    .occurredAt(now)
                    .build();

            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .aggregateType("USER")
                    .aggregateId(user.getId())
                    .eventType("EmailVerificationRequestedEvent")
                    .payload(objectMapper.writeValueAsString(event))
                    .status("PENDING")
                    .retryCount(0)
                    .createdAt(now)
                    .build();

            outboxRepository.save(outboxEvent);
            log.info("Dispatched new email verification token for user [{}]", user.getId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize resend email verification outbox event for user [{}]", user.getId(), e);
            throw new BusinessException("Failed to dispatch verification email", e);
        }

        return true;
    }
}
