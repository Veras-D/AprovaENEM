package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionSummaryDto {

    private UUID id;
    private UUID examEditionId;
    private UUID topicId;
    private String topicName;
    private String discipline;
    private int itemNumber;
    private String statement;
    private String difficultyLevel;
    private String status;
    private List<QuestionOptionDto> options;
}
