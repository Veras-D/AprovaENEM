package com.aprovaenem.auth.domain.port.in;

import com.aprovaenem.auth.domain.model.AnonymousSession;

import java.util.UUID;

public interface AnonymousSessionUseCase {

    AnonymousSession provisionSession(String ipAddress);

    AnonymousSession getSession(String sessionUuid);

    void claimSession(String sessionUuid, UUID userId);
}
