package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.model.WeeklyLeaderboard;
import com.aprovaenem.auth.domain.port.out.GamificationRepositoryPort;
import com.aprovaenem.auth.domain.port.out.LeaderboardRedisPort;
import com.aprovaenem.auth.domain.port.out.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.IsoFields;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Service managing simulated study peers ("bots") across all league tiers.
 * Provides realistic student activity patterns, daily incremental XP gains,
 * and maintains dynamic competitive balance in Redis ZSET and PostgreSQL.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SimulatedPeerService {

    private final UserRepositoryPort userRepository;
    private final GamificationRepositoryPort gamificationRepository;
    private final LeaderboardRedisPort redisLeaderboardPort;

    private static final ZoneId BRT_ZONE = ZoneId.of("America/Sao_Paulo");

    /**
     * Ensures all simulated study peers are present in Redis weekly leaderboards
     * on application startup or container restart.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncSimulatedPeersToRedis() {
        LocalDate today = LocalDate.now(BRT_ZONE);
        int weekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);

        List<User> bots = userRepository.findSimulatedBots();
        if (bots.isEmpty()) {
            log.info("No simulated study peers found to sync.");
            return;
        }

        int syncedCount = 0;
        for (User bot : bots) {
            Optional<UserGamificationProfile> profileOpt = gamificationRepository.findProfileByUserId(bot.getId());
            if (profileOpt.isEmpty()) {
                continue;
            }

            UserGamificationProfile profile = profileOpt.get();
            LeagueTier tier = profile.getCurrentLeague() != null ? profile.getCurrentLeague() : LeagueTier.BRONZE;

            WeeklyLeaderboard board = gamificationRepository.findWeeklyLeaderboard(bot.getId(), weekNumber, year)
                    .orElseGet(() -> {
                        WeeklyLeaderboard newBoard = WeeklyLeaderboard.builder()
                                .userId(bot.getId())
                                .weekNumber(weekNumber)
                                .year(year)
                                .leagueTier(tier)
                                .weeklyXp(0)
                                .questionsSolved(0)
                                .build();
                        return gamificationRepository.saveWeeklyLeaderboard(newBoard);
                    });

            Double scoreInRedis = redisLeaderboardPort.getStudentScore(year, weekNumber, tier, bot.getId());
            if (scoreInRedis == null) {
                redisLeaderboardPort.recordWeeklyScore(year, weekNumber, tier, bot.getId(), board.getWeeklyXp());
                syncedCount++;
            }
        }

        log.info("Simulated peer synchronization complete: [{}] bots registered in Redis for Week [{}] Year [{}]",
                syncedCount, weekNumber, year);
    }

    /**
     * Simulates realistic study sessions 4 times a day across Brazilian study hours:
     * 08:00, 12:00, 16:00, and 20:00 BRT.
     */
    @Scheduled(cron = "0 0 8,12,16,20 * * *", zone = "America/Sao_Paulo")
    @Transactional
    public void scheduledDailyStudySimulation() {
        log.info("Triggering scheduled study session simulation for simulated peers...");
        int activeCount = simulateStudyTick();
        log.info("Simulated study session concluded: [{}] peers studied in this window.", activeCount);
    }

    /**
     * Executes a study simulation tick across all simulated study peers.
     * Higher leagues have slightly higher participation consistency and practice volumes.
     *
     * @return number of peers that practiced in this tick
     */
    @Transactional
    public int simulateStudyTick() {
        LocalDate today = LocalDate.now(BRT_ZONE);
        int weekNumber = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);

        List<User> bots = userRepository.findSimulatedBots();
        if (bots.isEmpty()) {
            return 0;
        }

        ThreadLocalRandom random = ThreadLocalRandom.current();
        int activeStudents = 0;

        for (User bot : bots) {
            Optional<UserGamificationProfile> profileOpt = gamificationRepository.findProfileByUserId(bot.getId());
            if (profileOpt.isEmpty()) {
                continue;
            }

            UserGamificationProfile profile = profileOpt.get();
            LeagueTier tier = profile.getCurrentLeague() != null ? profile.getCurrentLeague() : LeagueTier.BRONZE;

            int participationChance = getParticipationChance(tier);
            if (random.nextInt(100) >= participationChance) {
                continue;
            }

            int questionsSolved = getQuestionsSolvedForSession(tier, random);
            int xpPerQuestion = 10 + random.nextInt(6); // 10 to 15 XP per question
            int sessionXp = questionsSolved * xpPerQuestion;

            // Update user gamification profile
            profile.setCurrentXp(profile.getCurrentXp() + sessionXp);
            profile.setCurrentLevel((profile.getCurrentXp() / 200) + 1);
            profile.setDailyQuestionsCompleted(profile.getDailyQuestionsCompleted() + questionsSolved);
            profile.setLastActivityDate(today);
            gamificationRepository.saveProfile(profile);

            // Update weekly leaderboard in DB
            WeeklyLeaderboard board = gamificationRepository.findWeeklyLeaderboard(bot.getId(), weekNumber, year)
                    .orElseGet(() -> WeeklyLeaderboard.builder()
                            .userId(bot.getId())
                            .weekNumber(weekNumber)
                            .year(year)
                            .leagueTier(tier)
                            .weeklyXp(0)
                            .questionsSolved(0)
                            .build());

            board.setWeeklyXp(board.getWeeklyXp() + sessionXp);
            board.setQuestionsSolved(board.getQuestionsSolved() + questionsSolved);
            gamificationRepository.saveWeeklyLeaderboard(board);

            // Increment score in Redis ZSET
            redisLeaderboardPort.incrementWeeklyXp(year, weekNumber, tier, bot.getId(), sessionXp);
            activeStudents++;
        }

        return activeStudents;
    }

    private int getParticipationChance(LeagueTier tier) {
        return switch (tier) {
            case DIAMOND -> 85;
            case GOLD -> 75;
            case SILVER -> 65;
            case BRONZE -> 50;
        };
    }

    private int getQuestionsSolvedForSession(LeagueTier tier, ThreadLocalRandom random) {
        return switch (tier) {
            case DIAMOND -> 4 + random.nextInt(5); // 4 - 8 questions
            case GOLD -> 3 + random.nextInt(4);    // 3 - 6 questions
            case SILVER -> 2 + random.nextInt(4);  // 2 - 5 questions
            case BRONZE -> 2 + random.nextInt(3);  // 2 - 4 questions
        };
    }
}
