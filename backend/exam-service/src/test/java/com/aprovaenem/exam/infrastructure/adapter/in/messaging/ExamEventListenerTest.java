package com.aprovaenem.exam.infrastructure.adapter.in.messaging;

import com.aprovaenem.common.events.UserDeletedEvent;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataPracticeSessionRepository;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataTutorChatThreadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ExamEventListener Unit Tests")
class ExamEventListenerTest {

    @Mock
    private SpringDataPracticeSessionRepository practiceSessionRepository;

    @Mock
    private SpringDataTutorChatThreadRepository tutorChatThreadRepository;

    private ExamEventListener listener;

    @BeforeEach
    void setUp() {
        listener = new ExamEventListener(practiceSessionRepository, tutorChatThreadRepository);
    }

    @Test
    @DisplayName("Should handle UserDeletedEvent by anonymizing practice sessions and deleting AI tutor chats")
    void shouldHandleUserDeletedEvent() {
        UUID userId = UUID.randomUUID();
        UserDeletedEvent event = UserDeletedEvent.builder()
                .userId(userId)
                .email("student@escola.gov.br")
                .legalBasis("Art. 18, VI da Lei 13.709/2018 (LGPD)")
                .occurredAt(Instant.now())
                .build();

        when(practiceSessionRepository.anonymizeSessionsByUserId(userId)).thenReturn(3);

        listener.handleUserDeleted(event);

        verify(practiceSessionRepository).anonymizeSessionsByUserId(userId);
        verify(tutorChatThreadRepository).deleteByUserId(userId);
    }
}
