package com.aprovaenem.notification.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationFeedResponse {

    private long unreadCount;
    private List<NotificationItemDto> notifications;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationItemDto {
        private UUID id;
        private String channel;
        private String templateCode;
        private String title;
        private String body;
        private String status;
        private Instant sentAt;
        private Instant readAt;
    }
}
