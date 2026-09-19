package com.aprovaenem.exam.infrastructure.adapter.in.web;

import com.aprovaenem.exam.domain.model.AiQuotaStatus;
import com.aprovaenem.exam.domain.model.RegistrationRequiredException;
import com.aprovaenem.exam.domain.model.TutorChatMessage;
import com.aprovaenem.exam.domain.model.TutorChatThread;
import com.aprovaenem.exam.domain.model.TutorConsultationResult;
import com.aprovaenem.exam.domain.port.in.SocraticTutorUseCase;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.AskTutorRequest;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.ChatHistoryResponse;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.QuotaStatusResponse;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.ResetChatResponse;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.TutorChatResponse;
import com.aprovaenem.exam.infrastructure.security.JwtTokenValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
public class SocraticTutorController {

    private final SocraticTutorUseCase tutorUseCase;
    private final JwtTokenValidator jwtValidator;

    @PostMapping("/{id}/chat")
    public ResponseEntity<TutorChatResponse> askTutor(
            @PathVariable UUID id,
            @Valid @RequestBody AskTutorRequest request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader
    ) {
        AuthenticatedUser user = authenticate(authHeader);

        TutorConsultationResult result = tutorUseCase.askTutor(
                id,
                user.userId(),
                user.role(),
                request.getMessage()
        );

        HttpHeaders headers = new HttpHeaders();
        if (result.getQuotaStatus() != null) {
            headers.add("X-AI-Quota-Limit", String.valueOf(result.getQuotaStatus().getDailyLimit()));
            headers.add("X-AI-Quota-Remaining", String.valueOf(result.getQuotaStatus().getRemainingToday()));
            headers.add("X-AI-Quota-Reset", result.getQuotaStatus().getResetsAt().toString());
        }

        List<TutorChatResponse.RagReferenceDto> references = result.getRetrievedChunks().stream()
                .map(chunk -> TutorChatResponse.RagReferenceDto.builder()
                        .chunkId(chunk.getId())
                        .contentSnippet(chunk.getContent())
                        .similarityScore(chunk.getSimilarity())
                        .build())
                .toList();

        TutorChatResponse.QuotaStatusDto quotaDto = null;
        if (result.getQuotaStatus() != null) {
            quotaDto = TutorChatResponse.QuotaStatusDto.builder()
                    .dailyLimit(result.getQuotaStatus().getDailyLimit())
                    .usedToday(result.getQuotaStatus().getUsedToday())
                    .remainingToday(result.getQuotaStatus().getRemainingToday())
                    .resetsAt(result.getQuotaStatus().getResetsAt())
                    .isUnlimited(result.getQuotaStatus().isUnlimited())
                    .build();
        }

        TutorChatResponse response = TutorChatResponse.builder()
                .threadId(result.getThreadId())
                .questionId(result.getQuestionId())
                .message(result.getResponseText())
                .turnCount(result.getTurnCount())
                .maxTurns(result.getMaxTurns())
                .isFallback(result.isFallback())
                .pedagogicalReferences(references)
                .quota(quotaDto)
                .timestamp(result.getTimestamp())
                .build();

        return ResponseEntity.ok().headers(headers).body(response);
    }

    @GetMapping("/{id}/chat")
    public ResponseEntity<ChatHistoryResponse> getChatHistory(
            @PathVariable UUID id,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader
    ) {
        AuthenticatedUser user = authenticate(authHeader);

        TutorChatThread thread = tutorUseCase.getThreadHistory(id, user.userId());

        List<ChatHistoryResponse.ChatMessageDto> messageDtos = thread.getMessages().stream()
                .map(this::toMessageDto)
                .toList();

        ChatHistoryResponse response = ChatHistoryResponse.builder()
                .threadId(thread.getId())
                .questionId(thread.getQuestionId())
                .status(thread.getStatus().name())
                .turnCount(thread.getTurnCount())
                .maxTurns(thread.getMaxTurns())
                .unlockedAt(thread.getUnlockedAt())
                .messages(messageDtos)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/chat")
    public ResponseEntity<ResetChatResponse> resetChat(
            @PathVariable UUID id,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader
    ) {
        AuthenticatedUser user = authenticate(authHeader);

        tutorUseCase.resetThread(id, user.userId());

        ResetChatResponse response = ResetChatResponse.builder()
                .message("Chat conversation on this question has been reset. You can start a fresh dialogue.")
                .questionId(id)
                .resetAt(Instant.now())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/ai-quota")
    public ResponseEntity<QuotaStatusResponse> getDailyQuota(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader
    ) {
        UUID userId = null;
        String role = "ANONYMOUS";

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (jwtValidator.validateToken(token)) {
                userId = jwtValidator.extractUserId(token);
                role = jwtValidator.extractRole(token);
            }
        }

        AiQuotaStatus status = tutorUseCase.checkDailyQuota(userId, role);

        QuotaStatusResponse response = QuotaStatusResponse.builder()
                .dailyLimit(status.getDailyLimit())
                .usedToday(status.getUsedToday())
                .remainingToday(status.getRemainingToday())
                .resetsAt(status.getResetsAt())
                .isUnlimited(status.isUnlimited())
                .build();

        return ResponseEntity.ok(response);
    }

    private AuthenticatedUser authenticate(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RegistrationRequiredException(
                    "A free student account is required to use the Socratic AI Tutor. " +
                    "Create a free account to unlock 1 free AI consultation per day, or log in."
            );
        }

        String token = authHeader.substring(7).trim();
        if (!jwtValidator.validateToken(token)) {
            throw new RegistrationRequiredException(
                    "Invalid or expired authentication token. Please log in again to continue."
            );
        }

        UUID userId = jwtValidator.extractUserId(token);
        String role = jwtValidator.extractRole(token);

        return new AuthenticatedUser(userId, role);
    }

    private ChatHistoryResponse.ChatMessageDto toMessageDto(TutorChatMessage msg) {
        return ChatHistoryResponse.ChatMessageDto.builder()
                .id(msg.getId())
                .role(msg.getRole().name())
                .content(msg.getContent())
                .createdAt(msg.getCreatedAt())
                .build();
    }

    private record AuthenticatedUser(UUID userId, String role) {}
}
