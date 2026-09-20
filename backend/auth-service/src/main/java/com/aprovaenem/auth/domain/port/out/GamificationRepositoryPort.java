package com.aprovaenem.auth.domain.port.out;

import com.aprovaenem.auth.domain.model.AchievementBadge;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.model.WeeklyLeaderboard;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GamificationRepositoryPort {

    Optional<UserGamificationProfile> findProfileByUserId(UUID userId);

    UserGamificationProfile saveProfile(UserGamificationProfile profile);

    Optional<WeeklyLeaderboard> findWeeklyLeaderboard(UUID userId, int weekNumber, int year);

    WeeklyLeaderboard saveWeeklyLeaderboard(WeeklyLeaderboard leaderboard);

    List<WeeklyLeaderboard> findTopByLeague(int weekNumber, int year, String leagueTier);

    List<AchievementBadge> findBadgesByUserId(UUID userId);

    void unlockBadge(UUID userId, String badgeCode);

    List<UserGamificationProfile> findPendingStudyReminderProfiles();
}
