package com.aprovaenem.notification.infrastructure.adapter.in.web;

import com.aprovaenem.notification.application.service.NotificationService;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.MarkNotificationReadResponse;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.NotificationFeedResponse;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.RegisterDeviceTokenRequest;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.RegisterDeviceTokenResponse;
import com.aprovaenem.notification.infrastructure.security.JwtTokenValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("NotificationController WebMvc & Header Authentication Tests")
class NotificationControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private JwtTokenValidator jwtTokenValidator;

    @Test
    @DisplayName("POST /api/v1/notifications/push-tokens with X-User-Id header should register token and return HTTP 201")
    void shouldRegisterTokenWithUserIdHeader() throws Exception {
        UUID userId = UUID.randomUUID();
        RegisterDeviceTokenRequest request = new RegisterDeviceTokenRequest("device_token_abc_123", "ANDROID");

        RegisterDeviceTokenResponse response = new RegisterDeviceTokenResponse(
                "Device token registered successfully", "ANDROID", Instant.now()
        );

        when(notificationService.registerDeviceToken(eq(userId), any(RegisterDeviceTokenRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/notifications/push-tokens")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", is("Device token registered successfully")))
                .andExpect(jsonPath("$.platform", is("ANDROID")));
    }

    @Test
    @DisplayName("POST /api/v1/notifications/push-tokens with Bearer token should register token and return HTTP 201")
    void shouldRegisterTokenWithBearerToken() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = "valid.jwt.token";

        when(jwtTokenValidator.validateToken(token)).thenReturn(true);
        when(jwtTokenValidator.extractUserId(token)).thenReturn(userId);

        RegisterDeviceTokenRequest request = new RegisterDeviceTokenRequest("device_token_xyz_456", "WEB_PUSH");
        RegisterDeviceTokenResponse response = new RegisterDeviceTokenResponse(
                "Device token registered successfully", "WEB_PUSH", Instant.now()
        );

        when(notificationService.registerDeviceToken(eq(userId), any(RegisterDeviceTokenRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/notifications/push-tokens")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", is("Device token registered successfully")))
                .andExpect(jsonPath("$.platform", is("WEB_PUSH")));
    }

    @Test
    @DisplayName("POST /api/v1/notifications/push-tokens without auth header should return HTTP 401")
    void shouldReturnUnauthorizedWhenNoIdentityHeader() throws Exception {
        RegisterDeviceTokenRequest request = new RegisterDeviceTokenRequest("device_token_123", "ANDROID");

        mockMvc.perform(post("/api/v1/notifications/push-tokens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/notifications/push-tokens with invalid platform should return HTTP 400")
    void shouldReturnBadRequestWhenInvalidPlatform() throws Exception {
        UUID userId = UUID.randomUUID();
        RegisterDeviceTokenRequest request = new RegisterDeviceTokenRequest("device_token_123", "WINDOWS_PHONE");

        mockMvc.perform(post("/api/v1/notifications/push-tokens")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/notifications with valid auth should return HTTP 200 with notification feed")
    void shouldGetNotificationFeedSuccessfully() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID notifId = UUID.randomUUID();

        NotificationFeedResponse.NotificationItemDto item = NotificationFeedResponse.NotificationItemDto.builder()
                .id(notifId)
                .channel("PUSH")
                .templateCode("DAILY_STREAK_REMINDER")
                .title("Keep your streak!")
                .body("Solve 3 questions today to maintain your 5-day streak.")
                .status("DELIVERED")
                .sentAt(Instant.now())
                .build();

        NotificationFeedResponse feedResponse = NotificationFeedResponse.builder()
                .unreadCount(1)
                .notifications(List.of(item))
                .build();

        when(notificationService.getFeed(eq(userId), eq("ALL"), eq(0), eq(20)))
                .thenReturn(feedResponse);

        mockMvc.perform(get("/api/v1/notifications")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(1)))
                .andExpect(jsonPath("$.notifications", hasSize(1)))
                .andExpect(jsonPath("$.notifications[0].id", is(notifId.toString())))
                .andExpect(jsonPath("$.notifications[0].title", is("Keep your streak!")));
    }

    @Test
    @DisplayName("GET /api/v1/notifications without auth should return HTTP 401")
    void shouldReturnUnauthorizedWhenGettingFeedWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PATCH /api/v1/notifications/{id}/read should mark notification read and return HTTP 200")
    void shouldMarkNotificationAsReadSuccessfully() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID notifId = UUID.randomUUID();

        MarkNotificationReadResponse readResponse = new MarkNotificationReadResponse(
                notifId, "READ", Instant.now()
        );

        when(notificationService.markAsRead(userId, notifId)).thenReturn(readResponse);

        mockMvc.perform(patch("/api/v1/notifications/" + notifId + "/read")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(notifId.toString())))
                .andExpect(jsonPath("$.status", is("READ")));
    }

    @Test
    @DisplayName("PATCH /api/v1/notifications/{id}/read when notification not found should return HTTP 404")
    void shouldReturnNotFoundWhenNotificationDoesNotExist() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID notifId = UUID.randomUUID();

        when(notificationService.markAsRead(userId, notifId))
                .thenThrow(new IllegalArgumentException("Notification not found with ID: " + notifId));

        mockMvc.perform(patch("/api/v1/notifications/" + notifId + "/read")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/notifications/unread-count should return HTTP 200 with unread count")
    void shouldGetUnreadCountSuccessfully() throws Exception {
        UUID userId = UUID.randomUUID();
        when(notificationService.getUnreadCount(userId)).thenReturn(7L);

        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(7)));
    }
}
