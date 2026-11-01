package com.aprovaenem.exam.infrastructure.adapter.in.web;

import com.aprovaenem.exam.domain.model.InstitutionalAreaBreakdown;
import com.aprovaenem.exam.domain.model.InstitutionalCohortDiagnostics;
import com.aprovaenem.exam.domain.model.InstitutionalDistractorPitfall;
import com.aprovaenem.exam.domain.port.in.InstitutionalDiagnosticsUseCase;
import com.aprovaenem.exam.infrastructure.security.JwtTokenValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InstitutionalDiagnosticsController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("InstitutionalDiagnosticsController WebMvc Tests")
class InstitutionalDiagnosticsControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InstitutionalDiagnosticsUseCase useCase;

    @MockBean
    private JwtTokenValidator jwtValidator;

    @Test
    @DisplayName("GET /api/v1/institutional/cohorts/{cohortId}/diagnostics with coordinator token should return HTTP 200")
    void shouldReturnDiagnosticsForCoordinator() throws Exception {
        when(jwtValidator.validateToken("valid-coord-jwt")).thenReturn(true);
        when(jwtValidator.extractRole("valid-coord-jwt")).thenReturn("ROLE_INSTITUTIONAL_ADMIN");

        InstitutionalCohortDiagnostics diagnostics = InstitutionalCohortDiagnostics.builder()
                .cohortId("cohort-general")
                .cohortName("3º Ano EM — Visão Geral")
                .tenantId("tenant-aprovaenem")
                .totalEnrolledStudents(42)
                .activeParticipants(39)
                .participationRate(92.8)
                .averageScorePercentage(74.5)
                .areasBreakdown(List.of(
                        InstitutionalAreaBreakdown.builder()
                                .subjectArea("MATHEMATICS")
                                .areaName("Matemática e suas Tecnologias")
                                .averageScorePercentage(68.2)
                                .status("ATTENTION_NEEDED")
                                .topWeakTopic("Funções Trigonométricas")
                                .build()
                ))
                .commonDistractorPitfalls(List.of(
                        InstitutionalDistractorPitfall.builder()
                                .questionId("3fa85f64-5717-4562-b3fc-2c963f66afa6")
                                .questionTitle("ENEM - Física / Dinâmica Circular")
                                .correctOption("C")
                                .misleadingOption("B")
                                .failedPercentage(46.2)
                                .pedagogicalExplanation("Confusão de raio de curvatura.")
                                .build()
                ))
                .generatedAt(Instant.parse("2026-10-15T18:00:00Z"))
                .build();

        when(useCase.getCohortDiagnostics("cohort-general")).thenReturn(diagnostics);

        mockMvc.perform(get("/api/v1/institutional/cohorts/cohort-general/diagnostics")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer valid-coord-jwt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cohortId", is("cohort-general")))
                .andExpect(jsonPath("$.cohortName", is("3º Ano EM — Visão Geral")))
                .andExpect(jsonPath("$.totalEnrolledStudents", is(42)))
                .andExpect(jsonPath("$.activeParticipants", is(39)))
                .andExpect(jsonPath("$.participationRate", is(92.8)))
                .andExpect(jsonPath("$.averageScorePercentage", is(74.5)))
                .andExpect(jsonPath("$.areasBreakdown", hasSize(1)))
                .andExpect(jsonPath("$.areasBreakdown[0].subjectArea", is("MATHEMATICS")))
                .andExpect(jsonPath("$.commonDistractorPitfalls", hasSize(1)))
                .andExpect(jsonPath("$.commonDistractorPitfalls[0].correctOption", is("C")));
    }

    @Test
    @DisplayName("GET /api/v1/institutional/cohorts/{cohortId}/diagnostics without token should return HTTP 403")
    void shouldDenyWhenMissingAuth() throws Exception {
        mockMvc.perform(get("/api/v1/institutional/cohorts/cohort-general/diagnostics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/institutional/cohorts/{cohortId}/diagnostics with student token should return HTTP 403")
    void shouldDenyWhenStudentRole() throws Exception {
        when(jwtValidator.validateToken("student-jwt")).thenReturn(true);
        when(jwtValidator.extractRole("student-jwt")).thenReturn("ROLE_STUDENT");

        mockMvc.perform(get("/api/v1/institutional/cohorts/cohort-general/diagnostics")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer student-jwt"))
                .andExpect(status().isForbidden());
    }
}
