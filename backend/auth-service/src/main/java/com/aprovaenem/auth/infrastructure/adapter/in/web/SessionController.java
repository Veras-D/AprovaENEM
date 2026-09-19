package com.aprovaenem.auth.infrastructure.adapter.in.web;

import com.aprovaenem.auth.domain.model.AnonymousSession;
import com.aprovaenem.auth.domain.port.in.AnonymousSessionUseCase;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.AnonymousSessionResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class SessionController {

    private final AnonymousSessionUseCase sessionUseCase;

    @PostMapping("/session")
    public ResponseEntity<AnonymousSessionResponse> createSession(HttpServletRequest request) {
        String clientIp = extractClientIp(request);
        AnonymousSession session = sessionUseCase.provisionSession(clientIp);

        AnonymousSessionResponse response = AnonymousSessionResponse.builder()
                .sessionId(session.getSessionUuid())
                .isAnonymous(true)
                .expiresAt(session.getExpiresAt())
                .message("Anonymous session created. Pass this ID in the 'X-Session-Id' header.")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/session/{sessionUuid}")
    public ResponseEntity<AnonymousSessionResponse> getSession(@PathVariable String sessionUuid) {
        AnonymousSession session = sessionUseCase.getSession(sessionUuid);

        AnonymousSessionResponse response = AnonymousSessionResponse.builder()
                .sessionId(session.getSessionUuid())
                .isAnonymous(session.getClaimedByUserId() == null)
                .expiresAt(session.getExpiresAt())
                .message("Active session retrieved successfully.")
                .build();

        return ResponseEntity.ok(response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
