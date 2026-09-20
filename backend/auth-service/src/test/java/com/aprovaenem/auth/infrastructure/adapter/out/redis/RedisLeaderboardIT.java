package com.aprovaenem.auth.infrastructure.adapter.out.redis;

import com.aprovaenem.auth.domain.model.LeagueTier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = {RedisAutoConfiguration.class, RedisLeaderboardAdapter.class})
@Testcontainers
@DisplayName("RedisLeaderboardAdapter Testcontainers Integration Test")
class RedisLeaderboardIT {

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7.2-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
        registry.add("spring.data.redis.password", () -> "");
    }

    @Autowired
    private RedisLeaderboardAdapter leaderboardAdapter;

    private final int year = 2026;
    private final int weekNumber = 38;
    private final LeagueTier tier = LeagueTier.BRONZE;

    @BeforeEach
    void setUp() {
        leaderboardAdapter.clearWeeklyLeaderboard(year, weekNumber, tier);
    }

    @Test
    @DisplayName("Redis ZSET should rank students by weekly XP and maintain descending order")
    void shouldRankStudentsByWeeklyXpInRedis() {
        UUID alice = UUID.randomUUID();
        UUID bob = UUID.randomUUID();
        UUID charlie = UUID.randomUUID();

        // Increment XP for each student
        leaderboardAdapter.incrementWeeklyXp(year, weekNumber, tier, alice, 300);
        leaderboardAdapter.incrementWeeklyXp(year, weekNumber, tier, bob, 500);
        leaderboardAdapter.incrementWeeklyXp(year, weekNumber, tier, charlie, 150);

        // Verify total participants
        Long total = leaderboardAdapter.getTotalParticipants(year, weekNumber, tier);
        assertThat(total).isEqualTo(3L);

        // Verify ranks (1-based: Bob = 1, Alice = 2, Charlie = 3)
        assertThat(leaderboardAdapter.getStudentRank(year, weekNumber, tier, bob)).isEqualTo(1L);
        assertThat(leaderboardAdapter.getStudentRank(year, weekNumber, tier, alice)).isEqualTo(2L);
        assertThat(leaderboardAdapter.getStudentRank(year, weekNumber, tier, charlie)).isEqualTo(3L);

        // Verify scores
        assertThat(leaderboardAdapter.getStudentScore(year, weekNumber, tier, bob)).isEqualTo(500.0);
        assertThat(leaderboardAdapter.getStudentScore(year, weekNumber, tier, alice)).isEqualTo(300.0);
        assertThat(leaderboardAdapter.getStudentScore(year, weekNumber, tier, charlie)).isEqualTo(150.0);

        // Verify reverse range tuples (top 2: Bob, then Alice)
        Set<ZSetOperations.TypedTuple<String>> top2 = leaderboardAdapter.getTopRanked(year, weekNumber, tier, 0, 1);
        assertThat(top2).hasSize(2);
        List<ZSetOperations.TypedTuple<String>> list = top2.stream().toList();
        assertThat(list.get(0).getValue()).isEqualTo(bob.toString());
        assertThat(list.get(0).getScore()).isEqualTo(500.0);
        assertThat(list.get(1).getValue()).isEqualTo(alice.toString());
        assertThat(list.get(1).getScore()).isEqualTo(300.0);

        // Award bonus XP to Alice to overtake Bob
        leaderboardAdapter.incrementWeeklyXp(year, weekNumber, tier, alice, 300); // Alice = 600
        assertThat(leaderboardAdapter.getStudentRank(year, weekNumber, tier, alice)).isEqualTo(1L);
        assertThat(leaderboardAdapter.getStudentRank(year, weekNumber, tier, bob)).isEqualTo(2L);
        assertThat(leaderboardAdapter.getStudentScore(year, weekNumber, tier, alice)).isEqualTo(600.0);
    }

    @Test
    @DisplayName("Non-existent student should return null for rank and score")
    void shouldHandleNonExistentStudent() {
        UUID unknown = UUID.randomUUID();
        assertThat(leaderboardAdapter.getStudentRank(year, weekNumber, tier, unknown)).isNull();
        assertThat(leaderboardAdapter.getStudentScore(year, weekNumber, tier, unknown)).isNull();
    }
}
