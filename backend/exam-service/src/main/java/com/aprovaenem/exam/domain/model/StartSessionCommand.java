package com.aprovaenem.exam.domain.model;

import java.util.UUID;

public class StartSessionCommand {

    private UUID userId;
    private String anonymousSessionId;
    private SessionType sessionType;
    private UUID topicId;
    private DifficultyLevel difficulty;
    private int totalQuestions = 10;

    public StartSessionCommand() {
    }

    public StartSessionCommand(UUID userId, String anonymousSessionId, SessionType sessionType, UUID topicId, DifficultyLevel difficulty, int totalQuestions) {
        this.userId = userId;
        this.anonymousSessionId = anonymousSessionId;
        this.sessionType = sessionType != null ? sessionType : SessionType.TOPIC_PRACTICE;
        this.topicId = topicId;
        this.difficulty = difficulty;
        this.totalQuestions = totalQuestions > 0 ? totalQuestions : 10;
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

    public SessionType getSessionType() {
        return sessionType;
    }

    public void setSessionType(SessionType sessionType) {
        this.sessionType = sessionType;
    }

    public UUID getTopicId() {
        return topicId;
    }

    public void setTopicId(UUID topicId) {
        this.topicId = topicId;
    }

    public DifficultyLevel getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(DifficultyLevel difficulty) {
        this.difficulty = difficulty;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions > 0 ? totalQuestions : 10;
    }
}
