package com.aprovaenem.exam.domain.model;

import java.util.UUID;

public class AttemptResult {

    private UUID attemptId;
    private UUID sessionId;
    private UUID questionId;
    private char selectedOption;
    private boolean isCorrect;
    private char correctOption;
    private String baseExplanation;
    private String keyConcepts;
    private String authorAttribution;

    public AttemptResult() {
    }

    public AttemptResult(
            UUID attemptId,
            UUID sessionId,
            UUID questionId,
            char selectedOption,
            boolean isCorrect,
            char correctOption,
            String baseExplanation,
            String keyConcepts,
            String authorAttribution
    ) {
        this.attemptId = attemptId;
        this.sessionId = sessionId;
        this.questionId = questionId;
        this.selectedOption = selectedOption;
        this.isCorrect = isCorrect;
        this.correctOption = correctOption;
        this.baseExplanation = baseExplanation;
        this.keyConcepts = keyConcepts;
        this.authorAttribution = authorAttribution;
    }

    public UUID getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(UUID attemptId) {
        this.attemptId = attemptId;
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
        this.selectedOption = selectedOption;
    }

    public boolean isCorrect() {
        return isCorrect;
    }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }

    public char getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(char correctOption) {
        this.correctOption = correctOption;
    }

    public String getBaseExplanation() {
        return baseExplanation;
    }

    public void setBaseExplanation(String baseExplanation) {
        this.baseExplanation = baseExplanation;
    }

    public String getKeyConcepts() {
        return keyConcepts;
    }

    public void setKeyConcepts(String keyConcepts) {
        this.keyConcepts = keyConcepts;
    }

    public String getAuthorAttribution() {
        return authorAttribution;
    }

    public void setAuthorAttribution(String authorAttribution) {
        this.authorAttribution = authorAttribution;
    }
}
