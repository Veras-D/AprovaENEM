package com.aprovaenem.auth.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private UUID userId;
    private String email;
    private String fullName;
    private String role;
    private boolean isEmailVerified;
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private long expiresInSeconds;
}
