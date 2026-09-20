package com.aprovaenem.exam.infrastructure.adapter.out.ai;

import com.aprovaenem.exam.domain.model.PedagogicalChunk;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionOption;
import com.aprovaenem.exam.domain.model.QuestionResolution;
import com.aprovaenem.exam.domain.model.TutorAiResult;
import com.aprovaenem.exam.domain.model.TutorChatMessage;
import com.aprovaenem.exam.domain.port.out.TutorAiPort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GeminiTutorClientAdapter implements TutorAiPort {

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com}")
    private String baseUrl;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiTutorClientAdapter(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    @CircuitBreaker(name = "geminiTutor", fallbackMethod = "socraticFallback")
    public TutorAiResult generateSocraticResponse(
            Question question,
            List<PedagogicalChunk> pedagogicalChunks,
            List<TutorChatMessage> history,
            String studentMessage
    ) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equalsIgnoreCase("dummy_or_test_key")) {
            log.info("Gemini API key is not configured or is placeholder. Using pedagogical fallback.");
            return socraticFallback(question, pedagogicalChunks, history, studentMessage, new IllegalStateException("Gemini API key not configured"));
        }

        String systemInstruction = buildSystemPrompt(question, pedagogicalChunks);
        List<Map<String, Object>> contents = buildConversationContents(history, studentMessage);

        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("system_instruction", Map.of(
                "parts", List.of(Map.of("text", systemInstruction))
        ));
        requestPayload.put("contents", contents);
        requestPayload.put("generationConfig", Map.of(
                "temperature", 0.4,
                "maxOutputTokens", 600
        ));

        String url = String.format("%s/v1beta/models/%s:generateContent", baseUrl, model);

        String responseBody = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .header("x-goog-api-key", apiKey)
                .body(requestPayload)
                .retrieve()
                .body(String.class);

        return TutorAiResult.success(extractCandidateText(responseBody));
    }

    public TutorAiResult socraticFallback(
            Question question,
            List<PedagogicalChunk> pedagogicalChunks,
            List<TutorChatMessage> history,
            String studentMessage,
            Throwable t
    ) {
        log.warn("Gemini Tutor call diverted to Socratic fallback. Reason: {}", t.getMessage());

        QuestionResolution res = question.getResolution();
        String keyConcepts = (res != null && res.getKeyConcepts() != null)
                ? res.getKeyConcepts()
                : "os conceitos fundamentais da disciplina";

        String topicName = question.getTopicName() != null ? question.getTopicName() : "esta questão";

        if (studentMessage != null && (studentMessage.toLowerCase().contains("resposta") ||
                studentMessage.toLowerCase().contains("letra") ||
                studentMessage.toLowerCase().contains("gabarito"))) {
            return TutorAiResult.fallback("Como seu Tutor Socrático do AprovaENEM, minha função é te guiar no raciocínio para que você domine o conteúdo! " +
                    "Não posso te dar a letra ou a resposta pronta. " +
                    "Em vez disso, que tal identificarmos juntos: quais dados o enunciado nos dá e qual é o conceito de " + keyConcepts + " aplicável aqui?");
        }

        return TutorAiResult.fallback(String.format(
                "Excelente iniciativa em tentar resolver! Vamos analisar a questão sobre **%s** passo a passo.\n\n" +
                "💡 **Dica reflexiva**: Lembre-se de conectar a pergunta com %s.\n\n" +
                "Qual é o primeiro passo que você daria para isolar as grandezas dadas pelo enunciado?",
                topicName, keyConcepts
        ));
    }

    private String buildSystemPrompt(Question question, List<PedagogicalChunk> pedagogicalChunks) {
        StringBuilder sb = new StringBuilder();
        sb.append("Você é o Tutor Socrático Oficial da plataforma AprovaENEM, preparando estudantes brasileiros para o ENEM.\n");
        sb.append("DIRETRIZ PEDAGÓGICA ABSOLUTA: Use o método socrático. Faça perguntas norteadoras, proponha analogias, quebre problemas complexos em passos simples.\n");
        sb.append("REGRA DE OURO INVIOLÁVEL: NUNCA diga qual alternativa é a correta (A, B, C, D, E), NUNCA revele a resposta final ou resolva o cálculo inteiro pelo estudante.\n");
        sb.append("Se o estudante insistir para saber a resposta ou a letra, recuse educadamente e proponha o próximo passo lógico.\n");
        sb.append("Responda sempre em Português do Brasil (pt-BR), tom cordial, empático e encorajador. Use LaTeX ($...$) para equações.\n\n");

        sb.append("--- CONTEXTO DA QUESTÃO ---\n");
        sb.append("Enunciado: ").append(question.getStatement()).append("\n");
        sb.append("Disciplina: ").append(question.getDiscipline()).append(" | Tópico: ").append(question.getTopicName()).append("\n");
        if (question.getOptions() != null) {
            sb.append("Alternativas apresentadas:\n");
            for (QuestionOption opt : question.getOptions()) {
                sb.append("  (").append(opt.getOptionLetter()).append(") ").append(opt.getOptionText()).append("\n");
            }
        }

        if (pedagogicalChunks != null && !pedagogicalChunks.isEmpty()) {
            sb.append("\n--- BASE DE CONHECIMENTO PEDAGÓGICO RECOMENDADA (RAG) ---\n");
            for (PedagogicalChunk chunk : pedagogicalChunks) {
                sb.append("- ").append(chunk.getContent()).append("\n");
            }
        }

        return sb.toString();
    }

    private List<Map<String, Object>> buildConversationContents(List<TutorChatMessage> history, String studentMessage) {
        List<Map<String, Object>> contents = new ArrayList<>();

        if (history != null) {
            for (TutorChatMessage msg : history) {
                String role = msg.getRole().name().equals("STUDENT") ? "user" : "model";
                contents.add(Map.of(
                        "role", role,
                        "parts", List.of(Map.of("text", msg.getContent()))
                ));
            }
        }

        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", studentMessage))
        ));

        return contents;
    }

    private String extractCandidateText(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
        }
        return "Consegui analisar sua dúvida! Vamos refletir sobre as grandezas envolvidas no problema.";
    }
}
