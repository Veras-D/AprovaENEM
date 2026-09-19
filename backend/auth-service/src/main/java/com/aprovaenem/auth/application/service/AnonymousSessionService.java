package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.AnonymousSession;
import com.aprovaenem.auth.domain.port.in.AnonymousSessionUseCase;
import com.aprovaenem.auth.domain.port.out.AnonymousSessionRepositoryPort;
import com.aprovaenem.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnonymousSessionService implements AnonymousSessionUseCase {

    private final AnonymousSessionRepositoryPort sessionRepository;

    @Override
    @Transactional
    public AnonymousSession provisionSession(String ipAddress) {
        String sessionUuid = UUID.randomUUID().toString();
        Instant now = Instant.now();
        Instant expiresAt = now.plus(30, ChronoUnit.DAYS);

        String ipHash = hashIp(ipAddress);

        AnonymousSession session = AnonymousSession.builder()
                .sessionUuid(sessionUuid)
                .ipHash(ipHash)
                .createdAt(now)
                .lastActiveAt(now)
                .expiresAt(expiresAt)
                .build();

        return sessionRepository.save(session);
    }

    @Override
    @Transactional(readOnly = true)
    public AnonymousSession getSession(String sessionUuid) {
        return sessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Anonymous session", sessionUuid));
    }

    @Override
    @Transactional
    public void claimSession(String sessionUuid, UUID userId) {
        AnonymousSession session = getSession(sessionUuid);
        session.setClaimedByUserId(userId);
        session.setLastActiveAt(Instant.now());
        sessionRepository.save(session);
    }

    private String hashIp(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ipAddress.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return "UNKNOWN";
        }
    }
}
