package com.aprovaenem.exam.infrastructure.adapter.out.ai;

import com.aprovaenem.common.exception.BusinessException;
import com.aprovaenem.exam.domain.model.ChatRole;
import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.PedagogicalChunk;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionOption;
import com.aprovaenem.exam.domain.model.QuestionResolution;
import com.aprovaenem.exam.domain.model.QuestionStatus;
import com.aprovaenem.exam.domain.model.TutorAiResult;
import com.aprovaenem.exam.domain.model.TutorChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@DisplayName("GeminiTutorClientAdapter Unit Tests")
class GeminiTutorClientAdapterTest {

    private GeminiTutorClientAdapter adapter;
    private MockRestServiceServer mockServer;
    private ObjectMapper objectMapper = new ObjectMapper();
    private Question question;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        adapter = new GeminiTutorClientAdapter(builder, objectMapper);

        ReflectionTestUtils.setField(adapter, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(adapter, "model", "gemini-1.5-flash");
        ReflectionTestUtils.setField(adapter, "baseUrl", "https://generativelanguage.googleapis.com");

        question = new Question(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                110,
                "Qual a potência dissipada no circuito?",
                'B',
                DifficultyLevel.MEDIUM,
                BigDecimal.ONE,
                BigDecimal.ONE,
                BigDecimal.ZERO,
                QuestionStatus.ACTIVE,
                "pt-BR"
        );
        question.setTopicName("Eletrodinâmica");
        question.setDiscipline("Física");
        question.setResolution(new QuestionResolution(UUID.randomUUID(), question.getId(), "Usa P = V * I", "Lei de Ohm e Potência", "Prof"));
        question.addOption(new QuestionOption(UUID.randomUUID(), question.getId(), 'A', "10W", false));
        question.addOption(new QuestionOption(UUID.randomUUID(), question.getId(), 'B', "20W", true));
    }

    @Test
    @DisplayName("Should call Gemini API successfully and return candidate text")
    void shouldCallGeminiApiSuccessfully() {
        String expectedUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        String geminiJson = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          { "text": "Excelente raciocínio! Qual grandeza relaciona potência e corrente?" }
                        ]
                      }
                    }
                  ]
                }
                """;

        mockServer.expect(requestTo(expectedUrl))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", "test-api-key"))
                .andRespond(withSuccess(geminiJson, MediaType.APPLICATION_JSON));

        List<PedagogicalChunk> chunks = List.of(new PedagogicalChunk(UUID.randomUUID(), "P = U * i", 0.95));
        List<TutorChatMessage> history = List.of(
                new TutorChatMessage(UUID.randomUUID(), UUID.randomUUID(), ChatRole.STUDENT, "Oi", 0, 0, "gemini", Instant.now()),
                new TutorChatMessage(UUID.randomUUID(), UUID.randomUUID(), ChatRole.AI_TUTOR, "Olá!", 0, 0, "gemini", Instant.now())
        );

        TutorAiResult result = adapter.generateSocraticResponse(question, chunks, history, "Tenho uma dúvida");

        mockServer.verify();
        assertThat(result.isFallback()).isFalse();
        assertThat(result.responseText()).isEqualTo("Excelente raciocínio! Qual grandeza relaciona potência e corrente?");
    }

    @Test
    @DisplayName("Should handle empty candidate parts gracefully")
    void shouldHandleEmptyCandidateParts() {
        String expectedUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        String geminiJson = "{\"candidates\": [{\"content\": {\"parts\": []}}]}";

        mockServer.expect(requestTo(expectedUrl))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(geminiJson, MediaType.APPLICATION_JSON));

        TutorAiResult result = adapter.generateSocraticResponse(question, null, null, "Dúvida");
        assertThat(result.isFallback()).isFalse();
        assertThat(result.responseText()).contains("Consegui analisar sua dúvida");
    }

    @Test
    @DisplayName("Should throw BusinessException when API key is missing or placeholder")
    void shouldThrowExceptionWhenKeyMissingOrPlaceholder() {
        ReflectionTestUtils.setField(adapter, "apiKey", "");
        assertThatThrownBy(() -> adapter.generateSocraticResponse(question, List.of(), List.of(), "Como começo?"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("GEMINI_API_KEY");

        ReflectionTestUtils.setField(adapter, "apiKey", "your_google_gemini_api_key_here");
        assertThatThrownBy(() -> adapter.generateSocraticResponse(question, List.of(), List.of(), "Como começo?"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("GEMINI_API_KEY");
    }

    @Test
    @DisplayName("Should intercept direct answer request in live flow before calling Gemini API")
    void shouldInterceptDirectAnswerRequestInLiveFlow() {
        // Notice: mockServer expects ZERO requests because pre-flight guardrail intercepts it
        TutorAiResult result = adapter.generateSocraticResponse(question, List.of(), List.of(), "Qual é a resposta correta e a letra do gabarito?");

        mockServer.verify();
        assertThat(result.isFallback()).isFalse();
        assertThat(result.responseText()).contains("Não posso te dar a letra ou a resposta pronta");
        assertThat(result.responseText()).contains("Lei de Ohm e Potência");
    }

    @Test
    @DisplayName("Should sanitize candidate output if Gemini leaks direct answer")
    void shouldSanitizeCandidateOutputIfGeminiLeaksDirectAnswer() {
        String expectedUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        String geminiSpoilerJson = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          { "text": "A resposta correta é a letra B porque a potência é calculada por P = U * i." }
                        ]
                      }
                    }
                  ]
                }
                """;

        mockServer.expect(requestTo(expectedUrl))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", "test-api-key"))
                .andRespond(withSuccess(geminiSpoilerJson, MediaType.APPLICATION_JSON));

        TutorAiResult result = adapter.generateSocraticResponse(question, List.of(), List.of(), "Como relacionar as grandezas?");

        mockServer.verify();
        assertThat(result.isFallback()).isFalse();
        assertThat(result.responseText()).doesNotContain("A resposta correta é a letra B");
        assertThat(result.responseText()).contains("Lei de Ohm e Potência");
        assertThat(result.responseText()).contains("qual critério conceitual nos ajuda");
    }

    @Test
    @DisplayName("Should throw BusinessException when Gemini API returns HTTP server error")
    void shouldThrowBusinessExceptionWhenGeminiApiFails() {
        String expectedUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

        mockServer.expect(requestTo(expectedUrl))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        assertThatThrownBy(() -> adapter.generateSocraticResponse(question, List.of(), List.of(), "Não entendi a relação entre tensão e corrente."))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Falha ao comunicar com a API do Google Gemini");

        mockServer.verify();
    }

    @Test
    @DisplayName("Should rethrow BusinessException or wrap generic Throwable in socraticFallback")
    void shouldThrowBusinessExceptionInSocraticFallback() {
        assertThatThrownBy(() -> adapter.socraticFallback(
                question,
                List.of(),
                List.of(),
                "Não entendi a relação entre tensão e corrente.",
                new RuntimeException("Timeout")
        ))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Não foi possível obter resposta da API do Google Gemini");

        BusinessException original = new BusinessException("GEMINI_API_KEY ausente");
        assertThatThrownBy(() -> adapter.socraticFallback(
                question,
                List.of(),
                List.of(),
                "Ajuda",
                original
        ))
                .isSameAs(original);
    }
}
