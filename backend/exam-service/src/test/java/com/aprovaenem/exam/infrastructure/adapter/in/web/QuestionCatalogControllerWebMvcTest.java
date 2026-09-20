package com.aprovaenem.exam.infrastructure.adapter.in.web;

import com.aprovaenem.common.exception.ResourceNotFoundException;
import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.PagedResult;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionFilterCommand;
import com.aprovaenem.exam.domain.model.QuestionOption;
import com.aprovaenem.exam.domain.model.QuestionStatus;
import com.aprovaenem.exam.domain.port.in.QuestionCatalogUseCase;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.UpdateQuestionStatusRequest;
import com.aprovaenem.exam.infrastructure.security.JwtTokenValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(QuestionCatalogController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("QuestionCatalogController WebMvc Tests")
class QuestionCatalogControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private QuestionCatalogUseCase catalogUseCase;

    @MockBean
    private JwtTokenValidator jwtValidator;

    private Question createSampleQuestion(UUID id) {
        Question q = new Question(
                id,
                UUID.randomUUID(),
                UUID.randomUUID(),
                101,
                "Um bloco de massa m desliza sem atrito...",
                'B',
                DifficultyLevel.MEDIUM,
                new BigDecimal("1.25"),
                new BigDecimal("0.50"),
                new BigDecimal("0.20"),
                QuestionStatus.ACTIVE,
                "pt-BR"
        );
        q.setDiscipline("Física");
        q.setTopicName("Cinemática");

        QuestionOption optA = new QuestionOption(UUID.randomUUID(), id, 'A', "Opção 1", false);
        QuestionOption optB = new QuestionOption(UUID.randomUUID(), id, 'B', "Opção 2", true);
        q.addOption(optA);
        q.addOption(optB);
        return q;
    }

    @Test
    @DisplayName("GET /api/v1/questions with filters should return HTTP 200 and paged question summaries without revealing correct answers")
    void shouldGetQuestionsPagedSuccessfully() throws Exception {
        UUID questionId = UUID.randomUUID();
        Question q = createSampleQuestion(questionId);

        PagedResult<Question> pagedResult = new PagedResult<>(List.of(q), 0, 20, 1L, 1);
        when(catalogUseCase.getQuestions(any(QuestionFilterCommand.class))).thenReturn(pagedResult);

        mockMvc.perform(get("/api/v1/questions")
                        .param("discipline", "Física")
                        .param("difficulty", "MEDIUM")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page", is(0)))
                .andExpect(jsonPath("$.size", is(20)))
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.totalPages", is(1)))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].id", is(questionId.toString())))
                .andExpect(jsonPath("$.items[0].discipline", is("Física")))
                .andExpect(jsonPath("$.items[0].difficultyLevel", is("MEDIUM")))
                .andExpect(jsonPath("$.items[0].options", hasSize(2)))
                .andExpect(jsonPath("$.items[0].options[0].isCorrect", nullValue()))
                .andExpect(jsonPath("$.items[0].options[1].isCorrect", nullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/questions/{id} should return HTTP 200 with full question details and masked answers")
    void shouldGetQuestionByIdSuccessfully() throws Exception {
        UUID questionId = UUID.randomUUID();
        Question q = createSampleQuestion(questionId);

        when(catalogUseCase.getQuestionById(questionId)).thenReturn(q);

        mockMvc.perform(get("/api/v1/questions/" + questionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(questionId.toString())))
                .andExpect(jsonPath("$.statement", containsString("Um bloco de massa m")))
                .andExpect(jsonPath("$.discipline", is("Física")))
                .andExpect(jsonPath("$.difficultyLevel", is("MEDIUM")))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.options", hasSize(2)))
                .andExpect(jsonPath("$.options[0].isCorrect", nullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/questions/{id} when not found should return HTTP 404 Problem Details")
    void shouldReturnNotFoundWhenQuestionDoesNotExist() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        when(catalogUseCase.getQuestionById(nonExistentId))
                .thenThrow(new ResourceNotFoundException("Question not found with ID: " + nonExistentId));

        mockMvc.perform(get("/api/v1/questions/" + nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString("Question not found with ID: " + nonExistentId)));
    }

    @Test
    @DisplayName("PATCH /api/v1/questions/{id}/status should update question status and return HTTP 200")
    void shouldUpdateQuestionStatusSuccessfully() throws Exception {
        UUID questionId = UUID.randomUUID();
        Question q = createSampleQuestion(questionId);
        q.suspend("Contains typographical errors in equation");

        UpdateQuestionStatusRequest request = UpdateQuestionStatusRequest.builder()
                .status(QuestionStatus.SUSPENDED)
                .suspensionReason("Contains typographical errors in equation")
                .build();

        when(catalogUseCase.updateQuestionStatus(eq(questionId), eq(QuestionStatus.SUSPENDED), eq("Contains typographical errors in equation")))
                .thenReturn(q);

        mockMvc.perform(patch("/api/v1/questions/" + questionId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(questionId.toString())))
                .andExpect(jsonPath("$.status", is("SUSPENDED")))
                .andExpect(jsonPath("$.suspensionReason", is("Contains typographical errors in equation")));
    }

    @Test
    @DisplayName("PATCH /api/v1/questions/{id}/status with missing status should return HTTP 400 Validation Error")
    void shouldReturnBadRequestWhenStatusIsMissing() throws Exception {
        UUID questionId = UUID.randomUUID();
        UpdateQuestionStatusRequest request = new UpdateQuestionStatusRequest(); // null status

        mockMvc.perform(patch("/api/v1/questions/" + questionId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Failed")));
    }
}
