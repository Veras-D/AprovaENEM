import React from 'react';
import { Building2, GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { InstitutionalCohortView } from '@/features/diagnostic/components/InstitutionalCohortView';
import { useTenantStore } from '@/stores/useTenantStore';
import type { InstitutionalCohortDiagnosticResponse } from '@/api/types';

export interface InstitutionalDashboardProps {
  readonly cohortData?: InstitutionalCohortDiagnosticResponse;
  readonly className?: string;
  readonly onNavigate?: (section: string) => void;
  readonly onExportReport?: () => void;
}

export const InstitutionalDashboard: React.FC<InstitutionalDashboardProps> = ({
  cohortData,
  className = '',
  onNavigate,
  onExportReport,
}) => {
  const currentTenant = useTenantStore((s) => s.currentTenant);

  return (
    <div
      className={`space-y-6 ${className}`}
      role="region"
      aria-label="Painel da coordenação pedagógica e diagnóstico de turmas"
    >
      {/* Institutional Portal Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-brand border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Painel da Coordenação Pedagógica
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30"
              >
                B2B White-Label
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Métricas consolidadas de turmas, aderência aos simulados e diagnóstico pedagógico de {currentTenant.name}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onNavigate?.('home')}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <GraduationCap className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
          <span>Voltar ao Portal do Aluno</span>
        </Button>
      </div>

      {/* Main Cohort View */}
      <InstitutionalCohortView
        cohortData={cohortData}
        onExportReport={onExportReport}
      />
    </div>
  );
};
