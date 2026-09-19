package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistoryResponse {

    private UUID threadId;
    private UUID questionId;
    private String status;
    private int turnCount;
    private int maxTurns;
    private Instant unlockedAt;
    private List<ChatMessageDto> messages;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessageDto {
        private UUID id;
        private String role;
        private String content;
        private Instant createdAt;
    }
}
