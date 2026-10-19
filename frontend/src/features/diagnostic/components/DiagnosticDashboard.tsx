import React from 'react';
import { StudentDiagnosticRadar } from './StudentDiagnosticRadar';
import type { DiagnosticReportDto, InstitutionalCohortDiagnosticResponse } from '@/api/types';

export type DiagnosticViewMode = 'student' | 'institutional';

export interface DiagnosticDashboardProps {
  readonly initialMode?: DiagnosticViewMode;
  readonly studentReport?: DiagnosticReportDto;
  readonly cohortData?: InstitutionalCohortDiagnosticResponse;
  readonly className?: string;
  readonly onPracticeTopic?: (topic: string) => void;
  readonly onExportReport?: () => void;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  studentReport,
  className = '',
  onPracticeTopic,
}) => {
  return (
    <div
      className={`space-y-6 ${className}`}
      role="region"
      aria-label="Central de diagnósticos e proficiência ENEM do aluno"
    >
      <StudentDiagnosticRadar
        report={studentReport}
        onPracticeTopic={onPracticeTopic}
      />
    </div>
  );
};
