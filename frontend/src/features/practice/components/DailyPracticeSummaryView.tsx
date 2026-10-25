import React from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Target,
  Layers,
  BarChart2,
  Trophy,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface DailyPracticeSummaryViewProps {
  readonly questionsCount: number;
  readonly correctCount: number;
  readonly awardedXp: number;
  readonly dailyGoalTarget?: number;
  readonly dailyGoalProgress?: number;
  readonly onContinuePractice: () => void;
  readonly onStartOfficialSimulation?: () => void;
  readonly onOpenDiagnostics?: () => void;
  readonly onOpenGamification?: () => void;
  readonly className?: string;
}

export const DailyPracticeSummaryView: React.FC<DailyPracticeSummaryViewProps> = ({
  questionsCount,
  correctCount,
  awardedXp,
  dailyGoalTarget = 5,
  dailyGoalProgress = 0,
  onContinuePractice,
  onStartOfficialSimulation,
  onOpenDiagnostics,
  onOpenGamification,
  className = '',
}) => {
  const accuracyPercentage = questionsCount > 0
    ? Math.round((correctCount / questionsCount) * 100)
    : 0;

  const goalProgressClamped = Math.min(dailyGoalProgress, dailyGoalTarget);
  const goalPercentage = Math.min(
    100,
    Math.round((dailyGoalProgress / Math.max(1, dailyGoalTarget)) * 100)
  );
  const isGoalCompleted = dailyGoalProgress >= dailyGoalTarget;

  return (
    <section
      aria-labelledby="daily-practice-summary-heading"
      className={`space-y-6 animate-in fade-in duration-300 ${className}`}
      data-testid="daily-practice-summary-view"
    >
      {/* Header Accomplishment Card */}
      <Card className="border-2 border-emerald-500/30 bg-white dark:bg-slate-900 shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Award className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" className="text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white border-transparent">
                  Treino Diário ENEM Concluído
                </Badge>
                {isGoalCompleted && (
                  <Badge variant="secondary" className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-300">
                    <Flame className="h-3 w-3 mr-1 inline text-amber-500" aria-hidden="true" />
                    Meta Diária Atingida!
                  </Badge>
                )}
              </div>
              <h1
                id="daily-practice-summary-heading"
                className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100"
              >
                Treino Diário Concluído! 🎉
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Você finalizou sua sessão de treino diário e acumulou pontos para o ranking semanal da sua liga.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 flex-wrap">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onContinuePractice}
              className="h-9 px-4 text-xs sm:text-sm font-bold whitespace-nowrap inline-flex items-center justify-center shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              aria-label="Continuar praticando com nova série de questões"
            >
              <Sparkles className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Continuar Praticando
            </Button>
            {onStartOfficialSimulation && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onStartOfficialSimulation}
                className="h-9 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center shrink-0"
              >
                <Layers className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Simular Prova Oficial
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-4 sm:p-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Accuracy */}
            <div className="p-4 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Aproveitamento no Treino
              </span>
              <span className="block text-3xl font-black text-slate-900 dark:text-slate-100">
                {correctCount}/{questionsCount}
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {accuracyPercentage}% de acertos
              </span>
            </div>

            {/* XP Gained */}
            <div className="p-4 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                XP Conquistado
              </span>
              <span className="block text-3xl font-black text-amber-500">
                +{awardedXp} XP
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Pontos somados à sua liga semanal
              </span>
            </div>

            {/* Daily Goal Status */}
            <div className="p-4 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
                  Meta Diária
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {goalProgressClamped}/{dailyGoalTarget}
                </span>
              </div>
              <div
                className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden"
                role="progressbar"
                aria-valuenow={dailyGoalProgress}
                aria-valuemin={0}
                aria-valuemax={dailyGoalTarget}
                aria-label={`Progresso da meta diária: ${dailyGoalProgress} de ${dailyGoalTarget} questões resolvidas`}
              >
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>
              <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                {isGoalCompleted
                  ? 'Parabéns! Meta do dia cumprida!'
                  : `Faltam ${Math.max(0, dailyGoalTarget - dailyGoalProgress)} questões para bater a meta`}
              </span>
            </div>
          </div>

          {/* Quick Actions Footer Card */}
          <div className="p-4 rounded-brand bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Próximos Passos
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Continue praticando com mais 5 questões ou confira sua posição no ranking semanal.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenDiagnostics && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenDiagnostics}
                  className="text-xs font-semibold"
                >
                  <BarChart2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Painel Diagnóstico
                </Button>
              )}
              {onOpenGamification && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenGamification}
                  className="text-xs font-semibold"
                >
                  <Trophy className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Ranking da Liga
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onContinuePractice}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <span>Praticar Mais 5 Questões</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
};
