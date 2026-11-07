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
public class QuestionResolutionResponse {

    private UUID questionId;
    private String correctOption;
    private String baseExplanation;
    private String keyConcepts;
    private String authorAttribution;
    private String attribution;
}
