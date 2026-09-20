package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.AchievementBadge;
import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.model.WeeklyLeaderboard;
import com.aprovaenem.auth.domain.port.in.GamificationUseCase;
import com.aprovaenem.auth.domain.port.out.GamificationRepositoryPort;
import com.aprovaenem.auth.domain.port.out.LeaderboardRedisPort;
import com.aprovaenem.auth.domain.port.out.NotificationPublisherPort;
import com.aprovaenem.auth.domain.port.out.UserRepositoryPort;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.BadgesResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.GamificationProfileResponse;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.WeeklyLeaderboardResponse;
import com.aprovaenem.common.events.DailyGoalReminderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.IsoFields;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamificationService implements GamificationUseCase {

    private final GamificationRepositoryPort gamificationRepository;
    private final LeaderboardRedisPort redisLeaderboardPort;
    private final NotificationPublisherPort notificationPublisherPort;
    private final UserRepositoryPort userRepository;

    private static final ZoneId BRT_ZONE = ZoneId.of("America/Sao_Paulo");

    @Override
    @Transactional
    public UserGamificationProfile getProfile(UUID userId) {
        return gamificationRepository.findProfileByUserId(userId)
                .orElseGet(() -> createInitialProfile(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public GamificationProfileResponse getProfileResponse(UUID userId) {
        UserGamificationProfile profile = getProfile(userId);
        LocalDate today = LocalDate.now(BRT_ZONE);
        int weekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);

        Optional<WeeklyLeaderboard> userBoard = gamificationRepository.findWeeklyLeaderboard(userId, weekNumber, year);
        String currentLeague = userBoard.map(wb -> wb.getLeagueTier().name()).orElse("BRONZE");
        int weeklyXp = userBoard.map(WeeklyLeaderboard::getWeeklyXp).orElse(0);

        List<AchievementBadge> badges = gamificationRepository.findBadgesByUserId(userId);
        int unlockedCount = (int) badges.stream().filter(AchievementBadge::isUnlocked).count();

        GamificationProfileResponse.DailyGoalDto dailyGoalDto = GamificationProfileResponse.DailyGoalDto.builder()
                .targetQuestions(profile.getDailyGoalQuestions())
                .completedQuestions(profile.getDailyQuestionsCompleted())
                .isCompleted(profile.isDailyGoalCompleted())
                .optInReminders(profile.isOptInReminders())
                .build();

        return GamificationProfileResponse.builder()
                .userId(userId)
                .level(profile.getCurrentLevel())
                .levelTitle(profile.getLevelTitle())
                .currentXp(profile.getCurrentXp())
                .xpNextLevel(profile.getXpNextLevel())
                .levelProgressPercentage(profile.getLevelProgressPercentage())
                .streakDays(profile.getStreakDays())
                .streakFreezeAvailable(profile.getStreakFreezeAvailable())
                .dailyGoal(dailyGoalDto)
                .currentLeague(currentLeague)
                .weeklyXp(weeklyXp)
                .unlockedBadgesCount(unlockedCount)
                .build();
    }

    @Override
    @Transactional
    public UserGamificationProfile updateDailyGoal(UUID userId, Integer targetQuestions, Boolean optInReminders) {
        UserGamificationProfile profile = getProfile(userId);
        if (targetQuestions != null) {
            profile.setDailyGoalQuestions(targetQuestions);
        }
        if (optInReminders != null) {
            profile.setOptInReminders(optInReminders);
        }
        return gamificationRepository.saveProfile(profile);
    }

    @Override
    @Transactional
    public UserGamificationProfile awardXpForActivity(UUID userId, int questionsSolved, int correctCount, boolean sessionCompleted) {
        UserGamificationProfile profile = getProfile(userId);
        LocalDate today = LocalDate.now(BRT_ZONE);
        Instant now = Instant.now();

        // 1. XP Calculation (+10 per correct answer, +50 per completed session)
        int xpToAdd = (correctCount * 10) + (sessionCompleted ? 50 : 0);

        // 2. Streak & Daily Goal Tracking
        LocalDate lastDate = profile.getLastActivityDate();
        if (lastDate == null) {
            profile.setStreakDays(1);
            profile.setDailyQuestionsCompleted(questionsSolved);
        } else if (lastDate.equals(today)) {
            profile.setDailyQuestionsCompleted(profile.getDailyQuestionsCompleted() + questionsSolved);
        } else if (lastDate.equals(today.minusDays(1))) {
            profile.setStreakDays(profile.getStreakDays() + 1);
            profile.setDailyQuestionsCompleted(questionsSolved);
            profile.setDailyGoalReachedAt(null);
        } else {
            // Missed at least 1 calendar day
            if (profile.getStreakFreezeAvailable() > 0) {
                profile.setStreakFreezeAvailable(profile.getStreakFreezeAvailable() - 1);
                log.info("Applied emergency monthly streak freeze for user [{}]", userId);
            } else {
                profile.setStreakDays(1);
            }
            profile.setDailyQuestionsCompleted(questionsSolved);
            profile.setDailyGoalReachedAt(null);
        }

        // Daily Goal completion check (+20 XP bonus)
        if (profile.getDailyQuestionsCompleted() >= profile.getDailyGoalQuestions() && profile.getDailyGoalReachedAt() == null) {
            profile.setDailyGoalReachedAt(now);
            xpToAdd += 20;
            log.info("Student [{}] hit daily goal of [{}] questions (+20 bonus XP)", userId, profile.getDailyGoalQuestions());
        }

        profile.setLastActivityDate(today);
        profile.setCurrentXp(profile.getCurrentXp() + xpToAdd);
        int newLevel = (profile.getCurrentXp() / 200) + 1;
        profile.setCurrentLevel(newLevel);

        UserGamificationProfile savedProfile = gamificationRepository.saveProfile(profile);

        // 3. Badge Unlocks
        if (sessionCompleted) {
            gamificationRepository.unlockBadge(userId, "FIRST_SIMULADO");
        }
        if (savedProfile.getStreakDays() >= 7) {
            gamificationRepository.unlockBadge(userId, "STREAK_7_DAYS");
        }
        if (savedProfile.getCurrentLevel() >= 10) {
            gamificationRepository.unlockBadge(userId, "LEVEL_10");
        }

        // 4. Update Weekly Leaderboard (Postgres & Redis ZSET)
        int weekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);

        WeeklyLeaderboard leaderboard = gamificationRepository.findWeeklyLeaderboard(userId, weekNumber, year)
                .orElseGet(() -> WeeklyLeaderboard.builder()
                        .userId(userId)
                        .weekNumber(weekNumber)
                        .year(year)
                        .leagueTier(LeagueTier.BRONZE)
                        .weeklyXp(0)
                        .questionsSolved(0)
                        .build());

        leaderboard.setWeeklyXp(leaderboard.getWeeklyXp() + xpToAdd);
        leaderboard.setQuestionsSolved(leaderboard.getQuestionsSolved() + questionsSolved);
        gamificationRepository.saveWeeklyLeaderboard(leaderboard);

        redisLeaderboardPort.incrementWeeklyXp(year, weekNumber, leaderboard.getLeagueTier(), userId, xpToAdd);

        log.info("Awarded [{}] XP to user [{}]. Level: [{}], Total XP: [{}], Streak: [{}] days",
                xpToAdd, userId, savedProfile.getCurrentLevel(), savedProfile.getCurrentXp(), savedProfile.getStreakDays());

        return savedProfile;
    }

    @Override
    @Transactional(readOnly = true)
    public WeeklyLeaderboardResponse getWeeklyLeaderboard(UUID currentUserId, LeagueTier leagueTier, int page, int size) {
        LocalDate today = LocalDate.now(BRT_ZONE);
        int weekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);

        LeagueTier targetTier = leagueTier != null ? leagueTier : LeagueTier.BRONZE;
        Optional<WeeklyLeaderboard> userBoard = gamificationRepository.findWeeklyLeaderboard(currentUserId, weekNumber, year);
        if (leagueTier == null && userBoard.isPresent()) {
            targetTier = userBoard.get().getLeagueTier();
        }

        // Calculate next Sunday 23:59:59 BRT
        LocalDate nextSunday = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        String resetsAt = nextSunday.atTime(23, 59, 59).atZone(BRT_ZONE).toString();

        long totalParticipants = redisLeaderboardPort.getTotalParticipants(year, weekNumber, targetTier);
        if (totalParticipants == 0) {
            // Populate from Postgres if Redis cache was cold
            List<WeeklyLeaderboard> pgList = gamificationRepository.findTopByLeague(weekNumber, year, targetTier.name());
            for (WeeklyLeaderboard wb : pgList) {
                redisLeaderboardPort.incrementWeeklyXp(year, weekNumber, targetTier, wb.getUserId(), wb.getWeeklyXp());
            }
            totalParticipants = pgList.size();
        }

        long start = (long) page * size;
        long end = start + size - 1;
        Set<ZSetOperations.TypedTuple<String>> topEntries = redisLeaderboardPort.getTopRanked(year, weekNumber, targetTier, start, end);

        long cutoffPromotion = Math.max(1, (long) Math.ceil(totalParticipants * 0.20));

        List<WeeklyLeaderboardResponse.UserRankDto> leaderboardList = new ArrayList<>();
        long currentRank = start + 1;
        for (ZSetOperations.TypedTuple<String> tuple : topEntries) {
            if (tuple.getValue() == null) {
                continue;
            }
            UUID entryUserId = UUID.fromString(tuple.getValue());
            int score = tuple.getScore() != null ? tuple.getScore().intValue() : 0;

            String displayName = userRepository.findById(entryUserId)
                    .map(User::getFullName)
                    .orElse("Estudante");

            int streak = gamificationRepository.findProfileByUserId(entryUserId)
                    .map(UserGamificationProfile::getStreakDays)
                    .orElse(0);

            leaderboardList.add(WeeklyLeaderboardResponse.UserRankDto.builder()
                    .rank(currentRank)
                    .userId(entryUserId)
                    .displayName(displayName)
                    .weeklyXp(score)
                    .streakDays(streak)
                    .promotionZone(currentRank <= cutoffPromotion)
                    .build());
            currentRank++;
        }

        // Current user rank
        WeeklyLeaderboardResponse.UserRankDto currentUserRankDto = null;
        Long userRank = redisLeaderboardPort.getStudentRank(year, weekNumber, targetTier, currentUserId);
        Double userScore = redisLeaderboardPort.getStudentScore(year, weekNumber, targetTier, currentUserId);
        if (userRank != null && userScore != null) {
            String userName = userRepository.findById(currentUserId).map(User::getFullName).orElse("Você");
            int userStreak = gamificationRepository.findProfileByUserId(currentUserId).map(UserGamificationProfile::getStreakDays).orElse(0);
            currentUserRankDto = WeeklyLeaderboardResponse.UserRankDto.builder()
                    .rank(userRank)
                    .userId(currentUserId)
                    .displayName(userName)
                    .weeklyXp(userScore.intValue())
                    .streakDays(userStreak)
                    .promotionZone(userRank <= cutoffPromotion)
                    .build();
        }

        return WeeklyLeaderboardResponse.builder()
                .weekNumber(weekNumber)
                .year(year)
                .leagueTier(targetTier.name())
                .resetsAt(resetsAt)
                .currentUserRank(currentUserRankDto)
                .leaderboard(leaderboardList)
                .totalParticipants(totalParticipants)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BadgesResponse getBadges(UUID userId) {
        List<AchievementBadge> badges = gamificationRepository.findBadgesByUserId(userId);
        int unlockedCount = (int) badges.stream().filter(AchievementBadge::isUnlocked).count();

        List<BadgesResponse.BadgeItemDto> dtoList = badges.stream()
                .map(b -> BadgesResponse.BadgeItemDto.builder()
                        .code(b.getCode())
                        .name(b.getName())
                        .description(b.getDescription())
                        .icon(b.getIcon())
                        .unlocked(b.isUnlocked())
                        .unlockedAt(b.getUnlockedAt())
                        .build())
                .toList();

        return BadgesResponse.builder()
                .totalUnlocked(unlockedCount)
                .badges(dtoList)
                .build();
    }

    @Override
    @Scheduled(cron = "0 0 19 * * ?", zone = "America/Sao_Paulo")
    @Transactional(readOnly = true)
    public int triggerDailyStudyReminders() {
        log.info("Executing 19:00 BRT daily study goal reminder sweep");
        List<UserGamificationProfile> pendingProfiles = gamificationRepository.findPendingStudyReminderProfiles();
        int count = 0;

        for (UserGamificationProfile profile : pendingProfiles) {
            Optional<User> userOpt = userRepository.findById(profile.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                DailyGoalReminderEvent event = DailyGoalReminderEvent.builder()
                        .userId(profile.getUserId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .streakDays(profile.getStreakDays())
                        .questionsCompleted(profile.getDailyQuestionsCompleted())
                        .targetQuestions(profile.getDailyGoalQuestions())
                        .occurredAt(Instant.now())
                        .build();

                notificationPublisherPort.publishStudyReminder(event);
                count++;
            }
        }
        log.info("Dispatched [{}] study reminder alerts for pending goals", count);
        return count;
    }

    @Override
    @Scheduled(cron = "59 59 23 * * SUN", zone = "America/Sao_Paulo")
    @Transactional
    public void performWeeklyLeagueReset() {
        LocalDate today = LocalDate.now(BRT_ZONE);
        int weekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);

        log.info("Executing Sunday 23:59:59 BRT Weekly League Reset for Week [{}] Year [{}]", weekNumber, year);

        for (LeagueTier tier : LeagueTier.values()) {
            List<WeeklyLeaderboard> boards = gamificationRepository.findTopByLeague(weekNumber, year, tier.name());
            if (boards.isEmpty()) {
                continue;
            }

            int total = boards.size();
            int promoteCount = (int) Math.ceil(total * 0.20);
            int relegateCount = (int) Math.ceil(total * 0.10);
            log.info("Tier [{}]: total={}, promoteCount={}, relegateCount={}", tier, total, promoteCount, relegateCount);

            for (int i = 0; i < total; i++) {
                WeeklyLeaderboard board = boards.get(i);
                board.setRankPosition(i + 1);
                gamificationRepository.saveWeeklyLeaderboard(board);
            }
            redisLeaderboardPort.clearWeeklyLeaderboard(year, weekNumber, tier);
        }
        log.info("Weekly League Reset completed successfully");
    }

    private UserGamificationProfile createInitialProfile(UUID userId) {
        Instant now = Instant.now();
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(1)
                .currentXp(0)
                .streakDays(0)
                .streakFreezeAvailable(1)
                .lastActivityDate(null)
                .dailyGoalQuestions(10)
                .dailyQuestionsCompleted(0)
                .dailyGoalReachedAt(null)
                .optInReminders(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
        return gamificationRepository.saveProfile(profile);
    }
}
