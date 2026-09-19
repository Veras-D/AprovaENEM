package com.aprovaenem.auth.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnonymousSessionResponse {

    private String sessionId;
    private boolean isAnonymous;
    private Instant expiresAt;
    private String message;
}
