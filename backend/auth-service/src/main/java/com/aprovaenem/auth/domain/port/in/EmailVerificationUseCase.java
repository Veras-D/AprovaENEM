package com.aprovaenem.auth.domain.port.in;

import com.aprovaenem.auth.domain.model.User;

public interface EmailVerificationUseCase {

    User verifyEmail(String token);

    boolean resendVerificationEmail(String email);
}
