package com.aprovaenem.gateway.infrastructure.ratelimit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.test.StepVerifier;

import java.net.InetSocketAddress;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RateLimiterConfig Unit Tests")
class RateLimiterConfigTest {

    private RateLimiterConfig config;
    private KeyResolver keyResolver;

    @BeforeEach
    void setUp() {
        config = new RateLimiterConfig();
        keyResolver = config.ipOrSessionKeyResolver();
    }

    @Test
    @DisplayName("Should resolve authenticated Bearer token into user key hash")
    void shouldResolveBearerToken() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/me")
                .header("Authorization", "Bearer my-jwt-token-12345")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .assertNext(key -> {
                    assertThat(key).startsWith("user:");
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("Should resolve anonymous session ID header")
    void shouldResolveSessionId() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/practice-sessions")
                .header("X-Session-Id", "anon-session-xyz")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .assertNext(key -> {
                    assertThat(key).isEqualTo("session:anon-session-xyz");
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("Should resolve X-Forwarded-For client IP")
    void shouldResolveXForwardedFor() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/questions")
                .header("X-Forwarded-For", "203.0.113.195, 198.51.100.1")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .assertNext(key -> {
                    assertThat(key).isEqualTo("ip:203.0.113.195");
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("Should resolve remote address when headers absent")
    void shouldResolveRemoteAddress() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/questions")
                .remoteAddress(new InetSocketAddress("192.168.1.50", 12345))
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .assertNext(key -> {
                    assertThat(key).isEqualTo("ip:192.168.1.50");
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("Should resolve fallback 127.0.0.1 when no client address is present")
    void shouldResolveFallbackIp() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/questions").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .assertNext(key -> {
                    assertThat(key).isEqualTo("ip:127.0.0.1");
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("Should skip invalid or non-bearer auth header and fallback to IP")
    void shouldSkipNonBearerAuth() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/me")
                .header("Authorization", "Basic user:pass")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .assertNext(key -> assertThat(key).isEqualTo("ip:127.0.0.1"))
                .verifyComplete();
    }

    @Test
    @DisplayName("Should skip blank session ID and blank X-Forwarded-For")
    void shouldSkipBlankHeaders() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/practice-sessions")
                .header("X-Session-Id", "   ")
                .header("X-Forwarded-For", "   ")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .assertNext(key -> assertThat(key).isEqualTo("ip:127.0.0.1"))
                .verifyComplete();
    }

    @Test
    @DisplayName("Should handle unresolved InetSocketAddress with null IP address")
    void shouldHandleUnresolvedRemoteAddress() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/questions")
                .remoteAddress(InetSocketAddress.createUnresolved("unknown.host.local", 8080))
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .assertNext(key -> assertThat(key).isEqualTo("ip:127.0.0.1"))
                .verifyComplete();
    }
}
