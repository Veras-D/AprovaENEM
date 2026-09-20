package com.aprovaenem.exam.application.service;

import com.aprovaenem.common.exception.BusinessException;
import com.aprovaenem.common.exception.ResourceNotFoundException;
import com.aprovaenem.exam.domain.model.AttemptResult;
import com.aprovaenem.exam.domain.model.DiagnosticReport;
import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.MasteryLevel;
import com.aprovaenem.exam.domain.model.PracticeSession;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionResolution;
import com.aprovaenem.exam.domain.model.SessionStatus;
import com.aprovaenem.exam.domain.model.SessionType;
import com.aprovaenem.exam.domain.model.StartSessionCommand;
import com.aprovaenem.exam.domain.model.StudentAttempt;
import com.aprovaenem.exam.domain.model.SubmitAnswerCommand;
import com.aprovaenem.exam.domain.port.out.DiagnosticReportRepositoryPort;
import com.aprovaenem.exam.domain.port.out.PracticeSessionRepositoryPort;
import com.aprovaenem.exam.domain.port.out.QuestionRepositoryPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PracticeSessionService Application Service Unit Tests")
class PracticeSessionServiceTest {

    @Mock
    private PracticeSessionRepositoryPort sessionRepository;

    @Mock
    private QuestionRepositoryPort questionRepository;

    @Mock
    private DiagnosticReportRepositoryPort diagnosticReportRepository;

    @InjectMocks
    private PracticeSessionService practiceSessionService;

    @Test
    @DisplayName("Should successfully start a new practice session with active candidate questions")
    void shouldStartPracticeSessionSuccessfully() {
        UUID topicId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        StartSessionCommand command = new StartSessionCommand(
                userId,
                null,
                SessionType.TOPIC_PRACTICE,
                topicId,
                DifficultyLevel.MEDIUM,
                5
        );

        Question q1 = new Question();
        q1.setId(UUID.randomUUID());
        Question q2 = new Question();
        q2.setId(UUID.randomUUID());

        when(questionRepository.findRandomActiveQuestions(topicId, DifficultyLevel.MEDIUM, 5))
                .thenReturn(List.of(q1, q2));
        when(sessionRepository.save(any(PracticeSession.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PracticeSession session = practiceSessionService.startSession(command);

        assertThat(session).isNotNull();
        assertThat(session.getUserId()).isEqualTo(userId);
        assertThat(session.getSessionType()).isEqualTo(SessionType.TOPIC_PRACTICE);
        assertThat(session.getTotalQuestions()).isEqualTo(2);
        assertThat(session.getQuestions()).hasSize(2);
        verify(sessionRepository).save(any(PracticeSession.class));
    }

    @Test
    @DisplayName("Should throw BusinessException when no active questions are available for the selected criteria")
    void shouldThrowExceptionWhenNoQuestionsFound() {
        UUID topicId = UUID.randomUUID();
        StartSessionCommand command = new StartSessionCommand(
                UUID.randomUUID(),
                null,
                SessionType.TOPIC_PRACTICE,
                topicId,
                DifficultyLevel.HARD,
                10
        );

        when(questionRepository.findRandomActiveQuestions(topicId, DifficultyLevel.HARD, 10))
                .thenReturn(List.of());

        assertThatThrownBy(() -> practiceSessionService.startSession(command))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("No active questions found");

        verify(sessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should submit a correct answer, increment session score, and return resolution details")
    void shouldSubmitCorrectAnswer() {
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();

        PracticeSession session = new PracticeSession();
        session.setId(sessionId);
        session.setStatus(SessionStatus.IN_PROGRESS);

        Question question = new Question();
        question.setId(questionId);
        question.setCorrectOption('C');

        QuestionResolution resolution = new QuestionResolution(
                UUID.randomUUID(),
                questionId,
                "Resolução detalhada aplicando a Segunda Lei de Newton",
                "Dinâmica, Leis de Newton",
                "INEP Oficial"
        );
        question.setResolution(resolution);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.existsAttempt(sessionId, questionId)).thenReturn(false);
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(sessionRepository.saveAttempt(any(StudentAttempt.class)))
                .thenAnswer(inv -> {
                    StudentAttempt a = inv.getArgument(0);
                    a.setId(UUID.randomUUID());
                    return a;
                });

        SubmitAnswerCommand command = new SubmitAnswerCommand(sessionId, questionId, 'C', 40);

        AttemptResult result = practiceSessionService.submitAnswer(command);

        assertThat(result).isNotNull();
        assertThat(result.isCorrect()).isTrue();
        assertThat(result.getSelectedOption()).isEqualTo('C');
        assertThat(result.getCorrectOption()).isEqualTo('C');
        assertThat(result.getBaseExplanation()).contains("Segunda Lei de Newton");
        assertThat(result.getKeyConcepts()).contains("Dinâmica");
        assertThat(session.getCorrectCount()).isEqualTo(1);
        verify(sessionRepository).save(session);
        verify(sessionRepository).saveAttempt(any(StudentAttempt.class));
    }

    @Test
    @DisplayName("Should submit an incorrect answer without incrementing correct count")
    void shouldSubmitIncorrectAnswer() {
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();

        PracticeSession session = new PracticeSession();
        session.setId(sessionId);
        session.setStatus(SessionStatus.IN_PROGRESS);

        Question question = new Question();
        question.setId(questionId);
        question.setCorrectOption('A');

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.existsAttempt(sessionId, questionId)).thenReturn(false);
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(sessionRepository.saveAttempt(any(StudentAttempt.class)))
                .thenAnswer(inv -> {
                    StudentAttempt a = inv.getArgument(0);
                    a.setId(UUID.randomUUID());
                    return a;
                });

        SubmitAnswerCommand command = new SubmitAnswerCommand(sessionId, questionId, 'E', 55);

        AttemptResult result = practiceSessionService.submitAnswer(command);

        assertThat(result.isCorrect()).isFalse();
        assertThat(result.getSelectedOption()).isEqualTo('E');
        assertThat(result.getCorrectOption()).isEqualTo('A');
        assertThat(session.getCorrectCount()).isZero();
        verify(sessionRepository, never()).save(session);
    }

    @Test
    @DisplayName("Should throw BusinessException when submitting answer to closed session")
    void shouldThrowExceptionWhenSessionClosed() {
        UUID sessionId = UUID.randomUUID();
        PracticeSession session = new PracticeSession();
        session.setId(sessionId);
        session.setStatus(SessionStatus.COMPLETED);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        SubmitAnswerCommand command = new SubmitAnswerCommand(sessionId, UUID.randomUUID(), 'A', 20);

        assertThatThrownBy(() -> practiceSessionService.submitAnswer(command))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Session is already closed or abandoned");
    }

    @Test
    @DisplayName("Should throw BusinessException when question was already answered in session")
    void shouldThrowExceptionWhenAlreadyAnswered() {
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();

        PracticeSession session = new PracticeSession();
        session.setId(sessionId);
        session.setStatus(SessionStatus.IN_PROGRESS);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.existsAttempt(sessionId, questionId)).thenReturn(true);

        SubmitAnswerCommand command = new SubmitAnswerCommand(sessionId, questionId, 'B', 15);

        assertThatThrownBy(() -> practiceSessionService.submitAnswer(command))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Question has already been answered");
    }

    @Test
    @DisplayName("Should complete session, aggregate attempts by topic, and generate diagnostic report")
    void shouldCompleteSessionAndGenerateDiagnostic() {
        UUID sessionId = UUID.randomUUID();
        PracticeSession session = new PracticeSession();
        session.setId(sessionId);
        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setTotalQuestions(3);
        session.setCorrectCount(1);

        UUID q1Id = UUID.randomUUID();
        UUID q2Id = UUID.randomUUID();
        UUID q3Id = UUID.randomUUID();

        Question q1 = new Question();
        q1.setId(q1Id);
        q1.setTopicName("Eletrodinâmica");
        q1.setDiscipline("Física");

        Question q2 = new Question();
        q2.setId(q2Id);
        q2.setTopicName("Eletrodinâmica");
        q2.setDiscipline("Física");

        Question q3 = new Question();
        q3.setId(q3Id);
        q3.setTopicName("Geometria Espacial");
        q3.setDiscipline("Matemática");

        StudentAttempt att1 = new StudentAttempt(UUID.randomUUID(), sessionId, q1Id, 'A', true, 30);
        StudentAttempt att2 = new StudentAttempt(UUID.randomUUID(), sessionId, q2Id, 'B', false, 40);
        StudentAttempt att3 = new StudentAttempt(UUID.randomUUID(), sessionId, q3Id, 'C', false, 50);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(diagnosticReportRepository.findBySessionId(sessionId)).thenReturn(Optional.empty());
        when(sessionRepository.findAttemptsBySessionId(sessionId)).thenReturn(List.of(att1, att2, att3));
        when(questionRepository.findById(q1Id)).thenReturn(Optional.of(q1));
        when(questionRepository.findById(q2Id)).thenReturn(Optional.of(q2));
        when(questionRepository.findById(q3Id)).thenReturn(Optional.of(q3));
        when(diagnosticReportRepository.save(any(DiagnosticReport.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        DiagnosticReport report = practiceSessionService.completeSession(sessionId);

        assertThat(report).isNotNull();
        assertThat(report.getSessionId()).isEqualTo(sessionId);
        assertThat(session.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        assertThat(report.getTopicBreakdown()).containsKey("Eletrodinâmica");
        assertThat(report.getTopicBreakdown()).containsKey("Geometria Espacial");
        // Geometria Espacial: 0/1 = 0% -> CRITICAL -> in recommendedTopics
        assertThat(report.getRecommendedTopics()).contains("Geometria Espacial");
        verify(diagnosticReportRepository).save(any(DiagnosticReport.class));
    }

    @Test
    @DisplayName("Should return existing diagnostic report when already computed for session")
    void shouldReturnExistingDiagnosticReport() {
        UUID sessionId = UUID.randomUUID();
        PracticeSession session = new PracticeSession();
        session.setId(sessionId);
        session.setStatus(SessionStatus.COMPLETED);

        DiagnosticReport existingReport = new DiagnosticReport();
        existingReport.setSessionId(sessionId);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(diagnosticReportRepository.findBySessionId(sessionId)).thenReturn(Optional.of(existingReport));

        DiagnosticReport report = practiceSessionService.completeSession(sessionId);

        assertThat(report).isEqualTo(existingReport);
        verify(sessionRepository, never()).findAttemptsBySessionId(any());
    }
}
