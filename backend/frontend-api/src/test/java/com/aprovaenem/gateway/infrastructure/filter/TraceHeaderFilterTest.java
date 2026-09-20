package com.aprovaenem.gateway.infrastructure.filter;

import io.micrometer.tracing.Span;
import io.micrometer.tracing.TraceContext;
import io.micrometer.tracing.Tracer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("TraceHeaderFilter Unit Tests")
class TraceHeaderFilterTest {

    @Mock
    private Tracer tracer;

    @Mock
    private GatewayFilterChain filterChain;

    @Test
    @DisplayName("Should extract traceId from tracer when active span exists")
    void shouldExtractTraceIdFromTracer() {
        Span span = mock(Span.class);
        TraceContext context = mock(TraceContext.class);
        when(tracer.currentSpan()).thenReturn(span);
        when(span.context()).thenReturn(context);
        when(context.traceId()).thenReturn("tracer-trace-id-12345");

        TraceHeaderFilter filter = new TraceHeaderFilter(tracer);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/me").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<String> downstreamTraceId = new AtomicReference<>();
        when(filterChain.filter(any(ServerWebExchange.class))).thenAnswer(inv -> {
            ServerWebExchange mutated = inv.getArgument(0);
            downstreamTraceId.set(mutated.getRequest().getHeaders().getFirst(TraceHeaderFilter.TRACE_HEADER));
            return Mono.empty();
        });

        filter.filter(exchange, filterChain).block();

        assertThat(downstreamTraceId.get()).isEqualTo("tracer-trace-id-12345");
        assertThat(filter.getOrder()).isEqualTo(Ordered.HIGHEST_PRECEDENCE + 5);
    }

    @Test
    @DisplayName("Should extract traceId from incoming header when tracer context is empty")
    void shouldExtractTraceIdFromIncomingHeader() {
        TraceHeaderFilter filter = new TraceHeaderFilter(null);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/exams")
                .header(TraceHeaderFilter.TRACE_HEADER, "incoming-trace-id-999")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<String> downstreamTraceId = new AtomicReference<>();
        when(filterChain.filter(any(ServerWebExchange.class))).thenAnswer(inv -> {
            ServerWebExchange mutated = inv.getArgument(0);
            downstreamTraceId.set(mutated.getRequest().getHeaders().getFirst(TraceHeaderFilter.TRACE_HEADER));
            return Mono.empty();
        });

        filter.filter(exchange, filterChain).block();

        assertThat(downstreamTraceId.get()).isEqualTo("incoming-trace-id-999");
    }

    @Test
    @DisplayName("Should generate new UUID traceId when tracer context and header are missing")
    void shouldGenerateNewTraceIdWhenMissing() {
        TraceHeaderFilter filter = new TraceHeaderFilter(null);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/questions").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<String> downstreamTraceId = new AtomicReference<>();
        when(filterChain.filter(any(ServerWebExchange.class))).thenAnswer(inv -> {
            ServerWebExchange mutated = inv.getArgument(0);
            downstreamTraceId.set(mutated.getRequest().getHeaders().getFirst(TraceHeaderFilter.TRACE_HEADER));
            return Mono.empty();
        });

        filter.filter(exchange, filterChain).block();

        assertThat(downstreamTraceId.get()).isNotBlank();
        assertThat(downstreamTraceId.get()).doesNotContain("-");
    }

    @Test
    @DisplayName("Should fallback when tracer currentSpan is null")
    void shouldFallbackWhenTracerSpanIsNull() {
        when(tracer.currentSpan()).thenReturn(null);
        TraceHeaderFilter filter = new TraceHeaderFilter(tracer);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/questions").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<String> downstreamTraceId = new AtomicReference<>();
        when(filterChain.filter(any(ServerWebExchange.class))).thenAnswer(inv -> {
            ServerWebExchange mutated = inv.getArgument(0);
            downstreamTraceId.set(mutated.getRequest().getHeaders().getFirst(TraceHeaderFilter.TRACE_HEADER));
            return Mono.empty();
        });

        filter.filter(exchange, filterChain).block();

        assertThat(downstreamTraceId.get()).isNotBlank();
    }
}
