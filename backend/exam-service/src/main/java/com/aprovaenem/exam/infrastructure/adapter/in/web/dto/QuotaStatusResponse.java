package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotaStatusResponse {
    private int dailyLimit;
    private int usedToday;
    private int remainingToday;
    private Instant resetsAt;
    private boolean isUnlimited;
}
