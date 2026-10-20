import React from 'react';
import { Bot, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FeedbackBanner } from './FeedbackBanner';
import { ResolutionAccordion } from './ResolutionAccordion';
import type { QuestionOptionLetter } from '@/types';

export interface InstantFeedbackProps {
  readonly isCorrect: boolean;
  readonly selectedOption: QuestionOptionLetter;
  readonly correctOption: QuestionOptionLetter;
  readonly baseExplanation: string;
  readonly distractorAnalysis?: Readonly<Record<QuestionOptionLetter, string>>;
  readonly attribution?: string;
  readonly awardedXp?: number;
  readonly onNextQuestion?: () => void;
  readonly hasNextQuestion?: boolean;
  readonly onFinishDiagnostic?: () => void;
  readonly onOpenSocraticTutor?: () => void;
  readonly className?: string;
}

export const InstantFeedback: React.FC<InstantFeedbackProps> = ({
  isCorrect,
  selectedOption,
  correctOption,
  baseExplanation,
  distractorAnalysis,
  attribution,
  awardedXp,
  onNextQuestion,
  hasNextQuestion,
  onFinishDiagnostic,
  onOpenSocraticTutor,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Feedback e resolução da questão">
      {/* Instant Correctness Indicator & XP Banner */}
      <FeedbackBanner
        isCorrect={isCorrect}
        selectedOption={selectedOption}
        correctOption={correctOption}
        awardedXp={awardedXp}
        onNextQuestion={onNextQuestion}
        hasNextQuestion={hasNextQuestion}
        onFinishDiagnostic={onFinishDiagnostic}
      />

      {/* Step-by-Step Resolution Accordion with Distractor Analysis */}
      <ResolutionAccordion
        baseExplanation={baseExplanation}
        correctOption={correctOption}
        selectedOption={selectedOption}
        distractorAnalysis={distractorAnalysis}
        attribution={attribution}
        initialExpanded={true}
      />

      {/* Socratic AI Tutor Invitation Card */}
      <div className="p-3.5 sm:p-4 rounded-brand border border-brand-primary/20 bg-brand-primary/5 dark:bg-brand-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="p-1.5 rounded-full bg-brand-primary/10 text-brand-primary shrink-0">
            <Bot className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Dúvida no conceito ou nas fórmulas?
            </span>{' '}
            Consulte o <strong>Tutor IA Socrático</strong> para tirar dúvidas sem resposta pronta.
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Badge variant="outline" className="text-xs hidden sm:inline-flex">
            Tutor IA Pedagógico
          </Badge>

          {onOpenSocraticTutor && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSocraticTutor}
              className="text-xs"
              aria-label="Tirar dúvida com o Tutor IA sobre esta questão"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-brand-primary" aria-hidden="true" />
              Tirar Dúvida (IA)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
