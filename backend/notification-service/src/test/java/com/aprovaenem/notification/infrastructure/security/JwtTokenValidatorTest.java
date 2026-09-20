package com.aprovaenem.notification.infrastructure.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtTokenValidator Unit Tests")
class JwtTokenValidatorTest {

    private static final String SECRET = "super_secret_jwt_key_for_aprovaenem_at_least_256_bits_long_2026!";
    private JwtTokenValidator validator;

    @BeforeEach
    void setUp() {
        validator = new JwtTokenValidator();
        ReflectionTestUtils.setField(validator, "jwtSecret", SECRET);
        validator.init();
    }

    @Test
    @DisplayName("Should validate valid JWT token and extract claims")
    void shouldValidateAndExtractClaims() {
        UUID userId = UUID.randomUUID();
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .subject(userId.toString())
                .claim("role", "ROLE_STUDENT")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        assertThat(validator.validateToken(token)).isTrue();
        assertThat(validator.extractUserId(token)).isEqualTo(userId);
        assertThat(validator.extractRole(token)).isEqualTo("ROLE_STUDENT");
    }

    @Test
    @DisplayName("Should reject invalid or malformed JWT token")
    void shouldRejectInvalidToken() {
        assertThat(validator.validateToken("invalid.jwt.token")).isFalse();
        assertThat(validator.validateToken("")).isFalse();
    }
}
