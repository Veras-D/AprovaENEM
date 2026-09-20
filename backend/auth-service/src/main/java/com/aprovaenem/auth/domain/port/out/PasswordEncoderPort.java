package com.aprovaenem.auth.domain.port.out;

public interface PasswordEncoderPort {

    String encode(String rawPassword);

    boolean matches(String rawPassword, String encodedPassword);

    default boolean isLegacyHash(String rawPassword, String encodedPassword) {
        return false;
    }
}
