import React, { useState } from 'react';
import { ChevronDown, BookOpen, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { MathRenderer } from '@/components/math/MathRenderer';
import { DistractorBreakdown } from './DistractorBreakdown';
import type { QuestionOptionLetter } from '@/types';

export interface ResolutionAccordionProps {
  readonly baseExplanation: string;
  readonly correctOption: QuestionOptionLetter;
  readonly selectedOption?: QuestionOptionLetter | null;
  readonly distractorAnalysis?: Readonly<Record<QuestionOptionLetter, string>>;
  readonly attribution?: string;
  readonly initialExpanded?: boolean;
  readonly className?: string;
}

export const ResolutionAccordion: React.FC<ResolutionAccordionProps> = ({
  baseExplanation,
  correctOption,
  selectedOption = null,
  distractorAnalysis,
  attribution = 'INEP Microdados • Gabarito Oficial',
  initialExpanded = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);
  const [showDistractors, setShowDistractors] = useState<boolean>(false);

  const hasDistractors = distractorAnalysis && Object.keys(distractorAnalysis).length > 0;

  return (
    <div
      className={`rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all ${className}`}
    >
      {/* Accordion Disclosure Header Trigger */}
      <button
        type="button"
        id="resolution-accordion-header"
        aria-expanded={isExpanded}
        aria-controls="resolution-accordion-content"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-brand bg-brand-primary/10 text-brand-primary shrink-0">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            Resolução Comentada Oficial
          </span>
          <Badge variant="secondary" className="hidden sm:inline-flex text-[11px]">
            {attribution}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            {isExpanded ? 'Ocultar detalhes' : 'Ver resolução completa'}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-brand-primary' : ''
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Accordion Content Panel */}
      {isExpanded && (
        <div
          id="resolution-accordion-content"
          role="region"
          aria-labelledby="resolution-accordion-header"
          className="p-4 sm:p-5 space-y-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200"
        >
          {/* Base Step-by-Step Explanation */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
              <span>Passo a Passo Conceitual</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-brand bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              <MathRenderer content={baseExplanation} />
            </div>
          </div>

          {/* Distractor Analysis Sub-Accordion / Toggle */}
          {hasDistractors && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setShowDistractors(!showDistractors)}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded"
                  aria-expanded={showDistractors}
                  aria-controls="distractor-breakdown-panel"
                >
                  <span>
                    {showDistractors
                      ? 'Recolher análise dos distratores'
                      : 'Ver análise de cada alternativa (A–E) e falhas conceituais'}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      showDistractors ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {showDistractors && (
                <div id="distractor-breakdown-panel" className="animate-in fade-in duration-200">
                  <DistractorBreakdown
                    distractorAnalysis={distractorAnalysis}
                    correctOption={correctOption}
                    selectedOption={selectedOption}
                  />
                </div>
              )}
            </div>
          )}

          {/* Mobile Attribution Footer */}
          <div className="sm:hidden pt-2 text-[11px] text-slate-500 dark:text-slate-400 text-center border-t border-slate-100 dark:border-slate-800">
            Fonte: {attribution}
          </div>
        </div>
      )}
    </div>
  );
};
