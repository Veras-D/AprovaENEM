package com.aprovaenem.auth.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamificationProfileResponse {

    private UUID userId;
    private int level;
    private String levelTitle;
    private int currentXp;
    private int xpNextLevel;
    private double levelProgressPercentage;
    private int streakDays;
    private int streakFreezeAvailable;
    private DailyGoalDto dailyGoal;
    private String currentLeague;
    private int weeklyXp;
    private int unlockedBadgesCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyGoalDto {
        private int targetQuestions;
        private int completedQuestions;
        private boolean isCompleted;
        private boolean optInReminders;
    }
}
