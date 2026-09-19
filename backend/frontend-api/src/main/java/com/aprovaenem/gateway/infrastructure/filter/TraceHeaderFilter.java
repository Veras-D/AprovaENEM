package com.aprovaenem.gateway.infrastructure.filter;

import io.micrometer.tracing.Tracer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Global Gateway Filter ensuring end-to-end distributed tracing across the microservices mesh.
 * Injects X-Trace-Id into both outgoing request to downstream microservices and the HTTP client response.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TraceHeaderFilter implements GlobalFilter, Ordered {

    public static final String TRACE_HEADER = "X-Trace-Id";
    private final Tracer tracer;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String traceId = null;

        if (tracer != null && tracer.currentSpan() != null && tracer.currentSpan().context() != null) {
            traceId = tracer.currentSpan().context().traceId();
        }

        if (traceId == null || traceId.isBlank()) {
            String incomingTrace = exchange.getRequest().getHeaders().getFirst(TRACE_HEADER);
            if (incomingTrace != null && !incomingTrace.isBlank()) {
                traceId = incomingTrace;
            } else {
                traceId = UUID.randomUUID().toString().replace("-", "");
            }
        }

        final String activeTraceId = traceId;

        // Forward X-Trace-Id to downstream microservices
        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(builder -> builder.header(TRACE_HEADER, activeTraceId))
                .build();

        // Inject X-Trace-Id into client response before headers are committed to wire
        mutatedExchange.getResponse().beforeCommit(() -> {
            mutatedExchange.getResponse().getHeaders().set(TRACE_HEADER, activeTraceId);
            return Mono.empty();
        });

        return chain.filter(mutatedExchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 5;
    }
}
