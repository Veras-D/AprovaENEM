package com.aprovaenem.auth.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGamificationProfile {

    private UUID userId;
    @Builder.Default
    private int currentLevel = 1;
    @Builder.Default
    private int currentXp = 0;
    @Builder.Default
    private int streakDays = 0;
    @Builder.Default
    private int streakFreezeAvailable = 1;
    private LocalDate lastActivityDate;
    @Builder.Default
    private int dailyGoalQuestions = 10;
    @Builder.Default
    private int dailyQuestionsCompleted = 0;
    private Instant dailyGoalReachedAt;
    @Builder.Default
    private boolean optInReminders = true;
    private Instant createdAt;
    private Instant updatedAt;

    public int getXpNextLevel() {
        return currentLevel * 200;
    }

    public double getLevelProgressPercentage() {
        int baseLevelXp = (currentLevel - 1) * 200;
        int currentInLevel = Math.max(0, currentXp - baseLevelXp);
        return Math.min(100.0, Math.round((currentInLevel / 200.0) * 10000.0) / 100.0);
    }

    public String getLevelTitle() {
        if (currentLevel <= 4) {
            return "Calouro Iniciante";
        } else if (currentLevel <= 9) {
            return "Focado no SISU";
        } else if (currentLevel <= 19) {
            return "Mestre dos Simulados";
        } else {
            return "Nota 1000";
        }
    }

    public boolean isDailyGoalCompleted() {
        return dailyQuestionsCompleted >= dailyGoalQuestions;
    }
}
