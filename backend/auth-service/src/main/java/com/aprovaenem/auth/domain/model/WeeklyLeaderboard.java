package com.aprovaenem.auth.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyLeaderboard {

    private UUID id;
    private UUID userId;
    private String displayName;
    private int weekNumber;
    private int year;
    @Builder.Default
    private LeagueTier leagueTier = LeagueTier.BRONZE;
    @Builder.Default
    private int weeklyXp = 0;
    @Builder.Default
    private int questionsSolved = 0;
    private Integer rankPosition;
    private int streakDays;
    private boolean promotionZone;
    private Instant createdAt;
    private Instant updatedAt;
}
