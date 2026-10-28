package com.aprovaenem.exam.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.exam.domain.model.DiagnosticReport;
import com.aprovaenem.exam.domain.model.MasteryLevel;
import com.aprovaenem.exam.domain.model.RadarArea;
import com.aprovaenem.exam.domain.model.TopicPerformance;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.DiagnosticSummaryEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.PracticeSessionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataDiagnosticSummaryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DiagnosticReportRepositoryAdapter Unit Tests")
class DiagnosticReportRepositoryAdapterTest {

    @Mock
    private SpringDataDiagnosticSummaryRepository summaryRepository;

    @Mock
    private EntityManager entityManager;

    private ObjectMapper objectMapper = new ObjectMapper();

    private DiagnosticReportRepositoryAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new DiagnosticReportRepositoryAdapter(summaryRepository, objectMapper, entityManager);
    }

    @Test
    @DisplayName("Should save diagnostic report and convert to/from JSONB entity")
    void shouldSaveAndFindDiagnosticReport() throws Exception {
        UUID reportId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        TopicPerformance perf = new TopicPerformance("Eletrodinâmica", "Física", 10, 8);
        DiagnosticReport report = new DiagnosticReport(
                reportId,
                sessionId,
                new BigDecimal("80.00"),
                Map.of("Eletrodinâmica", perf),
                List.of("Cinemática")
        );

        PracticeSessionEntity sessionEntity = PracticeSessionEntity.builder().id(sessionId).build();
        when(entityManager.getReference(eq(PracticeSessionEntity.class), eq(sessionId))).thenReturn(sessionEntity);

        String breakdownJson = objectMapper.writeValueAsString(Map.of("Eletrodinâmica", perf));
        String recommendedJson = objectMapper.writeValueAsString(List.of("Cinemática"));

        DiagnosticSummaryEntity entity = DiagnosticSummaryEntity.builder()
                .id(reportId)
                .session(sessionEntity)
                .scorePercentage(new BigDecimal("80.00"))
                .topicBreakdown(breakdownJson)
                .recommendedTopics(recommendedJson)
                .generatedAt(Instant.now())
                .build();

        when(summaryRepository.save(any(DiagnosticSummaryEntity.class))).thenReturn(entity);
        when(summaryRepository.findBySessionId(sessionId)).thenReturn(Optional.of(entity));

        DiagnosticReport saved = adapter.save(report);
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isEqualTo(reportId);
        assertThat(saved.getRecommendedTopics()).contains("Cinemática");

        Optional<DiagnosticReport> found = adapter.findBySessionId(sessionId);
        assertThat(found).isPresent();
        assertThat(found.get().getScorePercentage()).isEqualByComparingTo(new BigDecimal("80.00"));
        assertThat(found.get().getTopicBreakdown()).containsKey("Eletrodinâmica");
    }

    @Test
    @DisplayName("Should handle corrupted JSON gracefully in toDomain")
    void shouldHandleCorruptedJsonGracefully() {
        UUID reportId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        PracticeSessionEntity sessionEntity = PracticeSessionEntity.builder().id(sessionId).build();

        DiagnosticSummaryEntity entity = DiagnosticSummaryEntity.builder()
                .id(reportId)
                .session(sessionEntity)
                .scorePercentage(new BigDecimal("50.00"))
                .topicBreakdown("invalid-json")
                .recommendedTopics("invalid-json")
                .generatedAt(Instant.now())
                .build();

        when(summaryRepository.findBySessionId(sessionId)).thenReturn(Optional.of(entity));

        Optional<DiagnosticReport> found = adapter.findBySessionId(sessionId);
        assertThat(found).isPresent();
        assertThat(found.get().getTopicBreakdown()).isEmpty();
        assertThat(found.get().getRecommendedTopics()).isEmpty();
    }

    @Test
    @DisplayName("Should persist per-area radar in the JSONB column and read it back unchanged")
    void shouldRoundTripRadarAreas() {
        UUID reportId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        PracticeSessionEntity sessionEntity = PracticeSessionEntity.builder().id(sessionId).build();
        when(entityManager.getReference(eq(PracticeSessionEntity.class), eq(sessionId))).thenReturn(sessionEntity);

        RadarArea math = new RadarArea();
        math.setKnowledgeArea("MT");
        math.setAreaName("Matemática e suas Tecnologias");
        math.setScorePercentage(new BigDecimal("75.00"));
        math.setTotalQuestions(15);
        math.setCorrectQuestions(11);
        math.setMasteryLevel("MASTERED");
        math.setTopWeakTopic("Geometria Espacial");

        DiagnosticReport report = new DiagnosticReport(
                reportId, sessionId, new BigDecimal("75.00"), Map.of(), List.of("Matemática"));
        report.setRadar(List.of(math));

        ArgumentCaptor<DiagnosticSummaryEntity> captor = ArgumentCaptor.forClass(DiagnosticSummaryEntity.class);
        when(summaryRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        adapter.save(report);

        DiagnosticSummaryEntity persisted = captor.getValue();
        assertThat(persisted.getTopicBreakdown()).contains("\"radar\"").contains("Geometria Espacial");

        when(summaryRepository.findBySessionId(sessionId)).thenReturn(Optional.of(persisted));
        DiagnosticReport loaded = adapter.findBySessionId(sessionId).orElseThrow();

        assertThat(loaded.getRadar()).hasSize(1);
        RadarArea loadedMath = loaded.getRadar().get(0);
        assertThat(loadedMath.getKnowledgeArea()).isEqualTo("MT");
        assertThat(loadedMath.getCorrectQuestions()).isEqualTo(11);
        assertThat(loadedMath.getTotalQuestions()).isEqualTo(15);
        assertThat(loadedMath.getTopWeakTopic()).isEqualTo("Geometria Espacial");
        assertThat(loadedMath.getScorePercentage()).isEqualByComparingTo(new BigDecimal("75.00"));
    }

    @Test
    @DisplayName("Should handle null entity and domain gracefully")
    void shouldHandleNullConversions() {
        assertThat(adapter.save(null)).isNull();
    }

    @Test
    @DisplayName("Should handle null breakdowns and session in entity")
    void shouldHandleNullFieldsInEntityAndDomain() {
        UUID reportId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        DiagnosticReport bareDomain = new DiagnosticReport(
                reportId, sessionId, new BigDecimal("60.00"), null, null
        );

        when(entityManager.getReference(eq(PracticeSessionEntity.class), eq(sessionId)))
                .thenReturn(PracticeSessionEntity.builder().id(sessionId).build());

        DiagnosticSummaryEntity bareEntity = DiagnosticSummaryEntity.builder()
                .id(reportId)
                .session(null)
                .scorePercentage(new BigDecimal("60.00"))
                .topicBreakdown(null)
                .recommendedTopics(null)
                .generatedAt(null)
                .build();

        when(summaryRepository.save(any(DiagnosticSummaryEntity.class))).thenReturn(bareEntity);

        DiagnosticReport saved = adapter.save(bareDomain);
        assertThat(saved).isNotNull();
        assertThat(saved.getSessionId()).isNull();
        assertThat(saved.getTopicBreakdown()).isEmpty();
        assertThat(saved.getRecommendedTopics()).isEmpty();
    }

    @Test
    @DisplayName("Should find latest diagnostic report by userId and anonymousSessionId")
    void shouldFindLatestReports() {
        UUID userId = UUID.randomUUID();
        String anonId = "anon-xyz";

        DiagnosticSummaryEntity entity = DiagnosticSummaryEntity.builder()
                .id(UUID.randomUUID())
                .scorePercentage(new BigDecimal("70.00"))
                .generatedAt(Instant.now())
                .build();

        when(summaryRepository.findByUserIdOrderByGeneratedAtDesc(userId)).thenReturn(List.of(entity));
        when(summaryRepository.findByAnonymousSessionIdOrderByGeneratedAtDesc(anonId)).thenReturn(List.of(entity));

        Optional<DiagnosticReport> byUser = adapter.findLatestByUserId(userId);
        Optional<DiagnosticReport> byAnon = adapter.findLatestByAnonymousSessionId(anonId);

        assertThat(byUser).isPresent();
        assertThat(byAnon).isPresent();
        assertThat(adapter.findLatestByUserId(null)).isEmpty();
        assertThat(adapter.findLatestByAnonymousSessionId(null)).isEmpty();
    }
}
