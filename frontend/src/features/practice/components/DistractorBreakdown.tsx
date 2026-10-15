import React from 'react';
import { CheckCircle2, XCircle, Info, ListChecks } from 'lucide-react';
import { MathRenderer } from '@/components/math/MathRenderer';
import type { QuestionOptionLetter } from '@/types';

export interface DistractorBreakdownProps {
  readonly distractorAnalysis: Readonly<Record<QuestionOptionLetter, string>>;
  readonly correctOption: QuestionOptionLetter;
  readonly selectedOption?: QuestionOptionLetter | null;
  readonly className?: string;
}

const LETTERS: readonly QuestionOptionLetter[] = ['A', 'B', 'C', 'D', 'E'];

export const DistractorBreakdown: React.FC<DistractorBreakdownProps> = ({
  distractorAnalysis,
  correctOption,
  selectedOption = null,
  className = '',
}) => {
  const lettersWithAnalysis = LETTERS.filter((l) => Boolean(distractorAnalysis[l]));

  if (lettersWithAnalysis.length === 0) {
    return null;
  }

  return (
    <div
      className={`space-y-3.5 p-4 sm:p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm ${className}`}
      role="region"
      aria-labelledby="distractor-breakdown-heading"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <ListChecks className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
        <h4
          id="distractor-breakdown-heading"
          className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
        >
          Análise Detalhada dos Distratores (Alternativas A–E)
        </h4>
      </div>

      <div className="space-y-2.5">
        {lettersWithAnalysis.map((letter) => {
          const isCorrect = letter === correctOption;
          const isSelectedWrong = letter === selectedOption && !isCorrect;
          const explanation = distractorAnalysis[letter] || '';

          let cardBorder = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40';
          let badgeStyles = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
          let icon = <Info className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />;
          let labelText = `Alternativa ${letter}`;

          if (isCorrect) {
            cardBorder = 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20';
            badgeStyles = 'bg-emerald-600 text-white font-bold';
            icon = <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />;
            labelText = `Alternativa ${letter} (Gabarito Oficial)`;
          } else if (isSelectedWrong) {
            cardBorder = 'border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20';
            badgeStyles = 'bg-rose-600 text-white font-bold';
            icon = <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />;
            labelText = `Alternativa ${letter} (Sua Resposta)`;
          }

          return (
            <div
              key={letter}
              className={`p-3 sm:p-3.5 rounded-brand border text-xs sm:text-sm transition-colors ${cardBorder}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm ${badgeStyles}`}
                  aria-label={labelText}
                >
                  {letter}
                </span>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    {icon}
                    <span
                      className={
                        isCorrect
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : isSelectedWrong
                          ? 'text-rose-800 dark:text-rose-300'
                          : 'text-slate-700 dark:text-slate-400'
                      }
                    >
                      {labelText}
                    </span>
                  </div>

                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed pl-5">
                    <MathRenderer content={explanation} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
