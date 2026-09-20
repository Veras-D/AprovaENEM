package com.aprovaenem.auth.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.auth.domain.model.OutboxEvent;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.OutboxEventEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataOutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("OutboxRepositoryAdapter Unit Tests")
class OutboxRepositoryAdapterTest {

    @Mock
    private SpringDataOutboxEventRepository outboxRepository;

    private OutboxRepositoryAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new OutboxRepositoryAdapter(outboxRepository);
    }

    @Test
    @DisplayName("Should save outbox event and convert to domain")
    void shouldSaveOutboxEvent() {
        UUID id = UUID.randomUUID();
        UUID aggId = UUID.randomUUID();
        OutboxEvent event = OutboxEvent.builder()
                .id(id)
                .aggregateType("User")
                .aggregateId(aggId)
                .eventType("UserRegisteredEvent")
                .payload("{\"test\": true}")
                .status("PENDING")
                .retryCount(0)
                .createdAt(Instant.now())
                .build();

        OutboxEventEntity entity = OutboxEventEntity.builder()
                .id(id)
                .aggregateType("User")
                .aggregateId(aggId)
                .eventType("UserRegisteredEvent")
                .payload("{\"test\": true}")
                .status("PENDING")
                .retryCount(0)
                .createdAt(Instant.now())
                .build();

        when(outboxRepository.save(any(OutboxEventEntity.class))).thenReturn(entity);

        OutboxEvent saved = adapter.save(event);
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isEqualTo(id);
        assertThat(saved.getEventType()).isEqualTo("UserRegisteredEvent");
    }

    @Test
    @DisplayName("Should find pending events with lock")
    void shouldFindPendingEvents() {
        UUID id = UUID.randomUUID();
        UUID aggId = UUID.randomUUID();
        OutboxEventEntity entity = OutboxEventEntity.builder()
                .id(id)
                .aggregateType("User")
                .aggregateId(aggId)
                .eventType("UserRegisteredEvent")
                .payload("{\"test\": true}")
                .status("PENDING")
                .retryCount(0)
                .createdAt(Instant.now())
                .build();

        when(outboxRepository.findPendingEventsForUpdate(10)).thenReturn(List.of(entity));

        List<OutboxEvent> list = adapter.findPendingEventsWithLock(10);
        assertThat(list).hasSize(1);
        assertThat(list.get(0).getId()).isEqualTo(id);
    }

    @Test
    @DisplayName("Should mark event as published")
    void shouldMarkPublished() {
        UUID id = UUID.randomUUID();
        OutboxEventEntity entity = OutboxEventEntity.builder()
                .id(id)
                .status("PENDING")
                .build();

        when(outboxRepository.findById(id)).thenReturn(Optional.of(entity));

        adapter.markPublished(id);

        assertThat(entity.getStatus()).isEqualTo("PUBLISHED");
        assertThat(entity.getPublishedAt()).isNotNull();
        verify(outboxRepository).save(entity);
    }

    @Test
    @DisplayName("Should mark event as failed with error message and incremented retry count")
    void shouldMarkFailed() {
        UUID id = UUID.randomUUID();
        OutboxEventEntity entity = OutboxEventEntity.builder()
                .id(id)
                .status("PENDING")
                .retryCount(1)
                .build();

        when(outboxRepository.findById(id)).thenReturn(Optional.of(entity));

        adapter.markFailed(id, "Connection refused");

        assertThat(entity.getStatus()).isEqualTo("FAILED");
        assertThat(entity.getRetryCount()).isEqualTo(2);
        assertThat(entity.getErrorMessage()).isEqualTo("Connection refused");
        verify(outboxRepository).save(entity);
    }
}
