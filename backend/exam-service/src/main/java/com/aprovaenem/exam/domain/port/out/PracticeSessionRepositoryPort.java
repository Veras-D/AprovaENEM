package com.aprovaenem.exam.domain.port.out;

import com.aprovaenem.exam.domain.model.PracticeSession;
import com.aprovaenem.exam.domain.model.StudentAttempt;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PracticeSessionRepositoryPort {

    Optional<PracticeSession> findById(UUID id);

    PracticeSession save(PracticeSession session);

    boolean existsAttempt(UUID sessionId, UUID questionId);

    StudentAttempt saveAttempt(StudentAttempt attempt);

    List<StudentAttempt> findAttemptsBySessionId(UUID sessionId);
}
