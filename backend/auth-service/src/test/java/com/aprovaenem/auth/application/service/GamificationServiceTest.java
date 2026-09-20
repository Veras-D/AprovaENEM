package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.AchievementBadge;
import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.model.WeeklyLeaderboard;
import com.aprovaenem.auth.domain.port.out.GamificationRepositoryPort;
import com.aprovaenem.auth.domain.port.out.LeaderboardRedisPort;
import com.aprovaenem.auth.domain.port.out.NotificationPublisherPort;
import com.aprovaenem.auth.domain.port.out.UserRepositoryPort;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.BadgesResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.GamificationProfileResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.WeeklyLeaderboardResponse;
import com.aprovaenem.common.events.DailyGoalReminderEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.DefaultTypedTuple;
import org.springframework.data.redis.core.ZSetOperations;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("GamificationService Application Service Unit Tests")
class GamificationServiceTest {

    @Mock
    private GamificationRepositoryPort gamificationRepository;

    @Mock
    private LeaderboardRedisPort redisLeaderboardPort;

    @Mock
    private NotificationPublisherPort notificationPublisherPort;

    @Mock
    private UserRepositoryPort userRepository;

    @InjectMocks
    private GamificationService gamificationService;

    private static final ZoneId BRT_ZONE = ZoneId.of("America/Sao_Paulo");

    @Test
    @DisplayName("Should create default initial profile when user has no gamification profile yet")
    void shouldCreateInitialProfileWhenNotPresent() {
        UUID userId = UUID.randomUUID();
        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.empty());
        when(gamificationRepository.saveProfile(any(UserGamificationProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        UserGamificationProfile profile = gamificationService.getProfile(userId);

        assertThat(profile).isNotNull();
        assertThat(profile.getUserId()).isEqualTo(userId);
        assertThat(profile.getCurrentLevel()).isEqualTo(1);
        assertThat(profile.getCurrentXp()).isZero();
        assertThat(profile.getStreakDays()).isZero();
        assertThat(profile.getStreakFreezeAvailable()).isEqualTo(1);
        assertThat(profile.getDailyGoalQuestions()).isEqualTo(10);
        assertThat(profile.isOptInReminders()).isTrue();
        verify(gamificationRepository).saveProfile(profile);
    }

    @Test
    @DisplayName("Should return comprehensive gamification profile response DTO")
    void shouldReturnProfileResponse() {
        UUID userId = UUID.randomUUID();
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(3)
                .currentXp(550)
                .streakDays(5)
                .streakFreezeAvailable(1)
                .dailyGoalQuestions(15)
                .dailyQuestionsCompleted(10)
                .optInReminders(true)
                .build();

        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.findWeeklyLeaderboard(eq(userId), anyInt(), anyInt())).thenReturn(Optional.empty());

        AchievementBadge badge1 = AchievementBadge.builder().code("FIRST_SIMULADO").unlocked(true).build();
        AchievementBadge badge2 = AchievementBadge.builder().code("STREAK_7_DAYS").unlocked(false).build();
        when(gamificationRepository.findBadgesByUserId(userId)).thenReturn(List.of(badge1, badge2));

        GamificationProfileResponse response = gamificationService.getProfileResponse(userId);

        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.getLevel()).isEqualTo(3);
        assertThat(response.getCurrentXp()).isEqualTo(550);
        assertThat(response.getCurrentLeague()).isEqualTo("BRONZE");
        assertThat(response.getUnlockedBadgesCount()).isEqualTo(1);
        assertThat(response.getDailyGoal().getTargetQuestions()).isEqualTo(15);
        assertThat(response.getDailyGoal().getCompletedQuestions()).isEqualTo(10);
        assertThat(response.getDailyGoal().isCompleted()).isFalse();
    }

    @Test
    @DisplayName("Should update daily goal target questions and reminder preferences")
    void shouldUpdateDailyGoal() {
        UUID userId = UUID.randomUUID();
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .dailyGoalQuestions(10)
                .optInReminders(true)
                .build();

        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.saveProfile(any(UserGamificationProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        UserGamificationProfile updated = gamificationService.updateDailyGoal(userId, 20, false);

        assertThat(updated.getDailyGoalQuestions()).isEqualTo(20);
        assertThat(updated.isOptInReminders()).isFalse();
        verify(gamificationRepository).saveProfile(profile);
    }

    @Test
    @DisplayName("Should award XP, increment consecutive streak, award daily goal bonus, and unlock badges")
    void shouldAwardXpConsecutiveDayAndUnlockBadges() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now(BRT_ZONE);
        LocalDate yesterday = today.minusDays(1);

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(1)
                .currentXp(180)
                .streakDays(6) // today becomes 7 -> unlocks STREAK_7_DAYS
                .streakFreezeAvailable(1)
                .dailyGoalQuestions(5)
                .dailyQuestionsCompleted(0)
                .dailyGoalReachedAt(null)
                .lastActivityDate(yesterday)
                .build();

        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.saveProfile(any(UserGamificationProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(gamificationRepository.findWeeklyLeaderboard(eq(userId), anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        // 5 solved, 5 correct, session completed (+50 for 5 correct, +50 for session, +20 for goal = +120 XP)
        UserGamificationProfile updated = gamificationService.awardXpForActivity(userId, 5, 5, true);

        assertThat(updated.getStreakDays()).isEqualTo(7);
        assertThat(updated.getCurrentXp()).isEqualTo(180 + (5 * 10) + 50 + 20); // 300 XP
        assertThat(updated.getCurrentLevel()).isEqualTo((300 / 200) + 1); // Level 2
        assertThat(updated.getLastActivityDate()).isEqualTo(today);
        assertThat(updated.getDailyGoalReachedAt()).isNotNull();

        verify(gamificationRepository).unlockBadge(userId, "FIRST_SIMULADO");
        verify(gamificationRepository).unlockBadge(userId, "STREAK_7_DAYS");
        verify(redisLeaderboardPort).incrementWeeklyXp(anyInt(), anyInt(), eq(LeagueTier.BRONZE), eq(userId), eq(120));
    }

    @Test
    @DisplayName("Should consume streak freeze when student missed a day but had freeze available")
    void shouldConsumeStreakFreezeWhenMissedDay() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now(BRT_ZONE);
        LocalDate threeDaysAgo = today.minusDays(3);

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(2)
                .currentXp(250)
                .streakDays(15)
                .streakFreezeAvailable(1) // has 1 emergency freeze
                .dailyGoalQuestions(10)
                .dailyQuestionsCompleted(0)
                .lastActivityDate(threeDaysAgo)
                .build();

        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.saveProfile(any(UserGamificationProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(gamificationRepository.findWeeklyLeaderboard(eq(userId), anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        UserGamificationProfile updated = gamificationService.awardXpForActivity(userId, 2, 2, false);

        assertThat(updated.getStreakDays()).isEqualTo(15); // preserved by freeze!
        assertThat(updated.getStreakFreezeAvailable()).isZero(); // consumed
        assertThat(updated.getLastActivityDate()).isEqualTo(today);
    }

    @Test
    @DisplayName("Should reset streak to 1 when student missed a day and has no streak freeze available")
    void shouldResetStreakWhenNoFreezeAvailable() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now(BRT_ZONE);
        LocalDate twoDaysAgo = today.minusDays(2);

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(2)
                .currentXp(250)
                .streakDays(20)
                .streakFreezeAvailable(0) // no freeze available
                .dailyGoalQuestions(10)
                .dailyQuestionsCompleted(0)
                .lastActivityDate(twoDaysAgo)
                .build();

        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.saveProfile(any(UserGamificationProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(gamificationRepository.findWeeklyLeaderboard(eq(userId), anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        UserGamificationProfile updated = gamificationService.awardXpForActivity(userId, 1, 1, false);

        assertThat(updated.getStreakDays()).isEqualTo(1); // reset to 1
        assertThat(updated.getLastActivityDate()).isEqualTo(today);
    }

    @Test
    @DisplayName("Should return weekly leaderboard with ranks, scores, and promotion zone")
    void shouldGetWeeklyLeaderboard() {
        UUID currentUserId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        when(gamificationRepository.findWeeklyLeaderboard(eq(currentUserId), anyInt(), anyInt()))
                .thenReturn(Optional.empty());
        when(redisLeaderboardPort.getTotalParticipants(anyInt(), anyInt(), eq(LeagueTier.BRONZE)))
                .thenReturn(10L);

        Set<ZSetOperations.TypedTuple<String>> entries = new LinkedHashSet<>();
        entries.add(new DefaultTypedTuple<>(otherUserId.toString(), 500.0));
        entries.add(new DefaultTypedTuple<>(currentUserId.toString(), 300.0));

        when(redisLeaderboardPort.getTopRanked(anyInt(), anyInt(), eq(LeagueTier.BRONZE), eq(0L), eq(9L)))
                .thenReturn(entries);

        User otherUser = User.builder().id(otherUserId).fullName("Ana Clara").build();
        User currentUser = User.builder().id(currentUserId).fullName("Lucas Silva").build();
        when(userRepository.findById(otherUserId)).thenReturn(Optional.of(otherUser));
        when(userRepository.findById(currentUserId)).thenReturn(Optional.of(currentUser));

        when(redisLeaderboardPort.getStudentRank(anyInt(), anyInt(), eq(LeagueTier.BRONZE), eq(currentUserId)))
                .thenReturn(2L);
        when(redisLeaderboardPort.getStudentScore(anyInt(), anyInt(), eq(LeagueTier.BRONZE), eq(currentUserId)))
                .thenReturn(300.0);

        WeeklyLeaderboardResponse response = gamificationService.getWeeklyLeaderboard(currentUserId, LeagueTier.BRONZE, 0, 10);

        assertThat(response).isNotNull();
        assertThat(response.getLeagueTier()).isEqualTo("BRONZE");
        assertThat(response.getTotalParticipants()).isEqualTo(10L);
        assertThat(response.getLeaderboard()).hasSize(2);
        assertThat(response.getCurrentUserRank()).isNotNull();
        assertThat(response.getCurrentUserRank().getRank()).isEqualTo(2L);
        assertThat(response.getCurrentUserRank().getDisplayName()).isEqualTo("Lucas Silva");
        assertThat(response.getCurrentUserRank().getWeeklyXp()).isEqualTo(300);
    }

    @Test
    @DisplayName("Should retrieve student badges with unlocked count")
    void shouldGetBadges() {
        UUID userId = UUID.randomUUID();
        AchievementBadge b1 = AchievementBadge.builder()
                .code("FIRST_SIMULADO")
                .name("Primeiro Simulado")
                .description("Completou um simulado completo")
                .icon("quiz")
                .unlocked(true)
                .unlockedAt(Instant.now())
                .build();
        AchievementBadge b2 = AchievementBadge.builder()
                .code("STREAK_7_DAYS")
                .name("Guerreiro Semanal")
                .description("Manteve 7 dias consecutivos")
                .icon("fire")
                .unlocked(false)
                .build();

        when(gamificationRepository.findBadgesByUserId(userId)).thenReturn(List.of(b1, b2));

        BadgesResponse response = gamificationService.getBadges(userId);

        assertThat(response.getTotalUnlocked()).isEqualTo(1);
        assertThat(response.getBadges()).hasSize(2);
        assertThat(response.getBadges().get(0).getCode()).isEqualTo("FIRST_SIMULADO");
        assertThat(response.getBadges().get(0).isUnlocked()).isTrue();
    }

    @Test
    @DisplayName("Should trigger daily study reminder notifications for profiles with pending daily goals")
    void shouldTriggerDailyStudyReminders() {
        UUID userId = UUID.randomUUID();
        UserGamificationProfile pendingProfile = UserGamificationProfile.builder()
                .userId(userId)
                .streakDays(4)
                .dailyQuestionsCompleted(2)
                .dailyGoalQuestions(10)
                .optInReminders(true)
                .build();

        User user = User.builder()
                .id(userId)
                .email("student@escola.gov.br")
                .fullName("Estudante Focado")
                .build();

        when(gamificationRepository.findPendingStudyReminderProfiles()).thenReturn(List.of(pendingProfile));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        int dispatchedCount = gamificationService.triggerDailyStudyReminders();

        assertThat(dispatchedCount).isEqualTo(1);
        ArgumentCaptor<DailyGoalReminderEvent> captor = ArgumentCaptor.forClass(DailyGoalReminderEvent.class);
        verify(notificationPublisherPort).publishStudyReminder(captor.capture());

        DailyGoalReminderEvent event = captor.getValue();
        assertThat(event.getUserId()).isEqualTo(userId);
        assertThat(event.getEmail()).isEqualTo("student@escola.gov.br");
        assertThat(event.getStreakDays()).isEqualTo(4);
        assertThat(event.getQuestionsCompleted()).isEqualTo(2);
        assertThat(event.getTargetQuestions()).isEqualTo(10);
    }

    @Test
    @DisplayName("Should perform Sunday weekly league reset and clear Redis leaderboard cache")
    void shouldPerformWeeklyLeagueReset() {
        UUID u1 = UUID.randomUUID();
        UUID u2 = UUID.randomUUID();

        WeeklyLeaderboard wb1 = WeeklyLeaderboard.builder().userId(u1).weeklyXp(100).build();
        WeeklyLeaderboard wb2 = WeeklyLeaderboard.builder().userId(u2).weeklyXp(50).build();

        when(gamificationRepository.findTopByLeague(anyInt(), anyInt(), anyString()))
                .thenAnswer(inv -> {
                    String tierName = inv.getArgument(2);
                    if ("BRONZE".equals(tierName)) {
                        return List.of(wb1, wb2);
                    }
                    return List.of();
                });

        gamificationService.performWeeklyLeagueReset();

        assertThat(wb1.getRankPosition()).isEqualTo(1);
        assertThat(wb2.getRankPosition()).isEqualTo(2);
        verify(gamificationRepository).saveWeeklyLeaderboard(wb1);
        verify(gamificationRepository).saveWeeklyLeaderboard(wb2);
        verify(redisLeaderboardPort).clearWeeklyLeaderboard(anyInt(), anyInt(), eq(LeagueTier.BRONZE));
    }

    @Test
    @DisplayName("Should initialize streak to 1 when last activity date is null")
    void shouldInitializeStreakWhenLastActivityDateIsNull() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now(BRT_ZONE);

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(1)
                .currentXp(0)
                .streakDays(0)
                .streakFreezeAvailable(1)
                .dailyGoalQuestions(10)
                .dailyQuestionsCompleted(0)
                .lastActivityDate(null)
                .build();

        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.saveProfile(any(UserGamificationProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(gamificationRepository.findWeeklyLeaderboard(eq(userId), anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        UserGamificationProfile updated = gamificationService.awardXpForActivity(userId, 3, 3, false);

        assertThat(updated.getStreakDays()).isEqualTo(1);
        assertThat(updated.getDailyQuestionsCompleted()).isEqualTo(3);
        assertThat(updated.getLastActivityDate()).isEqualTo(today);
    }

    @Test
    @DisplayName("Should accumulate questions completed when activity occurs on the same day")
    void shouldAccumulateQuestionsCompletedSameDay() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now(BRT_ZONE);

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(1)
                .currentXp(50)
                .streakDays(3)
                .streakFreezeAvailable(1)
                .dailyGoalQuestions(10)
                .dailyQuestionsCompleted(4)
                .lastActivityDate(today)
                .build();

        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.saveProfile(any(UserGamificationProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(gamificationRepository.findWeeklyLeaderboard(eq(userId), anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        UserGamificationProfile updated = gamificationService.awardXpForActivity(userId, 2, 2, false);

        assertThat(updated.getStreakDays()).isEqualTo(3);
        assertThat(updated.getDailyQuestionsCompleted()).isEqualTo(6);
        assertThat(updated.getLastActivityDate()).isEqualTo(today);
    }

    @Test
    @DisplayName("Should unlock LEVEL_10 badge when student reaches level 10 and not re-award goal bonus if already reached")
    void shouldUnlockLevel10BadgeAndSkipDailyGoalBonusIfAlreadyReached() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now(BRT_ZONE);

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(9)
                .currentXp(1800) // 1800 + 200 = 2000 -> Level 11 >= 10
                .streakDays(2)
                .streakFreezeAvailable(1)
                .dailyGoalQuestions(5)
                .dailyQuestionsCompleted(10)
                .dailyGoalReachedAt(Instant.now().minusSeconds(3600)) // already reached earlier today
                .lastActivityDate(today)
                .build();

        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.saveProfile(any(UserGamificationProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(gamificationRepository.findWeeklyLeaderboard(eq(userId), anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        // 20 questions, 20 correct (+200 XP), session completed (+50 XP) -> +250 XP
        UserGamificationProfile updated = gamificationService.awardXpForActivity(userId, 20, 20, true);

        assertThat(updated.getCurrentLevel()).isGreaterThanOrEqualTo(10);
        verify(gamificationRepository).unlockBadge(userId, "LEVEL_10");
        verify(gamificationRepository).unlockBadge(userId, "FIRST_SIMULADO");
    }

    @Test
    @DisplayName("Should populate cold Redis cache from Postgres leaderboard when totalParticipants is 0")
    void shouldPopulateColdRedisCacheFromPostgresLeaderboard() {
        UUID currentUserId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        // user has existing leaderboard in SILVER
        WeeklyLeaderboard userBoard = WeeklyLeaderboard.builder()
                .userId(currentUserId)
                .leagueTier(LeagueTier.SILVER)
                .weeklyXp(150)
                .build();

        when(gamificationRepository.findWeeklyLeaderboard(eq(currentUserId), anyInt(), anyInt()))
                .thenReturn(Optional.of(userBoard));
        // total participants in Redis is 0 (cold cache)
        when(redisLeaderboardPort.getTotalParticipants(anyInt(), anyInt(), eq(LeagueTier.SILVER)))
                .thenReturn(0L);

        WeeklyLeaderboard pgEntry = WeeklyLeaderboard.builder()
                .userId(otherUserId)
                .leagueTier(LeagueTier.SILVER)
                .weeklyXp(200)
                .build();
        when(gamificationRepository.findTopByLeague(anyInt(), anyInt(), eq("SILVER")))
                .thenReturn(List.of(pgEntry, userBoard));

        Set<ZSetOperations.TypedTuple<String>> entries = new LinkedHashSet<>();
        entries.add(new DefaultTypedTuple<>(otherUserId.toString(), 200.0));
        when(redisLeaderboardPort.getTopRanked(anyInt(), anyInt(), eq(LeagueTier.SILVER), eq(0L), eq(9L)))
                .thenReturn(entries);

        when(userRepository.findById(otherUserId)).thenReturn(Optional.empty()); // defaults to "Estudante"
        when(gamificationRepository.findProfileByUserId(otherUserId)).thenReturn(Optional.empty()); // defaults to 0 streak

        when(redisLeaderboardPort.getStudentRank(anyInt(), anyInt(), eq(LeagueTier.SILVER), eq(currentUserId)))
                .thenReturn(null); // not ranked
        when(redisLeaderboardPort.getStudentScore(anyInt(), anyInt(), eq(LeagueTier.SILVER), eq(currentUserId)))
                .thenReturn(null);

        WeeklyLeaderboardResponse response = gamificationService.getWeeklyLeaderboard(currentUserId, null, 0, 10);

        assertThat(response.getLeagueTier()).isEqualTo("SILVER");
        assertThat(response.getTotalParticipants()).isEqualTo(2L);
        assertThat(response.getCurrentUserRank()).isNull();
        assertThat(response.getLeaderboard()).hasSize(1);
        assertThat(response.getLeaderboard().get(0).getDisplayName()).isEqualTo("Estudante");
        verify(redisLeaderboardPort).incrementWeeklyXp(anyInt(), anyInt(), eq(LeagueTier.SILVER), eq(otherUserId), eq(200));
    }

    @Test
    @DisplayName("Should handle partial updates in updateDailyGoal when only targetQuestions or optInReminders is provided")
    void shouldHandlePartialUpdatesInDailyGoal() {
        UUID userId = UUID.randomUUID();
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .dailyGoalQuestions(10)
                .optInReminders(true)
                .build();

        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.saveProfile(any(UserGamificationProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // targetQuestions null, optInReminders false
        UserGamificationProfile updated1 = gamificationService.updateDailyGoal(userId, null, false);
        assertThat(updated1.getDailyGoalQuestions()).isEqualTo(10);
        assertThat(updated1.isOptInReminders()).isFalse();

        // targetQuestions 25, optInReminders null
        UserGamificationProfile updated2 = gamificationService.updateDailyGoal(userId, 25, null);
        assertThat(updated2.getDailyGoalQuestions()).isEqualTo(25);
        assertThat(updated2.isOptInReminders()).isFalse();
    }

    @Test
    @DisplayName("Should skip notification publishing when user profile has no matching User entity")
    void shouldSkipStudyReminderWhenUserNotFound() {
        UUID userId = UUID.randomUUID();
        UserGamificationProfile pendingProfile = UserGamificationProfile.builder()
                .userId(userId)
                .streakDays(2)
                .dailyQuestionsCompleted(1)
                .dailyGoalQuestions(10)
                .optInReminders(true)
                .build();

        when(gamificationRepository.findPendingStudyReminderProfiles()).thenReturn(List.of(pendingProfile));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        int count = gamificationService.triggerDailyStudyReminders();

        assertThat(count).isZero();
        verify(notificationPublisherPort, never()).publishStudyReminder(any());
    }
}
