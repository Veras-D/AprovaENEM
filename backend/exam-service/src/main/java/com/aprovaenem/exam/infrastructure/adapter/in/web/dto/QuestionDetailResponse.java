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
public class QuestionDetailResponse {

    private UUID id;
    private UUID examEditionId;
    private UUID topicId;
    private String topicName;
    private String discipline;
    private int itemNumber;
    private String statement;
    private String difficultyLevel;
    private BigDecimal triParamA;
    private BigDecimal triParamB;
    private BigDecimal triParamC;
    private String status;
    private String suspensionReason;
    private String contentLanguage;
    private Instant createdAt;
    private List<QuestionOptionDto> options;
}
