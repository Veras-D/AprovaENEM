package com.aprovaenem.exam.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.PagedResult;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionFilterCommand;
import com.aprovaenem.exam.domain.model.QuestionOption;
import com.aprovaenem.exam.domain.model.QuestionResolution;
import com.aprovaenem.exam.domain.model.QuestionStatus;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.ExamEditionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionOptionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionResolutionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.TopicEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataQuestionRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("QuestionRepositoryAdapter Unit Tests")
class QuestionRepositoryAdapterTest {

    @Mock
    private SpringDataQuestionRepository questionRepository;

    @Mock
    private EntityManager entityManager;

    private QuestionRepositoryAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new QuestionRepositoryAdapter(questionRepository, entityManager);
    }

    @Test
    @DisplayName("Should find question by ID and map all relations to domain")
    void shouldFindById() {
        UUID questionId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        UUID examId = UUID.randomUUID();

        TopicEntity topic = TopicEntity.builder().id(topicId).name("Cinemática").discipline("Física").build();
        ExamEditionEntity exam = ExamEditionEntity.builder().id(examId).year(2023).build();

        QuestionEntity entity = QuestionEntity.builder()
                .id(questionId)
                .topic(topic)
                .examEdition(exam)
                .itemNumber(105)
                .statement("Em um movimento uniforme...")
                .correctOption("C")
                .difficultyLevel("MEDIUM")
                .triParamA(new BigDecimal("1.2000"))
                .triParamB(new BigDecimal("0.5000"))
                .triParamC(new BigDecimal("0.2000"))
                .status("ACTIVE")
                .contentLanguage("pt-BR")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .options(new ArrayList<>(List.of(
                        QuestionOptionEntity.builder().id(UUID.randomUUID()).optionLetter("C").optionText("Opção C").isCorrect(true).build()
                )))
                .resolution(QuestionResolutionEntity.builder().id(UUID.randomUUID()).baseExplanation("V = S / T").keyConcepts("Velocidade").authorAttribution("Prof").build())
                .build();

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(entity));

        Optional<Question> result = adapter.findById(questionId);

        assertThat(result).isPresent();
        Question q = result.get();
        assertThat(q.getId()).isEqualTo(questionId);
        assertThat(q.getStatement()).isEqualTo("Em um movimento uniforme...");
        assertThat(q.getCorrectOption()).isEqualTo('C');
        assertThat(q.getTopicName()).isEqualTo("Cinemática");
        assertThat(q.getDiscipline()).isEqualTo("Física");
        assertThat(q.getOptions()).hasSize(1);
        assertThat(q.getResolution()).isNotNull();
        assertThat(q.getResolution().getBaseExplanation()).isEqualTo("V = S / T");
    }

    @Test
    @DisplayName("Should return empty optional when question not found")
    void shouldReturnEmptyWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(questionRepository.findById(id)).thenReturn(Optional.empty());

        assertThat(adapter.findById(id)).isEmpty();
    }

    @Test
    @DisplayName("Should find paged questions with filter")
    void shouldFindAllWithFilter() {
        QuestionFilterCommand filter = new QuestionFilterCommand(
                null, "Matemática", DifficultyLevel.HARD, "logaritmo", QuestionStatus.ACTIVE, 0, 10
        );

        QuestionEntity entity = QuestionEntity.builder()
                .id(UUID.randomUUID())
                .itemNumber(1)
                .statement("Calcule log(x)")
                .correctOption("A")
                .difficultyLevel("HARD")
                .status("ACTIVE")
                .build();

        when(questionRepository.searchQuestions(
                eq("ACTIVE"), eq(null), eq("Matemática"), eq("HARD"), eq("logaritmo"), any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(entity)));

        PagedResult<Question> paged = adapter.findAll(filter);

        assertThat(paged.getContent()).hasSize(1);
        assertThat(paged.getTotalElements()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should find random active questions")
    void shouldFindRandomActiveQuestions() {
        UUID topicId = UUID.randomUUID();
        QuestionEntity entity = QuestionEntity.builder()
                .id(UUID.randomUUID())
                .itemNumber(1)
                .statement("Pergunta")
                .correctOption("B")
                .difficultyLevel("EASY")
                .status("ACTIVE")
                .build();

        when(questionRepository.findRandomActiveQuestions(eq(topicId), eq("EASY"), eq(5)))
                .thenReturn(List.of(entity));

        List<Question> randoms = adapter.findRandomActiveQuestions(topicId, DifficultyLevel.EASY, 5);

        assertThat(randoms).hasSize(1);
    }

    @Test
    @DisplayName("Should save domain question and entity")
    void shouldSaveQuestion() {
        UUID qId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        UUID examId = UUID.randomUUID();

        Question domain = new Question(
                qId, examId, topicId, 10, "Enunciado", 'D',
                DifficultyLevel.HARD, BigDecimal.ONE, BigDecimal.ONE, BigDecimal.ZERO,
                QuestionStatus.ACTIVE, "pt-BR"
        );
        domain.addOption(new QuestionOption(UUID.randomUUID(), qId, 'D', "Opção correta", true));
        domain.setResolution(new QuestionResolution(UUID.randomUUID(), qId, "Resolução", "Conceito", "Autor"));

        when(entityManager.find(eq(ExamEditionEntity.class), eq(examId))).thenReturn(null);
        when(entityManager.getReference(eq(ExamEditionEntity.class), eq(examId)))
                .thenReturn(ExamEditionEntity.builder().id(examId).build());

        when(entityManager.find(eq(TopicEntity.class), eq(topicId))).thenReturn(null);
        when(entityManager.getReference(eq(TopicEntity.class), eq(topicId)))
                .thenReturn(TopicEntity.builder().id(topicId).build());

        when(questionRepository.save(any(QuestionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        Question saved = adapter.save(domain);

        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isEqualTo(qId);
        verify(questionRepository).save(any(QuestionEntity.class));
    }

    @Test
    @DisplayName("Should find paged questions with null status and difficulty in filter")
    void shouldFindAllWithDefaultFilters() {
        QuestionFilterCommand filter = new QuestionFilterCommand(
                null, null, null, null, null, 0, 10
        );

        when(questionRepository.searchQuestions(
                eq("ACTIVE"), eq(null), eq(null), eq(null), eq(null), any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of()));

        PagedResult<Question> paged = adapter.findAll(filter);
        assertThat(paged.getContent()).isEmpty();
    }

    @Test
    @DisplayName("Should find random active questions with null difficulty")
    void shouldFindRandomActiveQuestionsWithNullDifficulty() {
        UUID topicId = UUID.randomUUID();
        when(questionRepository.findRandomActiveQuestions(eq(topicId), eq(null), eq(3)))
                .thenReturn(List.of());

        List<Question> randoms = adapter.findRandomActiveQuestions(topicId, null, 3);
        assertThat(randoms).isEmpty();
    }

    @Test
    @DisplayName("Should save bare question without relations or options")
    void shouldSaveBareQuestion() {
        Question bare = new Question(
                UUID.randomUUID(), null, null, 1, "Enunciado", 'A',
                DifficultyLevel.EASY, BigDecimal.ONE, BigDecimal.ONE, BigDecimal.ZERO,
                QuestionStatus.ACTIVE, "pt-BR"
        );

        when(questionRepository.save(any(QuestionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        Question saved = adapter.save(bare);
        assertThat(saved).isNotNull();
        assertThat(saved.getOptions()).isEmpty();
        assertThat(saved.getResolution()).isNull();
    }

    @Test
    @DisplayName("Should map entity with existing managed relations in toEntity and bare in toDomain")
    void shouldHandleManagedRelationsAndBareEntity() {
        UUID examId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        ExamEditionEntity exam = ExamEditionEntity.builder().id(examId).build();
        TopicEntity topic = TopicEntity.builder().id(topicId).name("Álgebra").discipline("Matemática").build();

        when(entityManager.find(eq(ExamEditionEntity.class), eq(examId))).thenReturn(exam);
        when(entityManager.find(eq(TopicEntity.class), eq(topicId))).thenReturn(topic);

        Question domain = new Question(
                UUID.randomUUID(), examId, topicId, 2, "Texto", 'B',
                DifficultyLevel.MEDIUM, null, null, null, null, null
        );

        QuestionEntity entity = adapter.toEntity(domain);
        assertThat(entity.getExamEdition()).isEqualTo(exam);
        assertThat(entity.getTopic()).isEqualTo(topic);
        assertThat(entity.getStatus()).isEqualTo("ACTIVE");
        assertThat(entity.getContentLanguage()).isEqualTo("pt-BR");

        QuestionEntity bareEntity = QuestionEntity.builder()
                .id(UUID.randomUUID())
                .itemNumber(null)
                .statement("Texto")
                .correctOption(null)
                .difficultyLevel("EASY")
                .status("ACTIVE")
                .build();

        Question fromBare = adapter.toDomain(bareEntity);
        assertThat(fromBare.getCorrectOption()).isEqualTo('A');
        assertThat(fromBare.getItemNumber()).isEqualTo(0);
        assertThat(fromBare.getTopicName()).isNull();
    }

    @Test
    @DisplayName("Should return null for null input conversions")
    void shouldHandleNullConversions() {
        assertThat(adapter.toDomain(null)).isNull();
        assertThat(adapter.toEntity(null)).isNull();
    }
}
