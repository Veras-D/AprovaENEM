package com.aprovaenem.exam.infrastructure.adapter.in.web;

import com.aprovaenem.common.exception.BusinessException;
import com.aprovaenem.exam.domain.model.AttemptResult;
import com.aprovaenem.exam.domain.model.DiagnosticReport;
import com.aprovaenem.exam.domain.model.PracticeSession;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.StartSessionCommand;
import com.aprovaenem.exam.domain.model.SubmitAnswerCommand;
import com.aprovaenem.exam.domain.port.in.PracticeSessionUseCase;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.AttemptResultResponse;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.DiagnosticReportResponse;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.PracticeSessionResponse;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.QuestionSummaryDto;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.StartSessionRequest;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.SubmitAnswerRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.aprovaenem.common.exception.AccessDeniedException;
import com.aprovaenem.exam.infrastructure.security.JwtTokenValidator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping({"/api/v1/practice/sessions", "/api/v1/sessions"})
@RequiredArgsConstructor
public class PracticeSessionController {

    private final PracticeSessionUseCase sessionUseCase;
    private final JwtTokenValidator jwtValidator;

    @PostMapping
    public ResponseEntity<PracticeSessionResponse> startSession(
            @Valid @RequestBody(required = false) StartSessionRequest request,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            HttpServletRequest httpRequest
    ) {
        UUID resolvedUserId = resolveUserIdFromToken(authHeader);
        String sessionId = resolveSessionId(request, sessionHeader, resolvedUserId);
        StartSessionCommand command = buildStartSessionCommand(request, resolvedUserId, sessionId);

        PracticeSession session = sessionUseCase.startSession(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(toSessionResponse(session));
    }

    private UUID resolveUserIdFromToken(String authHeader) {
        String token = resolveToken(authHeader);
        if (token == null) {
            return null;
        }
        if (!jwtValidator.validateToken(token)) {
            throw new AccessDeniedException("Invalid or expired authentication token.");
        }
        return jwtValidator.extractUserId(token);
    }

    private String resolveSessionId(StartSessionRequest request, String sessionHeader, UUID resolvedUserId) {
        String sessionId = null;
        if (request != null && request.getAnonymousSessionId() != null && !request.getAnonymousSessionId().isBlank()) {
            sessionId = request.getAnonymousSessionId();
        } else if (sessionHeader != null && !sessionHeader.isBlank()) {
            sessionId = sessionHeader;
        } else if (resolvedUserId != null) {
            sessionId = resolvedUserId.toString();
        }

        if (sessionId == null) {
            throw new BusinessException("Session ID is required (either in request body or X-Session-Id header).");
        }
        return sessionId;
    }

    private StartSessionCommand buildStartSessionCommand(StartSessionRequest request, UUID resolvedUserId, String sessionId) {
        if (request == null) {
            return new StartSessionCommand(resolvedUserId, sessionId, null, null, null, 10);
        }
        return new StartSessionCommand(
                resolvedUserId,
                sessionId,
                request.getSessionType(),
                request.getTopicId(),
                request.getDifficulty(),
                request.getTotalQuestions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PracticeSessionResponse> getSession(
            @PathVariable UUID id,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionHeader
    ) {
        PracticeSession session = sessionUseCase.getSession(id);
        validateSessionOwnership(session, authHeader, sessionHeader);
        return ResponseEntity.ok(toSessionResponse(session));
    }

    @PostMapping("/{id}/attempts")
    public ResponseEntity<AttemptResultResponse> submitAnswer(
            @PathVariable UUID id,
            @Valid @RequestBody SubmitAnswerRequest request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionHeader
    ) {
        PracticeSession session = sessionUseCase.getSession(id);
        validateSessionOwnership(session, authHeader, sessionHeader);

        SubmitAnswerCommand command = new SubmitAnswerCommand(
                id,
                request.getQuestionId(),
                request.getSelectedOption(),
                request.getTimeSpentSeconds()
        );

        AttemptResult result = sessionUseCase.submitAnswer(command);

        AttemptResultResponse response = AttemptResultResponse.builder()
                .attemptId(result.getAttemptId())
                .sessionId(result.getSessionId())
                .questionId(result.getQuestionId())
                .selectedOption(result.getSelectedOption())
                .isCorrect(result.isCorrect())
                .correctOption(result.getCorrectOption())
                .baseExplanation(result.getBaseExplanation())
                .keyConcepts(result.getKeyConcepts())
                .authorAttribution(result.getAuthorAttribution())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<DiagnosticReportResponse> completeSession(
            @PathVariable UUID id,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionHeader
    ) {
        PracticeSession session = sessionUseCase.getSession(id);
        validateSessionOwnership(session, authHeader, sessionHeader);

        DiagnosticReport report = sessionUseCase.completeSession(id);
        return ResponseEntity.ok(toDiagnosticResponse(report));
    }

    @GetMapping({"/{id}/diagnostic", "/{id}/report"})
    public ResponseEntity<DiagnosticReportResponse> getDiagnosticReport(
            @PathVariable UUID id,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionHeader
    ) {
        PracticeSession session = sessionUseCase.getSession(id);
        validateSessionOwnership(session, authHeader, sessionHeader);

        DiagnosticReport report = sessionUseCase.getDiagnosticReport(id);
        return ResponseEntity.ok(toDiagnosticResponse(report));
    }

    private void validateSessionOwnership(PracticeSession session, String authHeader, String sessionHeader) {
        String token = resolveToken(authHeader);
        if (token != null && jwtValidator.validateToken(token)) {
            String role = jwtValidator.extractRole(token);
            if ("ROLE_ADMIN".equals(role)) {
                return;
            }
            if (session.getUserId() != null && session.getUserId().equals(jwtValidator.extractUserId(token))) {
                return;
            }
        }

        if (session.getUserId() == null && sessionHeader != null && sessionHeader.equals(session.getAnonymousSessionId())) {
            return;
        }

        throw new AccessDeniedException("You are not authorized to access this practice session.");
    }

    private String resolveToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return null;
    }

    private PracticeSessionResponse toSessionResponse(PracticeSession session) {
        List<QuestionSummaryDto> questionDtos = session.getQuestions().stream()
                .map(this::toQuestionSummaryDto)
                .toList();

        return PracticeSessionResponse.builder()
                .id(session.getId())
                .userId(session.getUserId())
                .anonymousSessionId(session.getAnonymousSessionId())
                .sessionType(session.getSessionType().name())
                .status(session.getStatus().name())
                .totalQuestions(session.getTotalQuestions())
                .correctCount(session.getCorrectCount())
                .scorePercentage(session.getScorePercentage())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .questions(questionDtos)
                .build();
    }

    private QuestionSummaryDto toQuestionSummaryDto(Question q) {
        return QuestionDtoMapper.toSummaryDto(q);
    }

    private DiagnosticReportResponse toDiagnosticResponse(DiagnosticReport report) {
        return DiagnosticReportResponse.builder()
                .id(report.getId())
                .sessionId(report.getSessionId())
                .scorePercentage(report.getScorePercentage())
                .topicBreakdown(report.getTopicBreakdown())
                .recommendedTopics(report.getRecommendedTopics())
                .generatedAt(report.getGeneratedAt())
                .build();
    }
}
