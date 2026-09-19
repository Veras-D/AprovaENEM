package com.aprovaenem.auth.domain.port.out;

import com.aprovaenem.auth.domain.model.OutboxEvent;

import java.util.List;
import java.util.UUID;

public interface OutboxRepositoryPort {

    OutboxEvent save(OutboxEvent event);

    List<OutboxEvent> findPendingEventsWithLock(int limit);

    void markPublished(UUID eventId);

    void markFailed(UUID eventId, String errorMessage);
}
