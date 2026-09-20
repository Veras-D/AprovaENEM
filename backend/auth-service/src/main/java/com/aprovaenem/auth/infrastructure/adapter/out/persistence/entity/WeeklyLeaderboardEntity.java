package com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "weekly_leaderboards")
public class WeeklyLeaderboardEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "week_number", nullable = false)
    private int weekNumber;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "league_tier", nullable = false)
    @Builder.Default
    private String leagueTier = "BRONZE";

    @Column(name = "weekly_xp", nullable = false)
    @Builder.Default
    private int weeklyXp = 0;

    @Column(name = "questions_solved", nullable = false)
    @Builder.Default
    private int questionsSolved = 0;

    @Column(name = "rank_position")
    private Integer rankPosition;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
