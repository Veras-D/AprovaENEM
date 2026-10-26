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
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
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
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
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
    @Transactional
    public GamificationProfileResponse getProfileResponse(UUID userId) {
        processPendingWeeklyResets();
        UserGamificationProfile profile = getProfile(userId);
        LocalDate today = LocalDate.now(BRT_ZONE);
        int weekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);

        Optional<WeeklyLeaderboard> userBoard = gamificationRepository.findWeeklyLeaderboard(userId, weekNumber, year);
        String currentLeague = userBoard.map(wb -> wb.getLeagueTier().name())
                .orElseGet(() -> profile.getCurrentLeague() != null ? profile.getCurrentLeague().name() : "BRONZE");
        int weeklyXp = userBoard.map(WeeklyLeaderboard::getWeeklyXp).orElse(0);

        List<AchievementBadge> badges = gamificationRepository.findBadgesByUserId(userId);
        int unlockedCount = (int) badges.stream().filter(AchievementBadge::isUnlocked).count();

        // 1. Daily Goal Evaluation: If last activity occurred on a previous calendar day, completed questions for today starts at 0
        boolean isActivityFromPastDay = profile.getLastActivityDate() != null && profile.getLastActivityDate().isBefore(today);
        int completedQuestionsToday = isActivityFromPastDay ? 0 : profile.getDailyQuestionsCompleted();
        boolean isGoalCompletedToday = !isActivityFromPastDay && profile.isDailyGoalCompleted();

        // 2. Monthly Freeze Recharge Evaluation: Recharges to 1 on a new calendar month
        int streakFreeze = profile.getStreakFreezeAvailable();
        LocalDate lastDate = profile.getLastActivityDate();
        if (streakFreeze < 1 && isNewCalendarMonth(today, lastDate)) {
            streakFreeze = 1;
        }

        GamificationProfileResponse.DailyGoalDto dailyGoalDto = GamificationProfileResponse.DailyGoalDto.builder()
                .targetQuestions(profile.getDailyGoalQuestions())
                .completedQuestions(completedQuestionsToday)
                .isCompleted(isGoalCompletedToday)
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
                .streakFreezeAvailable(streakFreeze)
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
        updateStreakAndDailyGoal(profile, today, questionsSolved, userId);
        xpToAdd += checkDailyGoalBonus(profile, userId, now);

        profile.setLastActivityDate(today);
        profile.setCurrentXp(profile.getCurrentXp() + xpToAdd);
        int newLevel = (profile.getCurrentXp() / 200) + 1;
        profile.setCurrentLevel(newLevel);

        UserGamificationProfile savedProfile = gamificationRepository.saveProfile(profile);

        // 3. Badge Unlocks
        evaluateBadgeUnlocks(userId, sessionCompleted, savedProfile);

        // 4. Update Weekly Leaderboard (Postgres & Redis ZSET)
        updateWeeklyLeaderboard(userId, today, xpToAdd, questionsSolved);

        log.info("Awarded [{}] XP to user [{}]. Level: [{}], Total XP: [{}], Streak: [{}] days",
                xpToAdd, userId, savedProfile.getCurrentLevel(), savedProfile.getCurrentXp(), savedProfile.getStreakDays());

        return savedProfile;
    }

    private void updateStreakAndDailyGoal(UserGamificationProfile profile, LocalDate today, int questionsSolved, UUID userId) {
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
            handleMissedDays(profile, today, lastDate, questionsSolved, userId);
        }
    }

    private void handleMissedDays(UserGamificationProfile profile, LocalDate today, LocalDate lastDate, int questionsSolved, UUID userId) {
        int availableFreeze = profile.getStreakFreezeAvailable();
        if (availableFreeze < 1 && isNewCalendarMonth(today, lastDate)) {
            availableFreeze = 1;
        }

        if (availableFreeze > 0) {
            profile.setStreakFreezeAvailable(availableFreeze - 1);
            log.info("Applied emergency monthly streak freeze for user [{}]", userId);
        } else {
            profile.setStreakDays(1);
        }
        profile.setDailyQuestionsCompleted(questionsSolved);
        profile.setDailyGoalReachedAt(null);
    }

    private boolean isNewCalendarMonth(LocalDate today, LocalDate lastDate) {
        return lastDate != null && (today.getYear() > lastDate.getYear() || today.getMonthValue() > lastDate.getMonthValue());
    }

    private int checkDailyGoalBonus(UserGamificationProfile profile, UUID userId, Instant now) {
        if (profile.getDailyQuestionsCompleted() >= profile.getDailyGoalQuestions() && profile.getDailyGoalReachedAt() == null) {
            profile.setDailyGoalReachedAt(now);
            log.info("Student [{}] hit daily goal of [{}] questions (+20 bonus XP)", userId, profile.getDailyGoalQuestions());
            return 20;
        }
        return 0;
    }

    private void evaluateBadgeUnlocks(UUID userId, boolean sessionCompleted, UserGamificationProfile profile) {
        if (sessionCompleted) {
            gamificationRepository.unlockBadge(userId, "FIRST_SIMULADO");
        }
        if (profile.getStreakDays() >= 7) {
            gamificationRepository.unlockBadge(userId, "STREAK_7_DAYS");
        }
        if (profile.getCurrentLevel() >= 10) {
            gamificationRepository.unlockBadge(userId, "LEVEL_10");
        }
    }

    private void updateWeeklyLeaderboard(UUID userId, LocalDate today, int xpToAdd, int questionsSolved) {
        processPendingWeeklyResets();
        int weekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);

        WeeklyLeaderboard leaderboard = gamificationRepository.findWeeklyLeaderboard(userId, weekNumber, year)
                .orElseGet(() -> {
                    LeagueTier initialTier = getProfile(userId).getCurrentLeague();
                    return WeeklyLeaderboard.builder()
                            .userId(userId)
                            .weekNumber(weekNumber)
                            .year(year)
                            .leagueTier(initialTier != null ? initialTier : LeagueTier.BRONZE)
                            .weeklyXp(0)
                            .questionsSolved(0)
                            .build();
                });

        leaderboard.setWeeklyXp(leaderboard.getWeeklyXp() + xpToAdd);
        leaderboard.setQuestionsSolved(leaderboard.getQuestionsSolved() + questionsSolved);
        gamificationRepository.saveWeeklyLeaderboard(leaderboard);

        redisLeaderboardPort.incrementWeeklyXp(year, weekNumber, leaderboard.getLeagueTier(), userId, xpToAdd);
    }

    @Override
    @Transactional
    public WeeklyLeaderboardResponse getWeeklyLeaderboard(UUID currentUserId, LeagueTier leagueTier, int page, int size) {
        processPendingWeeklyResets();
        LocalDate today = LocalDate.now(BRT_ZONE);
        int weekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);

        LeagueTier targetTier = leagueTier;
        if (targetTier == null) {
            Optional<WeeklyLeaderboard> userBoard = currentUserId != null
                    ? gamificationRepository.findWeeklyLeaderboard(currentUserId, weekNumber, year)
                    : Optional.empty();
            if (userBoard.isPresent()) {
                targetTier = userBoard.get().getLeagueTier();
            } else if (currentUserId != null) {
                targetTier = getProfile(currentUserId).getCurrentLeague();
            }
            if (targetTier == null) {
                targetTier = LeagueTier.BRONZE;
            }
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

            Optional<User> userOpt = userRepository.findById(entryUserId);
            String displayName = userOpt.map(User::getFullName).orElse("Estudante");
            String avatarConfig = userOpt.map(User::getAvatarConfig).orElse(null);

            int streak = gamificationRepository.findProfileByUserId(entryUserId)
                    .map(UserGamificationProfile::getStreakDays)
                    .orElse(0);

            leaderboardList.add(WeeklyLeaderboardResponse.UserRankDto.builder()
                    .rank(currentRank)
                    .userId(entryUserId)
                    .displayName(displayName)
                    .weeklyXp(score)
                    .streakDays(streak)
                    .promotionZone(targetTier != LeagueTier.DIAMOND && currentRank <= cutoffPromotion)
                    .avatarConfig(avatarConfig)
                    .build());
            currentRank++;
        }

        // Current user rank
        WeeklyLeaderboardResponse.UserRankDto currentUserRankDto = null;
        Long userRank = redisLeaderboardPort.getStudentRank(year, weekNumber, targetTier, currentUserId);
        Double userScore = redisLeaderboardPort.getStudentScore(year, weekNumber, targetTier, currentUserId);
        if (userRank != null && userScore != null) {
            Optional<User> currentUserOpt = userRepository.findById(currentUserId);
            String userName = currentUserOpt.map(User::getFullName).orElse("Você");
            String userAvatar = currentUserOpt.map(User::getAvatarConfig).orElse(null);
            int userStreak = gamificationRepository.findProfileByUserId(currentUserId)
                    .map(UserGamificationProfile::getStreakDays)
                    .orElse(0);
            currentUserRankDto = WeeklyLeaderboardResponse.UserRankDto.builder()
                    .rank(userRank)
                    .userId(currentUserId)
                    .displayName(userName)
                    .weeklyXp(userScore.intValue())
                    .streakDays(userStreak)
                    .promotionZone(targetTier != LeagueTier.DIAMOND && userRank <= cutoffPromotion)
                    .avatarConfig(userAvatar)
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

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            processPendingWeeklyResets();
        } catch (Exception e) {
            log.warn("Failed to process pending weekly resets on application startup: {}", e.getMessage());
        }
    }

    @Override
    @Scheduled(cron = "59 59 23 * * SUN", zone = "America/Sao_Paulo")
    @Transactional
    public void performWeeklyLeagueReset() {
        LocalDate today = LocalDate.now(BRT_ZONE);
        int weekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);

        log.info("Executing Sunday 23:59:59 BRT Weekly League Reset for Week [{}] Year [{}]", weekNumber, year);
        processWeeklyResetForWeek(weekNumber, year);
        log.info("Weekly League Reset completed successfully");
    }

    @Override
    @Transactional
    public void processPendingWeeklyResets() {
        LocalDate today = LocalDate.now(BRT_ZONE);
        int currentWeekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int currentYear = today.get(IsoFields.WEEK_BASED_YEAR);

        List<WeeklyLeaderboard> unfinalized = gamificationRepository.findUnfinalizedWeeklyLeaderboards();
        if (unfinalized.isEmpty()) {
            return;
        }

        Map<String, WeeklyLeaderboard> pastWeeks = new TreeMap<>();
        for (WeeklyLeaderboard board : unfinalized) {
            boolean isPast = board.getYear() < currentYear
                    || (board.getYear() == currentYear && board.getWeekNumber() < currentWeekNumber);
            if (isPast) {
                String key = String.format("%04d-%02d", board.getYear(), board.getWeekNumber());
                pastWeeks.putIfAbsent(key, board);
            }
        }

        for (WeeklyLeaderboard entry : pastWeeks.values()) {
            log.info("Catching up unfinalized weekly league reset for Week [{}] Year [{}]",
                    entry.getWeekNumber(), entry.getYear());
            processWeeklyResetForWeek(entry.getWeekNumber(), entry.getYear());
        }
    }

    private void processWeeklyResetForWeek(int weekNumber, int year) {
        LocalDate mondayOfWeek = LocalDate.of(year, 1, 1)
                .with(IsoFields.WEEK_BASED_YEAR, year)
                .with(IsoFields.WEEK_OF_WEEK_BASED_YEAR, weekNumber)
                .with(DayOfWeek.MONDAY);
        LocalDate nextWeekMonday = mondayOfWeek.plusWeeks(1);
        int nextWeekNumber = nextWeekMonday.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int nextYear = nextWeekMonday.get(IsoFields.WEEK_BASED_YEAR);

        for (LeagueTier tier : LeagueTier.values()) {
            List<WeeklyLeaderboard> boards = gamificationRepository.findTopByLeague(weekNumber, year, tier.name());
            if (boards.isEmpty()) {
                continue;
            }

            int total = boards.size();
            int promoteCount = (int) Math.ceil(total * 0.20);
            int relegateCount = total >= 5 ? (int) Math.ceil(total * 0.20) : 0;
            int demoteStartIndex = total - relegateCount;
            log.info("Tier [{}]: total={}, promoteCount={}, relegateCount={}", tier, total, promoteCount, relegateCount);

            for (int i = 0; i < total; i++) {
                WeeklyLeaderboard board = boards.get(i);
                int rank = i + 1;
                board.setRankPosition(rank);
                gamificationRepository.saveWeeklyLeaderboard(board);

                LeagueTier newTier = tier;
                if (i < promoteCount && tier != LeagueTier.DIAMOND) {
                    newTier = tier.getNextTier();
                    log.info("Promoting user [{}] from [{}] to [{}] (Rank {}/{})",
                            board.getUserId(), tier, newTier, rank, total);
                } else if (i >= demoteStartIndex && relegateCount > 0 && tier != LeagueTier.BRONZE) {
                    newTier = tier.getPreviousTier();
                    log.info("Demoting user [{}] from [{}] to [{}] (Rank {}/{})",
                            board.getUserId(), tier, newTier, rank, total);
                }

                Optional<UserGamificationProfile> profileOpt = gamificationRepository.findProfileByUserId(board.getUserId());
                if (profileOpt.isPresent()) {
                    UserGamificationProfile profile = profileOpt.get();
                    profile.setCurrentLeague(newTier);
                    gamificationRepository.saveProfile(profile);
                }

                Optional<WeeklyLeaderboard> nextBoardOpt = gamificationRepository.findWeeklyLeaderboard(
                        board.getUserId(), nextWeekNumber, nextYear);
                if (nextBoardOpt.isPresent()) {
                    WeeklyLeaderboard nextBoard = nextBoardOpt.get();
                    if (nextBoard.getLeagueTier() != newTier) {
                        LeagueTier oldTier = nextBoard.getLeagueTier();
                        nextBoard.setLeagueTier(newTier);
                        gamificationRepository.saveWeeklyLeaderboard(nextBoard);

                        redisLeaderboardPort.removeUserFromWeeklyLeaderboard(
                                nextYear, nextWeekNumber, oldTier, board.getUserId());
                        redisLeaderboardPort.incrementWeeklyXp(
                                nextYear, nextWeekNumber, newTier, board.getUserId(), nextBoard.getWeeklyXp());
                    }
                }
            }
            redisLeaderboardPort.clearWeeklyLeaderboard(year, weekNumber, tier);
        }
    }

    private UserGamificationProfile createInitialProfile(UUID userId) {
        Instant now = Instant.now();
        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(1)
                .currentXp(0)
                .currentLeague(LeagueTier.BRONZE)
                .streakDays(0)
                .streakFreezeAvailable(1)
                .lastActivityDate(null)
                .dailyGoalQuestions(5)
                .dailyQuestionsCompleted(0)
                .dailyGoalReachedAt(null)
                .optInReminders(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
        return gamificationRepository.saveProfile(profile);
    }
}
