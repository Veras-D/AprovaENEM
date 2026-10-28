package com.aprovaenem.exam.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.exam.domain.model.DiagnosticReport;
import com.aprovaenem.exam.domain.model.RadarArea;
import com.aprovaenem.exam.domain.model.TopicPerformance;
import com.aprovaenem.exam.domain.port.out.DiagnosticReportRepositoryPort;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.DiagnosticSummaryEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.PracticeSessionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataDiagnosticSummaryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DiagnosticReportRepositoryAdapter implements DiagnosticReportRepositoryPort {

    private static final String ENVELOPE_VERSION_KEY = "version";
    private static final String ENVELOPE_TOPICS_KEY = "topics";
    private static final String ENVELOPE_RADAR_KEY = "radar";

    private final SpringDataDiagnosticSummaryRepository summaryRepository;
    private final ObjectMapper objectMapper;
    private final EntityManager entityManager;

    @Override
    public DiagnosticReport save(DiagnosticReport report) {
        DiagnosticSummaryEntity entity = toEntity(report);
        DiagnosticSummaryEntity saved = summaryRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<DiagnosticReport> findBySessionId(UUID sessionId) {
        return summaryRepository.findBySessionId(sessionId).map(this::toDomain);
    }

    @Override
    public Optional<DiagnosticReport> findLatestByUserId(UUID userId) {
        if (userId == null) {
            return Optional.empty();
        }
        return summaryRepository.findByUserIdOrderByGeneratedAtDesc(userId).stream()
                .findFirst()
                .map(this::toDomain);
    }

    @Override
    public Optional<DiagnosticReport> findLatestByAnonymousSessionId(String anonymousSessionId) {
        if (anonymousSessionId == null || anonymousSessionId.isBlank()) {
            return Optional.empty();
        }
        return summaryRepository.findByAnonymousSessionIdOrderByGeneratedAtDesc(anonymousSessionId).stream()
                .findFirst()
                .map(this::toDomain);
    }

    private DiagnosticReport toDomain(DiagnosticSummaryEntity entity) {
        if (entity == null) {
            return null;
        }

        Map<String, TopicPerformance> topicBreakdown = Collections.emptyMap();
        List<RadarArea> radar = Collections.emptyList();
        List<String> recommendedTopics = Collections.emptyList();

        try {
            if (entity.getTopicBreakdown() != null) {
                JsonNode root = objectMapper.readTree(entity.getTopicBreakdown());
                if (root.isObject() && root.has(ENVELOPE_VERSION_KEY)) {
                    topicBreakdown = objectMapper.convertValue(
                            root.path(ENVELOPE_TOPICS_KEY),
                            new TypeReference<Map<String, TopicPerformance>>() {}
                    );
                    radar = objectMapper.convertValue(
                            root.path(ENVELOPE_RADAR_KEY),
                            new TypeReference<List<RadarArea>>() {}
                    );
                } else {
                    topicBreakdown = objectMapper.convertValue(
                            root,
                            new TypeReference<Map<String, TopicPerformance>>() {}
                    );
                }
            }
            if (entity.getRecommendedTopics() != null) {
                recommendedTopics = objectMapper.readValue(
                        entity.getRecommendedTopics(),
                        new TypeReference<List<String>>() {}
                );
            }
        } catch (JsonProcessingException | IllegalArgumentException e) {
            log.error("Failed to deserialize diagnostic JSONB data for summary id: {}", entity.getId(), e);
        }

        DiagnosticReport report = new DiagnosticReport(
                entity.getId(),
                entity.getSession() != null ? entity.getSession().getId() : null,
                entity.getScorePercentage(),
                topicBreakdown,
                recommendedTopics
        );
        report.setRadar(radar);
        report.setGeneratedAt(entity.getGeneratedAt());
        return report;
    }

    private DiagnosticSummaryEntity toEntity(DiagnosticReport domain) {
        if (domain == null) {
            return null;
        }

        String breakdownJson = "{}";
        String recommendedJson = "[]";

        try {
            Map<String, Object> envelope = new LinkedHashMap<>();
            envelope.put(ENVELOPE_VERSION_KEY, 2);
            envelope.put(ENVELOPE_TOPICS_KEY, domain.getTopicBreakdown());
            envelope.put(ENVELOPE_RADAR_KEY, domain.getRadar());
            breakdownJson = objectMapper.writeValueAsString(envelope);
            if (domain.getRecommendedTopics() != null) {
                recommendedJson = objectMapper.writeValueAsString(domain.getRecommendedTopics());
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize diagnostic report to JSON", e);
        }

        return DiagnosticSummaryEntity.builder()
                .id(domain.getId())
                .session(entityManager.getReference(PracticeSessionEntity.class, domain.getSessionId()))
                .scorePercentage(domain.getScorePercentage())
                .topicBreakdown(breakdownJson)
                .recommendedTopics(recommendedJson)
                .generatedAt(domain.getGeneratedAt() != null ? domain.getGeneratedAt() : Instant.now())
                .build();
    }
}
