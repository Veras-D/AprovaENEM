package com.aprovaenem.auth.infrastructure.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDailyGoalRequest {

    @JsonProperty("targetQuestions")
    @JsonAlias({"target", "dailyGoal", "targetQuestions"})
    @Min(value = 1, message = "Daily target must be at least 1 question.")
    @Max(value = 100, message = "Daily target cannot exceed 100 questions.")
    private Integer targetQuestions;

    private Boolean optInReminders;
}
