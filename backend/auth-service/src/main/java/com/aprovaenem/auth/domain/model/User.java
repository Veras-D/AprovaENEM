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
public class User {

    private UUID id;
    private String email;
    private String passwordHash;
    private String fullName;
    private SchoolType schoolType;
    private String targetDegree;
    private UserRole role;
    private boolean isActive;
    private boolean isEmailVerified;
    private String emailVerificationToken;
    private Instant emailVerificationExpiresAt;
    private String passwordResetToken;
    private Instant passwordResetExpiresAt;
    private Instant createdAt;
    private Instant updatedAt;
}
