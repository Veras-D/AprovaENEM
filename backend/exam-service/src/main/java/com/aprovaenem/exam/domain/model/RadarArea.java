package com.aprovaenem.exam.domain.model;

import java.math.BigDecimal;

/**
 * Per-knowledge-area (MT, CN, CH, LC) result of a diagnostic assessment, persisted
 * together with the report so the student's area breakdown survives reloads and devices.
 */
public class RadarArea {

    private String knowledgeArea;
    private String areaName;
    private BigDecimal scorePercentage;
    private int totalQuestions;
    private int correctQuestions;
    private String masteryLevel;
    private String topWeakTopic;

    public RadarArea() {
    }

    public String getKnowledgeArea() {
        return knowledgeArea;
    }

    public void setKnowledgeArea(String knowledgeArea) {
        this.knowledgeArea = knowledgeArea;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public BigDecimal getScorePercentage() {
        return scorePercentage;
    }

    public void setScorePercentage(BigDecimal scorePercentage) {
        this.scorePercentage = scorePercentage;
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

    public String getMasteryLevel() {
        return masteryLevel;
    }

    public void setMasteryLevel(String masteryLevel) {
        this.masteryLevel = masteryLevel;
    }

    public String getTopWeakTopic() {
        return topWeakTopic;
    }

    public void setTopWeakTopic(String topWeakTopic) {
        this.topWeakTopic = topWeakTopic;
    }
}
