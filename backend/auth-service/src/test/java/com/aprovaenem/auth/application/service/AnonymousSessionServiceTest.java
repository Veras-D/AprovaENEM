package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.AnonymousSession;
import com.aprovaenem.auth.domain.port.out.AnonymousSessionRepositoryPort;
import com.aprovaenem.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AnonymousSessionService Application Service Unit Tests")
class AnonymousSessionServiceTest {

    @Mock
    private AnonymousSessionRepositoryPort sessionRepository;

    @InjectMocks
    private AnonymousSessionService sessionService;

    @Test
    @DisplayName("Should provision anonymous session with SHA-256 hashed IP and 30-day TTL")
    void shouldProvisionAnonymousSessionWithHashedIp() {
        String ipAddress = "192.168.1.100";

        when(sessionRepository.save(any(AnonymousSession.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        AnonymousSession session = sessionService.provisionSession(ipAddress);

        assertThat(session).isNotNull();
        assertThat(session.getSessionUuid()).isNotBlank();
        assertThat(session.getIpHash()).isNotNull();
        assertThat(session.getIpHash()).isNotEqualTo(ipAddress); // must be hashed, not raw IP
        assertThat(session.getExpiresAt()).isAfter(Instant.now().plus(29, ChronoUnit.DAYS));
        verify(sessionRepository).save(session);
    }

    @Test
    @DisplayName("Should provision anonymous session with null ipHash when IP is blank or null")
    void shouldProvisionSessionWithNullIpWhenBlank() {
        when(sessionRepository.save(any(AnonymousSession.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        AnonymousSession sessionNull = sessionService.provisionSession(null);
        assertThat(sessionNull.getIpHash()).isNull();

        AnonymousSession sessionBlank = sessionService.provisionSession("   ");
        assertThat(sessionBlank.getIpHash()).isNull();
    }

    @Test
    @DisplayName("Should retrieve anonymous session by UUID when existing")
    void shouldGetExistingSession() {
        String sessionUuid = UUID.randomUUID().toString();
        AnonymousSession session = AnonymousSession.builder()
                .sessionUuid(sessionUuid)
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                .build();

        when(sessionRepository.findBySessionUuid(sessionUuid)).thenReturn(Optional.of(session));

        AnonymousSession found = sessionService.getSession(sessionUuid);

        assertThat(found).isNotNull();
        assertThat(found.getSessionUuid()).isEqualTo(sessionUuid);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when session UUID does not exist")
    void shouldThrowExceptionWhenSessionNotFound() {
        String nonExistentUuid = UUID.randomUUID().toString();
        when(sessionRepository.findBySessionUuid(nonExistentUuid)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.getSession(nonExistentUuid))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Anonymous session");
    }

    @Test
    @DisplayName("Should claim anonymous session by assigning user ID and updating activity timestamp")
    void shouldClaimSession() {
        String sessionUuid = UUID.randomUUID().toString();
        UUID userId = UUID.randomUUID();
        Instant originalActive = Instant.now().minus(1, ChronoUnit.HOURS);

        AnonymousSession session = AnonymousSession.builder()
                .sessionUuid(sessionUuid)
                .createdAt(originalActive)
                .lastActiveAt(originalActive)
                .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                .build();

        when(sessionRepository.findBySessionUuid(sessionUuid)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(AnonymousSession.class))).thenAnswer(inv -> inv.getArgument(0));

        sessionService.claimSession(sessionUuid, userId);

        assertThat(session.getClaimedByUserId()).isEqualTo(userId);
        assertThat(session.getLastActiveAt()).isAfter(originalActive);
        verify(sessionRepository).save(session);
    }
}
