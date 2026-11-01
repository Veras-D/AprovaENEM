package com.aprovaenem.exam.infrastructure.adapter.in.web;

import com.aprovaenem.common.exception.AccessDeniedException;
import com.aprovaenem.exam.domain.model.InstitutionalCohortDiagnostics;
import com.aprovaenem.exam.domain.port.in.InstitutionalDiagnosticsUseCase;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.InstitutionalCohortDiagnosticResponse;
import com.aprovaenem.exam.infrastructure.security.JwtTokenValidator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/institutional/cohorts")
@RequiredArgsConstructor
@Tag(name = "Institutional Diagnostics", description = "Aggregated pedagogical diagnostic metrics and distractor analysis for school coordinators")
public class InstitutionalDiagnosticsController {

    private final InstitutionalDiagnosticsUseCase useCase;
    private final JwtTokenValidator jwtValidator;

    @GetMapping("/{cohortId}/diagnostics")
    @Operation(summary = "Get aggregated cohort diagnostics for pedagogical coordinators")
    public ResponseEntity<InstitutionalCohortDiagnosticResponse> getCohortDiagnostics(
            @PathVariable("cohortId") String cohortId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader
    ) {
        validateCoordinatorAccess(authHeader);
        InstitutionalCohortDiagnostics diagnostics = useCase.getCohortDiagnostics(cohortId);
        return ResponseEntity.ok(toResponse(diagnostics));
    }

    private void validateCoordinatorAccess(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AccessDeniedException("Authentication required to access institutional coordinator analytics.");
        }
        String token = authHeader.substring(7);
        if (!jwtValidator.validateToken(token)) {
            throw new AccessDeniedException("Invalid or expired authentication token.");
        }
        String role = jwtValidator.extractRole(token);
        if (!"ROLE_ADMIN".equals(role) && !"ROLE_INSTITUTIONAL_ADMIN".equals(role)) {
            throw new AccessDeniedException("Forbidden: coordinator or administrator role required.");
        }
    }

    private InstitutionalCohortDiagnosticResponse toResponse(InstitutionalCohortDiagnostics d) {
        return InstitutionalCohortDiagnosticResponse.builder()
                .cohortId(d.getCohortId())
                .cohortName(d.getCohortName())
                .tenantId(d.getTenantId())
                .totalEnrolledStudents(d.getTotalEnrolledStudents())
                .activeParticipants(d.getActiveParticipants())
                .participationRate(d.getParticipationRate())
                .averageScorePercentage(d.getAverageScorePercentage())
                .areasBreakdown(d.getAreasBreakdown().stream()
                        .map(a -> InstitutionalCohortDiagnosticResponse.AreaBreakdownDto.builder()
                                .subjectArea(a.getSubjectArea())
                                .areaName(a.getAreaName())
                                .averageScorePercentage(a.getAverageScorePercentage())
                                .status(a.getStatus())
                                .topWeakTopic(a.getTopWeakTopic())
                                .build())
                        .toList())
                .commonDistractorPitfalls(d.getCommonDistractorPitfalls().stream()
                        .map(p -> InstitutionalCohortDiagnosticResponse.DistractorPitfallDto.builder()
                                .questionId(p.getQuestionId())
                                .questionTitle(p.getQuestionTitle())
                                .correctOption(p.getCorrectOption())
                                .misleadingOption(p.getMisleadingOption())
                                .failedPercentage(p.getFailedPercentage())
                                .pedagogicalExplanation(p.getPedagogicalExplanation())
                                .build())
                        .toList())
                .generatedAt(d.getGeneratedAt().toString())
                .build();
    }
}
