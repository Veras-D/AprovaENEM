package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {

    @NotNull(message = "Question ID is required")
    private java.util.UUID questionId;

    @NotNull(message = "Selected option is required")
    private Character selectedOption;

    @Builder.Default
    private int timeSpentSeconds = 0;
}
