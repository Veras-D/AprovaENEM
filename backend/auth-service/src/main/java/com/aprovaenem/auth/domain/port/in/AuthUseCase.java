package com.aprovaenem.auth.domain.port.in;

import com.aprovaenem.auth.domain.model.SchoolType;
import com.aprovaenem.auth.domain.model.User;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AuthUseCase {

    User register(String email, String rawPassword, String fullName, SchoolType schoolType, String targetDegree);

    AuthResult login(String email, String rawPassword);

    User getCurrentUser(UUID userId);

    UserDataExport exportUserData(UUID userId);

    void deleteAccount(UUID userId);

    record AuthResult(User user, String token, long expiresInSeconds) {}

    record BadgeExport(
            String code,
            String name,
            String description,
            String icon,
            boolean unlocked,
            Instant unlockedAt
    ) implements Serializable {}

    record GamificationExport(
            int currentLevel,
            String levelTitle,
            int currentXp,
            int xpNextLevel,
            double levelProgressPercentage,
            int streakDays,
            int streakFreezeAvailable,
            int dailyGoalQuestions,
            int dailyQuestionsCompleted,
            List<BadgeExport> badges
    ) implements Serializable {}

    record UserDataExport(
            UUID userId,
            String email,
            String fullName,
            String schoolType,
            String targetDegree,
            String role,
            boolean isEmailVerified,
            Instant createdAt,
            Instant exportTimestamp,
            String legalBasis,
            String privacyPolicyVersion,
            GamificationExport gamification
    ) implements Serializable {}
}
