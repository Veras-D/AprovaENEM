package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.SessionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartSessionRequest {

    private String anonymousSessionId;
    private UUID userId;
    @Builder.Default
    private SessionType sessionType = SessionType.TOPIC_PRACTICE;
    private UUID topicId;
    private DifficultyLevel difficulty;
    @Min(value = 1, message = "Total questions must be at least 1")
    @Max(value = 50, message = "Total questions cannot exceed 50 per session")
    @Builder.Default
    private int totalQuestions = 10;
}
