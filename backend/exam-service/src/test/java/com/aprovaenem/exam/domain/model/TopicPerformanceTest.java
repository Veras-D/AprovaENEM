package com.aprovaenem.exam.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("TopicPerformance Domain Model Unit Tests")
class TopicPerformanceTest {

    @ParameterizedTest(name = "{0}/{1} correct = {2}% -> {3}")
    @CsvSource({
            "8, 10, 80.00, MASTERED",
            "7, 10, 70.00, MASTERED",
            "10, 10, 100.00, MASTERED",
            "6, 10, 60.00, ATTENTION_NEEDED",
            "5, 10, 50.00, ATTENTION_NEEDED",
            "4, 10, 40.00, CRITICAL",
            "1, 10, 10.00, CRITICAL",
            "0, 10, 0.00, CRITICAL"
    })
    @DisplayName("Should calculate accuracy and classify mastery level according to thresholds")
    void shouldCalculateAccuracyAndClassifyMastery(
            int correct,
            int total,
            String expectedAccuracy,
            MasteryLevel expectedMastery
    ) {
        TopicPerformance performance = new TopicPerformance(
                "Eletrodinâmica",
                "Física",
                total,
                correct
        );

        assertThat(performance.getTopicName()).isEqualTo("Eletrodinâmica");
        assertThat(performance.getDiscipline()).isEqualTo("Física");
        assertThat(performance.getTotalQuestions()).isEqualTo(total);
        assertThat(performance.getCorrectQuestions()).isEqualTo(correct);
        assertThat(performance.getAccuracyPercentage()).isEqualByComparingTo(expectedAccuracy);
        assertThat(performance.getMasteryLevel()).isEqualTo(expectedMastery);
    }

    @Test
    @DisplayName("Should handle zero total questions safely by assigning 0% accuracy and CRITICAL mastery")
    void shouldHandleZeroTotalQuestions() {
        TopicPerformance performance = new TopicPerformance(
                "Geometria Analítica",
                "Matemática",
                0,
                0
        );

        assertThat(performance.getAccuracyPercentage()).isEqualByComparingTo("0.00");
        assertThat(performance.getMasteryLevel()).isEqualTo(MasteryLevel.CRITICAL);
    }

    @Test
    @DisplayName("Should dynamically re-evaluate mastery level when accuracy percentage is updated")
    void shouldRecalculateMasteryOnAccuracyUpdate() {
        TopicPerformance performance = new TopicPerformance(
                "Termodinâmica",
                "Física",
                10,
                4 // 40% -> CRITICAL
        );
        assertThat(performance.getMasteryLevel()).isEqualTo(MasteryLevel.CRITICAL);

        performance.setAccuracyPercentage(new BigDecimal("75.00"));
        assertThat(performance.getMasteryLevel()).isEqualTo(MasteryLevel.MASTERED);

        performance.setAccuracyPercentage(new BigDecimal("55.00"));
        assertThat(performance.getMasteryLevel()).isEqualTo(MasteryLevel.ATTENTION_NEEDED);
    }
}
