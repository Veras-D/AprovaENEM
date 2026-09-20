package com.aprovaenem.auth.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordActivityRequest {

    @Min(value = 0, message = "Questions solved cannot be negative.")
    private int questionsSolved;

    @Min(value = 0, message = "Correct count cannot be negative.")
    private int correctCount;

    private boolean sessionCompleted;
}
