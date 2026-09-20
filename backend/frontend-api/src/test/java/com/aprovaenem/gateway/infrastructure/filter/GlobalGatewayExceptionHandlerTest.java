package com.aprovaenem.gateway.infrastructure.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ResponseStatusException;
import reactor.test.StepVerifier;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GlobalGatewayExceptionHandler Unit Tests")
class GlobalGatewayExceptionHandlerTest {

    private ObjectMapper objectMapper = new ObjectMapper();
    private GlobalGatewayExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalGatewayExceptionHandler(objectMapper);
    }

    @Test
    @DisplayName("Should handle ResponseStatusException and format RFC 7807 response")
    void shouldHandleResponseStatusException() throws IOException {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/unknown")
                .header(TraceHeaderFilter.TRACE_HEADER, "test-trace-123")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        ResponseStatusException ex = new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found on gateway");

        StepVerifier.create(handler.handle(exchange, ex))
                .verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(exchange.getResponse().getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PROBLEM_JSON);

        String responseBody = exchange.getResponse().getBodyAsString().block();
        JsonNode json = objectMapper.readTree(responseBody);

        assertThat(json.get("status").asInt()).isEqualTo(404);
        assertThat(json.get("title").asText()).isEqualTo("Not Found");
        assertThat(json.get("detail").asText()).isEqualTo("Resource not found on gateway");
        assertThat(json.get("instance").asText()).isEqualTo("/api/v1/unknown");
        assertThat(json.get("traceId").asText()).isEqualTo("test-trace-123");
    }

    @Test
    @DisplayName("Should handle Connection refused with 503 SERVICE_UNAVAILABLE")
    void shouldHandleConnectionRefused() throws IOException {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        RuntimeException ex = new RuntimeException("io.netty.channel.AbstractChannel$AnnotatedConnectException: Connection refused: /127.0.0.1:8081");

        StepVerifier.create(handler.handle(exchange, ex))
                .verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);

        String responseBody = exchange.getResponse().getBodyAsString().block();
        JsonNode json = objectMapper.readTree(responseBody);

        assertThat(json.get("status").asInt()).isEqualTo(503);
        assertThat(json.get("title").asText()).isEqualTo("Service Temporarily Unavailable");
        assertThat(json.get("detail").asText()).contains("unreachable or undergoing maintenance");
    }

    @Test
    @DisplayName("Should handle generic exception with 500 INTERNAL_SERVER_ERROR")
    void shouldHandleGenericException() throws IOException {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/exams").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        RuntimeException ex = new RuntimeException("Unexpected NullPointer");

        StepVerifier.create(handler.handle(exchange, ex))
                .verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);

        String responseBody = exchange.getResponse().getBodyAsString().block();
        JsonNode json = objectMapper.readTree(responseBody);

        assertThat(json.get("status").asInt()).isEqualTo(500);
        assertThat(json.get("title").asText()).isEqualTo("Internal Gateway Error");
    }

    @Test
    @DisplayName("Should return Mono.error when response is already committed")
    void shouldReturnErrorWhenCommitted() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/exams").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        exchange.getResponse().setComplete().block();

        RuntimeException ex = new RuntimeException("Late error");
        StepVerifier.create(handler.handle(exchange, ex))
                .expectError(RuntimeException.class)
                .verify();
    }

    @Test
    @DisplayName("Should handle ResponseStatusException with null reason")
    void shouldHandleResponseStatusExceptionWithNullReason() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/bad").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.BAD_REQUEST);

        StepVerifier.create(handler.handle(exchange, ex))
                .verifyComplete();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
