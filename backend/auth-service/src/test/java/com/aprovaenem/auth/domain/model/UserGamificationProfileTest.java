package com.aprovaenem.auth.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("UserGamificationProfile Domain Model Unit Tests")
class UserGamificationProfileTest {

    @Test
    @DisplayName("Should instantiate default gamification profile with Level 1, 0 XP, and 1 streak freeze")
    void shouldInitializeWithDefaults() {
        UUID userId = UUID.randomUUID();
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .build();

        assertThat(profile.getUserId()).isEqualTo(userId);
        assertThat(profile.getCurrentLevel()).isEqualTo(1);
        assertThat(profile.getCurrentXp()).isZero();
        assertThat(profile.getStreakDays()).isZero();
        assertThat(profile.getStreakFreezeAvailable()).isEqualTo(1);
        assertThat(profile.getDailyGoalQuestions()).isEqualTo(10);
        assertThat(profile.getDailyQuestionsCompleted()).isZero();
        assertThat(profile.isOptInReminders()).isTrue();
    }

    @ParameterizedTest(name = "Level {0} requires {1} XP for next level")
    @CsvSource({
            "1, 200",
            "2, 400",
            "5, 1000",
            "10, 2000",
            "20, 4000"
    })
    @DisplayName("Should calculate required XP for next level linearly (level * 200)")
    void shouldCalculateXpNextLevel(int level, int expectedXp) {
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .currentLevel(level)
                .build();

        assertThat(profile.getXpNextLevel()).isEqualTo(expectedXp);
    }

    @ParameterizedTest(name = "Level {0} with {1} XP = {2}% progress in current level")
    @CsvSource({
            "1, 0, 0.0",
            "1, 50, 25.0",
            "1, 100, 50.0",
            "1, 150, 75.0",
            "1, 200, 100.0",
            "2, 200, 0.0",
            "2, 250, 25.0",
            "2, 300, 50.0",
            "2, 350, 75.0",
            "2, 400, 100.0"
    })
    @DisplayName("Should calculate level progress percentage within the current tier bounds")
    void shouldCalculateLevelProgressPercentage(int level, int currentXp, double expectedPercentage) {
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .currentLevel(level)
                .currentXp(currentXp)
                .build();

        assertThat(profile.getLevelProgressPercentage()).isEqualTo(expectedPercentage);
    }

    @ParameterizedTest(name = "Level {0} receives title: {1}")
    @CsvSource({
            "1, Calouro Iniciante",
            "3, Calouro Iniciante",
            "4, Calouro Iniciante",
            "5, Focado no SISU",
            "8, Focado no SISU",
            "9, Focado no SISU",
            "10, Mestre dos Simulados",
            "15, Mestre dos Simulados",
            "19, Mestre dos Simulados",
            "20, Nota 1000",
            "50, Nota 1000"
    })
    @DisplayName("Should assign pedagogically motivating level titles according to progression tiers")
    void shouldAssignLevelTitles(int level, String expectedTitle) {
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .currentLevel(level)
                .build();

        assertThat(profile.getLevelTitle()).isEqualTo(expectedTitle);
    }

    @ParameterizedTest(name = "{0} completed out of {1} daily questions -> completed: {2}")
    @CsvSource({
            "0, 10, false",
            "5, 10, false",
            "9, 10, false",
            "10, 10, true",
            "15, 10, true"
    })
    @DisplayName("Should accurately verify whether the daily study question goal has been met")
    void shouldVerifyDailyGoalCompletion(int completed, int goal, boolean expectedResult) {
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .dailyGoalQuestions(goal)
                .dailyQuestionsCompleted(completed)
                .build();

        assertThat(profile.isDailyGoalCompleted()).isEqualTo(expectedResult);
    }
}
