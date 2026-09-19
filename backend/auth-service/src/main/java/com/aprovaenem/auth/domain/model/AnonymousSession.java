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
public class AnonymousSession {

    private UUID id;
    private String sessionUuid;
    private UUID claimedByUserId;
    private String ipHash;
    private Instant createdAt;
    private Instant lastActiveAt;
    private Instant expiresAt;

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}
