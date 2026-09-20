package com.aprovaenem.auth.infrastructure.adapter.out.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("BCryptPasswordEncoderAdapter Unit Tests")
class BCryptPasswordEncoderAdapterTest {

    private final BCryptPasswordEncoderAdapter adapter = new BCryptPasswordEncoderAdapter();

    @Test
    @DisplayName("Should encode password and match raw password successfully")
    void shouldEncodeAndMatch() {
        String raw = "SenhaForte@2026";
        String encoded = adapter.encode(raw);

        assertThat(encoded).isNotBlank();
        assertThat(encoded).isNotEqualTo(raw);
        assertThat(adapter.matches(raw, encoded)).isTrue();
        assertThat(adapter.matches("WrongSenha", encoded)).isFalse();
    }
}
