package com.aprovaenem.exam.application.service;

import com.aprovaenem.common.exception.ResourceNotFoundException;
import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.PagedResult;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionFilterCommand;
import com.aprovaenem.exam.domain.model.QuestionStatus;
import com.aprovaenem.exam.domain.port.out.QuestionRepositoryPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("QuestionCatalogService Application Service Unit Tests")
class QuestionCatalogServiceTest {

    @Mock
    private QuestionRepositoryPort questionRepository;

    @InjectMocks
    private QuestionCatalogService questionCatalogService;

    @Test
    @DisplayName("Should query repository with filter and return paged results")
    void shouldGetQuestionsWithFilter() {
        QuestionFilterCommand filter = new QuestionFilterCommand(
                UUID.randomUUID(),
                "Física",
                DifficultyLevel.MEDIUM,
                null,
                QuestionStatus.ACTIVE,
                0,
                10
        );

        Question q1 = new Question();
        q1.setId(UUID.randomUUID());
        q1.setStatement("Enunciado 1");

        PagedResult<Question> expectedPage = new PagedResult<>(List.of(q1), 0, 10, 1L, 1);
        when(questionRepository.findAll(filter)).thenReturn(expectedPage);

        PagedResult<Question> result = questionCatalogService.getQuestions(filter);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getStatement()).isEqualTo("Enunciado 1");
        verify(questionRepository).findAll(filter);
    }

    @Test
    @DisplayName("Should return Question when found by ID")
    void shouldReturnQuestionWhenFoundById() {
        UUID questionId = UUID.randomUUID();
        Question question = new Question();
        question.setId(questionId);
        question.setStatement("Questão de Física sobre Eletrodinâmica");

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        Question result = questionCatalogService.getQuestionById(questionId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(questionId);
        assertThat(result.getStatement()).contains("Eletrodinâmica");
        verify(questionRepository).findById(questionId);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when question is not found by ID")
    void shouldThrowExceptionWhenQuestionNotFound() {
        UUID questionId = UUID.randomUUID();
        when(questionRepository.findById(questionId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> questionCatalogService.getQuestionById(questionId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Question")
                .hasMessageContaining(questionId.toString());

        verify(questionRepository).findById(questionId);
    }

    @Test
    @DisplayName("Should suspend Question with reason and save")
    void shouldSuspendQuestion() {
        UUID questionId = UUID.randomUUID();
        Question question = new Question();
        question.setId(questionId);
        question.setStatus(QuestionStatus.ACTIVE);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Question updated = questionCatalogService.updateQuestionStatus(
                questionId,
                QuestionStatus.SUSPENDED,
                "Inconsistent figure resolution in PDF"
        );

        assertThat(updated.getStatus()).isEqualTo(QuestionStatus.SUSPENDED);
        assertThat(updated.getSuspensionReason()).isEqualTo("Inconsistent figure resolution in PDF");
        verify(questionRepository).save(question);
    }

    @Test
    @DisplayName("Should activate Question and clear suspension reason")
    void shouldActivateQuestion() {
        UUID questionId = UUID.randomUUID();
        Question question = new Question();
        question.setId(questionId);
        question.suspend("Temporary review");

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Question updated = questionCatalogService.updateQuestionStatus(
                questionId,
                QuestionStatus.ACTIVE,
                null
        );

        assertThat(updated.getStatus()).isEqualTo(QuestionStatus.ACTIVE);
        assertThat(updated.getSuspensionReason()).isNull();
        verify(questionRepository).save(question);
    }

    @Test
    @DisplayName("Should mark Question as NEEDS_REVIEW with note")
    void shouldMarkQuestionNeedsReview() {
        UUID questionId = UUID.randomUUID();
        Question question = new Question();
        question.setId(questionId);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Question updated = questionCatalogService.updateQuestionStatus(
                questionId,
                QuestionStatus.NEEDS_REVIEW,
                "Distractor C needs clarification"
        );

        assertThat(updated.getStatus()).isEqualTo(QuestionStatus.NEEDS_REVIEW);
        assertThat(updated.getSuspensionReason()).isEqualTo("Distractor C needs clarification");
        verify(questionRepository).save(question);
    }
}
