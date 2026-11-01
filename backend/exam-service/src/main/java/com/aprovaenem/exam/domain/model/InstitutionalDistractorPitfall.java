package com.aprovaenem.exam.domain.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InstitutionalDistractorPitfall {
    private final String questionId;
    private final String questionTitle;
    private final String correctOption;
    private final String misleadingOption;
    private final double failedPercentage;
    private final String pedagogicalExplanation;
}
