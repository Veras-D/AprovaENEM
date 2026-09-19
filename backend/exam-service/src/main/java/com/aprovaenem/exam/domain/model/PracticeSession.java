package com.aprovaenem.exam.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class PracticeSession {

    private UUID id;
    private UUID userId;
    private String anonymousSessionId;
    private SessionType sessionType;
    private SessionStatus status;
    private int totalQuestions;
    private int correctCount;
    private Instant startedAt;
    private Instant completedAt;
    private List<Question> questions = new ArrayList<>();
    private List<StudentAttempt> attempts = new ArrayList<>();

    public PracticeSession() {
        this.status = SessionStatus.IN_PROGRESS;
        this.startedAt = Instant.now();
        this.correctCount = 0;
    }

    public PracticeSession(
            UUID id,
            UUID userId,
            String anonymousSessionId,
            SessionType sessionType,
            int totalQuestions
    ) {
        this.id = id;
        this.userId = userId;
        this.anonymousSessionId = anonymousSessionId;
        this.sessionType = sessionType != null ? sessionType : SessionType.TOPIC_PRACTICE;
        this.status = SessionStatus.IN_PROGRESS;
        this.totalQuestions = totalQuestions;
        this.correctCount = 0;
        this.startedAt = Instant.now();
    }

    public boolean canAcceptAttempt() {
        return this.status == SessionStatus.IN_PROGRESS;
    }

    public void complete() {
        if (this.status != SessionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Session is not in progress. Current status: " + this.status);
        }
        this.status = SessionStatus.COMPLETED;
        this.completedAt = Instant.now();
    }

    public void abandon() {
        this.status = SessionStatus.ABANDONED;
        this.completedAt = Instant.now();
    }

    public void incrementCorrectCount() {
        this.correctCount++;
    }

    public BigDecimal getScorePercentage() {
        if (totalQuestions == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(correctCount)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP);
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(int correctCount) {
        this.correctCount = correctCount;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public List<Question> getQuestions() {
        return Collections.unmodifiableList(questions);
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions != null ? new ArrayList<>(questions) : new ArrayList<>();
    }

    public void addQuestion(Question question) {
        if (question != null) {
            this.questions.add(question);
        }
    }

    public List<StudentAttempt> getAttempts() {
        return Collections.unmodifiableList(attempts);
    }

    public void setAttempts(List<StudentAttempt> attempts) {
        this.attempts = attempts != null ? new ArrayList<>(attempts) : new ArrayList<>();
    }

    public void addAttempt(StudentAttempt attempt) {
        if (attempt != null) {
            this.attempts.add(attempt);
        }
    }
}
