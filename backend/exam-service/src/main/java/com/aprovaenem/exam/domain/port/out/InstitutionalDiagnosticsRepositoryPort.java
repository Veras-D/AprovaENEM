package com.aprovaenem.exam.domain.port.out;

import com.aprovaenem.exam.domain.model.InstitutionalAreaBreakdown;
import com.aprovaenem.exam.domain.model.InstitutionalDistractorPitfall;

import java.util.List;

public interface InstitutionalDiagnosticsRepositoryPort {
    long countDistinctActiveStudents();
    long countCompletedSessions();
    Double calculateOverallAverageScorePercentage();
    List<InstitutionalAreaBreakdown> calculateAreasBreakdown();
    List<InstitutionalDistractorPitfall> findTopDistractorPitfalls(int limit);
}
