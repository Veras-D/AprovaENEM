package com.aprovaenem.exam.domain.model;

import java.time.Instant;
import java.util.UUID;

public class StudentAttempt {

    private UUID id;
    private UUID sessionId;
    private UUID questionId;
    private char selectedOption;
    private boolean isCorrect;
    private int timeSpentSeconds;
    private Instant submittedAt;

    public StudentAttempt() {
        this.submittedAt = Instant.now();
    }

    public StudentAttempt(
            UUID id,
            UUID sessionId,
            UUID questionId,
            char selectedOption,
            boolean isCorrect,
            int timeSpentSeconds
    ) {
        validateOption(selectedOption);
        this.id = id;
        this.sessionId = sessionId;
        this.questionId = questionId;
        this.selectedOption = Character.toUpperCase(selectedOption);
        this.isCorrect = isCorrect;
        this.timeSpentSeconds = Math.max(0, timeSpentSeconds);
        this.submittedAt = Instant.now();
    }

    private void validateOption(char option) {
        char upper = Character.toUpperCase(option);
        if (upper < 'A' || upper > 'E') {
            throw new IllegalArgumentException("Selected option must be between A and E. Received: " + option);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getQuestionId() {
        return questionId;
    }

    public void setQuestionId(UUID questionId) {
        this.questionId = questionId;
    }

    public char getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(char selectedOption) {
        validateOption(selectedOption);
        this.selectedOption = Character.toUpperCase(selectedOption);
    }

    public boolean isCorrect() {
        return isCorrect;
    }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }

    public int getTimeSpentSeconds() {
        return timeSpentSeconds;
    }

    public void setTimeSpentSeconds(int timeSpentSeconds) {
        this.timeSpentSeconds = Math.max(0, timeSpentSeconds);
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }
}
