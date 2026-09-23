package com.aprovaenem.exam.infrastructure.adapter.in.web;

import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.PagedResult;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionFilterCommand;
import com.aprovaenem.exam.domain.model.QuestionStatus;
import com.aprovaenem.exam.domain.port.in.QuestionCatalogUseCase;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.QuestionDetailResponse;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.QuestionListResponse;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.QuestionOptionDto;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.QuestionSummaryDto;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.UpdateQuestionStatusRequest;
import jakarta.validation.Valid;
import com.aprovaenem.common.exception.AccessDeniedException;
import com.aprovaenem.exam.infrastructure.security.JwtTokenValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
public class QuestionCatalogController {

    private final QuestionCatalogUseCase catalogUseCase;
    private final JwtTokenValidator jwtValidator;

    @GetMapping
    public ResponseEntity<QuestionListResponse> getQuestions(
            @RequestParam(required = false) UUID topicId,
            @RequestParam(required = false) String discipline,
            @RequestParam(required = false) DifficultyLevel difficulty,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "ACTIVE") QuestionStatus status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        QuestionFilterCommand filter = new QuestionFilterCommand(
                topicId, discipline, difficulty, search, status, page, size
        );

        PagedResult<Question> pagedResult = catalogUseCase.getQuestions(filter);

        List<QuestionSummaryDto> items = pagedResult.getContent().stream()
                .map(this::toSummaryDto)
                .toList();

        QuestionListResponse response = QuestionListResponse.builder()
                .items(items)
                .page(pagedResult.getPage())
                .size(pagedResult.getSize())
                .totalElements(pagedResult.getTotalElements())
                .totalPages(pagedResult.getTotalPages())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionDetailResponse> getQuestionById(@PathVariable UUID id) {
        Question q = catalogUseCase.getQuestionById(id);
        return ResponseEntity.ok(toDetailDto(q));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<QuestionDetailResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateQuestionStatusRequest request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AccessDeniedException("Authentication is required to update question status.");
        }
        String token = authHeader.substring(7).trim();
        if (!jwtValidator.validateToken(token)) {
            throw new AccessDeniedException("Invalid or expired authentication token.");
        }
        String role = jwtValidator.extractRole(token);
        if (!"ROLE_ADMIN".equals(role)) {
            throw new AccessDeniedException("Administrator role (ROLE_ADMIN) is required to update question catalog status.");
        }

        Question updated = catalogUseCase.updateQuestionStatus(
                id, request.getStatus(), request.getSuspensionReason()
        );
        return ResponseEntity.ok(toDetailDto(updated));
    }

    private QuestionSummaryDto toSummaryDto(Question q) {
        return QuestionDtoMapper.toSummaryDto(q);
    }

    private QuestionDetailResponse toDetailDto(Question q) {
        List<QuestionOptionDto> optionDtos = q.getOptions().stream()
                .map(opt -> QuestionOptionDto.builder()
                        .id(opt.getId())
                        .optionLetter(opt.getOptionLetter())
                        .optionText(opt.getOptionText())
                        .isCorrect(null) // Purposely null in public read queries
                        .build())
                .toList();

        return QuestionDetailResponse.builder()
                .id(q.getId())
                .examEditionId(q.getExamEditionId())
                .topicId(q.getTopicId())
                .topicName(q.getTopicName())
                .discipline(q.getDiscipline())
                .itemNumber(q.getItemNumber())
                .statement(q.getStatement())
                .difficultyLevel(q.getDifficultyLevel().name())
                .triParamA(q.getTriParamA())
                .triParamB(q.getTriParamB())
                .triParamC(q.getTriParamC())
                .status(q.getStatus().name())
                .suspensionReason(q.getSuspensionReason())
                .contentLanguage(q.getContentLanguage())
                .createdAt(q.getCreatedAt())
                .options(optionDtos)
                .build();
    }
}
