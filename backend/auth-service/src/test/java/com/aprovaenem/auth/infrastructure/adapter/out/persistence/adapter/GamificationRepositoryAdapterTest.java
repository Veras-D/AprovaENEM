package com.aprovaenem.auth.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.auth.domain.model.AchievementBadge;
import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.model.WeeklyLeaderboard;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserAchievementEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserGamificationProfileEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.WeeklyLeaderboardEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataGamificationProfileRepository;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataUserAchievementRepository;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataUserRepository;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataWeeklyLeaderboardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("GamificationRepositoryAdapter Unit Tests")
class GamificationRepositoryAdapterTest {

    @Mock
    private SpringDataGamificationProfileRepository profileRepository;

    @Mock
    private SpringDataWeeklyLeaderboardRepository leaderboardRepository;

    @Mock
    private SpringDataUserAchievementRepository achievementRepository;

    @Mock
    private SpringDataUserRepository userRepository;

    private GamificationRepositoryAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new GamificationRepositoryAdapter(
                profileRepository,
                leaderboardRepository,
                achievementRepository,
                userRepository
        );
    }

    @Test
    @DisplayName("Should find and save user gamification profile")
    void shouldFindAndSaveProfile() {
        UUID userId = UUID.randomUUID();
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(3)
                .currentXp(550)
                .streakDays(4)
                .streakFreezeAvailable(1)
                .lastActivityDate(LocalDate.now())
                .dailyGoalQuestions(10)
                .dailyQuestionsCompleted(5)
                .optInReminders(true)
                .build();

        UserGamificationProfileEntity entity = UserGamificationProfileEntity.builder()
                .userId(userId)
                .currentLevel(3)
                .currentXp(550)
                .streakDays(4)
                .streakFreezeAvailable(1)
                .lastActivityDate(LocalDate.now())
                .dailyGoalQuestions(10)
                .dailyQuestionsCompleted(5)
                .optInReminders(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(profileRepository.findById(userId)).thenReturn(Optional.of(entity));
        when(profileRepository.save(any(UserGamificationProfileEntity.class))).thenReturn(entity);

        Optional<UserGamificationProfile> found = adapter.findProfileByUserId(userId);
        assertThat(found).isPresent();
        assertThat(found.get().getCurrentLevel()).isEqualTo(3);

        UserGamificationProfile saved = adapter.saveProfile(profile);
        assertThat(saved).isNotNull();
        assertThat(saved.getUserId()).isEqualTo(userId);
    }

    @Test
    @DisplayName("Should save, find, and rank weekly leaderboard entries")
    void shouldManageWeeklyLeaderboard() {
        UUID userId = UUID.randomUUID();
        WeeklyLeaderboard leaderboard = WeeklyLeaderboard.builder()
                .userId(userId)
                .weekNumber(38)
                .year(2026)
                .leagueTier(LeagueTier.SILVER)
                .weeklyXp(420)
                .questionsSolved(42)
                .rankPosition(5)
                .build();

        WeeklyLeaderboardEntity entity = WeeklyLeaderboardEntity.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .weekNumber(38)
                .year(2026)
                .leagueTier("SILVER")
                .weeklyXp(420)
                .questionsSolved(42)
                .rankPosition(5)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(leaderboardRepository.save(any(WeeklyLeaderboardEntity.class))).thenReturn(entity);
        when(leaderboardRepository.findByUserIdAndWeekNumberAndYear(userId, 38, 2026)).thenReturn(Optional.of(entity));
        when(leaderboardRepository.findByWeekNumberAndYearAndLeagueTierOrderByWeeklyXpDesc(38, 2026, "SILVER"))
                .thenReturn(List.of(entity));
        when(userRepository.findById(userId)).thenReturn(Optional.of(UserEntity.builder().fullName("Maria Souza").build()));
        when(profileRepository.findById(userId)).thenReturn(Optional.of(UserGamificationProfileEntity.builder().streakDays(7).build()));

        WeeklyLeaderboard saved = adapter.saveWeeklyLeaderboard(leaderboard);
        assertThat(saved).isNotNull();
        assertThat(saved.getDisplayName()).isEqualTo("Maria Souza");
        assertThat(saved.getStreakDays()).isEqualTo(7);

        Optional<WeeklyLeaderboard> found = adapter.findWeeklyLeaderboard(userId, 38, 2026);
        assertThat(found).isPresent();
        assertThat(found.get().getLeagueTier()).isEqualTo(LeagueTier.SILVER);

        List<WeeklyLeaderboard> top = adapter.findTopByLeague(38, 2026, "SILVER");
        assertThat(top).hasSize(1);
    }

    @Test
    @DisplayName("Should find badges with unlocked status and unlock newly earned badge")
    void shouldManageBadges() {
        UUID userId = UUID.randomUUID();
        UserAchievementEntity achievement = UserAchievementEntity.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .badgeCode("FIRST_SIMULADO")
                .unlockedAt(Instant.now())
                .build();

        when(achievementRepository.findByUserId(userId)).thenReturn(List.of(achievement));
        when(achievementRepository.existsByUserIdAndBadgeCode(userId, "STREAK_7_DAYS")).thenReturn(false);
        when(achievementRepository.existsByUserIdAndBadgeCode(userId, "FIRST_SIMULADO")).thenReturn(true);

        List<AchievementBadge> badges = adapter.findBadgesByUserId(userId);
        assertThat(badges).isNotEmpty();
        assertThat(badges.stream().anyMatch(b -> b.getCode().equals("FIRST_SIMULADO") && b.isUnlocked())).isTrue();

        // Unlock non-existing badge
        adapter.unlockBadge(userId, "STREAK_7_DAYS");
        verify(achievementRepository).save(any(UserAchievementEntity.class));

        // Already unlocked badge should not be saved again
        adapter.unlockBadge(userId, "FIRST_SIMULADO");
    }

    @Test
    @DisplayName("Should find pending study reminder profiles")
    void shouldFindPendingStudyReminderProfiles() {
        UserGamificationProfileEntity entity = UserGamificationProfileEntity.builder()
                .userId(UUID.randomUUID())
                .currentLevel(1)
                .currentXp(20)
                .optInReminders(true)
                .dailyQuestionsCompleted(2)
                .dailyGoalQuestions(10)
                .build();

        when(profileRepository.findPendingStudyReminderProfiles()).thenReturn(List.of(entity));

        List<UserGamificationProfile> pending = adapter.findPendingStudyReminderProfiles();
        assertThat(pending).hasSize(1);
    }
}
