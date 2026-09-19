package com.aprovaenem.exam.domain.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class TutorChatThread implements Serializable {

    private final UUID id;
    private final UUID userId;
    private final UUID questionId;
    private ThreadStatus status;
    private int turnCount;
    private final int maxTurns;
    private final Instant unlockedAt;
    private final Instant createdAt;
    private Instant updatedAt;
    private List<TutorChatMessage> messages;

    public TutorChatThread(
            UUID id,
            UUID userId,
            UUID questionId,
            ThreadStatus status,
            int turnCount,
            int maxTurns,
            Instant unlockedAt,
            Instant createdAt,
            Instant updatedAt,
            List<TutorChatMessage> messages
    ) {
        this.id = id;
        this.userId = userId;
        this.questionId = questionId;
        this.status = status != null ? status : ThreadStatus.ACTIVE;
        this.turnCount = turnCount;
        this.maxTurns = maxTurns > 0 ? maxTurns : 6;
        this.unlockedAt = unlockedAt != null ? unlockedAt : Instant.now();
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
        this.messages = messages != null ? new ArrayList<>(messages) : new ArrayList<>();
    }

    public boolean canAcceptTurn() {
        return status == ThreadStatus.ACTIVE && turnCount < maxTurns;
    }

    public void incrementTurn() {
        this.turnCount++;
        this.updatedAt = Instant.now();
    }

    public void reset() {
        this.status = ThreadStatus.RESET;
        this.updatedAt = Instant.now();
    }

    public void addMessage(TutorChatMessage message) {
        if (this.messages == null) {
            this.messages = new ArrayList<>();
        }
        this.messages.add(message);
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getQuestionId() {
        return questionId;
    }

    public ThreadStatus getStatus() {
        return status;
    }

    public int getTurnCount() {
        return turnCount;
    }

    public int getMaxTurns() {
        return maxTurns;
    }

    public Instant getUnlockedAt() {
        return unlockedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<TutorChatMessage> getMessages() {
        return messages != null ? Collections.unmodifiableList(messages) : Collections.emptyList();
    }
}
