package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import com.aprovaenem.exam.domain.model.QuestionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateQuestionStatusRequest {

    @NotNull(message = "Question status cannot be null")
    private QuestionStatus status;

    private String suspensionReason;
}
