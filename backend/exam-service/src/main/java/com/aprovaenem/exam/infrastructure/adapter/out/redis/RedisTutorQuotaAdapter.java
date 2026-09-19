package com.aprovaenem.exam.infrastructure.adapter.out.redis;

import com.aprovaenem.exam.domain.model.AiQuotaStatus;
import com.aprovaenem.exam.domain.port.out.TutorQuotaPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisTutorQuotaAdapter implements TutorQuotaPort {

    private static final String ZONE_BRT = "America/Sao_Paulo";
    private static final int FREE_DAILY_LIMIT = 1;
    private final StringRedisTemplate redisTemplate;

    @Override
    public AiQuotaStatus getQuotaStatus(UUID userId, String role) {
        if (isPremium(role)) {
            return AiQuotaStatus.unlimited(calculateNextReset());
        }

        String key = buildQuotaKey(userId);
        String val = redisTemplate.opsForValue().get(key);
        int used = (val != null) ? Integer.parseInt(val) : 0;

        return AiQuotaStatus.standard(FREE_DAILY_LIMIT, used, calculateNextReset());
    }

    @Override
    public boolean tryAcquireQuota(UUID userId, String role) {
        if (isPremium(role)) {
            return true;
        }

        String key = buildQuotaKey(userId);
        Long current = redisTemplate.opsForValue().increment(key);
        if (current != null && current == 1) {
            // First increment of the day: set TTL until next midnight BRT
            long ttlSeconds = calculateTtlSeconds();
            redisTemplate.expire(key, ttlSeconds, TimeUnit.SECONDS);
            return true;
        }

        // Exceeded limit (current > 1)
        return false;
    }

    private boolean isPremium(String role) {
        if (role == null) return false;
        return role.toUpperCase().contains("PREMIUM") || role.toUpperCase().contains("ADMIN");
    }

    private String buildQuotaKey(UUID userId) {
        ZonedDateTime brtNow = Instant.now().atZone(ZoneId.of(ZONE_BRT));
        String dateSuffix = brtNow.format(DateTimeFormatter.ISO_LOCAL_DATE);
        return "ratelimit:tutor:daily:" + userId + ":" + dateSuffix;
    }

    private Instant calculateNextReset() {
        ZonedDateTime brtNow = Instant.now().atZone(ZoneId.of(ZONE_BRT));
        ZonedDateTime nextMidnight = brtNow.toLocalDate().plusDays(1).atStartOfDay(ZoneId.of(ZONE_BRT));
        return nextMidnight.toInstant();
    }

    private long calculateTtlSeconds() {
        ZonedDateTime brtNow = Instant.now().atZone(ZoneId.of(ZONE_BRT));
        ZonedDateTime nextMidnight = brtNow.toLocalDate().plusDays(1).atStartOfDay(ZoneId.of(ZONE_BRT));
        return Math.max(60, Duration.between(brtNow, nextMidnight).getSeconds());
    }
}
