package com.aprovaenem.exam.application.service;

import com.aprovaenem.common.exception.BusinessException;
import com.aprovaenem.common.exception.ResourceNotFoundException;
import com.aprovaenem.exam.domain.model.AttemptResult;
import com.aprovaenem.exam.domain.model.DiagnosticReport;
import com.aprovaenem.exam.domain.model.MasteryLevel;
import com.aprovaenem.exam.domain.model.PracticeSession;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionResolution;
import com.aprovaenem.exam.domain.model.StartSessionCommand;
import com.aprovaenem.exam.domain.model.StudentAttempt;
import com.aprovaenem.exam.domain.model.SubmitAnswerCommand;
import com.aprovaenem.exam.domain.model.TopicPerformance;
import com.aprovaenem.exam.domain.port.in.PracticeSessionUseCase;
import com.aprovaenem.exam.domain.port.out.DiagnosticReportRepositoryPort;
import com.aprovaenem.exam.domain.port.out.PracticeSessionRepositoryPort;
import com.aprovaenem.exam.domain.port.out.QuestionRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PracticeSessionService implements PracticeSessionUseCase {

    private final PracticeSessionRepositoryPort sessionRepository;
    private final QuestionRepositoryPort questionRepository;
    private final DiagnosticReportRepositoryPort diagnosticReportRepository;

    @Override
    @Transactional
    public PracticeSession startSession(StartSessionCommand command) {
        log.info("Starting practice session: anonymousSession={}, topic={}, difficulty={}, count={}",
                command.getAnonymousSessionId(), command.getTopicId(), command.getDifficulty(), command.getTotalQuestions());

        List<Question> candidateQuestions = questionRepository.findRandomActiveQuestions(
                command.getTopicId(), command.getDifficulty(), command.getTotalQuestions()
        );

        if (candidateQuestions.isEmpty()) {
            throw new BusinessException("No active questions found for the selected criteria.");
        }

        PracticeSession session = new PracticeSession(
                null,
                command.getUserId(),
                command.getAnonymousSessionId(),
                command.getSessionType(),
                candidateQuestions.size()
        );
        session.setQuestions(candidateQuestions);

        return sessionRepository.save(session);
    }

    @Override
    @Transactional
    public AttemptResult submitAnswer(SubmitAnswerCommand command) {
        log.debug("Submitting answer for session: {}, question: {}, option: {}",
                command.getSessionId(), command.getQuestionId(), command.getSelectedOption());

        PracticeSession session = sessionRepository.findById(command.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Practice session", command.getSessionId()));

        if (!session.canAcceptAttempt()) {
            throw new BusinessException("Session is already closed or abandoned. No more attempts allowed.");
        }

        if (sessionRepository.existsAttempt(command.getSessionId(), command.getQuestionId())) {
            throw new BusinessException("Question has already been answered in this session.");
        }

        Question question = questionRepository.findById(command.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question", command.getQuestionId()));

        boolean isCorrect = question.isOptionCorrect(command.getSelectedOption());
        if (isCorrect) {
            session.incrementCorrectCount();
            sessionRepository.save(session);
        }

        StudentAttempt attempt = new StudentAttempt(
                null,
                session.getId(),
                question.getId(),
                command.getSelectedOption(),
                isCorrect,
                command.getTimeSpentSeconds()
        );
        StudentAttempt savedAttempt = sessionRepository.saveAttempt(attempt);

        QuestionResolution res = question.getResolution();
        String baseExplanation = res != null ? res.getBaseExplanation() : "Explanation not yet available.";
        String keyConcepts = res != null ? res.getKeyConcepts() : null;
        String authorAttribution = res != null ? res.getAuthorAttribution() : null;

        return new AttemptResult(
                savedAttempt.getId(),
                session.getId(),
                question.getId(),
                command.getSelectedOption(),
                isCorrect,
                question.getCorrectOption(),
                baseExplanation,
                keyConcepts,
                authorAttribution
        );
    }

    @Override
    @Transactional
    public DiagnosticReport completeSession(UUID sessionId) {
        log.info("Completing practice session and calculating diagnostic report: {}", sessionId);

        PracticeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Practice session", sessionId));

        if (session.canAcceptAttempt()) {
            session.complete();
            sessionRepository.save(session);
        }

        // Return existing report if already computed
        return diagnosticReportRepository.findBySessionId(sessionId).orElseGet(() -> {
            List<StudentAttempt> attempts = sessionRepository.findAttemptsBySessionId(sessionId);

            // Group performance by topic
            Map<String, int[]> topicStats = new HashMap<>(); // [total, correct]
            Map<String, String> topicDisciplines = new HashMap<>();

            for (StudentAttempt attempt : attempts) {
                Question q = questionRepository.findById(attempt.getQuestionId()).orElse(null);
                if (q != null) {
                    String topicName = q.getTopicName() != null ? q.getTopicName() : "General";
                    String discipline = q.getDiscipline() != null ? q.getDiscipline() : "Geral";

                    topicStats.putIfAbsent(topicName, new int[]{0, 0});
                    topicDisciplines.putIfAbsent(topicName, discipline);

                    topicStats.get(topicName)[0]++;
                    if (attempt.isCorrect()) {
                        topicStats.get(topicName)[1]++;
                    }
                }
            }

            Map<String, TopicPerformance> topicBreakdown = new HashMap<>();
            List<String> recommendedTopics = new ArrayList<>();

            for (Map.Entry<String, int[]> entry : topicStats.entrySet()) {
                String topicName = entry.getKey();
                int total = entry.getValue()[0];
                int correct = entry.getValue()[1];
                String discipline = topicDisciplines.get(topicName);

                TopicPerformance performance = new TopicPerformance(topicName, discipline, total, correct);
                topicBreakdown.put(topicName, performance);

                if (performance.getMasteryLevel() == MasteryLevel.CRITICAL ||
                        performance.getMasteryLevel() == MasteryLevel.ATTENTION_NEEDED) {
                    recommendedTopics.add(topicName);
                }
            }

            DiagnosticReport report = new DiagnosticReport(
                    null,
                    session.getId(),
                    session.getScorePercentage(),
                    topicBreakdown,
                    recommendedTopics
            );

            return diagnosticReportRepository.save(report);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public PracticeSession getSession(UUID sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Practice session", sessionId));
    }

    @Override
    @Transactional(readOnly = true)
    public DiagnosticReport getDiagnosticReport(UUID sessionId) {
        return diagnosticReportRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnostic report for session", sessionId));
    }
}
