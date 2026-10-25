import React from 'react';
import {
  Award,
  CheckCircle2,
  Sparkles,
  Layers,
  RotateCcw,
  UserPlus,
  LogIn,
  Lightbulb,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StudentDiagnosticRadar } from './StudentDiagnosticRadar';
import { evaluateDiagnosticLevel } from '../diagnostic-utils';
import { useAuthStore } from '@/stores/useAuthStore';
import type { DiagnosticReportDto } from '@/api/types';

export interface DiagnosticResultViewProps {
  readonly report: DiagnosticReportDto;
  readonly awardedXp?: number;
  readonly flaggedCount?: number;
  readonly onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  readonly onPracticeTopic?: (topic: string) => void;
  readonly onStartDailyPractice?: () => void;
  readonly onStartOfficialSimulation?: () => void;
  readonly onRetakeDiagnostic?: () => void;
  readonly className?: string;
}

export const DiagnosticResultView: React.FC<DiagnosticResultViewProps> = ({
  report,
  awardedXp = 50,
  onOpenAuthModal,
  onPracticeTopic,
  onStartDailyPractice,
  onStartOfficialSimulation,
  onRetakeDiagnostic,
  className = '',
}) => {
  const { isAuthenticated } = useAuthStore();
  const evaluation = evaluateDiagnosticLevel(report.scorePercentage);

  // Compute total and correct questions from radar
  const { totalQuestions, correctQuestions } = (report.radar || []).reduce(
    (acc, curr) => ({
      totalQuestions: acc.totalQuestions + (curr.totalQuestions || 0),
      correctQuestions: acc.correctQuestions + (curr.correctQuestions || 0),
    }),
    { totalQuestions: 0, correctQuestions: 0 }
  );

  return (
    <div
      className={`space-y-6 animate-in fade-in duration-300 ${className}`}
      role="region"
      aria-label="Resultado da Avaliação Diagnóstica e Nível de Compreensão"
      data-testid="diagnostic-result-view"
    >
      {/* Header Accomplishment Card */}
      <Card className="border-2 border-brand-primary/30 bg-white dark:bg-slate-900 shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-full bg-brand-primary/10 text-brand-primary shrink-0">
              <Award className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" className="text-xs font-bold uppercase tracking-wider">
                  Avaliação Diagnóstica Concluída &bull; Calibração TRI
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {evaluation.tierLabel}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                Seu Diagnóstico ENEM &amp; Nível de Compreensão
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Mapeamos suas proficiências nas 4 áreas do conhecimento do ENEM com base no seu desempenho.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
            {onStartDailyPractice && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onStartDailyPractice}
                className="h-9 px-3 text-xs sm:text-sm font-bold whitespace-nowrap inline-flex items-center justify-center shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                aria-label="Começar treino diário de questões"
              >
                <Sparkles className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Iniciar Treino Diário
              </Button>
            )}
            {onStartOfficialSimulation && (
              <Button
                type="button"
                variant={onStartDailyPractice ? 'outline' : 'primary'}
                size="sm"
                onClick={onStartOfficialSimulation}
                className="h-9 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center shrink-0"
              >
                <Layers className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Simular Prova Oficial
              </Button>
            )}
            {!isAuthenticated && onRetakeDiagnostic && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetakeDiagnostic}
                className="h-9 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center shrink-0"
                title="Refazer avaliação diagnóstica para calibrar novamente"
              >
                <RotateCcw className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Refazer Diagnóstico
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-4 sm:p-6 space-y-6">
          {/* Key Understanding Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nota TRI Estimada
              </span>
              <span className="block text-3xl font-black text-brand-primary">
                ~{evaluation.estimatedTriScore}
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                {evaluation.tierLabel}
              </span>
            </div>

            <div className="p-4 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Aproveitamento Global
              </span>
              <span className="block text-3xl font-black text-slate-900 dark:text-slate-100">
                {totalQuestions > 0 ? `${correctQuestions}/${totalQuestions}` : `${report.scorePercentage}%`}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {Math.round(report.scorePercentage)}% das questões corretas
              </span>
            </div>

            {isAuthenticated ? (
              <div className="p-4 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  XP Conquistado
                </span>
                <span className="block text-3xl font-black text-amber-500">
                  +{awardedXp}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Pontos de experiência ganhos
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  XP de Experiência
                </span>
                <span className="block text-2xl sm:text-3xl font-black text-slate-400 dark:text-slate-500">
                  0 XP
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Cadastre-se para pontuar
                </span>
              </div>
            )}
          </div>

          {/* Qualitative Pedagogical Analysis */}
          <div className="p-4 rounded-brand border border-blue-500/20 bg-blue-50/60 dark:bg-blue-950/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              <Lightbulb className="h-4 w-4" aria-hidden="true" />
              <span>Parecer Pedagógico de Entrada</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {evaluation.qualitativeFeedback}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Unauthenticated Guest Save Notice */}
      {!isAuthenticated && (
        <Card className="border-2 border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
          <CardBody className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Salve seu Diagnóstico e Histórico</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Deseja salvar sua nota TRI e acompanhar sua evolução semanal?
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                Crie sua conta gratuita em 30 segundos para manter seu histórico de proficiência salvo permanentemente, desbloquear o ranking da liga e praticar tópicos direcionados.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  if (onOpenAuthModal) {
                    onOpenAuthModal('register');
                  } else {
                    useAuthStore.getState().openAuthModal('register');
                  }
                }}
                className="text-xs font-bold shadow-sm"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                Cadastre-se Gratuitamente
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onOpenAuthModal) {
                    onOpenAuthModal('login');
                  } else {
                    useAuthStore.getState().openAuthModal('login');
                  }
                }}
                className="text-xs"
              >
                <LogIn className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                Entrar
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Interactive Radar Chart & Knowledge Areas Breakdown */}
      <StudentDiagnosticRadar
        report={report}
        onPracticeTopic={onPracticeTopic}
      />
    </div>
  );
};
