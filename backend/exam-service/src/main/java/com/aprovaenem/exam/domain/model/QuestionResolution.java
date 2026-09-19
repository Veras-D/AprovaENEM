package com.aprovaenem.exam.domain.model;

import java.io.Serializable;
import java.util.UUID;

public class QuestionResolution implements Serializable {

    private static final long serialVersionUID = 1L;

    private UUID id;
    private UUID questionId;
    private String baseExplanation;
    private String keyConcepts;
    private String authorAttribution;

    public QuestionResolution() {
    }

    public QuestionResolution(UUID id, UUID questionId, String baseExplanation, String keyConcepts, String authorAttribution) {
        this.id = id;
        this.questionId = questionId;
        this.baseExplanation = baseExplanation;
        this.keyConcepts = keyConcepts;
        this.authorAttribution = authorAttribution;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getQuestionId() {
        return questionId;
    }

    public void setQuestionId(UUID questionId) {
        this.questionId = questionId;
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
