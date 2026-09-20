package com.aprovaenem.auth.domain.port.in;

import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.BadgesResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.GamificationProfileResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.WeeklyLeaderboardResponse;

import java.util.UUID;

public interface GamificationUseCase {

    UserGamificationProfile getProfile(UUID userId);

    GamificationProfileResponse getProfileResponse(UUID userId);

    UserGamificationProfile updateDailyGoal(UUID userId, Integer targetQuestions, Boolean optInReminders);

    UserGamificationProfile awardXpForActivity(UUID userId, int questionsSolved, int correctCount, boolean sessionCompleted);

    WeeklyLeaderboardResponse getWeeklyLeaderboard(UUID currentUserId, LeagueTier leagueTier, int page, int size);

    BadgesResponse getBadges(UUID userId);

    int triggerDailyStudyReminders();

    void performWeeklyLeagueReset();
}
