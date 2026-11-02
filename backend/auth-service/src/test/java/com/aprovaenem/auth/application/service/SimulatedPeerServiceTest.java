package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.model.UserRole;
import com.aprovaenem.auth.domain.model.WeeklyLeaderboard;
import com.aprovaenem.auth.domain.port.out.GamificationRepositoryPort;
import com.aprovaenem.auth.domain.port.out.LeaderboardRedisPort;
import com.aprovaenem.auth.domain.port.out.UserRepositoryPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SimulatedPeerService Unit Tests")
class SimulatedPeerServiceTest {

    @Mock
    private UserRepositoryPort userRepository;

    @Mock
    private GamificationRepositoryPort gamificationRepository;

    @Mock
    private LeaderboardRedisPort redisLeaderboardPort;

    @InjectMocks
    private SimulatedPeerService simulatedPeerService;

    @Test
    @DisplayName("Should sync simulated peers into Redis when score is not yet recorded in Redis")
    void shouldSyncSimulatedPeersToRedisWhenNotPresent() {
        UUID botId = UUID.randomUUID();
        User botUser = User.builder()
                .id(botId)
                .email("danilo.siqueira@simulado.enem.br")
                .fullName("Danilo Siqueira")
                .isBot(true)
                .build();

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(botId)
                .currentLeague(LeagueTier.BRONZE)
                .currentXp(380)
                .build();

        WeeklyLeaderboard board = WeeklyLeaderboard.builder()
                .userId(botId)
                .weekNumber(44)
                .year(2026)
                .leagueTier(LeagueTier.BRONZE)
                .weeklyXp(180)
                .questionsSolved(12)
                .build();

        when(userRepository.findSimulatedBots()).thenReturn(List.of(botUser));
        when(gamificationRepository.findProfileByUserId(botId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.findWeeklyLeaderboard(eq(botId), anyInt(), anyInt()))
                .thenReturn(Optional.of(board));
        when(redisLeaderboardPort.getStudentScore(anyInt(), anyInt(), eq(LeagueTier.BRONZE), eq(botId)))
                .thenReturn(null);

        simulatedPeerService.syncSimulatedPeersToRedis();

        verify(redisLeaderboardPort).recordWeeklyScore(anyInt(), anyInt(), eq(LeagueTier.BRONZE), eq(botId), eq(180.0));
    }

    @Test
    @DisplayName("Should not overwrite Redis score when already present")
    void shouldNotOverwriteRedisWhenAlreadyPresent() {
        UUID botId = UUID.randomUUID();
        User botUser = User.builder()
                .id(botId)
                .email("danilo.siqueira@simulado.enem.br")
                .fullName("Danilo Siqueira")
                .isBot(true)
                .build();

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(botId)
                .currentLeague(LeagueTier.BRONZE)
                .currentXp(380)
                .build();

        WeeklyLeaderboard board = WeeklyLeaderboard.builder()
                .userId(botId)
                .weekNumber(44)
                .year(2026)
                .leagueTier(LeagueTier.BRONZE)
                .weeklyXp(180)
                .questionsSolved(12)
                .build();

        when(userRepository.findSimulatedBots()).thenReturn(List.of(botUser));
        when(gamificationRepository.findProfileByUserId(botId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.findWeeklyLeaderboard(eq(botId), anyInt(), anyInt()))
                .thenReturn(Optional.of(board));
        when(redisLeaderboardPort.getStudentScore(anyInt(), anyInt(), eq(LeagueTier.BRONZE), eq(botId)))
                .thenReturn(180.0);

        simulatedPeerService.syncSimulatedPeersToRedis();

        verify(redisLeaderboardPort, never()).recordWeeklyScore(anyInt(), anyInt(), any(), any(), anyDouble());
    }

    @Test
    @DisplayName("Should return 0 when no simulated bots exist")
    void shouldHandleEmptyBotsListGracefully() {
        when(userRepository.findSimulatedBots()).thenReturn(Collections.emptyList());

        simulatedPeerService.syncSimulatedPeersToRedis();
        int active = simulatedPeerService.simulateStudyTick();

        assertThat(active).isZero();
        verify(gamificationRepository, never()).saveProfile(any());
    }

    @Test
    @DisplayName("Should simulate study session and award XP to participating bots")
    void shouldSimulateStudySessionAndAwardXpToBots() {
        UUID diamondBotId = UUID.randomUUID();
        User botUser = User.builder()
                .id(diamondBotId)
                .email("gabriel.sampaio@simulado.enem.br")
                .fullName("Gabriel Sampaio")
                .isBot(true)
                .build();

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(diamondBotId)
                .currentLeague(LeagueTier.DIAMOND)
                .currentXp(3850)
                .currentLevel(12)
                .dailyQuestionsCompleted(10)
                .build();

        WeeklyLeaderboard board = WeeklyLeaderboard.builder()
                .userId(diamondBotId)
                .weekNumber(44)
                .year(2026)
                .leagueTier(LeagueTier.DIAMOND)
                .weeklyXp(1250)
                .questionsSolved(82)
                .build();

        when(userRepository.findSimulatedBots()).thenReturn(List.of(botUser));
        when(gamificationRepository.findProfileByUserId(diamondBotId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.findWeeklyLeaderboard(eq(diamondBotId), anyInt(), anyInt()))
                .thenReturn(Optional.of(board));

        // Repeat until at least one tick participates (since Diamond participation is 85%)
        int totalStudied = 0;
        for (int i = 0; i < 5; i++) {
            totalStudied += simulatedPeerService.simulateStudyTick();
        }

        assertThat(totalStudied).isGreaterThan(0);
        verify(gamificationRepository, atLeastOnce()).saveProfile(profile);
        verify(gamificationRepository, atLeastOnce()).saveWeeklyLeaderboard(board);
    }

    @Test
    @DisplayName("Should initialize streak to 1 when bot studies for the very first time")
    void shouldInitializeStreakWhenFirstStudy() {
        LocalDate today = LocalDate.of(2026, 11, 1);
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(UUID.randomUUID())
                .streakDays(0)
                .longestStreakDays(0)
                .lastActivityDate(null)
                .build();

        simulatedPeerService.updateBotStreakAndDailyProgress(profile, today, 8);

        assertThat(profile.getStreakDays()).isEqualTo(1);
        assertThat(profile.getLongestStreakDays()).isEqualTo(1);
        assertThat(profile.getDailyQuestionsCompleted()).isEqualTo(8);
    }

    @Test
    @DisplayName("Should increment streak by 1 on consecutive study day")
    void shouldIncrementStreakOnConsecutiveDay() {
        LocalDate today = LocalDate.of(2026, 11, 1);
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(UUID.randomUUID())
                .streakDays(3)
                .longestStreakDays(3)
                .lastActivityDate(today.minusDays(1))
                .dailyQuestionsCompleted(5)
                .build();

        simulatedPeerService.updateBotStreakAndDailyProgress(profile, today, 6);

        assertThat(profile.getStreakDays()).isEqualTo(4);
        assertThat(profile.getLongestStreakDays()).isEqualTo(4);
        assertThat(profile.getDailyQuestionsCompleted()).isEqualTo(6);
    }

    @Test
    @DisplayName("Should accumulate daily questions without incrementing streak twice on the same day")
    void shouldAccumulateQuestionsWithoutDoubleIncrementOnSameDay() {
        LocalDate today = LocalDate.of(2026, 11, 1);
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(UUID.randomUUID())
                .streakDays(4)
                .longestStreakDays(4)
                .lastActivityDate(today)
                .dailyQuestionsCompleted(5)
                .build();

        simulatedPeerService.updateBotStreakAndDailyProgress(profile, today, 3);

        assertThat(profile.getStreakDays()).isEqualTo(4);
        assertThat(profile.getLongestStreakDays()).isEqualTo(4);
        assertThat(profile.getDailyQuestionsCompleted()).isEqualTo(8);
    }

    @Test
    @DisplayName("Should consume streak freeze and continue streak when bot misses exactly one day")
    void shouldConsumeStreakFreezeWhenMissedOneDay() {
        LocalDate today = LocalDate.of(2026, 11, 2);
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(UUID.randomUUID())
                .streakDays(5)
                .longestStreakDays(5)
                .streakFreezeAvailable(1)
                .lastActivityDate(today.minusDays(2)) // Missed Nov 1st
                .dailyQuestionsCompleted(7)
                .build();

        simulatedPeerService.updateBotStreakAndDailyProgress(profile, today, 4);

        assertThat(profile.getStreakDays()).isEqualTo(6);
        assertThat(profile.getLongestStreakDays()).isEqualTo(6);
        assertThat(profile.getStreakFreezeAvailable()).isEqualTo(0);
        assertThat(profile.getDailyQuestionsCompleted()).isEqualTo(4);
    }

    @Test
    @DisplayName("Should reset streak to 1 when bot missed days without freeze shield, preserving longestStreakDays")
    void shouldResetStreakToOneWhenMissedWithoutFreeze() {
        LocalDate today = LocalDate.of(2026, 11, 5);
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(UUID.randomUUID())
                .streakDays(7)
                .longestStreakDays(10)
                .streakFreezeAvailable(0)
                .lastActivityDate(today.minusDays(4))
                .dailyQuestionsCompleted(10)
                .build();

        simulatedPeerService.updateBotStreakAndDailyProgress(profile, today, 5);

        assertThat(profile.getStreakDays()).isEqualTo(1);
        assertThat(profile.getLongestStreakDays()).isEqualTo(10); // Preserved
        assertThat(profile.getDailyQuestionsCompleted()).isEqualTo(5);
    }

    @Test
    @DisplayName("Should update bot streak during simulateStudyTick execution")
    void shouldUpdateStreakDuringSimulateStudyTick() {
        LocalDate today = LocalDate.of(2026, 11, 1);
        Clock fixedClock = Clock.fixed(
                today.atTime(14, 0).atZone(ZoneId.of("America/Sao_Paulo")).toInstant(),
                ZoneId.of("America/Sao_Paulo")
        );
        simulatedPeerService.setClock(fixedClock);

        UUID diamondBotId = UUID.randomUUID();
        User botUser = User.builder()
                .id(diamondBotId)
                .email("clara.mendes@simulado.enem.br")
                .fullName("Clara Mendes")
                .isBot(true)
                .build();

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(diamondBotId)
                .currentLeague(LeagueTier.DIAMOND)
                .currentXp(5000)
                .currentLevel(15)
                .streakDays(3)
                .longestStreakDays(3)
                .lastActivityDate(today.minusDays(1))
                .dailyQuestionsCompleted(4)
                .build();

        WeeklyLeaderboard board = WeeklyLeaderboard.builder()
                .userId(diamondBotId)
                .weekNumber(44)
                .year(2026)
                .leagueTier(LeagueTier.DIAMOND)
                .weeklyXp(1200)
                .questionsSolved(70)
                .build();

        when(userRepository.findSimulatedBots()).thenReturn(List.of(botUser));
        when(gamificationRepository.findProfileByUserId(diamondBotId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.findWeeklyLeaderboard(eq(diamondBotId), anyInt(), anyInt()))
                .thenReturn(Optional.of(board));

        int participated = 0;
        for (int i = 0; i < 10 && participated == 0; i++) {
            participated = simulatedPeerService.simulateStudyTick();
        }

        assertThat(participated).isGreaterThan(0);
        assertThat(profile.getStreakDays()).isEqualTo(4);
        assertThat(profile.getLongestStreakDays()).isEqualTo(4);
        assertThat(profile.getLastActivityDate()).isEqualTo(today);
    }

    @Test
    @DisplayName("Should enroll student in active week with 0 XP in Redis and Postgres when starting new week")
    void shouldEnrollActiveStudentWithZeroStartingXpInRedisAndPostgres() {
        UUID studentId = UUID.randomUUID();
        User student = User.builder()
                .id(studentId)
                .email("student@aprovaenem.com.br")
                .fullName("Lucas Silva")
                .role(UserRole.ROLE_STUDENT)
                .isBot(false)
                .build();

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(gamificationRepository.findWeeklyLeaderboard(studentId, 45, 2026)).thenReturn(Optional.empty());
        when(gamificationRepository.saveWeeklyLeaderboard(any(WeeklyLeaderboard.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(redisLeaderboardPort.getStudentScore(2026, 45, LeagueTier.BRONZE, studentId)).thenReturn(null);

        simulatedPeerService.enrollStudentInActiveWeek(studentId, 45, 2026, LeagueTier.BRONZE);

        verify(gamificationRepository).saveWeeklyLeaderboard(any(WeeklyLeaderboard.class));
        verify(redisLeaderboardPort).recordWeeklyScore(2026, 45, LeagueTier.BRONZE, studentId, 0.0);
    }

    @Test
    @DisplayName("Should skip enrolling user when user is admin or bot")
    void shouldSkipEnrollingUserWhenAdminOrBot() {
        UUID adminId = UUID.randomUUID();
        User admin = User.builder()
                .id(adminId)
                .email("admin@aprovaenem.com.br")
                .fullName("Admin")
                .role(UserRole.ROLE_ADMIN)
                .isBot(false)
                .build();

        when(userRepository.findById(adminId)).thenReturn(Optional.of(admin));

        simulatedPeerService.enrollStudentInActiveWeek(adminId, 45, 2026, LeagueTier.BRONZE);

        verify(gamificationRepository, never()).saveWeeklyLeaderboard(any(WeeklyLeaderboard.class));
        verify(redisLeaderboardPort, never()).recordWeeklyScore(anyInt(), anyInt(), any(), any(), anyDouble());
    }
}
