package com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "diagnostic_summaries")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosticSummaryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private PracticeSessionEntity session;

    @Column(name = "score_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal scorePercentage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "topic_breakdown", nullable = false, columnDefinition = "jsonb")
    private String topicBreakdown;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommended_topics", nullable = false, columnDefinition = "jsonb")
    private String recommendedTopics;

    @Column(name = "generated_at", nullable = false, updatable = false)
    private Instant generatedAt;
}
