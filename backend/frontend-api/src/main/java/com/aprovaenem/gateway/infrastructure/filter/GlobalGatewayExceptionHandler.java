package com.aprovaenem.gateway.infrastructure.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Global Edge Error Web Exception Handler ensuring RFC 7807 Problem Details compliance
 * and rigorous data masking (stripping internal stack traces and database schemas).
 */
@Slf4j
@Component
@Order(-1)
@RequiredArgsConstructor
public class GlobalGatewayExceptionHandler implements ErrorWebExceptionHandler {

    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        if (exchange.getResponse().isCommitted()) {
            return Mono.error(ex);
        }

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String title = "Internal Gateway Error";
        String detail = "An unexpected error occurred while routing the request.";

        if (ex instanceof ResponseStatusException rse) {
            status = HttpStatus.valueOf(rse.getStatusCode().value());
            title = status.getReasonPhrase();
            detail = rse.getReason() != null ? rse.getReason() : status.getReasonPhrase();
        } else if (ex.getMessage() != null && ex.getMessage().contains("Connection refused")) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            title = "Service Temporarily Unavailable";
            detail = "The target upstream microservice is unreachable or undergoing maintenance.";
        }

        log.error("Edge Gateway encountered exception on path [{}]: status={}, message={}",
                exchange.getRequest().getPath(), status.value(), ex.getMessage());

        String path = exchange.getRequest().getPath().value();
        String traceId = exchange.getRequest().getHeaders().getFirst(TraceHeaderFilter.TRACE_HEADER);

        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("type", "https://aprovaenem.org/errors/" + status.name().toLowerCase());
        errorBody.put("title", title);
        errorBody.put("status", status.value());
        errorBody.put("detail", detail);
        errorBody.put("instance", path);
        errorBody.put("timestamp", Instant.now().toString());
        if (traceId != null) {
            errorBody.put("traceId", traceId);
        }

        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_PROBLEM_JSON);

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(errorBody);
        } catch (JsonProcessingException e) {
            bytes = ("{\"status\":" + status.value() + ",\"title\":\"" + title + "\"}").getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}
