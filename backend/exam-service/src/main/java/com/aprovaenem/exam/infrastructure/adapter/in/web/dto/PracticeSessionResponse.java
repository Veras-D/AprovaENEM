package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionResponse {

    private UUID id;
    private UUID userId;
    private String anonymousSessionId;
    private String sessionType;
    private String status;
    private int totalQuestions;
    private int correctCount;
    private BigDecimal scorePercentage;
    private Instant startedAt;
    private Instant completedAt;
    private List<QuestionSummaryDto> questions;
}
