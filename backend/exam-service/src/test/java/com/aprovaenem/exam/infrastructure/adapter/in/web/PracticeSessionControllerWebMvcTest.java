package com.aprovaenem.exam.infrastructure.adapter.in.web;

import com.aprovaenem.exam.domain.model.AttemptResult;
import com.aprovaenem.exam.domain.model.DiagnosticReport;
import com.aprovaenem.exam.domain.model.PracticeSession;
import com.aprovaenem.exam.domain.model.SessionType;
import com.aprovaenem.exam.domain.model.StartSessionCommand;
import com.aprovaenem.exam.domain.model.SubmitAnswerCommand;
import com.aprovaenem.exam.domain.port.in.PracticeSessionUseCase;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.StartSessionRequest;
import com.aprovaenem.exam.infrastructure.adapter.in.web.dto.SubmitAnswerRequest;
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
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PracticeSessionController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("PracticeSessionController WebMvc Tests")
class PracticeSessionControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PracticeSessionUseCase sessionUseCase;

    @MockBean
    private JwtTokenValidator jwtValidator;

    @Test
    @DisplayName("POST /api/v1/practice/sessions with X-Session-Id header should start session and return HTTP 201")
    void shouldStartSessionWithHeaderSuccessfully() throws Exception {
        UUID sessionId = UUID.randomUUID();
        String anonymousSessionId = "anon-sess-1234";

        PracticeSession session = new PracticeSession(sessionId, null, anonymousSessionId, SessionType.TOPIC_PRACTICE, 10);
        when(sessionUseCase.startSession(any(StartSessionCommand.class))).thenReturn(session);

        StartSessionRequest request = StartSessionRequest.builder()
                .sessionType(SessionType.TOPIC_PRACTICE)
                .totalQuestions(10)
                .build();

        mockMvc.perform(post("/api/v1/practice/sessions")
                        .header("X-Session-Id", anonymousSessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(sessionId.toString())))
                .andExpect(jsonPath("$.anonymousSessionId", is(anonymousSessionId)))
                .andExpect(jsonPath("$.sessionType", is("TOPIC_PRACTICE")))
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")))
                .andExpect(jsonPath("$.totalQuestions", is(10)));
    }

    @Test
    @DisplayName("POST /api/v1/practice/sessions with anonymousSessionId in body should return HTTP 201")
    void shouldStartSessionWithBodySessionIdSuccessfully() throws Exception {
        UUID sessionId = UUID.randomUUID();
        String anonymousSessionId = "anon-sess-5678";

        PracticeSession session = new PracticeSession(sessionId, null, anonymousSessionId, SessionType.DIAGNOSTIC_QUICK, 5);
        when(sessionUseCase.startSession(any(StartSessionCommand.class))).thenReturn(session);

        StartSessionRequest request = StartSessionRequest.builder()
                .anonymousSessionId(anonymousSessionId)
                .sessionType(SessionType.DIAGNOSTIC_QUICK)
                .totalQuestions(5)
                .build();

        mockMvc.perform(post("/api/v1/practice/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(sessionId.toString())))
                .andExpect(jsonPath("$.anonymousSessionId", is(anonymousSessionId)))
                .andExpect(jsonPath("$.sessionType", is("DIAGNOSTIC_QUICK")));
    }

    @Test
    @DisplayName("POST /api/v1/practice/sessions without session ID should return HTTP 400 Business Exception")
    void shouldReturnBadRequestWhenNoSessionIdProvided() throws Exception {
        StartSessionRequest request = StartSessionRequest.builder()
                .sessionType(SessionType.EXAM_SIMULATION)
                .totalQuestions(10)
                .build();

        mockMvc.perform(post("/api/v1/practice/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.message", containsString("Session ID is required")));
    }

    @Test
    @DisplayName("GET /api/v1/practice/sessions/{id} should return HTTP 200 with session details")
    void shouldGetSessionByIdSuccessfully() throws Exception {
        UUID sessionId = UUID.randomUUID();
        PracticeSession session = new PracticeSession(sessionId, null, "anon-123", SessionType.TOPIC_PRACTICE, 10);

        when(sessionUseCase.getSession(sessionId)).thenReturn(session);

        mockMvc.perform(get("/api/v1/practice/sessions/" + sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sessionId.toString())))
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")));
    }

    @Test
    @DisplayName("POST /api/v1/practice/sessions/{id}/attempts should record attempt and return HTTP 201 with answer explanation")
    void shouldSubmitAnswerSuccessfully() throws Exception {
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        UUID attemptId = UUID.randomUUID();

        SubmitAnswerRequest request = SubmitAnswerRequest.builder()
                .questionId(questionId)
                .selectedOption('C')
                .timeSpentSeconds(45)
                .build();

        AttemptResult result = new AttemptResult(
                attemptId,
                sessionId,
                questionId,
                'C',
                true,
                'C',
                "A fotossíntese converte energia luminosa em energia química.",
                "Fotossíntese, Cloroplastos",
                "Prof. Bio 2024"
        );

        when(sessionUseCase.submitAnswer(any(SubmitAnswerCommand.class))).thenReturn(result);

        mockMvc.perform(post("/api/v1/practice/sessions/" + sessionId + "/attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.attemptId", is(attemptId.toString())))
                .andExpect(jsonPath("$.sessionId", is(sessionId.toString())))
                .andExpect(jsonPath("$.questionId", is(questionId.toString())))
                .andExpect(jsonPath("$.selectedOption", is("C")))
                .andExpect(jsonPath("$.correct", is(true)))
                .andExpect(jsonPath("$.correctOption", is("C")))
                .andExpect(jsonPath("$.baseExplanation", containsString("A fotossíntese converte")));
    }

    @Test
    @DisplayName("POST /api/v1/practice/sessions/{id}/attempts with missing questionId should return HTTP 400 Validation Error")
    void shouldReturnBadRequestWhenSubmittingAnswerWithoutQuestionId() throws Exception {
        UUID sessionId = UUID.randomUUID();
        SubmitAnswerRequest request = SubmitAnswerRequest.builder()
                .selectedOption('B')
                .build(); // questionId is null

        mockMvc.perform(post("/api/v1/practice/sessions/" + sessionId + "/attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Failed")));
    }

    @Test
    @DisplayName("POST /api/v1/practice/sessions/{id}/complete should complete session and return HTTP 200 Diagnostic Report")
    void shouldCompleteSessionSuccessfully() throws Exception {
        UUID sessionId = UUID.randomUUID();
        UUID reportId = UUID.randomUUID();

        DiagnosticReport report = new DiagnosticReport(
                reportId,
                sessionId,
                new BigDecimal("80.00"),
                Map.of(),
                List.of("Termodinâmica", "Cinemática")
        );

        when(sessionUseCase.completeSession(sessionId)).thenReturn(report);

        mockMvc.perform(post("/api/v1/practice/sessions/" + sessionId + "/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(reportId.toString())))
                .andExpect(jsonPath("$.sessionId", is(sessionId.toString())))
                .andExpect(jsonPath("$.scorePercentage", is(80.00)))
                .andExpect(jsonPath("$.recommendedTopics[0]", is("Termodinâmica")));
    }

    @Test
    @DisplayName("GET /api/v1/practice/sessions/{id}/diagnostic should return HTTP 200 Diagnostic Report")
    void shouldGetDiagnosticReportSuccessfully() throws Exception {
        UUID sessionId = UUID.randomUUID();
        UUID reportId = UUID.randomUUID();

        DiagnosticReport report = new DiagnosticReport(
                reportId,
                sessionId,
                new BigDecimal("85.00"),
                Map.of(),
                List.of("Eletrodinâmica")
        );

        when(sessionUseCase.getDiagnosticReport(sessionId)).thenReturn(report);

        mockMvc.perform(get("/api/v1/practice/sessions/" + sessionId + "/diagnostic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(reportId.toString())))
                .andExpect(jsonPath("$.sessionId", is(sessionId.toString())))
                .andExpect(jsonPath("$.scorePercentage", is(85.00)));
    }
}
