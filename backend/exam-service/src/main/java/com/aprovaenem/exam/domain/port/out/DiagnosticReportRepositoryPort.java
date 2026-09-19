package com.aprovaenem.exam.domain.port.out;

import com.aprovaenem.exam.domain.model.DiagnosticReport;

import java.util.Optional;
import java.util.UUID;

public interface DiagnosticReportRepositoryPort {

    DiagnosticReport save(DiagnosticReport report);

    Optional<DiagnosticReport> findBySessionId(UUID sessionId);
}
