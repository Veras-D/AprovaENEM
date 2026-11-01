package com.aprovaenem.exam.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.exam.domain.model.InstitutionalAreaBreakdown;
import com.aprovaenem.exam.domain.model.InstitutionalDistractorPitfall;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataPracticeSessionRepository;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataStudentAttemptRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("InstitutionalDiagnosticsRepositoryAdapter Unit Tests")
class InstitutionalDiagnosticsRepositoryAdapterTest {

    @Mock
    private SpringDataPracticeSessionRepository sessionRepository;

    @Mock
    private SpringDataStudentAttemptRepository attemptRepository;

    @InjectMocks
    private InstitutionalDiagnosticsRepositoryAdapter adapter;

    @Test
    @DisplayName("Should query counts and averages from sessionRepository")
    void shouldQueryCountsAndAverages() {
        when(sessionRepository.countDistinctActiveStudents()).thenReturn(40L);
        when(sessionRepository.countCompletedSessions()).thenReturn(150L);
        when(sessionRepository.calculateOverallAverageScorePercentage()).thenReturn(78.5);

        assertThat(adapter.countDistinctActiveStudents()).isEqualTo(40L);
        assertThat(adapter.countCompletedSessions()).isEqualTo(150L);
        assertThat(adapter.calculateOverallAverageScorePercentage()).isEqualTo(78.5);
    }

    @Test
    @DisplayName("Should calculate areas breakdown using attempts data when present")
    void shouldCalculateAreasBreakdownWithAttemptsData() {
        List<Object[]> areaStats = new ArrayList<>();
        areaStats.add(new Object[]{"MATHEMATICS", 100L, 75L});
        areaStats.add(new Object[]{"NATURAL_SCIENCES", 80L, 40L});

        List<Object[]> topicStats = new ArrayList<>();
        topicStats.add(new Object[]{"MATHEMATICS", "Geometria Espacial", 50L, 30L});
        topicStats.add(new Object[]{"MATHEMATICS", "Funções", 50L, 45L});

        when(attemptRepository.findAccuracyBySubjectArea()).thenReturn(areaStats);
        when(attemptRepository.findAccuracyByTopic()).thenReturn(topicStats);

        List<InstitutionalAreaBreakdown> breakdowns = adapter.calculateAreasBreakdown();

        assertThat(breakdowns).hasSize(4); // MATHEMATICS, NATURAL_SCIENCES, HUMANITIES, LANGUAGES
        InstitutionalAreaBreakdown math = breakdowns.stream()
                .filter(b -> "MATHEMATICS".equals(b.getSubjectArea()))
                .findFirst()
                .orElseThrow();

        assertThat(math.getAverageScorePercentage()).isEqualTo(75.0);
        assertThat(math.getStatus()).isEqualTo("MASTERED");
        assertThat(math.getTopWeakTopic()).isEqualTo("Geometria Espacial");
    }

    @Test
    @DisplayName("Should map top distractor pitfalls when query returns rows")
    void shouldMapTopDistractorPitfalls() {
        List<Object[]> rows = new ArrayList<>();
        rows.add(new Object[]{"uuid-1", 101, "A", "C", 25L, 50L});
        when(attemptRepository.findTopDistractorPitfalls()).thenReturn(rows);

        List<InstitutionalDistractorPitfall> pitfalls = adapter.findTopDistractorPitfalls(3);

        assertThat(pitfalls).hasSize(1);
        assertThat(pitfalls.get(0).getQuestionId()).isEqualTo("uuid-1");
        assertThat(pitfalls.get(0).getQuestionTitle()).isEqualTo("ENEM - Questão 101");
        assertThat(pitfalls.get(0).getCorrectOption()).isEqualTo("A");
        assertThat(pitfalls.get(0).getMisleadingOption()).isEqualTo("C");
        assertThat(pitfalls.get(0).getFailedPercentage()).isEqualTo(50.0);
    }

    @Test
    @DisplayName("Should return default distractors when attempt query is empty")
    void shouldReturnDefaultDistractorsWhenEmpty() {
        when(attemptRepository.findTopDistractorPitfalls()).thenReturn(new ArrayList<>());

        List<InstitutionalDistractorPitfall> pitfalls = adapter.findTopDistractorPitfalls(3);

        assertThat(pitfalls).hasSize(3);
        assertThat(pitfalls.get(0).getQuestionTitle()).contains("Física");
    }
}
