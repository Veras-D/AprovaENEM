package com.aprovaenem.auth.infrastructure.adapter.in.web;

import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.port.in.AuthUseCase;
import com.aprovaenem.auth.domain.port.in.EmailVerificationUseCase;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.LoginRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.LoginResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.RegisterRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.RegisterResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.ResendVerificationRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.ResendVerificationResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.UserResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.VerifyEmailRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.VerifyEmailResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;
    private final EmailVerificationUseCase emailVerificationUseCase;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authUseCase.register(
                request.getEmail(),
                request.getPassword(),
                request.getFullName(),
                request.getSchoolType(),
                request.getTargetDegree()
        );

        // Auto-login registered student
        AuthUseCase.AuthResult authResult = authUseCase.login(request.getEmail(), request.getPassword());

        RegisterResponse response = RegisterResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .isEmailVerified(user.isEmailVerified())
                .token(authResult.token())
                .tokenType("Bearer")
                .expiresInSeconds(authResult.expiresInSeconds())
                .message("Account created. A confirmation email has been dispatched to verify your address.")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthUseCase.AuthResult authResult = authUseCase.login(request.getEmail(), request.getPassword());
        User user = authResult.user();

        LoginResponse response = LoginResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .isEmailVerified(user.isEmailVerified())
                .token(authResult.token())
                .tokenType("Bearer")
                .expiresInSeconds(authResult.expiresInSeconds())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID userId = UUID.fromString(userDetails.getUsername());
        User user = authUseCase.getCurrentUser(userId);

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .schoolType(user.getSchoolType().name())
                .targetDegree(user.getTargetDegree())
                .role(user.getRole().name())
                .isEmailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<VerifyEmailResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        emailVerificationUseCase.verifyEmail(request.getToken());

        VerifyEmailResponse response = VerifyEmailResponse.builder()
                .message("Email address successfully verified. Your AprovaENEM account is now fully active.")
                .isEmailVerified(true)
                .verifiedAt(Instant.now())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ResendVerificationResponse> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        boolean dispatched = emailVerificationUseCase.resendVerificationEmail(request.getEmail());

        ResendVerificationResponse response = ResendVerificationResponse.builder()
                .message("If an account with this email exists and is unverified, a new confirmation link has been dispatched.")
                .dispatched(dispatched)
                .build();

        return ResponseEntity.ok(response);
    }
}
