package com.aprovaenem.exam.domain.model;

public class DailyQuotaExceededException extends RuntimeException {

    private final AiQuotaStatus quotaStatus;

    public DailyQuotaExceededException(String message, AiQuotaStatus quotaStatus) {
        super(message);
        this.quotaStatus = quotaStatus;
    }

    public AiQuotaStatus getQuotaStatus() {
        return quotaStatus;
    }
}
