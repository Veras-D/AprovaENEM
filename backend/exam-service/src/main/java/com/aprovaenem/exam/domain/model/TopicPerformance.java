package com.aprovaenem.exam.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class TopicPerformance {

    private String topicName;
    private String discipline;
    private int totalQuestions;
    private int correctQuestions;
    private BigDecimal accuracyPercentage;
    private MasteryLevel masteryLevel;

    public TopicPerformance() {
    }

    public TopicPerformance(String topicName, String discipline, int totalQuestions, int correctQuestions) {
        this.topicName = topicName;
        this.discipline = discipline;
        this.totalQuestions = totalQuestions;
        this.correctQuestions = correctQuestions;
        this.accuracyPercentage = totalQuestions > 0
                ? BigDecimal.valueOf(correctQuestions)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        this.masteryLevel = evaluateMastery(this.accuracyPercentage);
    }

    private MasteryLevel evaluateMastery(BigDecimal accuracy) {
        if (accuracy.compareTo(BigDecimal.valueOf(70)) >= 0) {
            return MasteryLevel.MASTERED;
        } else if (accuracy.compareTo(BigDecimal.valueOf(50)) >= 0) {
            return MasteryLevel.ATTENTION_NEEDED;
        } else {
            return MasteryLevel.CRITICAL;
        }
    }

    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }

    public String getDiscipline() {
        return discipline;
    }

    public void setDiscipline(String discipline) {
        this.discipline = discipline;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getCorrectQuestions() {
        return correctQuestions;
    }

    public void setCorrectQuestions(int correctQuestions) {
        this.correctQuestions = correctQuestions;
    }

    public BigDecimal getAccuracyPercentage() {
        return accuracyPercentage;
    }

    public void setAccuracyPercentage(BigDecimal accuracyPercentage) {
        this.accuracyPercentage = accuracyPercentage;
        this.masteryLevel = evaluateMastery(accuracyPercentage);
    }

    public MasteryLevel getMasteryLevel() {
        return masteryLevel;
    }

    public void setMasteryLevel(MasteryLevel masteryLevel) {
        this.masteryLevel = masteryLevel;
    }
}
