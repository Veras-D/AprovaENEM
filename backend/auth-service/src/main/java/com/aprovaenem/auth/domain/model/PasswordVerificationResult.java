package com.aprovaenem.auth.domain.model;

public record PasswordVerificationResult(boolean matches, boolean needsUpgrade) {

    public static PasswordVerificationResult matched() {
        return new PasswordVerificationResult(true, false);
    }

    public static PasswordVerificationResult upgradeNeeded() {
        return new PasswordVerificationResult(true, true);
    }

    public static PasswordVerificationResult failed() {
        return new PasswordVerificationResult(false, false);
    }
}
