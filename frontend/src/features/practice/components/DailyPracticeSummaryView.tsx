import React from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
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
  readonly streakDays?: number;
  readonly currentStreakDays?: number;
  readonly onContinuePractice: () => void;
  readonly onOpenStreakCelebration?: () => void;
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
  streakDays,
  currentStreakDays,
  onContinuePractice,
  onOpenStreakCelebration,
  onStartOfficialSimulation,
  onOpenDiagnostics,
  onOpenGamification,
  className = '',
}) => {
  const accuracyPercentage = questionsCount > 0
    ? Math.round((correctCount / questionsCount) * 100)
    : 0;

  const resolvedStreak = Math.max(1, streakDays ?? currentStreakDays ?? 1);
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
                  <button
                    type="button"
                    onClick={onOpenStreakCelebration}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer transition-colors"
                    title="Ver comemoração da ofensiva"
                    aria-label="Meta diária atingida. Clique para ver a celebração da ofensiva"
                  >
                    <Flame className="h-3 w-3 inline text-amber-500 fill-amber-500" aria-hidden="true" />
                    Meta Diária Atingida!
                  </button>
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

            {/* Daily Streak Status */}
            <div
              role={onOpenStreakCelebration ? 'button' : undefined}
              tabIndex={onOpenStreakCelebration ? 0 : undefined}
              onClick={onOpenStreakCelebration}
              onKeyDown={
                onOpenStreakCelebration
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenStreakCelebration();
                      }
                    }
                  : undefined
              }
              aria-label={
                onOpenStreakCelebration
                  ? 'Ofensiva diária. Clique para ver a celebração da ofensiva'
                  : undefined
              }
              className={`p-4 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1 transition-all ${
                onOpenStreakCelebration
                  ? 'cursor-pointer hover:border-orange-400 hover:shadow-md hover:bg-orange-50/20 dark:hover:bg-orange-950/10 focus:outline-hidden focus:ring-2 focus:ring-orange-400'
                  : ''
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 inline-flex items-center justify-center gap-1">
                Ofensiva Diária
                {onOpenStreakCelebration && (
                  <Sparkles className="h-3 w-3 text-orange-500" aria-hidden="true" />
                )}
              </span>
              <span className="flex items-center justify-center gap-1.5 text-3xl font-black text-orange-500 dark:text-orange-400">
                <Flame className="h-7 w-7 fill-orange-500 text-orange-500" aria-hidden="true" />
                {resolvedStreak} {resolvedStreak === 1 ? 'Dia' : 'Dias'}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {resolvedStreak > 1
                  ? `${resolvedStreak} dias seguidos de estudos!`
                  : 'Chama de estudos mantida hoje!'}
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
                Continue praticando com mais {dailyGoalTarget} questões ou confira sua posição no ranking semanal.
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
                <span>Praticar Mais {dailyGoalTarget} Questões</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
};
