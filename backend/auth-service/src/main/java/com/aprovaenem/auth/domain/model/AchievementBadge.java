package com.aprovaenem.auth.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementBadge {

    private String code;
    private String name;
    private String description;
    private String icon;
    private boolean unlocked;
    private Instant unlockedAt;
}
