package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.OutboxEvent;
import com.aprovaenem.auth.domain.model.SchoolType;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.model.UserRole;
import com.aprovaenem.auth.domain.port.in.AuthUseCase;
import com.aprovaenem.auth.domain.port.out.OutboxRepositoryPort;
import com.aprovaenem.auth.domain.port.out.PasswordEncoderPort;
import com.aprovaenem.auth.domain.port.out.TokenProviderPort;
import com.aprovaenem.auth.domain.port.out.UserRepositoryPort;
import com.aprovaenem.common.events.EmailVerificationRequestedEvent;
import com.aprovaenem.common.events.UserRegisteredEvent;
import com.aprovaenem.common.exception.BusinessException;
import com.aprovaenem.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements AuthUseCase {

    private final UserRepositoryPort userRepository;
    private final OutboxRepositoryPort outboxRepository;
    private final PasswordEncoderPort passwordEncoder;
    private final TokenProviderPort tokenProvider;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public User register(String email, String rawPassword, String fullName, SchoolType schoolType, String targetDegree) {
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("An account with email " + normalizedEmail + " already exists.");
        }

        String passwordHash = passwordEncoder.encode(rawPassword);
        String verificationToken = UUID.randomUUID().toString().replace("-", "");
        Instant now = Instant.now();
        Instant tokenExpiresAt = now.plus(24, ChronoUnit.HOURS);

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordHash)
                .fullName(fullName.trim())
                .schoolType(schoolType != null ? schoolType : SchoolType.PUBLIC_SCHOOL)
                .targetDegree(targetDegree)
                .role(UserRole.ROLE_STUDENT)
                .isActive(true)
                .isEmailVerified(false)
                .emailVerificationToken(verificationToken)
                .emailVerificationExpiresAt(tokenExpiresAt)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User savedUser = userRepository.save(user);

        // Transactional Outbox Events (atomically committed in the same database transaction)
        publishOutboxEvent(
                "USER",
                savedUser.getId(),
                "UserRegisteredEvent",
                UserRegisteredEvent.builder()
                        .userId(savedUser.getId())
                        .email(savedUser.getEmail())
                        .fullName(savedUser.getFullName())
                        .schoolType(savedUser.getSchoolType().name())
                        .role(savedUser.getRole().name())
                        .occurredAt(now)
                        .build()
        );

        publishOutboxEvent(
                "USER",
                savedUser.getId(),
                "EmailVerificationRequestedEvent",
                EmailVerificationRequestedEvent.builder()
                        .userId(savedUser.getId())
                        .email(savedUser.getEmail())
                        .fullName(savedUser.getFullName())
                        .verificationToken(verificationToken)
                        .expiresAt(tokenExpiresAt)
                        .occurredAt(now)
                        .build()
        );

        log.info("Registered new user [{}] with role [{}] and pending email verification", savedUser.getId(), savedUser.getRole());
        return savedUser;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResult login(String email, String rawPassword) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException("Invalid email or credentials."));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BusinessException("Invalid email or credentials.");
        }

        if (!user.isActive()) {
            throw new BusinessException("Your account has been deactivated. Please contact support.");
        }

        String token = tokenProvider.generateToken(user);
        long expiresInSeconds = tokenProvider.getExpirationSeconds();

        return new AuthResult(user, token, expiresInSeconds);
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDataExport exportUserData(UUID userId) {
        User user = getCurrentUser(userId);
        return new UserDataExport(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getSchoolType().name(),
                user.getTargetDegree(),
                user.getRole().name(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                Instant.now(),
                "Art. 7º, I e Art. 14 (Consentimento e Melhor Interesse do Estudante / LGPD)",
                "2026.1-v1.0"
        );
    }

    @Override
    @Transactional
    public void deleteAccount(UUID userId) {
        User user = getCurrentUser(userId);
        userRepository.deleteById(user.getId());
        log.info("LGPD Art. 18 Purge: User [{}] account and personal identifiers permanently deleted", userId);
    }

    private void publishOutboxEvent(String aggregateType, UUID aggregateId, String eventType, Object payloadObject) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(payloadObject);
            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .payload(jsonPayload)
                    .status("PENDING")
                    .retryCount(0)
                    .createdAt(Instant.now())
                    .build();

            outboxRepository.save(outboxEvent);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize outbox event payload for event [{}]", eventType, e);
            throw new BusinessException("Failed to register domain event", e);
        }
    }
}
