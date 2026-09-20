package com.aprovaenem.exam.infrastructure.adapter.out.ai;

import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionOption;
import com.aprovaenem.exam.domain.model.QuestionResolution;
import com.aprovaenem.exam.domain.model.QuestionStatus;
import com.aprovaenem.exam.domain.model.TutorAiResult;
import com.aprovaenem.exam.domain.model.TutorChatMessage;
import com.aprovaenem.exam.domain.model.TutorConsultationResult;
import com.aprovaenem.exam.domain.port.in.SocraticTutorUseCase;
import com.aprovaenem.exam.domain.port.out.QuestionRepositoryPort;
import com.aprovaenem.exam.domain.port.out.TutorChatRepositoryPort;
import com.sun.net.httpserver.HttpServer;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.io.IOException;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@DisplayName("TASK-S3-07: Resilience4j Chaos & Circuit Breaker Fault Injection IT")
class Resilience4jChaosAndCircuitBreakerIT {

    private enum ServerMode {
        SUCCESS,
        TIMEOUT,
        RATE_LIMIT_429,
        SERVER_ERROR_503
    }

    private static final HttpServer mockGeminiServer;
    private static final int mockPort;
    private static final AtomicInteger requestCounter = new AtomicInteger(0);
    private static volatile ServerMode serverMode = ServerMode.SUCCESS;

    static {
        try {
            mockGeminiServer = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            mockPort = mockGeminiServer.getAddress().getPort();
            mockGeminiServer.createContext("/", exchange -> {
                requestCounter.incrementAndGet();
                exchange.getRequestBody().readAllBytes();

                switch (serverMode) {
                    case SUCCESS -> {
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
                        byte[] bytes = geminiJson.getBytes(StandardCharsets.UTF_8);
                        exchange.getResponseHeaders().set("Content-Type", "application/json");
                        exchange.sendResponseHeaders(200, bytes.length);
                        try (OutputStream os = exchange.getResponseBody()) {
                            os.write(bytes);
                        }
                    }
                    case TIMEOUT -> {
                        try {
                            Thread.sleep(2000);
                        } catch (InterruptedException ignored) {
                            Thread.currentThread().interrupt();
                        }
                        byte[] bytes = "{\"error\": \"timeout\"}".getBytes(StandardCharsets.UTF_8);
                        exchange.getResponseHeaders().set("Content-Type", "application/json");
                        exchange.sendResponseHeaders(504, bytes.length);
                        try (OutputStream os = exchange.getResponseBody()) {
                            os.write(bytes);
                        }
                    }
                    case RATE_LIMIT_429 -> {
                        String err = "{\"error\": {\"code\": 429, \"message\": \"Quota exceeded for gemini-1.5-flash\"}}";
                        byte[] bytes = err.getBytes(StandardCharsets.UTF_8);
                        exchange.getResponseHeaders().set("Content-Type", "application/json");
                        exchange.sendResponseHeaders(429, bytes.length);
                        try (OutputStream os = exchange.getResponseBody()) {
                            os.write(bytes);
                        }
                    }
                    case SERVER_ERROR_503 -> {
                        String err = "{\"error\": {\"code\": 503, \"message\": \"Service Unavailable\"}}";
                        byte[] bytes = err.getBytes(StandardCharsets.UTF_8);
                        exchange.getResponseHeaders().set("Content-Type", "application/json");
                        exchange.sendResponseHeaders(503, bytes.length);
                        try (OutputStream os = exchange.getResponseBody()) {
                            os.write(bytes);
                        }
                    }
                }
            });
            mockGeminiServer.start();
        } catch (IOException e) {
            throw new RuntimeException("Failed to bootstrap embedded mock Gemini server", e);
        }
    }

    @AfterAll
    static void tearDownServer() {
        if (mockGeminiServer != null) {
            mockGeminiServer.stop(0);
        }
    }

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("pgvector/pgvector:pg16").asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("exam_db")
            .withUsername("aprovaenem_user")
            .withPassword("secret");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7.2-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");

        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
        registry.add("spring.data.redis.password", () -> "");
        registry.add("spring.cache.type", () -> "redis");

        registry.add("gemini.api-key", () -> "mock-test-gemini-key");
        registry.add("gemini.model", () -> "gemini-1.5-flash");
        registry.add("gemini.base-url", () -> "http://127.0.0.1:" + mockPort);
        registry.add("gemini.timeout-seconds", () -> "1");
    }

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @MockBean
    private ConnectionFactory connectionFactory;

    @Autowired
    private GeminiTutorClientAdapter geminiTutorClientAdapter;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @Autowired
    private SocraticTutorUseCase socraticTutorUseCase;

    @Autowired
    private QuestionRepositoryPort questionRepository;

    @Autowired
    private TutorChatRepositoryPort tutorChatRepository;

    private Question sampleQuestion;

    @BeforeEach
    void setUp() {
        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("geminiTutor");
        cb.reset();
        serverMode = ServerMode.SUCCESS;
        requestCounter.set(0);

        sampleQuestion = createSampleQuestion();
    }

    @Test
    @DisplayName("1. Normal operation: should call Gemini API successfully when Circuit Breaker is CLOSED")
    void shouldCallGeminiSuccessfullyWhenCircuitBreakerIsClosed() {
        serverMode = ServerMode.SUCCESS;
        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("geminiTutor");

        TutorAiResult result = geminiTutorClientAdapter.generateSocraticResponse(
                sampleQuestion, List.of(), List.of(), "Qual fórmula devo usar?"
        );

        assertThat(result.isFallback()).isFalse();
        assertThat(result.responseText()).contains("Excelente raciocínio!");
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.CLOSED);
        assertThat(requestCounter.get()).isEqualTo(1);
    }

    @Test
    @DisplayName("2. Latency Fault Injection: should trigger fallback gracefully on Gemini API timeout (> 1s)")
    void shouldFallbackGracefullyOnGeminiApiTimeout() {
        serverMode = ServerMode.TIMEOUT;
        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("geminiTutor");

        long start = System.currentTimeMillis();
        TutorAiResult result = geminiTutorClientAdapter.generateSocraticResponse(
                sampleQuestion, List.of(), List.of(), "Não entendi nada da questão."
        );
        long duration = System.currentTimeMillis() - start;

        assertThat(duration).isGreaterThanOrEqualTo(900);
        assertThat(result.isFallback()).isTrue();
        assertThat(result.responseText()).contains("Eletrodinâmica");
        assertThat(result.responseText()).contains("Potência Elétrica e Lei de Joule");
        assertThat(requestCounter.get()).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("3. HTTP 429 Quota Exhausted: should trigger fallback gracefully on rate limiting")
    void shouldFallbackGracefullyOnGeminiHttp429QuotaExhausted() {
        serverMode = ServerMode.RATE_LIMIT_429;

        TutorAiResult result = geminiTutorClientAdapter.generateSocraticResponse(
                sampleQuestion, List.of(), List.of(), "Qual o gabarito ou letra?"
        );

        assertThat(result.isFallback()).isTrue();
        assertThat(result.responseText()).contains("Não posso te dar a letra ou a resposta pronta");
        assertThat(result.responseText()).contains("Potência Elétrica e Lei de Joule");
        assertThat(requestCounter.get()).isEqualTo(1);
    }

    @Test
    @DisplayName("4. Sustained Chaos: should open Circuit Breaker after 3 failures and short-circuit calls with 0 network traffic")
    void shouldOpenCircuitBreakerAfterThreeConsecutiveFailuresAndShortCircuitCalls() {
        serverMode = ServerMode.SERVER_ERROR_503;
        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("geminiTutor");

        // 3 consecutive calls fail, meeting minimum-number-of-calls=3 and exceeding 50% threshold
        for (int i = 1; i <= 3; i++) {
            TutorAiResult failResult = geminiTutorClientAdapter.generateSocraticResponse(
                    sampleQuestion, List.of(), List.of(), "Dúvida " + i
            );
            assertThat(failResult.isFallback()).isTrue();
        }

        assertThat(requestCounter.get()).isEqualTo(3);
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.OPEN);

        // 4th call when circuit is OPEN: must immediately short-circuit without calling the mock server!
        int requestsBeforeShortCircuit = requestCounter.get();
        TutorAiResult shortCircuited = geminiTutorClientAdapter.generateSocraticResponse(
                sampleQuestion, List.of(), List.of(), "Outra dúvida com circuito aberto"
        );

        assertThat(shortCircuited.isFallback()).isTrue();
        assertThat(shortCircuited.responseText()).contains("Eletrodinâmica");
        assertThat(requestCounter.get())
                .as("Request counter must not increase because Circuit Breaker short-circuits network calls")
                .isEqualTo(requestsBeforeShortCircuit);
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.OPEN);
    }

    @Test
    @DisplayName("5. Recovery Cycle: should transition OPEN -> HALF_OPEN -> CLOSED upon successful probing calls")
    void shouldTransitionFromOpenToHalfOpenAndRecoverToClosedOnSuccess() {
        serverMode = ServerMode.SERVER_ERROR_503;
        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("geminiTutor");

        // Trip breaker to OPEN
        for (int i = 0; i < 3; i++) {
            geminiTutorClientAdapter.generateSocraticResponse(
                    sampleQuestion, List.of(), List.of(), "Erro " + i
            );
        }
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.OPEN);

        // Simulate probe transition to HALF_OPEN
        cb.transitionToHalfOpenState();
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.HALF_OPEN);

        // Backend recovers
        serverMode = ServerMode.SUCCESS;

        // In HALF_OPEN, permitted-number-of-calls-in-half-open-state = 2
        TutorAiResult probe1 = geminiTutorClientAdapter.generateSocraticResponse(
                sampleQuestion, List.of(), List.of(), "Probe 1"
        );
        assertThat(probe1.isFallback()).isFalse();

        TutorAiResult probe2 = geminiTutorClientAdapter.generateSocraticResponse(
                sampleQuestion, List.of(), List.of(), "Probe 2"
        );
        assertThat(probe2.isFallback()).isFalse();

        // Breaker should have automatically closed after 2 successful probes
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.CLOSED);

        // Subsequent call proceeds normally in CLOSED state
        TutorAiResult subsequent = geminiTutorClientAdapter.generateSocraticResponse(
                sampleQuestion, List.of(), List.of(), "Pergunta normal pós-recuperação"
        );
        assertThat(subsequent.isFallback()).isFalse();
        assertThat(subsequent.responseText()).contains("Excelente raciocínio!");
    }

    private static final UUID SEEDED_QUESTION_ID = UUID.fromString("44444444-0000-0000-0000-000000000001");

    @Test
    @DisplayName("6. End-to-End Service Orchestration: SocraticTutorService propagates isFallback & records proper model")
    void shouldOrchestrateEndToEndInSocraticTutorServiceWithFallbackPropagation() {
        UUID studentId = UUID.randomUUID();

        // 1. When Gemini fails (503), service falls back gracefully with HTTP 200 contract
        serverMode = ServerMode.SERVER_ERROR_503;

        TutorConsultationResult fallbackResult = socraticTutorUseCase.askTutor(
                SEEDED_QUESTION_ID,
                studentId,
                "ROLE_PREMIUM_STUDENT",
                "Como calculo a potência?"
        );

        assertThat(fallbackResult.isFallback()).isTrue();
        assertThat(fallbackResult.getResponseText()).isNotEmpty();

        List<TutorChatMessage> fallbackMessages = tutorChatRepository.findMessagesByThreadId(fallbackResult.getThreadId());
        assertThat(fallbackMessages).isNotEmpty();
        TutorChatMessage lastFallbackMsg = fallbackMessages.get(fallbackMessages.size() - 1);
        assertThat(lastFallbackMsg.getModelUsed()).isEqualTo("static-inep-fallback");

        // 2. When Gemini recovers, subsequent consultation uses live LLM
        serverMode = ServerMode.SUCCESS;
        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("geminiTutor");
        cb.reset();

        TutorConsultationResult liveResult = socraticTutorUseCase.askTutor(
                SEEDED_QUESTION_ID,
                studentId,
                "ROLE_PREMIUM_STUDENT",
                "Entendi! E agora como calculo a corrente?"
        );

        assertThat(liveResult.isFallback()).isFalse();
        assertThat(liveResult.getResponseText()).contains("Excelente raciocínio!");

        List<TutorChatMessage> liveMessages = tutorChatRepository.findMessagesByThreadId(liveResult.getThreadId());
        assertThat(liveMessages).isNotEmpty();
        TutorChatMessage lastLiveMsg = liveMessages.get(liveMessages.size() - 1);
        assertThat(lastLiveMsg.getModelUsed()).isEqualTo("gemini-1.5-flash");
    }

    private Question createSampleQuestion() {
        Question question = new Question(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                142,
                "Um chuveiro elétrico opera sob tensão de 220V com potência de 4400W. Calcule a corrente elétrica necessária.",
                'C',
                DifficultyLevel.MEDIUM,
                BigDecimal.valueOf(650.00),
                BigDecimal.valueOf(1.20),
                BigDecimal.valueOf(0.20),
                QuestionStatus.ACTIVE,
                "pt-BR"
        );
        question.setDiscipline("Física");
        question.setTopicName("Eletrodinâmica");
        question.setResolution(new QuestionResolution(
                UUID.randomUUID(),
                question.getId(),
                "A corrente é dada por i = P / U = 4400 / 220 = 20A.",
                "Potência Elétrica e Lei de Joule",
                "Professor de Física"
        ));
        question.addOption(new QuestionOption(UUID.randomUUID(), question.getId(), 'A', "10 A", false));
        question.addOption(new QuestionOption(UUID.randomUUID(), question.getId(), 'B', "15 A", false));
        question.addOption(new QuestionOption(UUID.randomUUID(), question.getId(), 'C', "20 A", true));
        question.addOption(new QuestionOption(UUID.randomUUID(), question.getId(), 'D', "25 A", false));
        question.addOption(new QuestionOption(UUID.randomUUID(), question.getId(), 'E', "30 A", false));
        return question;
    }
}
