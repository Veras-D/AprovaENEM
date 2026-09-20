package com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_gamification_profiles")
public class UserGamificationProfileEntity {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private int currentLevel = 1;

    @Column(name = "current_xp", nullable = false)
    @Builder.Default
    private int currentXp = 0;

    @Column(name = "streak_days", nullable = false)
    @Builder.Default
    private int streakDays = 0;

    @Column(name = "streak_freeze_available", nullable = false)
    @Builder.Default
    private int streakFreezeAvailable = 1;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "daily_goal_questions", nullable = false)
    @Builder.Default
    private int dailyGoalQuestions = 10;

    @Column(name = "daily_questions_completed", nullable = false)
    @Builder.Default
    private int dailyQuestionsCompleted = 0;

    @Column(name = "daily_goal_reached_at")
    private Instant dailyGoalReachedAt;

    @Column(name = "opt_in_reminders", nullable = false)
    @Builder.Default
    private boolean optInReminders = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
