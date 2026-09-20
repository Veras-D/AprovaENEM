package com.aprovaenem.exam.application.service;

import com.aprovaenem.common.exception.ResourceNotFoundException;
import com.aprovaenem.exam.domain.model.AiQuotaStatus;
import com.aprovaenem.exam.domain.model.ChatRole;
import com.aprovaenem.exam.domain.model.DailyQuotaExceededException;
import com.aprovaenem.exam.domain.model.PedagogicalChunk;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.RegistrationRequiredException;
import com.aprovaenem.exam.domain.model.ThreadStatus;
import com.aprovaenem.exam.domain.model.TutorAiResult;
import com.aprovaenem.exam.domain.model.TutorChatMessage;
import com.aprovaenem.exam.domain.model.TutorChatThread;
import com.aprovaenem.exam.domain.model.TutorConsultationResult;
import com.aprovaenem.exam.domain.port.in.SocraticTutorUseCase;
import com.aprovaenem.exam.domain.port.out.QuestionRepositoryPort;
import com.aprovaenem.exam.domain.port.out.RagKnowledgePort;
import com.aprovaenem.exam.domain.port.out.TutorAiPort;
import com.aprovaenem.exam.domain.port.out.TutorChatRepositoryPort;
import com.aprovaenem.exam.domain.port.out.TutorQuotaPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SocraticTutorService implements SocraticTutorUseCase {

    private final TutorChatRepositoryPort chatRepository;
    private final TutorAiPort aiPort;
    private final TutorQuotaPort quotaPort;
    private final RagKnowledgePort ragPort;
    private final QuestionRepositoryPort questionRepository;

    @Override
    @Transactional
    public TutorConsultationResult askTutor(UUID questionId, UUID userId, String userRole, String message) {
        if (userId == null) {
            throw new RegistrationRequiredException(
                    "A free student account is required to use the Socratic AI Tutor. " +
                    "Create a free account to unlock 1 free AI consultation per day, or log in."
            );
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));

        Optional<TutorChatThread> activeThreadOpt = chatRepository.findActiveThread(userId, questionId);
        TutorChatThread thread;

        if (activeThreadOpt.isEmpty()) {
            boolean acquired = quotaPort.tryAcquireQuota(userId, userRole);
            if (!acquired) {
                AiQuotaStatus quotaStatus = quotaPort.getQuotaStatus(userId, userRole);
                throw new DailyQuotaExceededException(
                        "You have used your 1 free Socratic AI consultation for today. " +
                        "You can continue practicing unlimited exam questions and static resolutions for free, " +
                        "or upgrade to AprovaENEM Pro for unlimited AI tutoring.",
                        quotaStatus
                );
            }

            thread = new TutorChatThread(
                    null,
                    userId,
                    questionId,
                    ThreadStatus.ACTIVE,
                    0,
                    6,
                    Instant.now(),
                    Instant.now(),
                    Instant.now(),
                    new ArrayList<>()
            );
            thread = chatRepository.saveThread(thread);
        } else {
            thread = activeThreadOpt.get();
        }

        if (!thread.canAcceptTurn()) {
            String limitNotice = "Você atingiu o limite de " + thread.getMaxTurns() +
                    " interações socráticas para esta questão. " +
                    "Recomendamos revisar a resolução detalhada passo a passo ou reiniciar a conversa.";
            AiQuotaStatus quotaStatus = quotaPort.getQuotaStatus(userId, userRole);
            return new TutorConsultationResult(
                    thread.getId(),
                    questionId,
                    limitNotice,
                    thread.getTurnCount(),
                    thread.getMaxTurns(),
                    quotaStatus,
                    false,
                    List.of(),
                    Instant.now()
            );
        }

        TutorChatMessage studentMsg = new TutorChatMessage(
                null,
                thread.getId(),
                ChatRole.STUDENT,
                message,
                0,
                0,
                "user-prompt",
                Instant.now()
        );
        chatRepository.saveMessage(studentMsg);

        List<PedagogicalChunk> ragChunks = ragPort.findRelevantChunks(question.getStatement() + " " + message, 3);

        TutorAiResult aiResult = aiPort.generateSocraticResponse(
                question,
                ragChunks,
                thread.getMessages(),
                message
        );

        TutorChatMessage aiMsg = new TutorChatMessage(
                null,
                thread.getId(),
                ChatRole.AI_TUTOR,
                aiResult.responseText(),
                0,
                0,
                aiResult.isFallback() ? "static-inep-fallback" : "gemini-1.5-flash",
                Instant.now()
        );
        chatRepository.saveMessage(aiMsg);

        thread.incrementTurn();
        chatRepository.saveThread(thread);

        AiQuotaStatus quotaStatus = quotaPort.getQuotaStatus(userId, userRole);

        return new TutorConsultationResult(
                thread.getId(),
                questionId,
                aiResult.responseText(),
                thread.getTurnCount(),
                thread.getMaxTurns(),
                quotaStatus,
                aiResult.isFallback(),
                ragChunks,
                Instant.now()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public TutorChatThread getThreadHistory(UUID questionId, UUID userId) {
        if (userId == null) {
            throw new RegistrationRequiredException("A free student account is required to view chat history.");
        }

        return chatRepository.findActiveThread(userId, questionId).orElseGet(() ->
                new TutorChatThread(
                        null,
                        userId,
                        questionId,
                        ThreadStatus.ACTIVE,
                        0,
                        6,
                        Instant.now(),
                        Instant.now(),
                        Instant.now(),
                        List.of()
                )
        );
    }

    @Override
    @Transactional
    public void resetThread(UUID questionId, UUID userId) {
        if (userId == null) {
            throw new RegistrationRequiredException("A free student account is required to reset chat history.");
        }

        chatRepository.findActiveThread(userId, questionId).ifPresent(thread -> {
            chatRepository.resetThread(thread.getId());
            log.info("Reset active Socratic chat thread [{}] for user [{}] and question [{}]",
                    thread.getId(), userId, questionId);
        });
    }

    @Override
    public AiQuotaStatus checkDailyQuota(UUID userId, String userRole) {
        if (userId == null) {
            return AiQuotaStatus.standard(1, 0, Instant.now());
        }
        return quotaPort.getQuotaStatus(userId, userRole);
    }
}
