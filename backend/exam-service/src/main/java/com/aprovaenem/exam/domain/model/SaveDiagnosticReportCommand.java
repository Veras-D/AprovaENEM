package com.aprovaenem.exam.domain.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class SaveDiagnosticReportCommand {

    private UUID userId;
    private String anonymousSessionId;
    private BigDecimal scorePercentage;
    private Map<String, TopicPerformance> topicBreakdown = new HashMap<>();
    private List<String> recommendedTopics = new ArrayList<>();
    private List<RadarArea> radar = new ArrayList<>();

    public SaveDiagnosticReportCommand() {
    }

    public SaveDiagnosticReportCommand(
            UUID userId,
            String anonymousSessionId,
            BigDecimal scorePercentage,
            Map<String, TopicPerformance> topicBreakdown,
            List<String> recommendedTopics
    ) {
        this.userId = userId;
        this.anonymousSessionId = anonymousSessionId;
        this.scorePercentage = scorePercentage != null ? scorePercentage : BigDecimal.ZERO;
        this.topicBreakdown = topicBreakdown != null ? topicBreakdown : new HashMap<>();
        this.recommendedTopics = recommendedTopics != null ? recommendedTopics : new ArrayList<>();
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getAnonymousSessionId() {
        return anonymousSessionId;
    }

    public void setAnonymousSessionId(String anonymousSessionId) {
        this.anonymousSessionId = anonymousSessionId;
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
        this.topicBreakdown = topicBreakdown;
    }

    public List<RadarArea> getRadar() {
        return radar;
    }

    public void setRadar(List<RadarArea> radar) {
        this.radar = radar != null ? radar : new ArrayList<>();
    }

    public List<String> getRecommendedTopics() {
        return recommendedTopics;
    }

    public void setRecommendedTopics(List<String> recommendedTopics) {
        this.recommendedTopics = recommendedTopics;
    }
}
