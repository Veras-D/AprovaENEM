package com.aprovaenem.auth.domain.port.out;

import com.aprovaenem.auth.domain.model.User;

import java.util.UUID;

public interface TokenProviderPort {

    String generateToken(User user);

    UUID extractUserId(String token);

    String extractEmail(String token);

    String extractRole(String token);

    boolean validateToken(String token);

    long getExpirationSeconds();
}
