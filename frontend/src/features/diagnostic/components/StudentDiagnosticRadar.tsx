import React, { useMemo, useState } from 'react';
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
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Table as TableIcon,
  PieChart,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  getAreaMetadata,
  MASTERY_CONFIGS,
  NATIONAL_ENEM_BASELINE,
  MASTERY_TARGET_THRESHOLD,
  transformRadarDataForChart,
} from '../diagnostic-utils';
import type { DiagnosticReportDto, DiagnosticRadarAreaDto, MasteryLevel } from '@/api/types';

export interface StudentDiagnosticRadarProps {
  readonly report: DiagnosticReportDto;
  readonly className?: string;
  readonly onPracticeTopic?: (topic: string) => void;
}

export const StudentDiagnosticRadar: React.FC<StudentDiagnosticRadarProps> = ({
  report,
  className = '',
  onPracticeTopic,
}) => {
  const [showTableView, setShowTableView] = useState<boolean>(false);

  const radarAreas: readonly DiagnosticRadarAreaDto[] = useMemo(() => {
    if (report.radar && report.radar.length > 0) {
      return report.radar;
    }
    // Fallback default 4 areas if empty
    return [
      {
        knowledgeArea: 'MT',
        areaName: 'Matemática e suas Tecnologias',
        scorePercentage: 75,
        totalQuestions: 15,
        correctQuestions: 11,
        masteryLevel: 'MASTERED',
        topWeakTopic: 'Geometria Espacial',
      },
      {
        knowledgeArea: 'CN',
        areaName: 'Ciências da Natureza e suas Tecnologias',
        scorePercentage: 65,
        totalQuestions: 15,
        correctQuestions: 10,
        masteryLevel: 'ATTENTION_NEEDED',
        topWeakTopic: 'Ondulatória',
      },
      {
        knowledgeArea: 'CH',
        areaName: 'Ciências Humanas e suas Tecnologias',
        scorePercentage: 80,
        totalQuestions: 15,
        correctQuestions: 12,
        masteryLevel: 'MASTERED',
        topWeakTopic: 'Filosofia Moderna',
      },
      {
        knowledgeArea: 'LC',
        areaName: 'Linguagens, Códigos e suas Tecnologias',
        scorePercentage: 85,
        totalQuestions: 15,
        correctQuestions: 13,
        masteryLevel: 'MASTERED',
        topWeakTopic: 'Gêneros Digitais',
      },
    ];
  }, [report.radar]);

  const chartData = useMemo(() => transformRadarDataForChart(radarAreas), [radarAreas]);

  // Identify highest and lowest areas
  const { strongestArea, weakestArea } = useMemo(() => {
    if (chartData.length === 0) {
      return { strongestArea: null, weakestArea: null };
    }
    const sorted = [...chartData].sort((a, b) => b.score - a.score);
    return {
      strongestArea: sorted[0],
      weakestArea: sorted[sorted.length - 1],
    };
  }, [chartData]);

  const overallScore = Math.round(report.scorePercentage);

  return (
    <div
      className={`space-y-6 ${className}`}
      role="region"
      aria-label="Raio-X de Habilidades e Radar Diagnóstico ENEM"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 shadow-xs">
            <Target className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                Raio-X Diagnóstico de Habilidades
              </h2>
              <Badge
                variant="outline"
                className="bg-brand-primary/10 text-brand-primary border-brand-primary/30 text-xs py-0 px-2 font-bold"
              >
                Matriz INEP ENEM
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Mapeamento de proficiência pelas 4 áreas do conhecimento com benchmarks de corte.
            </p>
          </div>
        </div>

        {/* View Switcher Toggle (Radar Visual vs Tabela Acessível) */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTableView((prev) => !prev)}
            className="text-xs gap-1.5"
            aria-label={showTableView ? 'Ver Gráfico Radar: Alternar para gráfico de radar spider' : 'Ver em Tabela: Alternar para tabela de dados acessível'}
          >
            {showTableView ? (
              <>
                <PieChart className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                Ver Gráfico Radar
              </>
            ) : (
              <>
                <TableIcon className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                Ver em Tabela
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Radar Chart & Highlight Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Radar Spider Chart Container */}
        <div className="lg:col-span-7 p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              Radar de Proficiência por Área
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
              Média Geral: {overallScore}%
            </span>
          </div>

          {!showTableView ? (
            <div
              className="w-full h-80 flex items-center justify-center"
              role="img"
              aria-label="Gráfico de radar mostrando desempenho nas 4 áreas do ENEM"
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
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                  />
                  <Radar
                    name="Seu Desempenho"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Meta de Domínio (70%)"
                    dataKey="target"
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    fill="#10b981"
                    fillOpacity={0.08}
                  />
                  <Radar
                    name="Média Nacional (60%)"
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
            /* Accessible Fallback / High-Contrast Table View */
            <div className="w-full overflow-x-auto py-2">
              <table className="w-full text-left text-sm" aria-label="Tabela de desempenho por área">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase font-semibold">
                  <tr>
                    <th scope="col" className="py-2.5 px-3">Área</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Seu Score</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Meta (70%)</th>
                    <th scope="col" className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {chartData.map((row) => {
                    const statusConfig = MASTERY_CONFIGS[row.masteryLevel as MasteryLevel];
                    return (
                      <tr key={row.areaKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {row.fullName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-brand-primary">
                          {row.score}%
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

        {/* Highlights & Diagnostic Insight Cards */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Strongest Area Card */}
          {strongestArea && (
            <div className="p-4 rounded-brand border border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Maior Domínio Consolidado
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {strongestArea.fullName}
                  </h4>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-10">
                Você atingiu <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{strongestArea.score}%</strong> de acerto nesta área. Continue praticando simulados para manter a consistência TRI.
              </p>
            </div>
          )}

          {/* Area Requiring Focus Card */}
          {weakestArea && (
            <div className="p-4 rounded-brand border border-amber-500/20 bg-amber-50/60 dark:bg-amber-950/20">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Oportunidade de Evolução
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {weakestArea.fullName}
                  </h4>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-10">
                Seu score atual é de <strong className="text-amber-600 dark:text-amber-400 font-bold">{weakestArea.score}%</strong>. Focar nesta área elevará sensivelmente sua nota de corte no SISU.
                {weakestArea.topWeakTopic && (
                  <span className="block mt-1 font-semibold text-amber-800 dark:text-amber-300">
                    Tópico crítico sugerido: {weakestArea.topWeakTopic}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Target Score Summary Info */}
          <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Meta de Domínio:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ≥ {MASTERY_TARGET_THRESHOLD}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Média Nacional ENEM:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                ~{NATIONAL_ENEM_BASELINE}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, overallScore)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Knowledge Area Breakdown Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          Detalhamento por Área de Conhecimento
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {chartData.map((area) => {
            const meta = getAreaMetadata(area.areaKey);
            const statusConfig = MASTERY_CONFIGS[area.masteryLevel as MasteryLevel];
            return (
              <div
                key={area.areaKey}
                className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={`${meta.bgLight} ${meta.borderLight} text-xs font-bold font-mono`}
                    >
                      {area.areaKey}
                    </Badge>
                    <span
                      className={`text-[11px] font-bold py-0.5 px-2 rounded-full border ${statusConfig.fullBadgeClass}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {area.fullName}
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-mono font-black text-slate-900 dark:text-slate-100">
                      {area.score}%
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {area.correctQuestions}/{area.totalQuestions} questões
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${area.score}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>

                  {area.topWeakTopic && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="font-semibold text-amber-700 dark:text-amber-400">Revisar:</span> {area.topWeakTopic}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Topics for Revision Section */}
      {report.recommendedTopics && report.recommendedTopics.length > 0 && (
        <div className="p-4 sm:p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              Tópicos Recomendados para Reforço & Treino
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Baseado nas suas maiores taxas de erro
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {report.recommendedTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => onPracticeTopic && onPracticeTopic(topic)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-brand-primary/10 dark:bg-slate-800 dark:hover:bg-brand-primary/20 hover:border-brand-primary/40 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span>{topic}</span>
                <ArrowRight
                  className="h-3 w-3 text-slate-400 group-hover:text-brand-primary transition-colors"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
