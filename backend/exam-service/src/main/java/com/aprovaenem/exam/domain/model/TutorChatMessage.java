package com.aprovaenem.exam.domain.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class TutorChatMessage implements Serializable {

    private final UUID id;
    private final UUID threadId;
    private final ChatRole role;
    private final String content;
    private final Integer promptTokens;
    private final Integer completionTokens;
    private final String modelUsed;
    private final Instant createdAt;

    public TutorChatMessage(
            UUID id,
            UUID threadId,
            ChatRole role,
            String content,
            Integer promptTokens,
            Integer completionTokens,
            String modelUsed,
            Instant createdAt
    ) {
        this.id = id;
        this.threadId = threadId;
        this.role = role;
        this.content = content;
        this.promptTokens = promptTokens != null ? promptTokens : 0;
        this.completionTokens = completionTokens != null ? completionTokens : 0;
        this.modelUsed = modelUsed != null ? modelUsed : "gemini-1.5-flash";
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getThreadId() {
        return threadId;
    }

    public ChatRole getRole() {
        return role;
    }

    public String getContent() {
        return content;
    }

    public Integer getPromptTokens() {
        return promptTokens;
    }

    public Integer getCompletionTokens() {
        return completionTokens;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
