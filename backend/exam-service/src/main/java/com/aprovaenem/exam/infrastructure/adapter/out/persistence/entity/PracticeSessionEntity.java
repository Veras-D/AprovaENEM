package com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "practice_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "anonymous_session_id", nullable = false, length = 64)
    private String anonymousSessionId;

    @Column(name = "session_type", nullable = false, length = 30)
    private String sessionType;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount;

    @Column(name = "started_at", nullable = false, updatable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "session_questions",
            joinColumns = @JoinColumn(name = "session_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    @jakarta.persistence.OrderColumn(name = "display_order")
    @org.hibernate.annotations.ListIndexBase(1)
    @Builder.Default
    private List<QuestionEntity> questions = new ArrayList<>();

    @OneToMany(mappedBy = "session", fetch = FetchType.LAZY)
    @OrderBy("submittedAt ASC")
    @Builder.Default
    private List<StudentAttemptEntity> attempts = new ArrayList<>();
}
