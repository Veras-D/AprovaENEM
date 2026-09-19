package com.aprovaenem.auth.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutboxEvent {

    private UUID id;
    private String aggregateType;
    private UUID aggregateId;
    private String eventType;
    private String payload;
    private String status; // 'PENDING', 'PUBLISHED', 'FAILED'
    private int retryCount;
    private Instant createdAt;
    private Instant publishedAt;
    private String errorMessage;
}
