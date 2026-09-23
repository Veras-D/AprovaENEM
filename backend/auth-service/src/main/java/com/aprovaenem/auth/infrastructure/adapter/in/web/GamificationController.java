package com.aprovaenem.auth.infrastructure.adapter.in.web;

import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.port.in.GamificationUseCase;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.BadgesResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.GamificationProfileResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.RecordActivityRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.UpdateDailyGoalRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.UpdateDailyGoalResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.WeeklyLeaderboardResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationUseCase gamificationUseCase;

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('STUDENT', 'PREMIUM_STUDENT')")
    public ResponseEntity<GamificationProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = resolveUserId(userDetails);
        GamificationProfileResponse profile = gamificationUseCase.getProfileResponse(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/daily-goal")
    @PreAuthorize("hasAnyRole('STUDENT', 'PREMIUM_STUDENT')")
    public ResponseEntity<UpdateDailyGoalResponse> updateDailyGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateDailyGoalRequest request) {
        UUID userId = resolveUserId(userDetails);
        UserGamificationProfile profile = gamificationUseCase.updateDailyGoal(
                userId,
                request.getTargetQuestions(),
                request.getOptInReminders()
        );

        UpdateDailyGoalResponse response = UpdateDailyGoalResponse.builder()
                .message("Daily study goal updated successfully.")
                .targetQuestions(profile.getDailyGoalQuestions())
                .optInReminders(profile.isOptInReminders())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/leaderboard/weekly")
    @PreAuthorize("hasAnyRole('STUDENT', 'PREMIUM_STUDENT')")
    public ResponseEntity<WeeklyLeaderboardResponse> getWeeklyLeaderboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "league", required = false) String leagueStr,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        UUID userId = resolveUserId(userDetails);
        LeagueTier leagueTier = null;
        if (leagueStr != null && !leagueStr.isBlank()) {
            try {
                leagueTier = LeagueTier.valueOf(leagueStr.toUpperCase());
            } catch (IllegalArgumentException ex) {
                log.warn("Invalid league tier requested: [{}]", leagueStr);
            }
        }

        int normalizedSize = Math.min(Math.max(1, size), 50);
        int normalizedPage = Math.max(0, page);

        WeeklyLeaderboardResponse response = gamificationUseCase.getWeeklyLeaderboard(
                userId,
                leagueTier,
                normalizedPage,
                normalizedSize
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/badges")
    @PreAuthorize("hasAnyRole('STUDENT', 'PREMIUM_STUDENT')")
    public ResponseEntity<BadgesResponse> getBadges(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = resolveUserId(userDetails);
        BadgesResponse response = gamificationUseCase.getBadges(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/activity")
    @PreAuthorize("hasAnyRole('STUDENT', 'PREMIUM_STUDENT')")
    public ResponseEntity<GamificationProfileResponse> recordActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RecordActivityRequest request) {
        UUID userId = resolveUserId(userDetails);
        gamificationUseCase.awardXpForActivity(
                userId,
                request.getQuestionsSolved(),
                request.getCorrectCount(),
                request.isSessionCompleted()
        );

        GamificationProfileResponse profile = gamificationUseCase.getProfileResponse(userId);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/reminders/trigger")
    @PreAuthorize("hasAnyRole('STUDENT', 'PREMIUM_STUDENT')")
    public ResponseEntity<Map<String, Object>> triggerStudyReminders() {
        int count = gamificationUseCase.triggerDailyStudyReminders();
        return ResponseEntity.ok(Map.of("dispatchedReminders", count));
    }

    private UUID resolveUserId(UserDetails userDetails) {
        if (userDetails != null && userDetails.getUsername() != null && !userDetails.getUsername().isBlank()) {
            try {
                return UUID.fromString(userDetails.getUsername());
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Authenticated user identity is not a valid UUID", ex);
            }
        }
        throw new IllegalArgumentException("Authenticated user could not be identified");
    }
}
