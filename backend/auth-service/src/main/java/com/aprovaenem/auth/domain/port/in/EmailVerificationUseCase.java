package com.aprovaenem.auth.domain.port.in;

public interface EmailVerificationUseCase {

    boolean verifyEmail(String token);

    boolean resendVerificationEmail(String email);
}
