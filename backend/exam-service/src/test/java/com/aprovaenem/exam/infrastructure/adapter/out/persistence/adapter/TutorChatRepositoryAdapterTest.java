package com.aprovaenem.exam.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.exam.domain.model.ChatRole;
import com.aprovaenem.exam.domain.model.ThreadStatus;
import com.aprovaenem.exam.domain.model.TutorChatMessage;
import com.aprovaenem.exam.domain.model.TutorChatThread;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.TutorChatMessageEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.TutorChatThreadEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataTutorChatMessageRepository;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataTutorChatThreadRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("TutorChatRepositoryAdapter Unit Tests")
class TutorChatRepositoryAdapterTest {

    @Mock
    private SpringDataTutorChatThreadRepository threadRepository;

    @Mock
    private SpringDataTutorChatMessageRepository messageRepository;

    @Mock
    private EntityManager entityManager;

    private TutorChatRepositoryAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new TutorChatRepositoryAdapter(threadRepository, messageRepository, entityManager);
    }

    @Test
    @DisplayName("Should find active thread by user ID and question ID")
    void shouldFindActiveThread() {
        UUID userId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        UUID threadId = UUID.randomUUID();

        TutorChatThreadEntity entity = TutorChatThreadEntity.builder()
                .id(threadId)
                .userId(userId)
                .question(QuestionEntity.builder().id(questionId).build())
                .status("ACTIVE")
                .turnCount(1)
                .maxTurns(6)
                .unlockedAt(Instant.now())
                .createdAt(Instant.now())
                .build();

        when(threadRepository.findByUserIdAndQuestion_IdAndStatus(userId, questionId, "ACTIVE"))
                .thenReturn(Optional.of(entity));

        Optional<TutorChatThread> thread = adapter.findActiveThread(userId, questionId);
        assertThat(thread).isPresent();
        assertThat(thread.get().getId()).isEqualTo(threadId);
        assertThat(thread.get().getStatus()).isEqualTo(ThreadStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should save thread and return domain model")
    void shouldSaveThread() {
        UUID userId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        UUID threadId = UUID.randomUUID();

        TutorChatThread thread = new TutorChatThread(
                threadId,
                userId,
                questionId,
                ThreadStatus.ACTIVE,
                0,
                6,
                Instant.now(),
                Instant.now(),
                Instant.now(),
                List.of()
        );

        QuestionEntity questionEntity = QuestionEntity.builder().id(questionId).build();
        when(entityManager.getReference(eq(QuestionEntity.class), eq(questionId))).thenReturn(questionEntity);

        TutorChatThreadEntity savedEntity = TutorChatThreadEntity.builder()
                .id(threadId)
                .userId(userId)
                .question(questionEntity)
                .status("ACTIVE")
                .turnCount(0)
                .maxTurns(6)
                .createdAt(Instant.now())
                .build();

        when(threadRepository.save(any(TutorChatThreadEntity.class))).thenReturn(savedEntity);

        TutorChatThread saved = adapter.saveThread(thread);
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isEqualTo(threadId);
    }

    @Test
    @DisplayName("Should save message and find messages by thread ID")
    void shouldSaveAndFindMessages() {
        UUID threadId = UUID.randomUUID();
        UUID messageId = UUID.randomUUID();

        TutorChatMessage message = new TutorChatMessage(
                messageId,
                threadId,
                ChatRole.STUDENT,
                "Explain Newton's laws",
                10,
                20,
                "gemini-1.5-flash",
                Instant.now()
        );

        TutorChatThreadEntity threadEntity = TutorChatThreadEntity.builder().id(threadId).build();
        when(entityManager.getReference(eq(TutorChatThreadEntity.class), eq(threadId))).thenReturn(threadEntity);

        TutorChatMessageEntity messageEntity = TutorChatMessageEntity.builder()
                .id(messageId)
                .thread(threadEntity)
                .role("STUDENT")
                .content("Explain Newton's laws")
                .promptTokens(10)
                .completionTokens(20)
                .modelUsed("gemini-1.5-flash")
                .createdAt(Instant.now())
                .build();

        when(messageRepository.save(any(TutorChatMessageEntity.class))).thenReturn(messageEntity);
        when(messageRepository.findByThread_IdOrderByCreatedAtAsc(threadId)).thenReturn(List.of(messageEntity));

        TutorChatMessage saved = adapter.saveMessage(message);
        assertThat(saved).isNotNull();
        assertThat(saved.getContent()).isEqualTo("Explain Newton's laws");

        List<TutorChatMessage> list = adapter.findMessagesByThreadId(threadId);
        assertThat(list).hasSize(1);
    }

    @Test
    @DisplayName("Should reset thread status to RESET")
    void shouldResetThread() {
        UUID threadId = UUID.randomUUID();
        TutorChatThreadEntity entity = TutorChatThreadEntity.builder()
                .id(threadId)
                .status("ACTIVE")
                .build();

        when(threadRepository.findById(threadId)).thenReturn(Optional.of(entity));

        adapter.resetThread(threadId);

        assertThat(entity.getStatus()).isEqualTo("RESET");
        verify(threadRepository).save(entity);
    }

    @Test
    @DisplayName("Should handle non-existent thread in resetThread gracefully")
    void shouldHandleNonExistentThreadInReset() {
        UUID threadId = UUID.randomUUID();
        when(threadRepository.findById(threadId)).thenReturn(Optional.empty());

        adapter.resetThread(threadId);
        // Does not throw and does not save
    }

    @Test
    @DisplayName("Should handle null question and null messages in thread entity")
    void shouldHandleNullRelationsInThreadEntity() {
        UUID userId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();

        TutorChatThreadEntity bareEntity = TutorChatThreadEntity.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .question(null)
                .status("ACTIVE")
                .turnCount(0)
                .maxTurns(5)
                .messages(null)
                .build();

        when(threadRepository.findByUserIdAndQuestion_IdAndStatus(userId, questionId, "ACTIVE"))
                .thenReturn(Optional.of(bareEntity));

        Optional<TutorChatThread> result = adapter.findActiveThread(userId, questionId);
        assertThat(result).isPresent();
        assertThat(result.get().getQuestionId()).isNull();
        assertThat(result.get().getMessages()).isEmpty();
    }

    @Test
    @DisplayName("Should handle message with null thread in entity")
    void shouldHandleMessageWithNullThreadInEntity() {
        UUID threadId = UUID.randomUUID();
        TutorChatMessageEntity entity = TutorChatMessageEntity.builder()
                .id(UUID.randomUUID())
                .thread(null)
                .role("STUDENT")
                .content("Texto")
                .build();

        when(messageRepository.findByThread_IdOrderByCreatedAtAsc(threadId))
                .thenReturn(List.of(entity));

        List<TutorChatMessage> list = adapter.findMessagesByThreadId(threadId);
        assertThat(list).hasSize(1);
        assertThat(list.get(0).getThreadId()).isNull();
    }
}
