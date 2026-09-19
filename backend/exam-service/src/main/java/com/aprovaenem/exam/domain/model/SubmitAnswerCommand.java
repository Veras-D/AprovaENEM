package com.aprovaenem.exam.domain.model;

import java.util.UUID;

public class SubmitAnswerCommand {

    private UUID sessionId;
    private UUID questionId;
    private char selectedOption;
    private int timeSpentSeconds;

    public SubmitAnswerCommand() {
    }

    public SubmitAnswerCommand(UUID sessionId, UUID questionId, char selectedOption, int timeSpentSeconds) {
        this.sessionId = sessionId;
        this.questionId = questionId;
        this.selectedOption = Character.toUpperCase(selectedOption);
        this.timeSpentSeconds = Math.max(0, timeSpentSeconds);
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
        this.selectedOption = Character.toUpperCase(selectedOption);
    }

    public int getTimeSpentSeconds() {
        return timeSpentSeconds;
    }

    public void setTimeSpentSeconds(int timeSpentSeconds) {
        this.timeSpentSeconds = Math.max(0, timeSpentSeconds);
    }
}
