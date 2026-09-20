package com.aprovaenem.exam.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.exam.domain.model.PracticeSession;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.SessionStatus;
import com.aprovaenem.exam.domain.model.SessionType;
import com.aprovaenem.exam.domain.model.StudentAttempt;
import com.aprovaenem.exam.domain.port.out.PracticeSessionRepositoryPort;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.PracticeSessionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.StudentAttemptEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataPracticeSessionRepository;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataStudentAttemptRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Transactional
public class PracticeSessionRepositoryAdapter implements PracticeSessionRepositoryPort {

    private final SpringDataPracticeSessionRepository sessionRepository;
    private final SpringDataStudentAttemptRepository attemptRepository;
    private final QuestionRepositoryAdapter questionAdapter;
    private final EntityManager entityManager;

    @Override
    public Optional<PracticeSession> findById(UUID id) {
        return sessionRepository.findById(id).map(entity -> {
            PracticeSession domain = toDomain(entity);
            if (domain != null && (domain.getAttempts() == null || domain.getAttempts().isEmpty())) {
                domain.setAttempts(findAttemptsBySessionId(id));
            }
            return domain;
        });
    }

    @Override
    public PracticeSession save(PracticeSession session) {
        PracticeSessionEntity entity = toEntity(session);
        PracticeSessionEntity saved = sessionRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public boolean existsAttempt(UUID sessionId, UUID questionId) {
        return attemptRepository.existsBySession_IdAndQuestion_Id(sessionId, questionId);
    }

    @Override
    public StudentAttempt saveAttempt(StudentAttempt attempt) {
        StudentAttemptEntity entity = StudentAttemptEntity.builder()
                .id(attempt.getId())
                .session(entityManager.getReference(PracticeSessionEntity.class, attempt.getSessionId()))
                .question(entityManager.getReference(QuestionEntity.class, attempt.getQuestionId()))
                .selectedOption(String.valueOf(attempt.getSelectedOption()))
                .isCorrect(attempt.isCorrect())
                .timeSpentSeconds(attempt.getTimeSpentSeconds())
                .submittedAt(attempt.getSubmittedAt() != null ? attempt.getSubmittedAt() : Instant.now())
                .build();

        StudentAttemptEntity saved = attemptRepository.save(entity);
        return toAttemptDomain(saved);
    }

    @Override
    public List<StudentAttempt> findAttemptsBySessionId(UUID sessionId) {
        return attemptRepository.findBySession_IdOrderBySubmittedAtAsc(sessionId).stream()
                .map(this::toAttemptDomain)
                .toList();
    }

    private PracticeSession toDomain(PracticeSessionEntity entity) {
        if (entity == null) {
            return null;
        }

        PracticeSession session = new PracticeSession();
        session.setId(entity.getId());
        session.setUserId(entity.getUserId());
        session.setAnonymousSessionId(entity.getAnonymousSessionId());
        session.setSessionType(SessionType.valueOf(entity.getSessionType()));
        session.setStatus(SessionStatus.valueOf(entity.getStatus()));
        session.setTotalQuestions(entity.getTotalQuestions());
        session.setCorrectCount(entity.getCorrectCount());
        session.setStartedAt(entity.getStartedAt());
        session.setCompletedAt(entity.getCompletedAt());

        if (entity.getQuestions() != null && org.hibernate.Hibernate.isInitialized(entity.getQuestions())) {
            List<Question> questions = entity.getQuestions().stream()
                    .map(questionAdapter::toDomain)
                    .toList();
            session.setQuestions(questions);
        }

        if (entity.getAttempts() != null && org.hibernate.Hibernate.isInitialized(entity.getAttempts())) {
            List<StudentAttempt> attempts = entity.getAttempts().stream()
                    .map(this::toAttemptDomain)
                    .toList();
            session.setAttempts(attempts);
        }

        return session;
    }

    private PracticeSessionEntity toEntity(PracticeSession domain) {
        if (domain == null) {
            return null;
        }

        PracticeSessionEntity entity = PracticeSessionEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .anonymousSessionId(domain.getAnonymousSessionId())
                .sessionType(domain.getSessionType() != null ? domain.getSessionType().name() : SessionType.TOPIC_PRACTICE.name())
                .status(domain.getStatus() != null ? domain.getStatus().name() : SessionStatus.IN_PROGRESS.name())
                .totalQuestions(domain.getTotalQuestions())
                .correctCount(domain.getCorrectCount())
                .startedAt(domain.getStartedAt() != null ? domain.getStartedAt() : Instant.now())
                .completedAt(domain.getCompletedAt())
                .build();

        if (domain.getQuestions() != null && !domain.getQuestions().isEmpty()) {
            List<QuestionEntity> questionEntities = new ArrayList<>();
            for (Question q : domain.getQuestions()) {
                if (q.getId() != null) {
                    questionEntities.add(entityManager.getReference(QuestionEntity.class, q.getId()));
                }
            }
            entity.setQuestions(questionEntities);
        }

        return entity;
    }

    private StudentAttempt toAttemptDomain(StudentAttemptEntity entity) {
        if (entity == null) {
            return null;
        }
        return new StudentAttempt(
                entity.getId(),
                entity.getSession() != null ? entity.getSession().getId() : null,
                entity.getQuestion() != null ? entity.getQuestion().getId() : null,
                entity.getSelectedOption() != null ? entity.getSelectedOption().charAt(0) : 'A',
                Boolean.TRUE.equals(entity.getIsCorrect()),
                entity.getTimeSpentSeconds() != null ? entity.getTimeSpentSeconds() : 0
        );
    }
}
