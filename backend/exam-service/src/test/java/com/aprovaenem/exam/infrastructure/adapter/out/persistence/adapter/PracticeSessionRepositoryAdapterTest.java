package com.aprovaenem.exam.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.PracticeSession;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionStatus;
import com.aprovaenem.exam.domain.model.SessionStatus;
import com.aprovaenem.exam.domain.model.SessionType;
import com.aprovaenem.exam.domain.model.StudentAttempt;
import java.math.BigDecimal;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.PracticeSessionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.StudentAttemptEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataPracticeSessionRepository;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataStudentAttemptRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PracticeSessionRepositoryAdapter Unit Tests")
class PracticeSessionRepositoryAdapterTest {

    @Mock
    private SpringDataPracticeSessionRepository sessionRepository;

    @Mock
    private SpringDataStudentAttemptRepository attemptRepository;

    @Mock
    private QuestionRepositoryAdapter questionAdapter;

    @Mock
    private EntityManager entityManager;

    private PracticeSessionRepositoryAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new PracticeSessionRepositoryAdapter(sessionRepository, attemptRepository, questionAdapter, entityManager);
    }

    @Test
    @DisplayName("Should find practice session by ID with lazy loaded attempts")
    void shouldFindByIdWithAttempts() {
        UUID sessionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        PracticeSessionEntity entity = PracticeSessionEntity.builder()
                .id(sessionId)
                .userId(userId)
                .sessionType("TOPIC_PRACTICE")
                .status("IN_PROGRESS")
                .totalQuestions(5)
                .correctCount(2)
                .startedAt(Instant.now())
                .questions(null)
                .attempts(null)
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(entity));

        UUID attemptId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        QuestionEntity questionEntity = QuestionEntity.builder().id(questionId).build();
        StudentAttemptEntity attemptEntity = StudentAttemptEntity.builder()
                .id(attemptId)
                .session(entity)
                .question(questionEntity)
                .selectedOption("B")
                .isCorrect(true)
                .timeSpentSeconds(45)
                .submittedAt(Instant.now())
                .build();

        when(attemptRepository.findBySession_IdOrderBySubmittedAtAsc(sessionId)).thenReturn(List.of(attemptEntity));

        Optional<PracticeSession> result = adapter.findById(sessionId);

        assertThat(result).isPresent();
        PracticeSession session = result.get();
        assertThat(session.getId()).isEqualTo(sessionId);
        assertThat(session.getUserId()).isEqualTo(userId);
        assertThat(session.getAttempts()).hasSize(1);
        assertThat(session.getAttempts().get(0).getId()).isEqualTo(attemptId);
        assertThat(session.getAttempts().get(0).getSelectedOption()).isEqualTo('B');
    }

    @Test
    @DisplayName("Should return empty optional when session not found")
    void shouldReturnEmptyWhenNotFound() {
        UUID sessionId = UUID.randomUUID();
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        assertThat(adapter.findById(sessionId)).isEmpty();
    }

    @Test
    @DisplayName("Should save practice session and convert question references")
    void shouldSaveSession() {
        UUID sessionId = UUID.randomUUID();
        UUID qId = UUID.randomUUID();

        PracticeSession session = new PracticeSession();
        session.setId(sessionId);
        session.setSessionType(SessionType.EXAM_SIMULATION);
        session.setStatus(SessionStatus.COMPLETED);
        session.setTotalQuestions(1);
        session.setCorrectCount(1);

        Question q = new Question();
        q.setId(qId);
        session.setQuestions(List.of(q));

        when(entityManager.getReference(eq(QuestionEntity.class), eq(qId)))
                .thenReturn(QuestionEntity.builder().id(qId).build());

        PracticeSessionEntity savedEntity = PracticeSessionEntity.builder()
                .id(sessionId)
                .sessionType("EXAM_SIMULATION")
                .status("COMPLETED")
                .totalQuestions(1)
                .correctCount(1)
                .build();

        when(sessionRepository.save(any(PracticeSessionEntity.class))).thenReturn(savedEntity);

        PracticeSession result = adapter.save(session);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(sessionId);
        assertThat(result.getSessionType()).isEqualTo(SessionType.EXAM_SIMULATION);
        verify(sessionRepository).save(any(PracticeSessionEntity.class));
    }

    @Test
    @DisplayName("Should check if attempt exists")
    void shouldCheckAttemptExists() {
        UUID sId = UUID.randomUUID();
        UUID qId = UUID.randomUUID();

        when(attemptRepository.existsBySession_IdAndQuestion_Id(sId, qId)).thenReturn(true);

        assertThat(adapter.existsAttempt(sId, qId)).isTrue();
    }

    @Test
    @DisplayName("Should save attempt and reference session/question entities")
    void shouldSaveAttempt() {
        UUID attemptId = UUID.randomUUID();
        UUID sId = UUID.randomUUID();
        UUID qId = UUID.randomUUID();

        StudentAttempt attempt = new StudentAttempt(attemptId, sId, qId, 'C', true, 60);

        PracticeSessionEntity sessionEntity = PracticeSessionEntity.builder().id(sId).build();
        QuestionEntity questionEntity = QuestionEntity.builder().id(qId).build();

        when(entityManager.getReference(eq(PracticeSessionEntity.class), eq(sId))).thenReturn(sessionEntity);
        when(entityManager.getReference(eq(QuestionEntity.class), eq(qId))).thenReturn(questionEntity);

        StudentAttemptEntity savedEntity = StudentAttemptEntity.builder()
                .id(attemptId)
                .session(sessionEntity)
                .question(questionEntity)
                .selectedOption("C")
                .isCorrect(true)
                .timeSpentSeconds(60)
                .submittedAt(Instant.now())
                .build();

        when(attemptRepository.save(any(StudentAttemptEntity.class))).thenReturn(savedEntity);

        StudentAttempt result = adapter.saveAttempt(attempt);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(attemptId);
        assertThat(result.getSelectedOption()).isEqualTo('C');
        assertThat(result.isCorrect()).isTrue();
    }

    @Test
    @DisplayName("Should find by ID when attempts and questions are already initialized")
    void shouldFindByIdWithPreInitializedAttemptsAndQuestions() {
        UUID sessionId = UUID.randomUUID();
        UUID qId = UUID.randomUUID();

        QuestionEntity qEntity = QuestionEntity.builder().id(qId).statement("Pergunta").build();
        PracticeSessionEntity entity = PracticeSessionEntity.builder()
                .id(sessionId)
                .sessionType("TOPIC_PRACTICE")
                .status("IN_PROGRESS")
                .totalQuestions(1)
                .correctCount(0)
                .questions(List.of(qEntity))
                .attempts(List.of(
                        StudentAttemptEntity.builder()
                                .id(UUID.randomUUID())
                                .selectedOption("A")
                                .isCorrect(false)
                                .timeSpentSeconds(30)
                                .build()
                ))
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(entity));
        when(questionAdapter.toDomain(qEntity)).thenReturn(new Question(qId, null, null, 1, "Pergunta", 'A', DifficultyLevel.EASY, BigDecimal.ONE, BigDecimal.ONE, BigDecimal.ZERO, QuestionStatus.ACTIVE, "pt-BR"));

        Optional<PracticeSession> found = adapter.findById(sessionId);
        assertThat(found).isPresent();
        assertThat(found.get().getQuestions()).hasSize(1);
        assertThat(found.get().getAttempts()).hasSize(1);
    }

    @Test
    @DisplayName("Should return false when attempt does not exist")
    void shouldReturnFalseWhenAttemptDoesNotExist() {
        UUID sId = UUID.randomUUID();
        UUID qId = UUID.randomUUID();

        when(attemptRepository.existsBySession_IdAndQuestion_Id(sId, qId)).thenReturn(false);

        assertThat(adapter.existsAttempt(sId, qId)).isFalse();
    }

    @Test
    @DisplayName("Should handle nulls when converting")
    void shouldHandleNullConversions() {
        assertThat(adapter.save(null)).isNull();
    }
}
