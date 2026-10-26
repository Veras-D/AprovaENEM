package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
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
}
