package com.aprovaenem.auth.infrastructure.adapter.in.web;

import com.aprovaenem.auth.domain.model.AnonymousSession;
import com.aprovaenem.auth.domain.port.in.AnonymousSessionUseCase;
import com.aprovaenem.auth.infrastructure.adapter.out.security.CustomUserDetailsService;
import com.aprovaenem.auth.infrastructure.adapter.out.security.DelegatingAccessDeniedHandler;
import com.aprovaenem.auth.infrastructure.adapter.out.security.DelegatingAuthenticationEntryPoint;
import com.aprovaenem.auth.infrastructure.adapter.out.security.JwtAuthenticationFilter;
import com.aprovaenem.auth.infrastructure.adapter.out.security.JwtTokenProvider;
import com.aprovaenem.auth.infrastructure.adapter.out.security.SecurityConfig;
import com.aprovaenem.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SessionController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, DelegatingAuthenticationEntryPoint.class, DelegatingAccessDeniedHandler.class, GlobalExceptionHandler.class})
@DisplayName("SessionController WebMvc & Anonymous Access Integration Tests")
class SessionControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnonymousSessionUseCase sessionUseCase;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/v1/auth/session should create anonymous session and return HTTP 201 without auth")
    void shouldCreateAnonymousSessionPublicly() throws Exception {
        String sessionUuid = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(30, ChronoUnit.DAYS);

        AnonymousSession session = AnonymousSession.builder()
                .id(UUID.randomUUID())
                .sessionUuid(sessionUuid)
                .ipHash("hash123")
                .createdAt(Instant.now())
                .lastActiveAt(Instant.now())
                .expiresAt(expiresAt)
                .build();

        when(sessionUseCase.provisionSession(anyString())).thenReturn(session);

        mockMvc.perform(post("/api/v1/auth/session")
                        .header("X-Forwarded-For", "203.0.113.195"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionId", is(sessionUuid)))
                .andExpect(jsonPath("$.anonymous", is(true)))
                .andExpect(jsonPath("$.message", is("Anonymous session created. Pass this ID in the 'X-Session-Id' header.")));
    }

    @Test
    @DisplayName("GET /api/v1/auth/session/{sessionUuid} should retrieve active session publicly and return HTTP 200")
    void shouldRetrieveActiveSessionPublicly() throws Exception {
        String sessionUuid = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(30, ChronoUnit.DAYS);

        AnonymousSession session = AnonymousSession.builder()
                .id(UUID.randomUUID())
                .sessionUuid(sessionUuid)
                .ipHash("hash123")
                .createdAt(Instant.now())
                .lastActiveAt(Instant.now())
                .expiresAt(expiresAt)
                .build();

        when(sessionUseCase.getSession(sessionUuid)).thenReturn(session);

        mockMvc.perform(get("/api/v1/auth/session/" + sessionUuid))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId", is(sessionUuid)))
                .andExpect(jsonPath("$.anonymous", is(true)))
                .andExpect(jsonPath("$.message", is("Active session retrieved successfully.")));
    }

    @Test
    @DisplayName("GET /api/v1/auth/session/{sessionUuid} when session not found should return HTTP 404 Problem Details")
    void shouldReturnNotFoundWhenSessionDoesNotExist() throws Exception {
        String sessionUuid = "nonexistent-session";
        when(sessionUseCase.getSession(sessionUuid))
                .thenThrow(new ResourceNotFoundException("Anonymous session not found with identifier: " + sessionUuid));

        mockMvc.perform(get("/api/v1/auth/session/" + sessionUuid))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", is("Anonymous session not found with identifier: " + sessionUuid)));
    }
}
