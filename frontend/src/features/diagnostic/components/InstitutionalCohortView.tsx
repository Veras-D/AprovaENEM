import React, { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Building2,
  Users,
  UserCheck,
  TrendingUp,
  Award,
  AlertTriangle,
  Download,
  AlertCircle,
  CheckCircle2,
  Table as TableIcon,
  PieChart,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import {
  getAreaMetadata,
  MASTERY_CONFIGS,
  NATIONAL_ENEM_BASELINE,
  MASTERY_TARGET_THRESHOLD,
} from '../diagnostic-utils';
import { useCohortDiagnosticsQuery } from '@/api/hooks';
import { MOCK_COHORT_DIAGNOSTICS } from '@/api/mocks/mock-data';
import type {
  InstitutionalCohortDiagnosticResponse,
  InstitutionalAreaBreakdown,
  MasteryLevel,
} from '@/api/types';

export interface InstitutionalCohortViewProps {
  readonly cohortId?: string;
  readonly cohortData?: InstitutionalCohortDiagnosticResponse;
  readonly className?: string;
  readonly onExportReport?: () => void;
}

const AVAILABLE_COHORTS = [
  { id: 'cohort-med-2026', name: '3º Ano EM - Turma Medicina' },
  { id: 'cohort-eng-2026', name: '3º Ano EM - Turma Engenharia' },
  { id: 'cohort-hum-2026', name: '3º Ano EM - Turma Humanidades' },
];

export const InstitutionalCohortView: React.FC<InstitutionalCohortViewProps> = ({
  cohortId: propCohortId,
  cohortData: propData,
  className = '',
  onExportReport,
}) => {
  const [selectedCohortId, setSelectedCohortId] = useState<string>(
    propCohortId || AVAILABLE_COHORTS[0]!.id
  );
  const [showTableView, setShowTableView] = useState<boolean>(false);

  const cohortQuery = useCohortDiagnosticsQuery(selectedCohortId);
  const cohort: InstitutionalCohortDiagnosticResponse =
    propData || cohortQuery.data || MOCK_COHORT_DIAGNOSTICS;

  // Chart data transformation
  const chartData = useMemo(() => {
    return cohort.areasBreakdown.map((item) => {
      const meta = getAreaMetadata(item.subjectArea);
      return {
        areaKey: meta.code,
        areaName: meta.shortName,
        fullName: meta.name,
        averageScore: Math.round(item.averageScorePercentage),
        target: MASTERY_TARGET_THRESHOLD,
        baseline: NATIONAL_ENEM_BASELINE,
        status: item.status,
        topWeakTopic: item.topWeakTopic,
      };
    });
  }, [cohort.areasBreakdown]);

  const scoreDeltaVsBaseline = (cohort.averageScorePercentage - NATIONAL_ENEM_BASELINE).toFixed(1);
  const isAboveBaseline = cohort.averageScorePercentage >= NATIONAL_ENEM_BASELINE;

  return (
    <div
      className={`space-y-6 ${className}`}
      role="region"
      aria-label="Painel institucional de diagnóstico de turma"
    >
      {/* Institutional Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                Painel Institucional da Turma
              </h2>
              <Badge
                variant="outline"
                className="bg-brand-primary/10 text-brand-primary border-brand-primary/30 text-xs py-0 px-2 font-bold uppercase tracking-wider"
              >
                B2B White-Label
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Mapeamento de proficiência coletiva, lacunas de aprendizagem e distratores recorrentes.
            </p>
          </div>
        </div>

        {/* Cohort Selector & Export Action */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <label htmlFor="cohort-select" className="sr-only">
            Selecionar turma
          </label>
          <Select
            id="cohort-select"
            value={selectedCohortId}
            onChange={(val) => setSelectedCohortId(val)}
            options={AVAILABLE_COHORTS.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            size="sm"
            className="min-w-[180px]"
          />

          {onExportReport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExportReport}
              className="text-xs gap-1.5 shrink-0"
              aria-label="Exportar relatório da turma em PDF ou CSV"
            >
              <Download className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
              Exportar Relatório
            </Button>
          )}
        </div>
      </div>

      {/* 4 KPI Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Matriculados */}
        <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Alunos Matriculados</span>
            <Users className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {cohort.totalEnrolledStudents}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Capacidade da turma
          </span>
        </div>

        {/* Participantes Ativos */}
        <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Participantes Ativos</span>
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {cohort.activeParticipants}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Realizaram simulados
          </span>
        </div>

        {/* Taxa de Engajamento */}
        <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Engajamento</span>
            <TrendingUp className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {cohort.participationRate}%
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Alta adesão coletiva
          </span>
        </div>

        {/* Média da Turma */}
        <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Média da Turma</span>
            <Award className="h-4 w-4 text-amber-500" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {cohort.averageScorePercentage}%
          </div>
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {isAboveBaseline ? `+${scoreDeltaVsBaseline}%` : `${scoreDeltaVsBaseline}%`} vs baseline ENEM
          </span>
        </div>
      </div>

      {/* Main Grid: Cohort Radar Spider & Collective Benchmarking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              Comparativo de Desempenho da Turma
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTableView((prev) => !prev)}
              className="text-xs gap-1.5"
              aria-label={showTableView ? 'Ver Gráfico: Ver radar da turma' : 'Ver Tabela: Ver tabela de médias'}
            >
              {showTableView ? (
                <>
                  <PieChart className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                  Ver Gráfico
                </>
              ) : (
                <>
                  <TableIcon className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                  Ver Tabela
                </>
              )}
            </Button>
          </div>

          {!showTableView ? (
            <div
              className="w-full h-80 flex items-center justify-center"
              role="img"
              aria-label="Gráfico de radar comparativo da turma"
            >
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="areaName"
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(value, name) => [`${value ?? 0}%`, name ? String(name) : '']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                  <Radar
                    name="Média da Turma"
                    dataKey="averageScore"
                    stroke="#4f46e5"
                    fill="#6366f1"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Meta Institucional (70%)"
                    dataKey="target"
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    fill="#10b981"
                    fillOpacity={0.08}
                  />
                  <Radar
                    name="Baseline ENEM Brasil (60%)"
                    dataKey="baseline"
                    stroke="#94a3b8"
                    strokeDasharray="2 2"
                    fill="#94a3b8"
                    fillOpacity={0.05}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full overflow-x-auto py-2">
              <table className="w-full text-left text-sm" aria-label="Tabela de médias da turma">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase font-semibold">
                  <tr>
                    <th scope="col" className="py-2.5 px-3">Área</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Média da Turma</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Meta (70%)</th>
                    <th scope="col" className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {chartData.map((row) => {
                    const statusConfig = MASTERY_CONFIGS[row.status as MasteryLevel];
                    return (
                      <tr key={row.areaKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {row.fullName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {row.averageScore}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          {row.target}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center text-[11px] font-bold py-0.5 px-2 rounded-full border ${statusConfig.fullBadgeClass}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pedagogical Guidance & Priorities */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
              Prioridades Pedagógicas da Coordenação
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-primary font-bold">•</span>
                <span>
                  <strong>Reforço em Matemática:</strong> Turma com média de 68.2%, abaixo da meta de 70%. Concentrar intervenção em Funções Trigonométricas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>
                  <strong>Destaque em Humanas:</strong> Excelente desempenho de 82.4%, acima do percentil 80 estadual.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>
                  <strong>Engajamento Sólido:</strong> 92.8% dos matriculados já concluíram ao menos 3 simulados oficiais.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-brand border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Alinhamento TRI Institucional
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              A consistência pedagógica da turma está preservada: questões fáceis apresentam taxa de acerto superior a 85%, prevenindo penalização na régua TRI.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Area Cards with Critical Weak Topics */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Award className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          Diagnóstico por Disciplina & Tópicos Mais Críticos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cohort.areasBreakdown.map((area: InstitutionalAreaBreakdown) => {
            const meta = getAreaMetadata(area.subjectArea);
            const statusConfig = MASTERY_CONFIGS[area.status];
            return (
              <div
                key={area.subjectArea}
                className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={`${meta.bgLight} ${meta.borderLight} text-xs font-bold font-mono`}
                    >
                      {meta.code}
                    </Badge>
                    <span
                      className={`text-[11px] font-bold py-0.5 px-2 rounded-full border ${statusConfig.fullBadgeClass}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {area.areaName || meta.name}
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-mono font-black text-slate-900 dark:text-slate-100">
                      {Math.round(area.averageScorePercentage)}%
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Média Coletiva
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${area.averageScorePercentage}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span className="font-semibold text-rose-600 dark:text-rose-400">Ponto Fraco Coletivo:</span>{' '}
                    {area.topWeakTopic}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Common Distractor Pitfalls Panel */}
      {cohort.commonDistractorPitfalls && cohort.commonDistractorPitfalls.length > 0 && (
        <div className="p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                Pegadinhas & Falácias Pedagógicas Mais Frequentes da Turma
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Questões onde os estudantes mais foram induzidos a erro por distratores específicos.
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs py-0 px-2 self-start sm:self-auto"
            >
              Análise de Distratores
            </Badge>
          </div>

          <div className="space-y-3">
            {cohort.commonDistractorPitfalls.map((pitfall) => (
              <div
                key={pitfall.questionId}
                className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {pitfall.questionTitle || `Questão ${pitfall.questionId.slice(0, 8)}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Gabarito: <strong>{pitfall.correctOption}</strong>
                    </span>
                    <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Distrator: <strong>{pitfall.misleadingOption}</strong>
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 text-xs font-mono font-bold"
                    >
                      {pitfall.failedPercentage}% da turma
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-800 dark:text-slate-200">Falácia identificada:</strong>{' '}
                  {pitfall.pedagogicalExplanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
