package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import com.aprovaenem.exam.domain.model.TopicPerformance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosticReportResponse {

    private UUID id;
    private UUID sessionId;
    private BigDecimal scorePercentage;
    private Map<String, TopicPerformance> topicBreakdown;
    private List<String> recommendedTopics;
    private Instant generatedAt;
}
