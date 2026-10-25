import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { QuestionOptionLetter } from '@/types';

export interface FeedbackBannerProps {
  readonly isCorrect: boolean;
  readonly selectedOption: QuestionOptionLetter;
  readonly correctOption: QuestionOptionLetter;
  readonly awardedXp?: number;
  readonly onNextQuestion?: () => void;
  readonly hasNextQuestion?: boolean;
  readonly onFinishDiagnostic?: () => void;
  readonly finishButtonLabel?: string;
  readonly finishButtonAriaLabel?: string;
  readonly className?: string;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  isCorrect,
  selectedOption,
  correctOption,
  awardedXp = isCorrect ? 15 : 5,
  onNextQuestion,
  hasNextQuestion = false,
  onFinishDiagnostic,
  finishButtonLabel,
  finishButtonAriaLabel,
  className = '',
}) => {
  const containerStyles = isCorrect
    ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
    : 'border-rose-500/50 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';

  const srText = isCorrect
    ? `Resposta correta! Você selecionou a alternativa ${selectedOption}. Ganhou ${awardedXp} pontos de experiência.`
    : `Resposta incorreta. Você selecionou a alternativa ${selectedOption}. A alternativa correta é a letra ${correctOption}. Ganhou ${awardedXp} pontos pela tentativa.`;

  return (
    <div
      className={`p-4 sm:p-5 rounded-brand border-2 shadow-sm transition-all animate-in fade-in duration-300 ${containerStyles} ${className}`}
      role="region"
      aria-labelledby="feedback-banner-heading"
    >
      {/* Screen reader live announcement */}
      <span className="sr-only" role="status" aria-live="polite">
        {srText}
      </span>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Feedback Title and Indicator */}
        <div className="flex items-start gap-3.5">
          {isCorrect ? (
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 shrink-0 mt-0.5">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
          ) : (
            <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 shrink-0 mt-0.5">
              <XCircle className="h-6 w-6" aria-hidden="true" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                id="feedback-banner-heading"
                className="text-base sm:text-lg font-bold"
              >
                {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta!'}
              </h3>

              <Badge
                variant={isCorrect ? 'primary' : 'warning'}
                className="text-xs font-semibold inline-flex items-center gap-1"
              >
                <Award className="h-3 w-3" aria-hidden="true" />
                +{awardedXp} XP {isCorrect ? 'Concedidos' : 'Por Esforço'}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {isCorrect ? (
                <span>
                  Você acertou a questão ao selecionar a alternativa <strong>({selectedOption})</strong>.
                </span>
              ) : (
                <span>
                  Você selecionou a alternativa ({selectedOption}), mas o gabarito oficial é a letra{' '}
                  <strong className="underline underline-offset-2">({correctOption})</strong>.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Next Question Navigation Action */}
        {hasNextQuestion && onNextQuestion && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onNextQuestion}
            className="self-end sm:self-auto shrink-0 shadow-sm"
            aria-label="Avançar para a próxima questão"
          >
            <span>Próxima Questão</span>
            <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
          </Button>
        )}

        {/* Finalize Diagnostic or Daily Practice Action (when at the end of questions) */}
        {!hasNextQuestion && onFinishDiagnostic && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onFinishDiagnostic}
            className="self-end sm:self-auto shrink-0 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            aria-label={finishButtonAriaLabel || 'Finalizar e ver meu diagnóstico de proficiência'}
          >
            <span>{finishButtonLabel || 'Ver Meu Diagnóstico'}</span>
            <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
};
