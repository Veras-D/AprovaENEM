package com.aprovaenem.exam.domain.port.out;

import com.aprovaenem.exam.domain.model.AiQuotaStatus;

import java.util.UUID;

public interface TutorQuotaPort {

    AiQuotaStatus getQuotaStatus(UUID userId, String role);

    boolean tryAcquireQuota(UUID userId, String role);
}
