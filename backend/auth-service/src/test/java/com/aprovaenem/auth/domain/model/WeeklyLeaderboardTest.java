package com.aprovaenem.auth.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("WeeklyLeaderboard Domain Model Unit Tests")
class WeeklyLeaderboardTest {

    @Test
    @DisplayName("Should initialize weekly leaderboard entry with Bronze tier and zero weekly XP defaults")
    void shouldInitializeWithDefaults() {
        UUID userId = UUID.randomUUID();
        WeeklyLeaderboard entry = WeeklyLeaderboard.builder()
                .userId(userId)
                .displayName("Lucas S.")
                .weekNumber(38)
                .year(2026)
                .build();

        assertThat(entry.getUserId()).isEqualTo(userId);
        assertThat(entry.getDisplayName()).isEqualTo("Lucas S.");
        assertThat(entry.getWeekNumber()).isEqualTo(38);
        assertThat(entry.getYear()).isEqualTo(2026);
        assertThat(entry.getLeagueTier()).isEqualTo(LeagueTier.BRONZE);
        assertThat(entry.getWeeklyXp()).isZero();
        assertThat(entry.getQuestionsSolved()).isZero();
        assertThat(entry.isPromotionZone()).isFalse();
    }

    @ParameterizedTest(name = "LeagueTier: {0}")
    @EnumSource(LeagueTier.class)
    @DisplayName("Should support all progressive league tiers (BRONZE, SILVER, GOLD, DIAMOND)")
    void shouldSupportAllLeagueTiers(LeagueTier tier) {
        WeeklyLeaderboard entry = WeeklyLeaderboard.builder()
                .leagueTier(tier)
                .build();

        assertThat(entry.getLeagueTier()).isEqualTo(tier);
    }

    @Test
    @DisplayName("Should update rank position and promotion zone when student advances in weekly ladder")
    void shouldUpdateRankAndPromotionZone() {
        WeeklyLeaderboard entry = WeeklyLeaderboard.builder()
                .weeklyXp(1250)
                .questionsSolved(45)
                .rankPosition(3)
                .promotionZone(true)
                .build();

        assertThat(entry.getRankPosition()).isEqualTo(3);
        assertThat(entry.isPromotionZone()).isTrue();
        assertThat(entry.getWeeklyXp()).isEqualTo(1250);
        assertThat(entry.getQuestionsSolved()).isEqualTo(45);
    }
}
