package com.aprovaenem.auth.domain.port.in;

import com.aprovaenem.auth.domain.model.SchoolType;
import com.aprovaenem.auth.domain.model.User;

import java.util.UUID;

public interface AuthUseCase {

    User register(String email, String rawPassword, String fullName, SchoolType schoolType, String targetDegree);

    AuthResult login(String email, String rawPassword);

    User getCurrentUser(UUID userId);

    UserDataExport exportUserData(UUID userId);

    void deleteAccount(UUID userId);

    record AuthResult(User user, String token, long expiresInSeconds) {}

    record UserDataExport(
            UUID userId,
            String email,
            String fullName,
            String schoolType,
            String targetDegree,
            String role,
            boolean isEmailVerified,
            java.time.Instant createdAt,
            java.time.Instant exportTimestamp,
            String legalBasis,
            String privacyPolicyVersion
    ) {}
}
