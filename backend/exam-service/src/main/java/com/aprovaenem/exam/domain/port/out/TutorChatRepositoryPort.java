package com.aprovaenem.exam.domain.port.out;

import com.aprovaenem.exam.domain.model.TutorChatMessage;
import com.aprovaenem.exam.domain.model.TutorChatThread;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TutorChatRepositoryPort {

    Optional<TutorChatThread> findActiveThread(UUID userId, UUID questionId);

    TutorChatThread saveThread(TutorChatThread thread);

    TutorChatMessage saveMessage(TutorChatMessage message);

    List<TutorChatMessage> findMessagesByThreadId(UUID threadId);

    void resetThread(UUID threadId);
}
