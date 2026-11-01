package com.aprovaenem.exam.domain.port.in;

import com.aprovaenem.exam.domain.model.InstitutionalCohortDiagnostics;

public interface InstitutionalDiagnosticsUseCase {
    InstitutionalCohortDiagnostics getCohortDiagnostics(String cohortId);
}
