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
public class QuestionOptionDto {

    private UUID id;
    private char optionLetter;
    private String optionText;
    private Boolean isCorrect; // null in public catalog queries to prevent cheating
}
