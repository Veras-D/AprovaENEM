package com.aprovaenem.exam.application.service;

import com.aprovaenem.exam.domain.model.InstitutionalAreaBreakdown;
import com.aprovaenem.exam.domain.model.InstitutionalCohortDiagnostics;
import com.aprovaenem.exam.domain.model.InstitutionalDistractorPitfall;
import com.aprovaenem.exam.domain.port.out.InstitutionalDiagnosticsRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("InstitutionalDiagnosticsService Unit Tests")
class InstitutionalDiagnosticsServiceTest {

    @Mock
    private InstitutionalDiagnosticsRepositoryPort repository;

    @InjectMocks
    private InstitutionalDiagnosticsService service;

    private List<InstitutionalAreaBreakdown> mockAreas;
    private List<InstitutionalDistractorPitfall> mockPitfalls;

    @BeforeEach
    void setUp() {
        mockAreas = List.of(
                InstitutionalAreaBreakdown.builder()
                        .subjectArea("MATHEMATICS")
                        .areaName("Matemática e suas Tecnologias")
                        .averageScorePercentage(68.2)
                        .status("ATTENTION_NEEDED")
                        .topWeakTopic("Funções Trigonométricas")
                        .build(),
                InstitutionalAreaBreakdown.builder()
                        .subjectArea("NATURAL_SCIENCES")
                        .areaName("Ciências da Natureza")
                        .averageScorePercentage(71.0)
                        .status("MASTERED")
                        .topWeakTopic("Termodinâmica e Calorimetria")
                        .build()
        );

        mockPitfalls = List.of(
                InstitutionalDistractorPitfall.builder()
                        .questionId("q-1")
                        .questionTitle("ENEM - Física / Dinâmica Circular")
                        .correctOption("C")
                        .misleadingOption("B")
                        .failedPercentage(46.2)
                        .pedagogicalExplanation("Confusão de raio de curvatura.")
                        .build()
        );
    }

    @Test
    @DisplayName("Should aggregate real cohort diagnostics when database has active sessions")
    void shouldAggregateCohortDiagnosticsWithActiveData() {
        when(repository.countDistinctActiveStudents()).thenReturn(35L);
        when(repository.countCompletedSessions()).thenReturn(120L);
        when(repository.calculateOverallAverageScorePercentage()).thenReturn(72.5);
        when(repository.calculateAreasBreakdown()).thenReturn(mockAreas);
        when(repository.findTopDistractorPitfalls(3)).thenReturn(mockPitfalls);

        InstitutionalCohortDiagnostics result = service.getCohortDiagnostics("cohort-general");

        assertThat(result).isNotNull();
        assertThat(result.getCohortId()).isEqualTo("cohort-general");
        assertThat(result.getCohortName()).isEqualTo("3º Ano EM — Visão Geral");
        assertThat(result.getTotalEnrolledStudents()).isEqualTo(42);
        assertThat(result.getActiveParticipants()).isEqualTo(35);
        assertThat(result.getParticipationRate()).isEqualTo(83.3);
        assertThat(result.getAverageScorePercentage()).isEqualTo(72.5);
        assertThat(result.getAreasBreakdown()).hasSize(2);
        assertThat(result.getCommonDistractorPitfalls()).hasSize(1);
        assertThat(result.getGeneratedAt()).isNotNull();

        verify(repository).countDistinctActiveStudents();
        verify(repository).countCompletedSessions();
        verify(repository).calculateOverallAverageScorePercentage();
        verify(repository).calculateAreasBreakdown();
        verify(repository).findTopDistractorPitfalls(3);
    }

    @Test
    @DisplayName("Should fall back to baseline active metrics when database has 0 completed sessions")
    void shouldFallbackWhenZeroCompletedSessions() {
        when(repository.countDistinctActiveStudents()).thenReturn(0L);
        when(repository.countCompletedSessions()).thenReturn(0L);
        when(repository.calculateOverallAverageScorePercentage()).thenReturn(null);
        when(repository.calculateAreasBreakdown()).thenReturn(mockAreas);
        when(repository.findTopDistractorPitfalls(3)).thenReturn(mockPitfalls);

        InstitutionalCohortDiagnostics result = service.getCohortDiagnostics(null);

        assertThat(result).isNotNull();
        assertThat(result.getCohortId()).isEqualTo("cohort-general");
        assertThat(result.getActiveParticipants()).isEqualTo(39);
        assertThat(result.getTotalEnrolledStudents()).isEqualTo(42);
        assertThat(result.getParticipationRate()).isEqualTo(92.9);
        assertThat(result.getAverageScorePercentage()).isEqualTo(69.6);
    }
}
