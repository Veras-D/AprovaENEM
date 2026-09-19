package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorChatResponse {

    private UUID threadId;
    private UUID questionId;
    private String message;
    private int turnCount;
    private int maxTurns;
    private boolean isFallback;
    private List<RagReferenceDto> pedagogicalReferences;
    private QuotaStatusDto quota;
    private Instant timestamp;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RagReferenceDto {
        private UUID chunkId;
        private String contentSnippet;
        private double similarityScore;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuotaStatusDto {
        private int dailyLimit;
        private int usedToday;
        private int remainingToday;
        private Instant resetsAt;
        private boolean isUnlimited;
    }
}
