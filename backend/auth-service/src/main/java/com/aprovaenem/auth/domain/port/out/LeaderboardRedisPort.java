package com.aprovaenem.auth.domain.port.out;

import com.aprovaenem.auth.domain.model.LeagueTier;
import org.springframework.data.redis.core.ZSetOperations;

import java.util.Set;
import java.util.UUID;

public interface LeaderboardRedisPort {

    void incrementWeeklyXp(int year, int weekNumber, LeagueTier tier, UUID userId, int xpToAdd);

    Long getStudentRank(int year, int weekNumber, LeagueTier tier, UUID userId);

    Double getStudentScore(int year, int weekNumber, LeagueTier tier, UUID userId);

    Long getTotalParticipants(int year, int weekNumber, LeagueTier tier);

    Set<ZSetOperations.TypedTuple<String>> getTopRanked(int year, int weekNumber, LeagueTier tier, long start, long end);

    void clearWeeklyLeaderboard(int year, int weekNumber, LeagueTier tier);
}
