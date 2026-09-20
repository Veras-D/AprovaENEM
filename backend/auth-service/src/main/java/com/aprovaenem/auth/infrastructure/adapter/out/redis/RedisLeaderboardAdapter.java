package com.aprovaenem.auth.infrastructure.adapter.out.redis;

import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.port.out.LeaderboardRedisPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisLeaderboardAdapter implements LeaderboardRedisPort {

    private final StringRedisTemplate redisTemplate;

    private static final String LEADERBOARD_KEY_PREFIX = "leaderboard:weekly:";

    private String buildKey(int year, int weekNumber, LeagueTier tier) {
        return LEADERBOARD_KEY_PREFIX + year + ":" + weekNumber + ":" + tier.name();
    }

    @Override
    public void incrementWeeklyXp(int year, int weekNumber, LeagueTier tier, UUID userId, int xpToAdd) {
        String key = buildKey(year, weekNumber, tier);
        redisTemplate.opsForZSet().incrementScore(key, userId.toString(), xpToAdd);
        // Expire after 14 days so old leaderboards cleanly clean up
        redisTemplate.expire(key, 14, TimeUnit.DAYS);
    }

    @Override
    public Long getStudentRank(int year, int weekNumber, LeagueTier tier, UUID userId) {
        String key = buildKey(year, weekNumber, tier);
        Long zeroBasedRank = redisTemplate.opsForZSet().reverseRank(key, userId.toString());
        return zeroBasedRank != null ? zeroBasedRank + 1 : null;
    }

    @Override
    public Double getStudentScore(int year, int weekNumber, LeagueTier tier, UUID userId) {
        String key = buildKey(year, weekNumber, tier);
        return redisTemplate.opsForZSet().score(key, userId.toString());
    }

    @Override
    public Long getTotalParticipants(int year, int weekNumber, LeagueTier tier) {
        String key = buildKey(year, weekNumber, tier);
        Long count = redisTemplate.opsForZSet().zCard(key);
        return count != null ? count : 0L;
    }

    @Override
    public Set<ZSetOperations.TypedTuple<String>> getTopRanked(int year, int weekNumber, LeagueTier tier, long start, long end) {
        String key = buildKey(year, weekNumber, tier);
        Set<ZSetOperations.TypedTuple<String>> tuples = redisTemplate.opsForZSet().reverseRangeWithScores(key, start, end);
        return tuples != null ? tuples : Collections.emptySet();
    }

    @Override
    public void clearWeeklyLeaderboard(int year, int weekNumber, LeagueTier tier) {
        String key = buildKey(year, weekNumber, tier);
        redisTemplate.delete(key);
    }
}
