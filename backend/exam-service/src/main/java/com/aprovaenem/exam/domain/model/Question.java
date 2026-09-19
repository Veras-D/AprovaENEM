package com.aprovaenem.exam.domain.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Pure domain model representing an ENEM Examination Question item.
 * Strictly decoupled from persistence and web frameworks.
 */
public class Question implements Serializable {

    private static final long serialVersionUID = 1L;

    private UUID id;
    private UUID examEditionId;
    private UUID topicId;
    private String topicName;
    private String discipline;
    private int itemNumber;
    private String statement;
    private char correctOption;
    private DifficultyLevel difficultyLevel;
    private BigDecimal triParamA;
    private BigDecimal triParamB;
    private BigDecimal triParamC;
    private QuestionStatus status;
    private String suspensionReason;
    private String contentLanguage;
    private Instant createdAt;
    private Instant updatedAt;
    private List<QuestionOption> options = new ArrayList<>();
    private QuestionResolution resolution;

    public Question() {
        this.status = QuestionStatus.ACTIVE;
        this.contentLanguage = "pt-BR";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Question(
            UUID id,
            UUID examEditionId,
            UUID topicId,
            int itemNumber,
            String statement,
            char correctOption,
            DifficultyLevel difficultyLevel,
            BigDecimal triParamA,
            BigDecimal triParamB,
            BigDecimal triParamC,
            QuestionStatus status,
            String contentLanguage
    ) {
        validateCorrectOption(correctOption);
        this.id = id;
        this.examEditionId = examEditionId;
        this.topicId = topicId;
        this.itemNumber = itemNumber;
        this.statement = Objects.requireNonNull(statement, "Statement cannot be null");
        this.correctOption = Character.toUpperCase(correctOption);
        this.difficultyLevel = Objects.requireNonNull(difficultyLevel, "Difficulty level cannot be null");
        this.triParamA = triParamA;
        this.triParamB = triParamB;
        this.triParamC = triParamC;
        this.status = status != null ? status : QuestionStatus.ACTIVE;
        this.contentLanguage = contentLanguage != null ? contentLanguage : "pt-BR";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    private void validateCorrectOption(char letter) {
        char upper = Character.toUpperCase(letter);
        if (upper < 'A' || upper > 'E') {
            throw new IllegalArgumentException("Correct option must be between A and E. Received: " + letter);
        }
    }

    public boolean isActive() {
        return this.status == QuestionStatus.ACTIVE;
    }

    public void suspend(String reason) {
        this.status = QuestionStatus.SUSPENDED;
        this.suspensionReason = reason;
        this.updatedAt = Instant.now();
    }

    public void activate() {
        this.status = QuestionStatus.ACTIVE;
        this.suspensionReason = null;
        this.updatedAt = Instant.now();
    }

    public void markNeedsReview(String note) {
        this.status = QuestionStatus.NEEDS_REVIEW;
        this.suspensionReason = note;
        this.updatedAt = Instant.now();
    }

    public boolean isOptionCorrect(char optionLetter) {
        return Character.toUpperCase(optionLetter) == Character.toUpperCase(this.correctOption);
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getExamEditionId() {
        return examEditionId;
    }

    public void setExamEditionId(UUID examEditionId) {
        this.examEditionId = examEditionId;
    }

    public UUID getTopicId() {
        return topicId;
    }

    public void setTopicId(UUID topicId) {
        this.topicId = topicId;
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

    public int getItemNumber() {
        return itemNumber;
    }

    public void setItemNumber(int itemNumber) {
        this.itemNumber = itemNumber;
    }

    public String getStatement() {
        return statement;
    }

    public void setStatement(String statement) {
        this.statement = Objects.requireNonNull(statement, "Statement cannot be null");
    }

    public char getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(char correctOption) {
        validateCorrectOption(correctOption);
        this.correctOption = Character.toUpperCase(correctOption);
    }

    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = Objects.requireNonNull(difficultyLevel, "Difficulty level cannot be null");
    }

    public BigDecimal getTriParamA() {
        return triParamA;
    }

    public void setTriParamA(BigDecimal triParamA) {
        this.triParamA = triParamA;
    }

    public BigDecimal getTriParamB() {
        return triParamB;
    }

    public void setTriParamB(BigDecimal triParamB) {
        this.triParamB = triParamB;
    }

    public BigDecimal getTriParamC() {
        return triParamC;
    }

    public void setTriParamC(BigDecimal triParamC) {
        this.triParamC = triParamC;
    }

    public QuestionStatus getStatus() {
        return status;
    }

    public void setStatus(QuestionStatus status) {
        this.status = Objects.requireNonNull(status, "Question status cannot be null");
        this.updatedAt = Instant.now();
    }

    public String getSuspensionReason() {
        return suspensionReason;
    }

    public void setSuspensionReason(String suspensionReason) {
        this.suspensionReason = suspensionReason;
    }

    public String getContentLanguage() {
        return contentLanguage;
    }

    public void setContentLanguage(String contentLanguage) {
        this.contentLanguage = contentLanguage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<QuestionOption> getOptions() {
        return Collections.unmodifiableList(options);
    }

    public void setOptions(List<QuestionOption> options) {
        this.options = options != null ? new ArrayList<>(options) : new ArrayList<>();
    }

    public void addOption(QuestionOption option) {
        if (option != null) {
            this.options.add(option);
        }
    }

    public QuestionResolution getResolution() {
        return resolution;
    }

    public void setResolution(QuestionResolution resolution) {
        this.resolution = resolution;
    }
}
