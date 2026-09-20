package com.aprovaenem.auth.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AnonymousSession Domain Model Unit Tests")
class AnonymousSessionTest {

    @Test
    @DisplayName("Should detect non-expired active session when expiresAt is in the future")
    void shouldDetectActiveSession() {
        AnonymousSession session = AnonymousSession.builder()
                .id(UUID.randomUUID())
                .sessionUuid(UUID.randomUUID().toString())
                .ipHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
                .createdAt(Instant.now())
                .lastActiveAt(Instant.now())
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();

        assertThat(session.isExpired()).isFalse();
        assertThat(session.getClaimedByUserId()).isNull();
    }

    @Test
    @DisplayName("Should detect expired session when expiresAt is in the past")
    void shouldDetectExpiredSession() {
        AnonymousSession session = AnonymousSession.builder()
                .id(UUID.randomUUID())
                .sessionUuid(UUID.randomUUID().toString())
                .createdAt(Instant.now().minus(48, ChronoUnit.HOURS))
                .expiresAt(Instant.now().minus(1, ChronoUnit.HOURS))
                .build();

        assertThat(session.isExpired()).isTrue();
    }

    @Test
    @DisplayName("Should return false for expiration when expiresAt is null")
    void shouldHandleNullExpiresAt() {
        AnonymousSession session = AnonymousSession.builder()
                .id(UUID.randomUUID())
                .sessionUuid(UUID.randomUUID().toString())
                .expiresAt(null)
                .build();

        assertThat(session.isExpired()).isFalse();
    }

    @Test
    @DisplayName("Should associate claimed userId upon student registration")
    void shouldClaimSessionForRegisteredUser() {
        UUID claimedUserId = UUID.randomUUID();
        AnonymousSession session = AnonymousSession.builder()
                .id(UUID.randomUUID())
                .sessionUuid(UUID.randomUUID().toString())
                .build();

        session.setClaimedByUserId(claimedUserId);

        assertThat(session.getClaimedByUserId()).isEqualTo(claimedUserId);
    }
}
