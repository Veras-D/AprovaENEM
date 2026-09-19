package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResultResponse {

    private UUID attemptId;
    private UUID sessionId;
    private UUID questionId;
    private char selectedOption;
    private boolean isCorrect;
    private char correctOption;
    private String baseExplanation;
    private String keyConcepts;
    private String authorAttribution;
}
