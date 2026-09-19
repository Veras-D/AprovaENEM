package com.aprovaenem.exam.application.service;

import com.aprovaenem.common.exception.ResourceNotFoundException;
import com.aprovaenem.exam.domain.model.PagedResult;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionFilterCommand;
import com.aprovaenem.exam.domain.model.QuestionStatus;
import com.aprovaenem.exam.domain.port.in.QuestionCatalogUseCase;
import com.aprovaenem.exam.domain.port.out.QuestionRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionCatalogService implements QuestionCatalogUseCase {

    private final QuestionRepositoryPort questionRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResult<Question> getQuestions(QuestionFilterCommand filter) {
        log.debug("Fetching questions with filter: topic={}, diff={}, status={}, page={}",
                filter.getTopicId(), filter.getDifficulty(), filter.getStatus(), filter.getPage());
        return questionRepository.findAll(filter);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "questions", key = "#questionId", unless = "#result == null")
    public Question getQuestionById(UUID questionId) {
        log.debug("Fetching question by id: {}", questionId);
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));
    }

    @Override
    @Transactional
    @CacheEvict(value = "questions", key = "#questionId")
    public Question updateQuestionStatus(UUID questionId, QuestionStatus status, String suspensionReason) {
        log.info("Updating status of question {} to {} (reason: {})", questionId, status, suspensionReason);
        Question question = getQuestionById(questionId);

        if (status == QuestionStatus.ACTIVE) {
            question.activate();
        } else if (status == QuestionStatus.SUSPENDED) {
            question.suspend(suspensionReason);
        } else if (status == QuestionStatus.NEEDS_REVIEW) {
            question.markNeedsReview(suspensionReason);
        } else {
            question.setStatus(status);
        }

        return questionRepository.save(question);
    }
}
