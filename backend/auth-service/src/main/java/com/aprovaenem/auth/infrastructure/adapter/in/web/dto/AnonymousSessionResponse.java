package com.aprovaenem.auth.infrastructure.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("isAnonymous")
    private boolean isAnonymous;

    private Instant expiresAt;
    private String message;

    @JsonProperty("anonymous")
    public boolean getAnonymous() {
        return isAnonymous;
    }
}
