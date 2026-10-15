import React, { useState } from 'react';
import { Target, Building2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { StudentDiagnosticRadar } from './StudentDiagnosticRadar';
import { InstitutionalCohortView } from './InstitutionalCohortView';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
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
  initialMode = 'student',
  studentReport,
  cohortData,
  className = '',
  onPracticeTopic,
  onExportReport,
}) => {
  const [activeMode, setActiveMode] = useState<DiagnosticViewMode>(initialMode);

  const currentTenant = useTenantStore((s) => s.currentTenant);
  const user = useAuthStore((s) => s.user);

  const isInstitutionalAllowed = Boolean(
    currentTenant.features?.institutionalAnalyticsEnabled ||
      user?.roles?.some(
        (role) =>
          role === 'ROLE_ADMIN' ||
          role === 'ROLE_INSTITUTIONAL_ADMIN'
      )
  );

  return (
    <div
      className={`space-y-6 ${className}`}
      role="region"
      aria-label="Central de diagnósticos e proficiência ENEM"
    >
      {/* Top Navigation Tabs: Dual Visualization Mode Switcher */}
      <div
        className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3"
        role="tablist"
        aria-label="Modo de visualização diagnóstica"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="tab"
            id="tab-student-diagnostic"
            aria-selected={activeMode === 'student'}
            aria-controls="panel-student-diagnostic"
            onClick={() => setActiveMode('student')}
            className={`px-3.5 py-2 rounded-brand text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === 'student'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Target className="h-4 w-4" aria-hidden="true" />
            Diagnóstico do Aluno
          </button>

          <button
            type="button"
            role="tab"
            id="tab-institutional-cohort"
            aria-selected={activeMode === 'institutional'}
            aria-controls="panel-institutional-cohort"
            onClick={() => setActiveMode('institutional')}
            className={`px-3.5 py-2 rounded-brand text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === 'institutional'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="h-4 w-4" aria-hidden="true" />
            <span>Visão Institucional da Turma</span>
            <Badge
              variant="outline"
              className={`text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider ${
                activeMode === 'institutional'
                  ? 'bg-white/20 text-white border-white/40'
                  : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30'
              }`}
            >
              B2B
            </Badge>
          </button>
        </div>

        {isInstitutionalAllowed && (
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
            Recursos institucionais ativos para {currentTenant.name}
          </span>
        )}
      </div>

      {/* Mode 1: Student Diagnostic Radar Panel */}
      <div
        id="panel-student-diagnostic"
        role="tabpanel"
        aria-labelledby="tab-student-diagnostic"
        hidden={activeMode !== 'student'}
        className={activeMode === 'student' ? 'block' : 'hidden'}
      >
        <StudentDiagnosticRadar
          report={studentReport}
          onPracticeTopic={onPracticeTopic}
        />
      </div>

      {/* Mode 2: Institutional Cohort View Panel */}
      <div
        id="panel-institutional-cohort"
        role="tabpanel"
        aria-labelledby="tab-institutional-cohort"
        hidden={activeMode !== 'institutional'}
        className={activeMode === 'institutional' ? 'block' : 'hidden'}
      >
        <InstitutionalCohortView
          cohortData={cohortData}
          onExportReport={onExportReport}
        />
      </div>
    </div>
  );
};
