package com.aprovaenem.auth.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgesResponse {

    private int totalUnlocked;
    private List<BadgeItemDto> badges;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BadgeItemDto {
        private String code;
        private String name;
        private String description;
        private String icon;
        private boolean unlocked;
        private Instant unlockedAt;
    }
}
