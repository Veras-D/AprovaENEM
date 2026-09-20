package com.aprovaenem.notification.infrastructure.adapter.in.web;

import com.aprovaenem.notification.application.service.NotificationService;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.MarkNotificationReadResponse;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.NotificationFeedResponse;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.RegisterDeviceTokenRequest;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.RegisterDeviceTokenResponse;
import com.aprovaenem.notification.infrastructure.security.JwtTokenValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtTokenValidator jwtTokenValidator;

    @PostMapping("/push-tokens")
    public ResponseEntity<RegisterDeviceTokenResponse> registerDeviceToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @Valid @RequestBody RegisterDeviceTokenRequest request) {
        UUID userId = resolveUserId(authHeader, xUserId);
        RegisterDeviceTokenResponse response = notificationService.registerDeviceToken(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<NotificationFeedResponse> getNotifications(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestParam(value = "status", defaultValue = "ALL") String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        UUID userId = resolveUserId(authHeader, xUserId);
        NotificationFeedResponse response = notificationService.getFeed(userId, status, page, size);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<MarkNotificationReadResponse> markAsRead(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable("id") UUID notificationId) {
        UUID userId = resolveUserId(authHeader, xUserId);
        try {
            MarkNotificationReadResponse response = notificationService.markAsRead(userId, notificationId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        UUID userId = resolveUserId(authHeader, xUserId);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    private UUID resolveUserId(String authHeader, String xUserId) {
        if (xUserId != null && !xUserId.isBlank()) {
            try {
                return UUID.fromString(xUserId);
            } catch (IllegalArgumentException ignored) {
            }
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenValidator.validateToken(token)) {
                return jwtTokenValidator.extractUserId(token);
            }
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Valid Bearer JWT token or authenticated identity required.");
    }
}
