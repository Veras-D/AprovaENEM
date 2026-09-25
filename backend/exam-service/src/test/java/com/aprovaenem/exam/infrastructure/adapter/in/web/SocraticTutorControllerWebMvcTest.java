package com.aprovaenem.exam.infrastructure.adapter.in.web;

import com.aprovaenem.exam.domain.model.AiQuotaStatus;
import com.aprovaenem.exam.domain.model.ChatRole;
import com.aprovaenem.exam.domain.model.DailyQuotaExceededException;
import com.aprovaenem.exam.domain.model.PedagogicalChunk;
import com.aprovaenem.exam.domain.model.ThreadStatus;
import com.aprovaenem.exam.domain.model.TutorChatMessage;
import com.aprovaenem.exam.domain.model.TutorChatThread;
import com.aprovaenem.exam.domain.model.TutorConsultationResult;
import com.aprovaenem.exam.domain.port.in.SocraticTutorUseCase;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.AskTutorRequest;
import com.aprovaenem.exam.infrastructure.security.JwtTokenValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SocraticTutorController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("SocraticTutorController WebMvc & Security Tests")
class SocraticTutorControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SocraticTutorUseCase tutorUseCase;

    @MockBean
    private JwtTokenValidator jwtValidator;

    @Test
    @DisplayName("POST /api/v1/questions/{id}/chat without token should return HTTP 401 and registration CTA problem details")
    void shouldReturnUnauthorizedWhenNoTokenProvided() throws Exception {
        UUID questionId = UUID.randomUUID();
        AskTutorRequest request = new AskTutorRequest();
        request.setMessage("Como começo a resolver esta questão?");

        mockMvc.perform(post("/api/v1/questions/" + questionId + "/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.type", is("https://aprovaenem.org/errors/REGISTRATION_REQUIRED_FOR_AI")))
                .andExpect(jsonPath("$.title", is("Registration Required For AI Tutor")))
                .andExpect(jsonPath("$.detail", containsString("A free student account is required")))
                .andExpect(jsonPath("$.signupUrl", is("/register")));
    }

    @Test
    @DisplayName("POST /api/v1/questions/{id}/chat with valid token should return HTTP 200, response, and quota headers")
    void shouldAskTutorSuccessfullyWithTokenAndQuotaHeaders() throws Exception {
        UUID questionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID threadId = UUID.randomUUID();
        String validToken = "valid.jwt.student.token";

        when(jwtValidator.validateToken(validToken)).thenReturn(true);
        when(jwtValidator.extractUserId(validToken)).thenReturn(userId);
        when(jwtValidator.extractRole(validToken)).thenReturn("ROLE_STUDENT");

        AskTutorRequest request = new AskTutorRequest();
        request.setMessage("Qual conceito de cinemática devo aplicar?");

        Instant resetTime = Instant.now().plusSeconds(3600);
        AiQuotaStatus quotaStatus = new AiQuotaStatus(1, 1, 0, resetTime, false);
        PedagogicalChunk chunk = new PedagogicalChunk(UUID.randomUUID(), "Equação de Torricelli: v² = v0² + 2aΔs", 0.94);

        TutorConsultationResult result = new TutorConsultationResult(
                threadId,
                questionId,
                "Considere se o tempo foi fornecido no enunciado ou se a aceleração é constante.",
                1,
                6,
                quotaStatus,
                false,
                List.of(chunk),
                Instant.now()
        );

        when(tutorUseCase.askTutor(eq(questionId), eq(userId), eq("ROLE_STUDENT"), eq("Qual conceito de cinemática devo aplicar?")))
                .thenReturn(result);

        mockMvc.perform(post("/api/v1/questions/" + questionId + "/chat")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().string("X-AI-Quota-Limit", "1"))
                .andExpect(header().string("X-AI-Quota-Remaining", "0"))
                .andExpect(header().string("X-AI-Quota-Reset", resetTime.toString()))
                .andExpect(jsonPath("$.threadId", is(threadId.toString())))
                .andExpect(jsonPath("$.questionId", is(questionId.toString())))
                .andExpect(jsonPath("$.turnCount", is(1)))
                .andExpect(jsonPath("$.maxTurns", is(6)))
                .andExpect(jsonPath("$.fallback", is(false)))
                .andExpect(jsonPath("$.pedagogicalReferences", hasSize(1)))
                .andExpect(jsonPath("$.pedagogicalReferences[0].contentSnippet", containsString("Equação de Torricelli")))
                .andExpect(jsonPath("$.quota.remainingToday", is(0)));
    }

    @Test
    @DisplayName("POST /api/v1/questions/{id}/chat when daily quota exceeded should return HTTP 429 and quota problem details")
    void shouldReturnTooManyRequestsWhenQuotaExhausted() throws Exception {
        UUID questionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String validToken = "valid.jwt.student.token";

        when(jwtValidator.validateToken(validToken)).thenReturn(true);
        when(jwtValidator.extractUserId(validToken)).thenReturn(userId);
        when(jwtValidator.extractRole(validToken)).thenReturn("ROLE_STUDENT");

        AskTutorRequest request = new AskTutorRequest();
        request.setMessage("Me ajude de novo.");

        Instant resetTime = Instant.now().plusSeconds(7200);
        AiQuotaStatus exhausted = new AiQuotaStatus(1, 1, 0, resetTime, false);

        when(tutorUseCase.askTutor(eq(questionId), eq(userId), eq("ROLE_STUDENT"), any()))
                .thenThrow(new DailyQuotaExceededException("You have used your 1 free Socratic AI consultation for today", exhausted));

        mockMvc.perform(post("/api/v1/questions/" + questionId + "/chat")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("X-AI-Quota-Limit", "1"))
                .andExpect(header().string("X-AI-Quota-Remaining", "0"))
                .andExpect(jsonPath("$.status", is(429)))
                .andExpect(jsonPath("$.type", is("https://aprovaenem.org/errors/DAILY_AI_QUOTA_EXHAUSTED")))
                .andExpect(jsonPath("$.title", is("Daily AI Tutor Quota Exhausted")))
                .andExpect(jsonPath("$.detail", containsString("You have used your 1 free Socratic AI consultation")))
                .andExpect(jsonPath("$.upgradeUrl", is("/pro")));
    }

    @Test
    @DisplayName("GET /api/v1/questions/{id}/chat should return HTTP 200 with chat history when authenticated")
    void shouldGetChatHistorySuccessfully() throws Exception {
        UUID questionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID threadId = UUID.randomUUID();
        String validToken = "valid.jwt.student.token";

        when(jwtValidator.validateToken(validToken)).thenReturn(true);
        when(jwtValidator.extractUserId(validToken)).thenReturn(userId);
        when(jwtValidator.extractRole(validToken)).thenReturn("ROLE_STUDENT");

        TutorChatMessage m1 = new TutorChatMessage(UUID.randomUUID(), threadId, ChatRole.STUDENT, "Como resolvo?", 10, 20, "gemini-1.5-flash", Instant.now());
        TutorChatMessage m2 = new TutorChatMessage(UUID.randomUUID(), threadId, ChatRole.AI_TUTOR, "Pense na fórmula de força.", 20, 30, "gemini-1.5-flash", Instant.now());

        TutorChatThread thread = new TutorChatThread(
                threadId, userId, questionId, ThreadStatus.ACTIVE, 1, 6,
                Instant.now(), Instant.now(), Instant.now(), List.of(m1, m2)
        );

        when(tutorUseCase.getThreadHistory(questionId, userId)).thenReturn(thread);

        mockMvc.perform(get("/api/v1/questions/" + questionId + "/chat")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.threadId", is(threadId.toString())))
                .andExpect(jsonPath("$.turnCount", is(1)))
                .andExpect(jsonPath("$.messages", hasSize(2)))
                .andExpect(jsonPath("$.messages[0].role", is("STUDENT")))
                .andExpect(jsonPath("$.messages[1].role", is("AI_TUTOR")));
    }

    @Test
    @DisplayName("DELETE /api/v1/questions/{id}/chat should return HTTP 200 and reset thread")
    void shouldResetChatSuccessfully() throws Exception {
        UUID questionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String validToken = "valid.jwt.student.token";

        when(jwtValidator.validateToken(validToken)).thenReturn(true);
        when(jwtValidator.extractUserId(validToken)).thenReturn(userId);
        when(jwtValidator.extractRole(validToken)).thenReturn("ROLE_STUDENT");

        mockMvc.perform(delete("/api/v1/questions/" + questionId + "/chat")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionId", is(questionId.toString())))
                .andExpect(jsonPath("$.message", containsString("has been reset")));

        verify(tutorUseCase).resetThread(questionId, userId);
    }

    @Test
    @DisplayName("GET /api/v1/questions/ai-quota should return HTTP 200 with daily quota status")
    void shouldCheckDailyQuotaSuccessfully() throws Exception {
        AiQuotaStatus status = new AiQuotaStatus(1, 0, 1, Instant.now().plusSeconds(86400), false);
        when(tutorUseCase.checkDailyQuota(null, "ANONYMOUS")).thenReturn(status);

        mockMvc.perform(get("/api/v1/questions/ai-quota"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dailyLimit", is(1)))
                .andExpect(jsonPath("$.remainingToday", is(1)))
                .andExpect(jsonPath("$.usedToday", is(0)));
    }
}
