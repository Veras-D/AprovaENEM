package com.aprovaenem.exam.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class InstitutionalCohortDiagnostics {
    private final String cohortId;
    private final String cohortName;
    private final String tenantId;
    private final int totalEnrolledStudents;
    private final int activeParticipants;
    private final double participationRate;
    private final double averageScorePercentage;
    private final List<InstitutionalAreaBreakdown> areasBreakdown;
    private final List<InstitutionalDistractorPitfall> commonDistractorPitfalls;
    private final Instant generatedAt;
}
