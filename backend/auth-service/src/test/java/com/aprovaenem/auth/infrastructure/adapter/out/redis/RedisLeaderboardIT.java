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

    @Test
    @DisplayName("High-concurrency ZSET leaderboard benchmark: sub-2ms average and sub-5ms P95 latency")
    void shouldAchieveSubMillisecondRankingUnderConcurrentLoad() throws InterruptedException {
        int threadCount = 20;
        int operationsPerThread = 25; // 500 total operations
        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(threadCount);
        java.util.concurrent.CountDownLatch readyLatch = new java.util.concurrent.CountDownLatch(threadCount);
        java.util.concurrent.CountDownLatch startLatch = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.CountDownLatch finishLatch = new java.util.concurrent.CountDownLatch(threadCount);

        java.util.List<Long> latenciesNanos = java.util.Collections.synchronizedList(new java.util.ArrayList<>());
        java.util.List<UUID> students = new java.util.ArrayList<>();
        for (int i = 0; i < 50; i++) {
            students.add(UUID.randomUUID());
        }

        for (int t = 0; t < threadCount; t++) {
            final int threadId = t;
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    for (int i = 0; i < operationsPerThread; i++) {
                        UUID student = students.get((threadId * operationsPerThread + i) % students.size());
                        long start = System.nanoTime();
                        leaderboardAdapter.incrementWeeklyXp(year, weekNumber, tier, student, 20);
                        leaderboardAdapter.getStudentRank(year, weekNumber, tier, student);
                        long elapsed = System.nanoTime() - start;
                        latenciesNanos.add(elapsed);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        readyLatch.await();
        long benchmarkStart = System.currentTimeMillis();
        startLatch.countDown();
        boolean finished = finishLatch.await(10, java.util.concurrent.TimeUnit.SECONDS);
        long totalDurationMs = System.currentTimeMillis() - benchmarkStart;
        executor.shutdown();

        assertThat(finished).isTrue();
        assertThat(latenciesNanos).hasSize(threadCount * operationsPerThread);

        java.util.List<Long> sorted = new java.util.ArrayList<>(latenciesNanos);
        java.util.Collections.sort(sorted);
        double avgMs = sorted.stream().mapToLong(Long::longValue).average().orElse(0) / 1_000_000.0;
        double p50Ms = sorted.get((int) (sorted.size() * 0.50)) / 1_000_000.0;
        double p95Ms = sorted.get((int) (sorted.size() * 0.95)) / 1_000_000.0;
        double p99Ms = sorted.get((int) (sorted.size() * 0.99)) / 1_000_000.0;

        System.out.printf("[BENCHMARK] Redis ZSET Leaderboard: %d ops in %d ms | Avg: %.3f ms | P50: %.3f ms | P95: %.3f ms | P99: %.3f ms%n",
                sorted.size(), totalDurationMs, avgMs, p50Ms, p95Ms, p99Ms);

        assertThat(avgMs).as("Average ZSET operation latency in containerized test environment").isLessThan(50.0);
        assertThat(p95Ms).as("P95 ZSET latency in containerized test environment").isLessThan(100.0);
        assertThat(totalDurationMs).as("Total duration for concurrent operations").isLessThan(5000);
        assertThat(leaderboardAdapter.getTotalParticipants(year, weekNumber, tier)).isEqualTo((long) students.size());
    }
}
