package com.aprovaenem.exam.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.exam.domain.model.DifficultyLevel;
import com.aprovaenem.exam.domain.model.PagedResult;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.QuestionFilterCommand;
import com.aprovaenem.exam.domain.model.QuestionOption;
import com.aprovaenem.exam.domain.model.QuestionResolution;
import com.aprovaenem.exam.domain.model.QuestionStatus;
import com.aprovaenem.exam.domain.port.out.QuestionRepositoryPort;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.ExamEditionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionOptionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionResolutionEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.TopicEntity;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataQuestionRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Transactional
public class QuestionRepositoryAdapter implements QuestionRepositoryPort {

    private final SpringDataQuestionRepository questionRepository;
    private final EntityManager entityManager;

    @Override
    public Optional<Question> findById(UUID id) {
        return questionRepository.findById(id).map(this::toDomain);
    }

    @Override
    public PagedResult<Question> findAll(QuestionFilterCommand filter) {
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize());

        String statusStr = filter.getStatus() != null ? filter.getStatus().name() : QuestionStatus.ACTIVE.name();
        String diffStr = filter.getDifficulty() != null ? filter.getDifficulty().name() : null;

        Page<QuestionEntity> pageResult = questionRepository.searchQuestions(
                statusStr,
                filter.getTopicId(),
                filter.getDiscipline(),
                diffStr,
                filter.getSearch(),
                pageable
        );

        List<Question> domainList = pageResult.getContent().stream()
                .map(this::toDomain)
                .toList();

        return new PagedResult<>(
                domainList,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages()
        );
    }

    @Override
    public List<Question> findRandomActiveQuestions(UUID topicId, DifficultyLevel difficulty, int limit) {
        String diffStr = difficulty != null ? difficulty.name() : null;
        return questionRepository.findRandomActiveQuestions(topicId, diffStr, limit).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Question save(Question question) {
        QuestionEntity entity = toEntity(question);
        QuestionEntity saved = questionRepository.save(entity);
        return toDomain(saved);
    }

    public Question toDomain(QuestionEntity entity) {
        if (entity == null) {
            return null;
        }

        Question question = new Question(
                entity.getId(),
                entity.getExamEdition() != null ? entity.getExamEdition().getId() : null,
                entity.getTopic() != null ? entity.getTopic().getId() : null,
                entity.getItemNumber() != null ? entity.getItemNumber() : 0,
                entity.getStatement(),
                entity.getCorrectOption() != null ? entity.getCorrectOption().charAt(0) : 'A',
                DifficultyLevel.valueOf(entity.getDifficultyLevel()),
                entity.getTriParamA(),
                entity.getTriParamB(),
                entity.getTriParamC(),
                QuestionStatus.valueOf(entity.getStatus()),
                entity.getContentLanguage()
        );

        if (entity.getTopic() != null) {
            try {
                question.setTopicName(entity.getTopic().getName());
                question.setDiscipline(entity.getTopic().getDiscipline());
            } catch (org.hibernate.LazyInitializationException ignored) {
                // If proxy is not initialized
            }
        }

        question.setSuspensionReason(entity.getSuspensionReason());
        question.setCreatedAt(entity.getCreatedAt());
        question.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getOptions() != null) {
            List<QuestionOption> options = entity.getOptions().stream()
                    .map(o -> new QuestionOption(
                            o.getId(),
                            entity.getId(),
                            o.getOptionLetter().charAt(0),
                            o.getOptionText(),
                            Boolean.TRUE.equals(o.getIsCorrect())
                    ))
                    .toList();
            question.setOptions(options);
        }

        if (entity.getResolution() != null) {
            QuestionResolutionEntity res = entity.getResolution();
            question.setResolution(new QuestionResolution(
                    res.getId(),
                    entity.getId(),
                    res.getBaseExplanation(),
                    res.getKeyConcepts(),
                    res.getAuthorAttribution()
            ));
        }

        return question;
    }

    public QuestionEntity toEntity(Question domain) {
        if (domain == null) {
            return null;
        }

        QuestionEntity entity = QuestionEntity.builder()
                .id(domain.getId())
                .itemNumber(domain.getItemNumber())
                .statement(domain.getStatement())
                .correctOption(String.valueOf(domain.getCorrectOption()))
                .difficultyLevel(domain.getDifficultyLevel() != null ? domain.getDifficultyLevel().name() : DifficultyLevel.MEDIUM.name())
                .triParamA(domain.getTriParamA())
                .triParamB(domain.getTriParamB())
                .triParamC(domain.getTriParamC())
                .status(domain.getStatus() != null ? domain.getStatus().name() : QuestionStatus.ACTIVE.name())
                .suspensionReason(domain.getSuspensionReason())
                .contentLanguage(domain.getContentLanguage() != null ? domain.getContentLanguage() : "pt-BR")
                .createdAt(domain.getCreatedAt() != null ? domain.getCreatedAt() : Instant.now())
                .updatedAt(domain.getUpdatedAt() != null ? domain.getUpdatedAt() : Instant.now())
                .build();

        if (domain.getExamEditionId() != null) {
            ExamEditionEntity exam = entityManager.find(ExamEditionEntity.class, domain.getExamEditionId());
            entity.setExamEdition(exam != null ? exam : entityManager.getReference(ExamEditionEntity.class, domain.getExamEditionId()));
        }
        if (domain.getTopicId() != null) {
            TopicEntity topic = entityManager.find(TopicEntity.class, domain.getTopicId());
            entity.setTopic(topic != null ? topic : entityManager.getReference(TopicEntity.class, domain.getTopicId()));
        }

        if (domain.getOptions() != null) {
            List<QuestionOptionEntity> optionEntities = new ArrayList<>();
            for (QuestionOption opt : domain.getOptions()) {
                optionEntities.add(QuestionOptionEntity.builder()
                        .id(opt.getId())
                        .question(entity)
                        .optionLetter(String.valueOf(opt.getOptionLetter()))
                        .optionText(opt.getOptionText())
                        .isCorrect(opt.isCorrect())
                        .build());
            }
            entity.setOptions(optionEntities);
        }

        if (domain.getResolution() != null) {
            QuestionResolution res = domain.getResolution();
            entity.setResolution(QuestionResolutionEntity.builder()
                    .id(res.getId())
                    .question(entity)
                    .baseExplanation(res.getBaseExplanation())
                    .keyConcepts(res.getKeyConcepts())
                    .authorAttribution(res.getAuthorAttribution())
                    .updatedAt(Instant.now())
                    .build());
        }

        return entity;
    }
}
