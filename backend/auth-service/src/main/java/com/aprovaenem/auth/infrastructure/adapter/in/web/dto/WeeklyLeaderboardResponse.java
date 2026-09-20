package com.aprovaenem.auth.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyLeaderboardResponse {

    private int weekNumber;
    private int year;
    private String leagueTier;
    private String resetsAt;
    private UserRankDto currentUserRank;
    private List<UserRankDto> leaderboard;
    private long totalParticipants;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRankDto {
        private long rank;
        private UUID userId;
        private String displayName;
        private int weeklyXp;
        private int streakDays;
        private boolean promotionZone;
    }
}
