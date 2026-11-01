package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionalCohortDiagnosticResponse {
    private String cohortId;
    private String cohortName;
    private String tenantId;
    private int totalEnrolledStudents;
    private int activeParticipants;
    private double participationRate;
    private double averageScorePercentage;
    private List<AreaBreakdownDto> areasBreakdown;
    private List<DistractorPitfallDto> commonDistractorPitfalls;
    private String generatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AreaBreakdownDto {
        private String subjectArea;
        private String areaName;
        private double averageScorePercentage;
        private String status;
        private String topWeakTopic;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DistractorPitfallDto {
        private String questionId;
        private String questionTitle;
        private String correctOption;
        private String misleadingOption;
        private double failedPercentage;
        private String pedagogicalExplanation;
    }
}
