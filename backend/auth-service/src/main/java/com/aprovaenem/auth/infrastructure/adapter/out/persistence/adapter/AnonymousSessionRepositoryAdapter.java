package com.aprovaenem.auth.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.auth.domain.model.AnonymousSession;
import com.aprovaenem.auth.domain.port.out.AnonymousSessionRepositoryPort;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.AnonymousSessionEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataAnonymousSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AnonymousSessionRepositoryAdapter implements AnonymousSessionRepositoryPort {

    private final SpringDataAnonymousSessionRepository sessionRepository;

    @Override
    public AnonymousSession save(AnonymousSession session) {
        AnonymousSessionEntity entity = toEntity(session);
        AnonymousSessionEntity saved = sessionRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<AnonymousSession> findBySessionUuid(String sessionUuid) {
        return sessionRepository.findBySessionUuid(sessionUuid).map(this::toDomain);
    }

    private AnonymousSessionEntity toEntity(AnonymousSession session) {
        return AnonymousSessionEntity.builder()
                .id(session.getId())
                .sessionUuid(session.getSessionUuid())
                .claimedByUserId(session.getClaimedByUserId())
                .ipHash(session.getIpHash())
                .createdAt(session.getCreatedAt())
                .lastActiveAt(session.getLastActiveAt())
                .build();
    }

    private AnonymousSession toDomain(AnonymousSessionEntity entity) {
        return AnonymousSession.builder()
                .id(entity.getId())
                .sessionUuid(entity.getSessionUuid())
                .claimedByUserId(entity.getClaimedByUserId())
                .ipHash(entity.getIpHash())
                .createdAt(entity.getCreatedAt())
                .lastActiveAt(entity.getLastActiveAt())
                .expiresAt(entity.getCreatedAt() != null ? entity.getCreatedAt().plus(30, java.time.temporal.ChronoUnit.DAYS) : null)
                .build();
    }
}
