package com.aprovaenem.exam.domain.port.in;

import com.aprovaenem.exam.domain.model.AiQuotaStatus;
import com.aprovaenem.exam.domain.model.TutorChatThread;
import com.aprovaenem.exam.domain.model.TutorConsultationResult;

import java.util.UUID;

public interface SocraticTutorUseCase {

    TutorConsultationResult askTutor(UUID questionId, UUID userId, String userRole, String message);

    TutorChatThread getThreadHistory(UUID questionId, UUID userId);

    void resetThread(UUID questionId, UUID userId);

    AiQuotaStatus checkDailyQuota(UUID userId, String userRole);
}
