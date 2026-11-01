package com.aprovaenem.exam.domain.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InstitutionalAreaBreakdown {
    private final String subjectArea;
    private final String areaName;
    private final double averageScorePercentage;
    private final String status;
    private final String topWeakTopic;
}
