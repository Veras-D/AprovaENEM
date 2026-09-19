package com.aprovaenem.exam.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class DiagnosticReport {

    private UUID id;
    private UUID sessionId;
    private BigDecimal scorePercentage;
    private Map<String, TopicPerformance> topicBreakdown = new HashMap<>();
    private List<String> recommendedTopics = new ArrayList<>();
    private Instant generatedAt;

    public DiagnosticReport() {
        this.generatedAt = Instant.now();
    }

    public DiagnosticReport(
            UUID id,
            UUID sessionId,
            BigDecimal scorePercentage,
            Map<String, TopicPerformance> topicBreakdown,
            List<String> recommendedTopics
    ) {
        this.id = id;
        this.sessionId = sessionId;
        this.scorePercentage = scorePercentage;
        this.topicBreakdown = topicBreakdown != null ? topicBreakdown : new HashMap<>();
        this.recommendedTopics = recommendedTopics != null ? recommendedTopics : new ArrayList<>();
        this.generatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public BigDecimal getScorePercentage() {
        return scorePercentage;
    }

    public void setScorePercentage(BigDecimal scorePercentage) {
        this.scorePercentage = scorePercentage;
    }

    public Map<String, TopicPerformance> getTopicBreakdown() {
        return topicBreakdown;
    }

    public void setTopicBreakdown(Map<String, TopicPerformance> topicBreakdown) {
        this.topicBreakdown = topicBreakdown != null ? topicBreakdown : new HashMap<>();
    }

    public List<String> getRecommendedTopics() {
        return recommendedTopics;
    }

    public void setRecommendedTopics(List<String> recommendedTopics) {
        this.recommendedTopics = recommendedTopics != null ? recommendedTopics : new ArrayList<>();
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }
}
