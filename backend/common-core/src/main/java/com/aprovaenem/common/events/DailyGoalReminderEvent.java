package com.aprovaenem.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyGoalReminderEvent implements Serializable {

    private UUID userId;
    private String email;
    private String fullName;
    private int streakDays;
    private int questionsCompleted;
    private int targetQuestions;

    @Builder.Default
    private Instant occurredAt = Instant.now();
}
