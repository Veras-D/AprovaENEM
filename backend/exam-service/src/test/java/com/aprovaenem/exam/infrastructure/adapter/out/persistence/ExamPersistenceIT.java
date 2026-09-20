package com.aprovaenem.exam.infrastructure.adapter.out.persistence;

import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.PagedResult;
import com.aprovaenem.exam.domain.model.PracticeSession;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionFilterCommand;
import com.aprovaenem.exam.domain.model.QuestionOption;
import com.aprovaenem.exam.domain.model.QuestionResolution;
import com.aprovaenem.exam.domain.model.QuestionStatus;
import com.aprovaenem.exam.domain.model.SessionStatus;
import com.aprovaenem.exam.domain.model.SessionType;
import com.aprovaenem.exam.domain.model.StudentAttempt;
import com.aprovaenem.exam.domain.port.out.PracticeSessionRepositoryPort;
import com.aprovaenem.exam.domain.port.out.QuestionRepositoryPort;
import com.aprovaenem.exam.domain.port.out.TutorQuotaPort;
import com.aprovaenem.exam.infrastructure.adapter.out.ai.GeminiTutorClientAdapter;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@DisplayName("ExamPersistence & pgvector Flyway PostgreSQL 16 Testcontainers Integration Test")
class ExamPersistenceIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("pgvector/pgvector:pg16").asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("exam_db")
            .withUsername("aprovaenem_user")
            .withPassword("secret");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.cache.type", () -> "none");
    }

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @MockBean
    private ConnectionFactory connectionFactory;

    @MockBean
    private TutorQuotaPort tutorQuotaPort;

    @MockBean
    private GeminiTutorClientAdapter geminiTutorClientAdapter;

    @Autowired
    private Flyway flyway;

    @Autowired
    private QuestionRepositoryPort questionRepository;

    @Autowired
    private PracticeSessionRepositoryPort sessionRepository;

    private static final UUID SEEDED_QUESTION_ID = UUID.fromString("44444444-0000-0000-0000-000000000001");
    private static final UUID SEEDED_EXAM_EDITION_ID = UUID.fromString("22222222-0000-0000-0000-000000002023");
    private static final UUID SEEDED_TOPIC_ID = UUID.fromString("33333333-0000-0000-0000-000000000003");

    @Test
    @DisplayName("Flyway migrations V1 (pgvector), V2 (indexes), V3 (seed), V4 (chat/RAG) should apply cleanly")
    void shouldExecuteFlywayMigrationsWithPgvectorAndVerifySeed() {
        assertThat(flyway.info().applied()).isNotEmpty();
        assertThat(flyway.info().applied()).hasSizeGreaterThanOrEqualTo(4);

        Optional<Question> seededQuestion = questionRepository.findById(SEEDED_QUESTION_ID);
        assertThat(seededQuestion).isPresent();
        assertThat(seededQuestion.get().getStatement()).contains("chuveiro elétrico");
        assertThat(seededQuestion.get().getDiscipline()).isEqualTo("Física");
        assertThat(seededQuestion.get().getCorrectOption()).isEqualTo('C');
        assertThat(seededQuestion.get().getOptions()).hasSize(5);
        assertThat(seededQuestion.get().getResolution()).isNotNull();
        assertThat(seededQuestion.get().getResolution().getBaseExplanation()).contains("P = V * I");
    }

    @Test
    @DisplayName("Portuguese Full-Text Search with GIN index should match question text accurately")
    void shouldPerformPortugueseFullTextSearch() {
        // Search for "chuveiro" - should match seeded question
        QuestionFilterCommand filter1 = new QuestionFilterCommand(
                null, null, null, "chuveiro", QuestionStatus.ACTIVE, 0, 10
        );
        PagedResult<Question> result1 = questionRepository.findAll(filter1);
        assertThat(result1.getContent()).isNotEmpty();
        assertThat(result1.getContent().get(0).getId()).isEqualTo(SEEDED_QUESTION_ID);

        // Search for "disjuntor"
        QuestionFilterCommand filter2 = new QuestionFilterCommand(
                null, null, null, "disjuntor", QuestionStatus.ACTIVE, 0, 10
        );
        PagedResult<Question> result2 = questionRepository.findAll(filter2);
        assertThat(result2.getContent()).isNotEmpty();

        // Search for non-existent keyword
        QuestionFilterCommand filter3 = new QuestionFilterCommand(
                null, null, null, "antigravityinexistente999", QuestionStatus.ACTIVE, 0, 10
        );
        PagedResult<Question> result3 = questionRepository.findAll(filter3);
        assertThat(result3.getContent()).isEmpty();
    }

    @Test
    @DisplayName("QuestionRepository should save new question and support status transitions")
    void shouldSaveNewQuestionAndChangeStatus() {
        Question newQuestion = new Question(
                null,
                SEEDED_EXAM_EDITION_ID,
                SEEDED_TOPIC_ID,
                110,
                "Um gerador de força eletromotriz constante alimenta um resistor ôhmico...",
                'B',
                DifficultyLevel.HARD,
                new BigDecimal("2.10"),
                new BigDecimal("0.85"),
                new BigDecimal("0.18"),
                QuestionStatus.ACTIVE,
                "pt-BR"
        );

        QuestionOption optA = new QuestionOption(null, null, 'A', "Corrente nula", false);
        QuestionOption optB = new QuestionOption(null, null, 'B', "Corrente máxima", true);
        newQuestion.addOption(optA);
        newQuestion.addOption(optB);

        QuestionResolution resolution = new QuestionResolution(
                null, null, "A lei de Ohm estabelece que U = R · i.", "Lei de Ohm", "Prof. Física"
        );
        newQuestion.setResolution(resolution);

        Question saved = questionRepository.save(newQuestion);
        assertThat(saved.getId()).isNotNull();

        Optional<Question> retrieved = questionRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getItemNumber()).isEqualTo(110);
        assertThat(retrieved.get().getDifficultyLevel()).isEqualTo(DifficultyLevel.HARD);
        assertThat(retrieved.get().getOptions()).hasSize(2);

        // Test status update
        retrieved.get().suspend("Diagram equation requires review");
        Question updated = questionRepository.save(retrieved.get());
        assertThat(updated.getStatus()).isEqualTo(QuestionStatus.SUSPENDED);
        assertThat(updated.getSuspensionReason()).isEqualTo("Diagram equation requires review");

        // Verify suspended question is excluded from ACTIVE search
        QuestionFilterCommand activeFilter = new QuestionFilterCommand(
                null, null, null, null, QuestionStatus.ACTIVE, 0, 20
        );
        PagedResult<Question> activeResult = questionRepository.findAll(activeFilter);
        assertThat(activeResult.getContent().stream().noneMatch(q -> q.getId().equals(saved.getId()))).isTrue();
    }

    @Test
    @DisplayName("PracticeSessionRepository should persist session, record attempts, and complete session")
    void shouldManagePracticeSessionLifecycle() {
        UUID sessionId = UUID.randomUUID();
        String anonymousSessionId = "anon-exam-it-" + UUID.randomUUID();

        PracticeSession session = new PracticeSession(
                sessionId,
                null,
                anonymousSessionId,
                SessionType.TOPIC_PRACTICE,
                5
        );

        Question seededQuestion = questionRepository.findById(SEEDED_QUESTION_ID).orElseThrow();
        session.addQuestion(seededQuestion);

        PracticeSession savedSession = sessionRepository.save(session);
        assertThat(savedSession).isNotNull();
        assertThat(savedSession.getId()).isNotNull();
        UUID realSessionId = savedSession.getId();
        assertThat(savedSession.getStatus()).isEqualTo(SessionStatus.IN_PROGRESS);

        // Record student attempt
        UUID attemptId = UUID.randomUUID();
        StudentAttempt attempt = new StudentAttempt(
                attemptId,
                realSessionId,
                SEEDED_QUESTION_ID,
                'C',
                true,
                35
        );

        StudentAttempt savedAttempt = sessionRepository.saveAttempt(attempt);
        assertThat(savedAttempt).isNotNull();

        boolean exists = sessionRepository.existsAttempt(realSessionId, SEEDED_QUESTION_ID);
        assertThat(exists).isTrue();

        boolean nonExistentAttempt = sessionRepository.existsAttempt(realSessionId, UUID.randomUUID());
        assertThat(nonExistentAttempt).isFalse();

        // Complete the session
        savedSession.complete();
        savedSession.incrementCorrectCount();
        PracticeSession completed = sessionRepository.save(savedSession);
        assertThat(completed.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        assertThat(completed.getCorrectCount()).isEqualTo(1);
        assertThat(completed.getCompletedAt()).isNotNull();
    }
}
