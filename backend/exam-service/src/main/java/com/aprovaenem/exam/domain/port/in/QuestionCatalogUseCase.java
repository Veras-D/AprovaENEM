package com.aprovaenem.exam.domain.port.in;

import com.aprovaenem.exam.domain.model.PagedResult;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionFilterCommand;
import com.aprovaenem.exam.domain.model.QuestionStatus;

import java.util.UUID;

public interface QuestionCatalogUseCase {

    PagedResult<Question> getQuestions(QuestionFilterCommand filter);

    Question getQuestionById(UUID questionId);

    Question updateQuestionStatus(UUID questionId, QuestionStatus status, String suspensionReason);
}
