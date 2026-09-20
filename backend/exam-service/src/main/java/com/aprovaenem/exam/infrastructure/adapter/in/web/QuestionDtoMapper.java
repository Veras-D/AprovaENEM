package com.aprovaenem.exam.infrastructure.adapter.in.web;

import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.QuestionOptionDto;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.QuestionSummaryDto;

import java.util.List;

/**
 * Shared DTO mapper for Question representations across web controllers.
 */
public final class QuestionDtoMapper {

    private QuestionDtoMapper() {
    }

    public static QuestionSummaryDto toSummaryDto(Question q) {
        List<QuestionOptionDto> options = q.getOptions().stream()
                .map(opt -> QuestionOptionDto.builder()
                        .id(opt.getId())
                        .optionLetter(opt.getOptionLetter())
                        .optionText(opt.getOptionText())
                        .isCorrect(null)
                        .build())
                .toList();

        return QuestionSummaryDto.builder()
                .id(q.getId())
                .examEditionId(q.getExamEditionId())
                .topicId(q.getTopicId())
                .topicName(q.getTopicName())
                .discipline(q.getDiscipline())
                .itemNumber(q.getItemNumber())
                .statement(q.getStatement())
                .difficultyLevel(q.getDifficultyLevel().name())
                .status(q.getStatus().name())
                .options(options)
                .build();
    }
}
