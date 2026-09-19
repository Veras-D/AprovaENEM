package com.aprovaenem.exam.domain.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class TutorConsultationResult implements Serializable {

    private final UUID threadId;
    private final UUID questionId;
    private final String responseText;
    private final int turnCount;
    private final int maxTurns;
    private final AiQuotaStatus quotaStatus;
    private final boolean isFallback;
    private final List<PedagogicalChunk> retrievedChunks;
    private final Instant timestamp;

    public TutorConsultationResult(
            UUID threadId,
            UUID questionId,
            String responseText,
            int turnCount,
            int maxTurns,
            AiQuotaStatus quotaStatus,
            boolean isFallback,
            List<PedagogicalChunk> retrievedChunks,
            Instant timestamp
    ) {
        this.threadId = threadId;
        this.questionId = questionId;
        this.responseText = responseText;
        this.turnCount = turnCount;
        this.maxTurns = maxTurns;
        this.quotaStatus = quotaStatus;
        this.isFallback = isFallback;
        this.retrievedChunks = retrievedChunks != null ? retrievedChunks : Collections.emptyList();
        this.timestamp = timestamp != null ? timestamp : Instant.now();
    }

    public UUID getThreadId() {
        return threadId;
    }

    public UUID getQuestionId() {
        return questionId;
    }

    public String getResponseText() {
        return responseText;
    }

    public int getTurnCount() {
        return turnCount;
    }

    public int getMaxTurns() {
        return maxTurns;
    }

    public AiQuotaStatus getQuotaStatus() {
        return quotaStatus;
    }

    public boolean isFallback() {
        return isFallback;
    }

    public List<PedagogicalChunk> getRetrievedChunks() {
        return retrievedChunks;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}
