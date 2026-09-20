package com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.CharJdbcType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "questions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_edition_id", nullable = false)
    private ExamEditionEntity examEdition;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topic_id", nullable = false)
    private TopicEntity topic;

    @Column(name = "item_number", nullable = false)
    private Integer itemNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String statement;

    @JdbcType(CharJdbcType.class)
    @Column(name = "correct_option", nullable = false)
    private String correctOption;

    @Column(name = "difficulty_level", nullable = false, length = 20)
    private String difficultyLevel;

    @Column(name = "tri_param_a", precision = 5, scale = 3)
    private BigDecimal triParamA;

    @Column(name = "tri_param_b", precision = 5, scale = 3)
    private BigDecimal triParamB;

    @Column(name = "tri_param_c", precision = 5, scale = 3)
    private BigDecimal triParamC;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "suspension_reason", columnDefinition = "TEXT")
    private String suspensionReason;

    @Column(name = "figure_url", length = 500)
    private String figureUrl;

    @Column(name = "figure_alt_text", columnDefinition = "TEXT")
    private String figureAltText;

    @Column(name = "content_language", nullable = false, length = 10)
    private String contentLanguage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("optionLetter ASC")
    @Builder.Default
    private List<QuestionOptionEntity> options = new ArrayList<>();

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private QuestionResolutionEntity resolution;
}
