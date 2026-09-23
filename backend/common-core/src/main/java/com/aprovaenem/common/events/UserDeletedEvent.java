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
public class UserDeletedEvent implements Serializable {

    private UUID userId;
    private String email;
    private String legalBasis;

    @Builder.Default
    private Instant occurredAt = Instant.now();
}
