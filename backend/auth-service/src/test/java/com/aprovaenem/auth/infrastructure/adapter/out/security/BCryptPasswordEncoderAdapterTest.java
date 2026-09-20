package com.aprovaenem.auth.infrastructure.adapter.out.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("BCryptPasswordEncoderAdapter & HMAC-SHA256 Pepper Unit Tests")
class BCryptPasswordEncoderAdapterTest {

    private static final String SECRET_PEPPER = "aprovaenem_test_secret_pepper_key_2026_at_least_256_bits!";
    private final BCryptPasswordEncoderAdapter pepperedAdapter = new BCryptPasswordEncoderAdapter(SECRET_PEPPER);
    private final BCryptPasswordEncoderAdapter unpepperedAdapter = new BCryptPasswordEncoderAdapter("");

    @Test
    @DisplayName("1. Should encode password with HMAC-SHA256 pepper and match raw password successfully")
    void shouldEncodeAndMatchWithPepper() {
        String raw = "SenhaForte@2026";
        String encoded = pepperedAdapter.encode(raw);

        assertThat(encoded).isNotBlank();
        assertThat(encoded).startsWith("$2a$10$");
        assertThat(encoded).isNotEqualTo(raw);

        // Correct password matches
        assertThat(pepperedAdapter.matches(raw, encoded)).isTrue();

        // Wrong password fails
        assertThat(pepperedAdapter.matches("SenhaIncorreta@2026", encoded)).isFalse();

        // Freshly encoded with pepper is not considered a legacy hash
        assertThat(pepperedAdapter.isLegacyHash(raw, encoded)).isFalse();
    }

    @Test
    @DisplayName("2. Dual-check: Should match legacy unpeppered BCrypt hash and flag it as legacy")
    void shouldMatchLegacyUnpepperedHashAndFlagAsLegacy() {
        String raw = "SenhaLegado@2023";
        // Legacy hash produced by standard unpeppered BCrypt (e.g. from V3 seed or prior to pepper implementation)
        String legacyHash = new BCryptPasswordEncoder(10).encode(raw);

        // Dual-check allows legacy login
        assertThat(pepperedAdapter.matches(raw, legacyHash)).isTrue();

        // Confirms it is flagged as legacy so it can be seamlessly upgraded
        assertThat(pepperedAdapter.isLegacyHash(raw, legacyHash)).isTrue();

        // After re-encoding with pepper, the new hash is no longer legacy
        String upgradedHash = pepperedAdapter.encode(raw);
        assertThat(pepperedAdapter.matches(raw, upgradedHash)).isTrue();
        assertThat(pepperedAdapter.isLegacyHash(raw, upgradedHash)).isFalse();
    }

    @Test
    @DisplayName("3. Should reject incorrect passwords for both peppered and legacy hashes")
    void shouldRejectIncorrectPasswordForBothPepperedAndLegacyHashes() {
        String correctRaw = "MinhaSenha@2026";
        String wrongRaw = "OutraSenha@9999";

        String pepperedHash = pepperedAdapter.encode(correctRaw);
        String legacyHash = new BCryptPasswordEncoder(10).encode(correctRaw);

        assertThat(pepperedAdapter.matches(wrongRaw, pepperedHash)).isFalse();
        assertThat(pepperedAdapter.matches(wrongRaw, legacyHash)).isFalse();
    }

    @Test
    @DisplayName("4. Security: Should eliminate BCrypt 72-byte truncation collision via HMAC-SHA256")
    void shouldEliminateBcrypt72ByteTruncationCollision() {
        // Standard BCrypt silently truncates passwords after 72 bytes.
        // Two passwords identical in the first 72 bytes collide in standard BCrypt!
        String base72 = "A".repeat(72);
        String pass1 = base72 + "Tail-Secret-1";
        String pass2 = base72 + "Tail-Secret-2";

        // Verification of BCrypt limitation without pepper:
        BCryptPasswordEncoder rawBcrypt = new BCryptPasswordEncoder(10);
        String rawBcryptHash = rawBcrypt.encode(pass1);
        assertThat(rawBcrypt.matches(pass2, rawBcryptHash))
                .as("Standard BCrypt demonstrates 72-byte truncation collision flaw")
                .isTrue();

        // Verification that our HMAC-SHA256 pepper adapter eliminates this vulnerability:
        String pepperedHash1 = pepperedAdapter.encode(pass1);
        assertThat(pepperedAdapter.matches(pass1, pepperedHash1)).isTrue();
        assertThat(pepperedAdapter.matches(pass2, pepperedHash1))
                .as("Peppered adapter must NOT collide when passwords differ after 72 bytes")
                .isFalse();
    }

    @Test
    @DisplayName("5. Should operate identically to standard BCrypt when pepper is empty")
    void shouldOperateAsStandardBcryptWhenPepperEmpty() {
        String raw = "SimplesSenha123";
        String encoded = unpepperedAdapter.encode(raw);

        assertThat(unpepperedAdapter.matches(raw, encoded)).isTrue();
        assertThat(unpepperedAdapter.matches("Errada", encoded)).isFalse();
        assertThat(unpepperedAdapter.isLegacyHash(raw, encoded)).isFalse();
    }

    @Test
    @DisplayName("6. Should handle null inputs gracefully and defensively")
    void shouldHandleNullInputsGracefully() {
        assertThatThrownBy(() -> pepperedAdapter.encode(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Raw password cannot be null");

        assertThat(pepperedAdapter.matches(null, "$2a$10$dummy")).isFalse();
        assertThat(pepperedAdapter.matches("senha", null)).isFalse();
        assertThat(pepperedAdapter.isLegacyHash(null, "$2a$10$dummy")).isFalse();
        assertThat(pepperedAdapter.isLegacyHash("senha", null)).isFalse();
    }

    @Test
    @DisplayName("7. Should verify default isLegacyHash method on PasswordEncoderPort interface")
    void shouldVerifyDefaultInterfaceMethod() {
        com.aprovaenem.auth.domain.port.out.PasswordEncoderPort port = new com.aprovaenem.auth.domain.port.out.PasswordEncoderPort() {
            @Override
            public String encode(String rawPassword) {
                return rawPassword;
            }

            @Override
            public boolean matches(String rawPassword, String encodedPassword) {
                return false;
            }
        };
        assertThat(port.isLegacyHash("pass", "hash")).isFalse();
    }
}
