package com.aprovaenem.auth.domain.port.out;

import com.aprovaenem.auth.domain.model.AnonymousSession;

import java.util.Optional;

public interface AnonymousSessionRepositoryPort {

    AnonymousSession save(AnonymousSession session);

    Optional<AnonymousSession> findBySessionUuid(String sessionUuid);
}
