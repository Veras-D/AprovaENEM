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

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "question_resolutions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResolutionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private QuestionEntity question;

    @Column(name = "base_explanation", nullable = false, columnDefinition = "TEXT")
    private String baseExplanation;

    @Column(name = "key_concepts", columnDefinition = "TEXT")
    private String keyConcepts;

    @Column(name = "author_attribution", length = 100)
    private String authorAttribution;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
