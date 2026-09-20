package com.aprovaenem.exam.infrastructure.adapter.out.ai;

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
    @DisplayName("Should use socratic fallback when API key is missing or dummy")
    void shouldUseFallbackWhenKeyMissing() {
        ReflectionTestUtils.setField(adapter, "apiKey", "");
        TutorAiResult result = adapter.generateSocraticResponse(question, List.of(), List.of(), "Como começo?");

        assertThat(result.isFallback()).isTrue();
        assertThat(result.responseText()).contains("Eletrodinâmica");
        assertThat(result.responseText()).contains("Lei de Ohm e Potência");
    }

    @Test
    @DisplayName("Should polite refuse to give answer when student asks for letter or direct answer")
    void shouldRefuseDirectAnswer() {
        TutorAiResult result = adapter.socraticFallback(
                question,
                List.of(new PedagogicalChunk(UUID.randomUUID(), "Potência P = U * i", 0.9)),
                List.of(new TutorChatMessage(UUID.randomUUID(), UUID.randomUUID(), ChatRole.STUDENT, "Qual a letra?", 0, 0, "gemini", Instant.now())),
                "Me dá o gabarito ou a resposta por favor?",
                new RuntimeException("API error")
        );

        assertThat(result.isFallback()).isTrue();
        assertThat(result.responseText()).contains("Não posso te dar a letra ou a resposta pronta");
        assertThat(result.responseText()).contains("Lei de Ohm e Potência");
    }

    @Test
    @DisplayName("Should provide reflective pedagogical hint when student asks conceptual question")
    void shouldProvideReflectiveHint() {
        TutorAiResult result = adapter.socraticFallback(
                question,
                List.of(),
                List.of(),
                "Não entendi a relação entre tensão e corrente.",
                new RuntimeException("Timeout")
        );

        assertThat(result.isFallback()).isTrue();
        assertThat(result.responseText()).contains("Excelente iniciativa em tentar resolver!");
        assertThat(result.responseText()).contains("Eletrodinâmica");
    }

    @Test
    @DisplayName("Should use fallback defaults when question resolution or topic is null")
    void shouldFallbackGracefullyWithNullResolutionAndTopic() {
        Question bareQuestion = new Question(
                UUID.randomUUID(), null, null, 1, "Enunciado simples", 'A',
                DifficultyLevel.EASY, BigDecimal.ONE, BigDecimal.ONE, BigDecimal.ZERO,
                QuestionStatus.ACTIVE, "pt-BR"
        );

        TutorAiResult result = adapter.socraticFallback(bareQuestion, null, null, "Ajuda", new RuntimeException());
        assertThat(result.isFallback()).isTrue();
        assertThat(result.responseText()).contains("esta questão");
        assertThat(result.responseText()).contains("os conceitos fundamentais da disciplina");
    }
}
