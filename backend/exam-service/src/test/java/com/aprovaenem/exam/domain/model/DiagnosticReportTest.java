package com.aprovaenem.exam.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("DiagnosticReport Domain Model Unit Tests")
class DiagnosticReportTest {

    @Test
    @DisplayName("Should assemble DiagnosticReport with overall score, topic breakdowns, and revision recommendations")
    void shouldAssembleDiagnosticReport() {
        UUID reportId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        Map<String, TopicPerformance> breakdown = new HashMap<>();
        breakdown.put("Eletrodinâmica", new TopicPerformance("Eletrodinâmica", "Física", 5, 4));
        breakdown.put("Geometria Espacial", new TopicPerformance("Geometria Espacial", "Matemática", 5, 2));

        List<String> recommendations = List.of("Geometria Espacial: Estudo de Cilindros e Cones");

        DiagnosticReport report = new DiagnosticReport(
                reportId,
                sessionId,
                new BigDecimal("60.00"),
                breakdown,
                recommendations
        );

        assertThat(report.getId()).isEqualTo(reportId);
        assertThat(report.getSessionId()).isEqualTo(sessionId);
        assertThat(report.getScorePercentage()).isEqualByComparingTo("60.00");
        assertThat(report.getTopicBreakdown()).hasSize(2);
        assertThat(report.getTopicBreakdown().get("Eletrodinâmica").getMasteryLevel()).isEqualTo(MasteryLevel.MASTERED);
        assertThat(report.getTopicBreakdown().get("Geometria Espacial").getMasteryLevel()).isEqualTo(MasteryLevel.CRITICAL);
        assertThat(report.getRecommendedTopics()).containsExactly("Geometria Espacial: Estudo de Cilindros e Cones");
        assertThat(report.getGeneratedAt()).isNotNull();
    }
}
