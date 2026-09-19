package com.aprovaenem.exam.domain.model;

import java.io.Serializable;
import java.time.Instant;

public class AiQuotaStatus implements Serializable {

    private final int dailyLimit;
    private final int usedToday;
    private final int remainingToday;
    private final Instant resetsAt;
    private final boolean isUnlimited;

    public AiQuotaStatus(int dailyLimit, int usedToday, int remainingToday, Instant resetsAt, boolean isUnlimited) {
        this.dailyLimit = dailyLimit;
        this.usedToday = usedToday;
        this.remainingToday = remainingToday;
        this.resetsAt = resetsAt;
        this.isUnlimited = isUnlimited;
    }

    public static AiQuotaStatus unlimited(Instant resetsAt) {
        return new AiQuotaStatus(Integer.MAX_VALUE, 0, Integer.MAX_VALUE, resetsAt, true);
    }

    public static AiQuotaStatus standard(int limit, int used, Instant resetsAt) {
        int remaining = Math.max(0, limit - used);
        return new AiQuotaStatus(limit, used, remaining, resetsAt, false);
    }

    public boolean hasAvailableQuota() {
        return isUnlimited || remainingToday > 0;
    }

    public int getDailyLimit() {
        return dailyLimit;
    }

    public int getUsedToday() {
        return usedToday;
    }

    public int getRemainingToday() {
        return remainingToday;
    }

    public Instant getResetsAt() {
        return resetsAt;
    }

    public boolean isUnlimited() {
        return isUnlimited;
    }
}
