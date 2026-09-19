package com.aprovaenem.exam.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.exam.domain.model.ChatRole;
import com.aprovaenem.exam.domain.model.ThreadStatus;
import com.aprovaenem.exam.domain.model.TutorChatMessage;
import com.aprovaenem.exam.domain.model.TutorChatThread;
import com.aprovaenem.exam.domain.port.out.TutorChatRepositoryPort;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.TutorChatMessageEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.TutorChatThreadEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataTutorChatMessageRepository;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataTutorChatThreadRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TutorChatRepositoryAdapter implements TutorChatRepositoryPort {

    private final SpringDataTutorChatThreadRepository threadRepository;
    private final SpringDataTutorChatMessageRepository messageRepository;
    private final EntityManager entityManager;

    @Override
    public Optional<TutorChatThread> findActiveThread(UUID userId, UUID questionId) {
        return threadRepository.findByUserIdAndQuestion_IdAndStatus(userId, questionId, ThreadStatus.ACTIVE.name())
                .map(this::toThreadDomain);
    }

    @Override
    @Transactional
    public TutorChatThread saveThread(TutorChatThread thread) {
        TutorChatThreadEntity entity = TutorChatThreadEntity.builder()
                .id(thread.getId())
                .userId(thread.getUserId())
                .question(entityManager.getReference(QuestionEntity.class, thread.getQuestionId()))
                .status(thread.getStatus().name())
                .turnCount(thread.getTurnCount())
                .maxTurns(thread.getMaxTurns())
                .unlockedAt(thread.getUnlockedAt())
                .createdAt(thread.getCreatedAt())
                .updatedAt(thread.getUpdatedAt() != null ? thread.getUpdatedAt() : Instant.now())
                .build();

        TutorChatThreadEntity saved = threadRepository.save(entity);
        return toThreadDomain(saved);
    }

    @Override
    @Transactional
    public TutorChatMessage saveMessage(TutorChatMessage message) {
        TutorChatMessageEntity entity = TutorChatMessageEntity.builder()
                .id(message.getId())
                .thread(entityManager.getReference(TutorChatThreadEntity.class, message.getThreadId()))
                .role(message.getRole().name())
                .content(message.getContent())
                .promptTokens(message.getPromptTokens())
                .completionTokens(message.getCompletionTokens())
                .modelUsed(message.getModelUsed())
                .createdAt(message.getCreatedAt())
                .build();

        TutorChatMessageEntity saved = messageRepository.save(entity);
        return toMessageDomain(saved);
    }

    @Override
    public List<TutorChatMessage> findMessagesByThreadId(UUID threadId) {
        return messageRepository.findByThread_IdOrderByCreatedAtAsc(threadId).stream()
                .map(this::toMessageDomain)
                .toList();
    }

    @Override
    @Transactional
    public void resetThread(UUID threadId) {
        threadRepository.findById(threadId).ifPresent(thread -> {
            thread.setStatus(ThreadStatus.RESET.name());
            thread.setUpdatedAt(Instant.now());
            threadRepository.save(thread);
        });
    }

    private TutorChatThread toThreadDomain(TutorChatThreadEntity entity) {
        if (entity == null) {
            return null;
        }

        List<TutorChatMessage> messages = entity.getMessages() != null
                ? entity.getMessages().stream().map(this::toMessageDomain).toList()
                : List.of();

        return new TutorChatThread(
                entity.getId(),
                entity.getUserId(),
                entity.getQuestion() != null ? entity.getQuestion().getId() : null,
                ThreadStatus.valueOf(entity.getStatus()),
                entity.getTurnCount(),
                entity.getMaxTurns(),
                entity.getUnlockedAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                messages
        );
    }

    private TutorChatMessage toMessageDomain(TutorChatMessageEntity entity) {
        if (entity == null) {
            return null;
        }

        return new TutorChatMessage(
                entity.getId(),
                entity.getThread() != null ? entity.getThread().getId() : null,
                ChatRole.valueOf(entity.getRole()),
                entity.getContent(),
                entity.getPromptTokens(),
                entity.getCompletionTokens(),
                entity.getModelUsed(),
                entity.getCreatedAt()
        );
    }
}
