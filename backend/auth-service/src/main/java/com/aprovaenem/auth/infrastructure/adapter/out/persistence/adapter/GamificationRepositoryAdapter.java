package com.aprovaenem.auth.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.auth.domain.model.AchievementBadge;
import com.aprovaenem.auth.domain.model.LeagueTier;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.model.WeeklyLeaderboard;
import com.aprovaenem.auth.domain.port.out.GamificationRepositoryPort;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserAchievementEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserGamificationProfileEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.WeeklyLeaderboardEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataGamificationProfileRepository;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataUserAchievementRepository;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataUserRepository;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataWeeklyLeaderboardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class GamificationRepositoryAdapter implements GamificationRepositoryPort {

    private final SpringDataGamificationProfileRepository profileRepository;
    private final SpringDataWeeklyLeaderboardRepository leaderboardRepository;
    private final SpringDataUserAchievementRepository achievementRepository;
    private final SpringDataUserRepository userRepository;

    private static final List<AchievementBadge> STANDARD_BADGES = List.of(
            AchievementBadge.builder()
                    .code("FIRST_SIMULADO")
                    .name("Primeiro Passo")
                    .description("Complete seu primeiro simulado com pelo menos 10 questões.")
                    .icon("trophy")
                    .build(),
            AchievementBadge.builder()
                    .code("STREAK_7_DAYS")
                    .name("Semana de Ferro")
                    .description("Mantenha uma ofensiva de estudos ativa por 7 dias consecutivos.")
                    .icon("flame")
                    .build(),
            AchievementBadge.builder()
                    .code("MATH_WIZARD_50")
                    .name("Gênio da Matemática")
                    .description("Resolva 50 questões de Matemática com acurácia superior a 75%.")
                    .icon("calculator")
                    .build(),
            AchievementBadge.builder()
                    .code("LEVEL_10")
                    .name("Mestre do Conhecimento")
                    .description("Atinja o nível 10 na plataforma.")
                    .icon("star")
                    .build()
    );

    @Override
    public Optional<UserGamificationProfile> findProfileByUserId(UUID userId) {
        return profileRepository.findById(userId).map(this::toProfileDomain);
    }

    @Override
    public UserGamificationProfile saveProfile(UserGamificationProfile profile) {
        Instant now = Instant.now();
        UserGamificationProfileEntity entity = UserGamificationProfileEntity.builder()
                .userId(profile.getUserId())
                .currentLevel(profile.getCurrentLevel())
                .currentXp(profile.getCurrentXp())
                .streakDays(profile.getStreakDays())
                .streakFreezeAvailable(profile.getStreakFreezeAvailable())
                .lastActivityDate(profile.getLastActivityDate())
                .dailyGoalQuestions(profile.getDailyGoalQuestions())
                .dailyQuestionsCompleted(profile.getDailyQuestionsCompleted())
                .dailyGoalReachedAt(profile.getDailyGoalReachedAt())
                .optInReminders(profile.isOptInReminders())
                .createdAt(profile.getCreatedAt() != null ? profile.getCreatedAt() : now)
                .updatedAt(now)
                .build();

        return toProfileDomain(profileRepository.save(entity));
    }

    @Override
    public Optional<WeeklyLeaderboard> findWeeklyLeaderboard(UUID userId, int weekNumber, int year) {
        return leaderboardRepository.findByUserIdAndWeekNumberAndYear(userId, weekNumber, year)
                .map(this::toLeaderboardDomain);
    }

    @Override
    public WeeklyLeaderboard saveWeeklyLeaderboard(WeeklyLeaderboard leaderboard) {
        Instant now = Instant.now();
        WeeklyLeaderboardEntity entity = WeeklyLeaderboardEntity.builder()
                .id(leaderboard.getId())
                .userId(leaderboard.getUserId())
                .weekNumber(leaderboard.getWeekNumber())
                .year(leaderboard.getYear())
                .leagueTier(leaderboard.getLeagueTier() != null ? leaderboard.getLeagueTier().name() : "BRONZE")
                .weeklyXp(leaderboard.getWeeklyXp())
                .questionsSolved(leaderboard.getQuestionsSolved())
                .rankPosition(leaderboard.getRankPosition())
                .createdAt(leaderboard.getCreatedAt() != null ? leaderboard.getCreatedAt() : now)
                .updatedAt(now)
                .build();

        return toLeaderboardDomain(leaderboardRepository.save(entity));
    }

    @Override
    public List<WeeklyLeaderboard> findTopByLeague(int weekNumber, int year, String leagueTier) {
        return leaderboardRepository.findByWeekNumberAndYearAndLeagueTierOrderByWeeklyXpDesc(weekNumber, year, leagueTier)
                .stream()
                .map(this::toLeaderboardDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AchievementBadge> findBadgesByUserId(UUID userId) {
        List<UserAchievementEntity> userAchievements = achievementRepository.findByUserId(userId);
        Map<String, Instant> unlockedMap = userAchievements.stream()
                .collect(Collectors.toMap(UserAchievementEntity::getBadgeCode, UserAchievementEntity::getUnlockedAt, (a, b) -> a));

        List<AchievementBadge> result = new ArrayList<>();
        for (AchievementBadge std : STANDARD_BADGES) {
            boolean isUnlocked = unlockedMap.containsKey(std.getCode());
            result.add(AchievementBadge.builder()
                    .code(std.getCode())
                    .name(std.getName())
                    .description(std.getDescription())
                    .icon(std.getIcon())
                    .unlocked(isUnlocked)
                    .unlockedAt(unlockedMap.get(std.getCode()))
                    .build());
        }
        return result;
    }

    @Override
    public void unlockBadge(UUID userId, String badgeCode) {
        if (!achievementRepository.existsByUserIdAndBadgeCode(userId, badgeCode)) {
            UserAchievementEntity entity = UserAchievementEntity.builder()
                    .userId(userId)
                    .badgeCode(badgeCode)
                    .unlockedAt(Instant.now())
                    .build();
            achievementRepository.save(entity);
            log.info("Unlocked badge [{}] for user [{}]", badgeCode, userId);
        }
    }

    @Override
    public List<UserGamificationProfile> findPendingStudyReminderProfiles() {
        return profileRepository.findPendingStudyReminderProfiles().stream()
                .map(this::toProfileDomain)
                .collect(Collectors.toList());
    }

    private UserGamificationProfile toProfileDomain(UserGamificationProfileEntity entity) {
        return UserGamificationProfile.builder()
                .userId(entity.getUserId())
                .currentLevel(entity.getCurrentLevel())
                .currentXp(entity.getCurrentXp())
                .streakDays(entity.getStreakDays())
                .streakFreezeAvailable(entity.getStreakFreezeAvailable())
                .lastActivityDate(entity.getLastActivityDate())
                .dailyGoalQuestions(entity.getDailyGoalQuestions())
                .dailyQuestionsCompleted(entity.getDailyQuestionsCompleted())
                .dailyGoalReachedAt(entity.getDailyGoalReachedAt())
                .optInReminders(entity.isOptInReminders())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private WeeklyLeaderboard toLeaderboardDomain(WeeklyLeaderboardEntity entity) {
        String displayName = userRepository.findById(entity.getUserId())
                .map(u -> u.getFullName())
                .orElse("Estudante");

        int streak = profileRepository.findById(entity.getUserId())
                .map(UserGamificationProfileEntity::getStreakDays)
                .orElse(0);

        return WeeklyLeaderboard.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .displayName(displayName)
                .weekNumber(entity.getWeekNumber())
                .year(entity.getYear())
                .leagueTier(LeagueTier.valueOf(entity.getLeagueTier()))
                .weeklyXp(entity.getWeeklyXp())
                .questionsSolved(entity.getQuestionsSolved())
                .rankPosition(entity.getRankPosition())
                .streakDays(streak)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
