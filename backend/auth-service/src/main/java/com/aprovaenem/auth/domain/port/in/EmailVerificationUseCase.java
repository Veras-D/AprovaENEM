package com.aprovaenem.auth.domain.port.in;

import com.aprovaenem.auth.domain.model.User;

public interface EmailVerificationUseCase {

    default User verifyEmail(String token) {
        return verifyEmail(token, null);
    }

    User verifyEmail(String token, String email);

    boolean resendVerificationEmail(String email);
}
