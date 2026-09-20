package com.aprovaenem.auth.infrastructure.adapter.out.security;

import com.aprovaenem.auth.domain.model.SchoolType;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtTokenProvider Unit Tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "super_secret_jwt_key_for_aprovaenem_at_least_256_bits_long_2026!");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 86400000L);
        jwtTokenProvider.init();
    }

    @Test
    @DisplayName("Should generate, validate, and extract claims from JWT token")
    void shouldGenerateAndExtractClaims() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("estudante@enem.gov.br")
                .passwordHash("hashed")
                .fullName("Estudante Exemplar")
                .schoolType(SchoolType.PUBLIC_SCHOOL)
                .role(UserRole.ROLE_STUDENT)
                .isActive(true)
                .isEmailVerified(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        String token = jwtTokenProvider.generateToken(user);
        assertThat(token).isNotBlank();

        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtTokenProvider.extractEmail(token)).isEqualTo("estudante@enem.gov.br");
        assertThat(jwtTokenProvider.extractRole(token)).isEqualTo("ROLE_STUDENT");
        assertThat(jwtTokenProvider.getExpirationSeconds()).isEqualTo(86400L);
    }

    @Test
    @DisplayName("Should reject invalid or tampered tokens")
    void shouldRejectInvalidTokens() {
        assertThat(jwtTokenProvider.validateToken("invalid.jwt.token")).isFalse();
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
        assertThat(jwtTokenProvider.validateToken(null)).isFalse();
    }
}
