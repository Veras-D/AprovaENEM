package com.aprovaenem.auth.domain.port.out;

import com.aprovaenem.auth.domain.model.PasswordVerificationResult;

public interface PasswordEncoderPort {

    String encode(String rawPassword);

    boolean matches(String rawPassword, String encodedPassword);

    default PasswordVerificationResult verify(String rawPassword, String encodedPassword) {
        boolean matched = matches(rawPassword, encodedPassword);
        boolean isLegacy = isLegacyHash(rawPassword, encodedPassword);
        return new PasswordVerificationResult(matched, isLegacy);
    }

    default boolean isLegacyHash(String rawPassword, String encodedPassword) {
        return false;
    }
}
