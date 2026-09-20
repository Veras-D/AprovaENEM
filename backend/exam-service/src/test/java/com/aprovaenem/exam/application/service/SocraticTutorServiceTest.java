package com.aprovaenem.exam.application.service;

import com.aprovaenem.common.exception.ResourceNotFoundException;
import com.aprovaenem.exam.domain.model.AiQuotaStatus;
import com.aprovaenem.exam.domain.model.DailyQuotaExceededException;
import com.aprovaenem.exam.domain.model.PedagogicalChunk;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.RegistrationRequiredException;
import com.aprovaenem.exam.domain.model.ThreadStatus;
import com.aprovaenem.exam.domain.model.TutorChatMessage;
import com.aprovaenem.exam.domain.model.TutorChatThread;
import com.aprovaenem.exam.domain.model.TutorConsultationResult;
import com.aprovaenem.exam.domain.port.out.QuestionRepositoryPort;
import com.aprovaenem.exam.domain.port.out.RagKnowledgePort;
import com.aprovaenem.exam.domain.port.out.TutorAiPort;
import com.aprovaenem.exam.domain.port.out.TutorChatRepositoryPort;
import com.aprovaenem.exam.domain.port.out.TutorQuotaPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SocraticTutorService Application Service Unit Tests")
class SocraticTutorServiceTest {

    @Mock
    private TutorChatRepositoryPort chatRepository;

    @Mock
    private TutorAiPort aiPort;

    @Mock
    private TutorQuotaPort quotaPort;

    @Mock
    private RagKnowledgePort ragPort;

    @Mock
    private QuestionRepositoryPort questionRepository;

    @InjectMocks
    private SocraticTutorService socraticTutorService;

    @Test
    @DisplayName("Should throw RegistrationRequiredException when anonymous student without userId accesses AI tutor")
    void shouldThrowExceptionWhenAnonymousUserAccessesAi() {
        UUID questionId = UUID.randomUUID();

        assertThatThrownBy(() -> socraticTutorService.askTutor(questionId, null, "ANONYMOUS", "Como começo?"))
                .isInstanceOf(RegistrationRequiredException.class)
                .hasMessageContaining("A free student account is required");

        verify(aiPort, never()).generateSocraticResponse(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when question does not exist")
    void shouldThrowExceptionWhenQuestionNotFound() {
        UUID questionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(questionRepository.findById(questionId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> socraticTutorService.askTutor(questionId, userId, "ROLE_STUDENT", "Me ajude."))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Question");

        verify(quotaPort, never()).tryAcquireQuota(any(), any());
    }

    @Test
    @DisplayName("Should throw DailyQuotaExceededException when daily AI consultation quota is exhausted")
    void shouldThrowExceptionWhenDailyQuotaExhausted() {
        UUID questionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Question question = new Question();
        question.setId(questionId);

        AiQuotaStatus exhaustedStatus = new AiQuotaStatus(1, 1, 0, Instant.now().plusSeconds(3600), false);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(chatRepository.findActiveThread(userId, questionId)).thenReturn(Optional.empty());
        when(quotaPort.tryAcquireQuota(userId, "ROLE_STUDENT")).thenReturn(false);
        when(quotaPort.getQuotaStatus(userId, "ROLE_STUDENT")).thenReturn(exhaustedStatus);

        assertThatThrownBy(() -> socraticTutorService.askTutor(questionId, userId, "ROLE_STUDENT", "Como resolvo?"))
                .isInstanceOf(DailyQuotaExceededException.class)
                .hasMessageContaining("You have used your 1 free Socratic AI consultation for today");

        verify(aiPort, never()).generateSocraticResponse(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should successfully provision thread, invoke RAG, generate Socratic response, and increment turn")
    void shouldGenerateSocraticResponseSuccessfully() {
        UUID questionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID threadId = UUID.randomUUID();

        Question question = new Question();
        question.setId(questionId);
        question.setStatement("Um bloco de massa 5 kg é acelerado...");

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(chatRepository.findActiveThread(userId, questionId)).thenReturn(Optional.empty());
        when(quotaPort.tryAcquireQuota(userId, "ROLE_STUDENT")).thenReturn(true);

        when(chatRepository.saveThread(any(TutorChatThread.class)))
                .thenAnswer(inv -> {
                    TutorChatThread t = inv.getArgument(0);
                    return new TutorChatThread(
                            threadId,
                            t.getUserId(),
                            t.getQuestionId(),
                            t.getStatus(),
                            t.getTurnCount(),
                            t.getMaxTurns(),
                            t.getUnlockedAt(),
                            t.getCreatedAt(),
                            t.getUpdatedAt(),
                            t.getMessages()
                    );
                });

        PedagogicalChunk chunk = new PedagogicalChunk(UUID.randomUUID(), "Segunda Lei de Newton: F = m * a", 0.92);
        when(ragPort.findRelevantChunks(anyString(), anyInt())).thenReturn(List.of(chunk));

        String socraticGuidance = "Pense na relação entre a força resultante aplicada e a massa do bloco.";
        when(aiPort.generateSocraticResponse(eq(question), eq(List.of(chunk)), any(), eq("O que significa F=ma?")))
                .thenReturn(socraticGuidance);

        AiQuotaStatus activeQuota = new AiQuotaStatus(1, 1, 0, Instant.now().plusSeconds(3600), false);
        when(quotaPort.getQuotaStatus(userId, "ROLE_STUDENT")).thenReturn(activeQuota);

        TutorConsultationResult result = socraticTutorService.askTutor(
                questionId,
                userId,
                "ROLE_STUDENT",
                "O que significa F=ma?"
        );

        assertThat(result).isNotNull();
        assertThat(result.getResponseText()).isEqualTo(socraticGuidance);
        assertThat(result.getTurnCount()).isEqualTo(1);
        assertThat(result.getMaxTurns()).isEqualTo(6);
        assertThat(result.getRetrievedChunks()).hasSize(1);
        assertThat(result.isFallback()).isFalse();

        verify(chatRepository, org.mockito.Mockito.times(2)).saveMessage(any(TutorChatMessage.class));
        verify(chatRepository, org.mockito.Mockito.times(2)).saveThread(any(TutorChatThread.class));
    }

    @Test
    @DisplayName("Should return turn limit notice without calling AI model when 6 turns are exceeded")
    void shouldReturnLimitNoticeWhenMaxTurnsExceeded() {
        UUID questionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID threadId = UUID.randomUUID();

        Question question = new Question();
        question.setId(questionId);

        TutorChatThread maxedThread = new TutorChatThread(
                threadId,
                userId,
                questionId,
                ThreadStatus.ACTIVE,
                6, // turnCount reached 6
                6, // maxTurns
                Instant.now(),
                Instant.now(),
                Instant.now(),
                new ArrayList<>()
        );

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(chatRepository.findActiveThread(userId, questionId)).thenReturn(Optional.of(maxedThread));

        AiQuotaStatus quotaStatus = new AiQuotaStatus(1, 1, 0, Instant.now().plusSeconds(3600), false);
        when(quotaPort.getQuotaStatus(userId, "ROLE_STUDENT")).thenReturn(quotaStatus);

        TutorConsultationResult result = socraticTutorService.askTutor(
                questionId,
                userId,
                "ROLE_STUDENT",
                "Ainda estou com dúvida."
        );

        assertThat(result.getResponseText()).contains("Você atingiu o limite de 6 interações socráticas");
        verify(aiPort, never()).generateSocraticResponse(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should reset active conversation thread")
    void shouldResetThread() {
        UUID questionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID threadId = UUID.randomUUID();

        TutorChatThread activeThread = new TutorChatThread(
                threadId,
                userId,
                questionId,
                ThreadStatus.ACTIVE,
                3,
                6,
                Instant.now(),
                Instant.now(),
                Instant.now(),
                new ArrayList<>()
        );

        when(chatRepository.findActiveThread(userId, questionId)).thenReturn(Optional.of(activeThread));

        socraticTutorService.resetThread(questionId, userId);

        verify(chatRepository).resetThread(threadId);
    }
}
