package com.aprovaenem.auth.domain.port.in;

import com.aprovaenem.auth.domain.model.SchoolType;
import com.aprovaenem.auth.domain.model.User;

import java.util.UUID;

public interface AuthUseCase {

    User register(String email, String rawPassword, String fullName, SchoolType schoolType, String targetDegree);

    AuthResult login(String email, String rawPassword);

    User getCurrentUser(UUID userId);

    record AuthResult(User user, String token, long expiresInSeconds) {}
}
