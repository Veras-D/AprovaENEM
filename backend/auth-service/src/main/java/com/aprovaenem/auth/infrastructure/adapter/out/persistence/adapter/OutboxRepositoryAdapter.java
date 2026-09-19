package com.aprovaenem.auth.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.auth.domain.model.OutboxEvent;
import com.aprovaenem.auth.domain.port.out.OutboxRepositoryPort;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.OutboxEventEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OutboxRepositoryAdapter implements OutboxRepositoryPort {

    private final SpringDataOutboxEventRepository outboxRepository;

    @Override
    public OutboxEvent save(OutboxEvent event) {
        OutboxEventEntity entity = toEntity(event);
        OutboxEventEntity saved = outboxRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<OutboxEvent> findPendingEventsWithLock(int limit) {
        return outboxRepository.findPendingEventsForUpdate(limit)
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public void markPublished(UUID eventId) {
        outboxRepository.findById(eventId).ifPresent(entity -> {
            entity.setStatus("PUBLISHED");
            entity.setPublishedAt(Instant.now());
            outboxRepository.save(entity);
        });
    }

    @Override
    @Transactional
    public void markFailed(UUID eventId, String errorMessage) {
        outboxRepository.findById(eventId).ifPresent(entity -> {
            entity.setStatus("FAILED");
            entity.setRetryCount(entity.getRetryCount() + 1);
            entity.setErrorMessage(errorMessage);
            outboxRepository.save(entity);
        });
    }

    private OutboxEventEntity toEntity(OutboxEvent event) {
        return OutboxEventEntity.builder()
                .id(event.getId())
                .aggregateType(event.getAggregateType())
                .aggregateId(event.getAggregateId())
                .eventType(event.getEventType())
                .payload(event.getPayload())
                .status(event.getStatus())
                .retryCount(event.getRetryCount())
                .createdAt(event.getCreatedAt())
                .publishedAt(event.getPublishedAt())
                .errorMessage(event.getErrorMessage())
                .build();
    }

    private OutboxEvent toDomain(OutboxEventEntity entity) {
        return OutboxEvent.builder()
                .id(entity.getId())
                .aggregateType(entity.getAggregateType())
                .aggregateId(entity.getAggregateId())
                .eventType(entity.getEventType())
                .payload(entity.getPayload())
                .status(entity.getStatus())
                .retryCount(entity.getRetryCount())
                .createdAt(entity.getCreatedAt())
                .publishedAt(entity.getPublishedAt())
                .errorMessage(entity.getErrorMessage())
                .build();
    }
}
