package com.aprovaenem.exam.domain.port.out;

import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.PagedResult;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionFilterCommand;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuestionRepositoryPort {

    Optional<Question> findById(UUID id);

    PagedResult<Question> findAll(QuestionFilterCommand filter);

    List<Question> findRandomActiveQuestions(UUID topicId, DifficultyLevel difficulty, int limit);

    Question save(Question question);
}
