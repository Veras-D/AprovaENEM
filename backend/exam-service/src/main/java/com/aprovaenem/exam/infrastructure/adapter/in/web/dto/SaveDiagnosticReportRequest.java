package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import com.aprovaenem.exam.domain.model.RadarArea;
import com.aprovaenem.exam.domain.model.TopicPerformance;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveDiagnosticReportRequest {

    @NotNull(message = "Score percentage is required")
    @DecimalMin(value = "0.0", message = "Score percentage cannot be negative")
    @DecimalMax(value = "100.0", message = "Score percentage cannot exceed 100")
    private BigDecimal scorePercentage;

    private Map<String, TopicPerformance> topicBreakdown;

    private List<String> recommendedTopics;

    private List<RadarArea> radar;
}
