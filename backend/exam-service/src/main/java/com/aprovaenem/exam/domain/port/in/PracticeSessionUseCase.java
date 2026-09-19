package com.aprovaenem.exam.domain.port.in;

import com.aprovaenem.exam.domain.model.AttemptResult;
import com.aprovaenem.exam.domain.model.DiagnosticReport;
import com.aprovaenem.exam.domain.model.PracticeSession;
import com.aprovaenem.exam.domain.model.StartSessionCommand;
import com.aprovaenem.exam.domain.model.SubmitAnswerCommand;

import java.util.UUID;

public interface PracticeSessionUseCase {

    PracticeSession startSession(StartSessionCommand command);

    AttemptResult submitAnswer(SubmitAnswerCommand command);

    DiagnosticReport completeSession(UUID sessionId);

    PracticeSession getSession(UUID sessionId);

    DiagnosticReport getDiagnosticReport(UUID sessionId);
}
