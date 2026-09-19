package com.aprovaenem.gateway.infrastructure.ratelimit;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;

/**
 * Token Bucket Key Resolver for Spring Cloud Gateway Redis Rate Limiting.
 * Resolves keys based on authenticated Bearer token, anonymous session ID, or client IP.
 */
@Configuration
public class RateLimiterConfig {

    @Bean
    @Primary
    public KeyResolver ipOrSessionKeyResolver() {
        return exchange -> {
            // 1. Authenticated Bearer Token
            String auth = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (auth != null && auth.startsWith("Bearer ") && auth.length() > 7) {
                return Mono.just("user:" + Integer.toHexString(auth.substring(7).trim().hashCode()));
            }

            // 2. Anonymous Practice Session ID
            String sessionId = exchange.getRequest().getHeaders().getFirst("X-Session-Id");
            if (sessionId != null && !sessionId.isBlank()) {
                return Mono.just("session:" + sessionId.trim());
            }

            // 3. Client IP address (X-Forwarded-For or remote socket address)
            String xff = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                String clientIp = xff.split(",")[0].trim();
                return Mono.just("ip:" + clientIp);
            }

            InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
            if (remoteAddress != null && remoteAddress.getAddress() != null) {
                return Mono.just("ip:" + remoteAddress.getAddress().getHostAddress());
            }

            return Mono.just("ip:127.0.0.1");
        };
    }
}
