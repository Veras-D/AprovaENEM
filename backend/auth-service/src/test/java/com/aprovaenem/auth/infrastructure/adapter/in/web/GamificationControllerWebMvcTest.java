package com.aprovaenem.auth.infrastructure.adapter.in.web;

import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.port.in.GamificationUseCase;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.BadgesResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.GamificationProfileResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.RecordActivityRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.UpdateDailyGoalRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.WeeklyLeaderboardResponse;
import com.aprovaenem.auth.infrastructure.adapter.out.security.CustomUserDetailsService;
import com.aprovaenem.auth.infrastructure.adapter.out.security.DelegatingAccessDeniedHandler;
import com.aprovaenem.auth.infrastructure.adapter.out.security.DelegatingAuthenticationEntryPoint;
import com.aprovaenem.auth.infrastructure.adapter.out.security.JwtAuthenticationFilter;
import com.aprovaenem.auth.infrastructure.adapter.out.security.JwtTokenProvider;
import com.aprovaenem.auth.infrastructure.adapter.out.security.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GamificationController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, DelegatingAuthenticationEntryPoint.class, DelegatingAccessDeniedHandler.class, GlobalExceptionHandler.class})
@DisplayName("GamificationController WebMvc & RBAC Integration Tests")
class GamificationControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GamificationUseCase gamificationUseCase;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(username = "11111111-1111-1111-1111-111111111111", roles = "STUDENT")
    @DisplayName("GET /api/v1/gamification/profile should return HTTP 200 with profile for ROLE_STUDENT")
    void shouldGetProfileForStudent() throws Exception {
        UUID userId = UUID.fromString("11111111-1111-1111-1111-111111111111");

        GamificationProfileResponse response = GamificationProfileResponse.builder()
                .userId(userId)
                .level(3)
                .levelTitle("Mestre dos Simulados")
                .currentXp(550)
                .xpNextLevel(600)
                .levelProgressPercentage(75.0)
                .streakDays(7)
                .streakFreezeAvailable(1)
                .currentLeague("BRONZE")
                .weeklyXp(120)
                .unlockedBadgesCount(2)
                .dailyGoal(GamificationProfileResponse.DailyGoalDto.builder()
                        .targetQuestions(10)
                        .completedQuestions(8)
                        .isCompleted(false)
                        .optInReminders(true)
                        .build())
                .build();

        when(gamificationUseCase.getProfileResponse(userId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/gamification/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is(userId.toString())))
                .andExpect(jsonPath("$.level", is(3)))
                .andExpect(jsonPath("$.levelTitle", is("Mestre dos Simulados")))
                .andExpect(jsonPath("$.streakDays", is(7)))
                .andExpect(jsonPath("$.currentLeague", is("BRONZE")));
    }

    @Test
    @WithMockUser(username = "22222222-2222-2222-2222-222222222222", roles = "ADMIN")
    @DisplayName("GET /api/v1/gamification/profile should return HTTP 403 Forbidden for ROLE_ADMIN")
    void shouldDenyAccessForNonStudentRoles() throws Exception {
        mockMvc.perform(get("/api/v1/gamification/profile"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.error", is("Forbidden")))
                .andExpect(jsonPath("$.message", containsString("Access denied")));
    }

    @Test
    @WithAnonymousUser
    @DisplayName("GET /api/v1/gamification/profile should return HTTP 401 Unauthorized for anonymous requests")
    void shouldRejectAnonymousAccessToProfile() throws Exception {
        mockMvc.perform(get("/api/v1/gamification/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    @WithMockUser(username = "11111111-1111-1111-1111-111111111111", roles = "STUDENT")
    @DisplayName("PUT /api/v1/gamification/daily-goal should return HTTP 200 OK and update daily goal")
    void shouldUpdateDailyGoalSuccessfully() throws Exception {
        UUID userId = UUID.fromString("11111111-1111-1111-1111-111111111111");

        UpdateDailyGoalRequest request = new UpdateDailyGoalRequest();
        request.setTargetQuestions(25);
        request.setOptInReminders(false);

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .dailyGoalQuestions(25)
                .optInReminders(false)
                .build();

        when(gamificationUseCase.updateDailyGoal(eq(userId), eq(25), eq(false))).thenReturn(profile);

        mockMvc.perform(put("/api/v1/gamification/daily-goal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.targetQuestions", is(25)))
                .andExpect(jsonPath("$.optInReminders", is(false)))
                .andExpect(jsonPath("$.message", containsString("updated successfully")));
    }

    @Test
    @WithMockUser(username = "11111111-1111-1111-1111-111111111111", roles = "STUDENT")
    @DisplayName("GET /api/v1/gamification/leaderboard/weekly should return HTTP 200 with rankings")
    void shouldGetWeeklyLeaderboardSuccessfully() throws Exception {
        UUID userId = UUID.fromString("11111111-1111-1111-1111-111111111111");

        WeeklyLeaderboardResponse response = WeeklyLeaderboardResponse.builder()
                .weekNumber(38)
                .year(2026)
                .leagueTier("BRONZE")
                .resetsAt("2026-09-20T23:59:59-03:00")
                .totalParticipants(42L)
                .currentUserRank(WeeklyLeaderboardResponse.UserRankDto.builder()
                        .rank(3L)
                        .userId(userId)
                        .displayName("Você")
                        .weeklyXp(350)
                        .streakDays(7)
                        .promotionZone(true)
                        .build())
                .leaderboard(List.of(
                        WeeklyLeaderboardResponse.UserRankDto.builder()
                                .rank(1L)
                                .userId(UUID.randomUUID())
                                .displayName("Ana Souza")
                                .weeklyXp(600)
                                .streakDays(14)
                                .promotionZone(true)
                                .build()
                ))
                .build();

        when(gamificationUseCase.getWeeklyLeaderboard(eq(userId), any(), anyInt(), anyInt()))
                .thenReturn(response);

        mockMvc.perform(get("/api/v1/gamification/leaderboard/weekly"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leagueTier", is("BRONZE")))
                .andExpect(jsonPath("$.totalParticipants", is(42)))
                .andExpect(jsonPath("$.currentUserRank.rank", is(3)))
                .andExpect(jsonPath("$.currentUserRank.promotionZone", is(true)))
                .andExpect(jsonPath("$.leaderboard", hasSize(1)));
    }

    @Test
    @WithMockUser(username = "11111111-1111-1111-1111-111111111111", roles = "STUDENT")
    @DisplayName("GET /api/v1/gamification/badges should return HTTP 200 with badges catalogue")
    void shouldGetBadgesSuccessfully() throws Exception {
        UUID userId = UUID.fromString("11111111-1111-1111-1111-111111111111");

        BadgesResponse response = BadgesResponse.builder()
                .totalUnlocked(1)
                .badges(List.of(
                        BadgesResponse.BadgeItemDto.builder()
                                .code("FIRST_SIMULADO")
                                .name("Primeiro Simulado")
                                .description("Completou primeiro simulado")
                                .icon("quiz")
                                .unlocked(true)
                                .build()
                ))
                .build();

        when(gamificationUseCase.getBadges(userId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/gamification/badges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUnlocked", is(1)))
                .andExpect(jsonPath("$.badges[0].code", is("FIRST_SIMULADO")))
                .andExpect(jsonPath("$.badges[0].unlocked", is(true)));
    }

    @Test
    @WithMockUser(username = "11111111-1111-1111-1111-111111111111", roles = "STUDENT")
    @DisplayName("POST /api/v1/gamification/activity should record solved questions and return updated profile")
    void shouldRecordActivitySuccessfully() throws Exception {
        UUID userId = UUID.fromString("11111111-1111-1111-1111-111111111111");

        RecordActivityRequest request = new RecordActivityRequest();
        request.setQuestionsSolved(5);
        request.setCorrectCount(4);
        request.setSessionCompleted(true);

        GamificationProfileResponse updatedProfile = GamificationProfileResponse.builder()
                .userId(userId)
                .level(2)
                .currentXp(280)
                .streakDays(3)
                .build();

        when(gamificationUseCase.getProfileResponse(userId)).thenReturn(updatedProfile);

        mockMvc.perform(post("/api/v1/gamification/activity")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is(userId.toString())))
                .andExpect(jsonPath("$.currentXp", is(280)));

        verify(gamificationUseCase).awardXpForActivity(userId, 5, 4, true);
    }
}
