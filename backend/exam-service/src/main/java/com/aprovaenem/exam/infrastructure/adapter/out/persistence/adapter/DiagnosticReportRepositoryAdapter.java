package com.aprovaenem.exam.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.exam.domain.model.DiagnosticReport;
import com.aprovaenem.exam.domain.model.TopicPerformance;
import com.aprovaenem.exam.domain.port.out.DiagnosticReportRepositoryPort;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.DiagnosticSummaryEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.PracticeSessionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataDiagnosticSummaryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DiagnosticReportRepositoryAdapter implements DiagnosticReportRepositoryPort {

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

    private DiagnosticReport toDomain(DiagnosticSummaryEntity entity) {
        if (entity == null) {
            return null;
        }

        Map<String, TopicPerformance> topicBreakdown = Collections.emptyMap();
        List<String> recommendedTopics = Collections.emptyList();

        try {
            if (entity.getTopicBreakdown() != null) {
                topicBreakdown = objectMapper.readValue(
                        entity.getTopicBreakdown(),
                        new TypeReference<Map<String, TopicPerformance>>() {}
                );
            }
            if (entity.getRecommendedTopics() != null) {
                recommendedTopics = objectMapper.readValue(
                        entity.getRecommendedTopics(),
                        new TypeReference<List<String>>() {}
                );
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize diagnostic JSONB data for summary id: {}", entity.getId(), e);
        }

        return new DiagnosticReport(
                entity.getId(),
                entity.getSession() != null ? entity.getSession().getId() : null,
                entity.getScorePercentage(),
                topicBreakdown,
                recommendedTopics
        );
    }

    private DiagnosticSummaryEntity toEntity(DiagnosticReport domain) {
        if (domain == null) {
            return null;
        }

        String breakdownJson = "{}";
        String recommendedJson = "[]";

        try {
            if (domain.getTopicBreakdown() != null) {
                breakdownJson = objectMapper.writeValueAsString(domain.getTopicBreakdown());
            }
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
