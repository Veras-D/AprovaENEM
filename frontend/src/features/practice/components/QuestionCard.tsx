import React from 'react';
import type { Question, QuestionOptionLetter } from '@/types';
import type { QuestionItemDto } from '@/api/types';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MathRenderer } from '@/components/math/MathRenderer';
import { QuestionImage } from './QuestionImage';
import { OptionSelector, type OptionItem } from './OptionSelector';
import { Bookmark, Sparkles, Send } from 'lucide-react';

export type UnifiedQuestion = Question | QuestionItemDto;

export interface QuestionCardProps {
  readonly question: UnifiedQuestion;
  readonly selectedOption: QuestionOptionLetter | null;
  readonly onSelectOption: (letter: QuestionOptionLetter) => void;
  readonly onSubmitAnswer?: () => void;
  readonly isSubmitted?: boolean;
  readonly correctOption?: QuestionOptionLetter | null;
  readonly isSubmitting?: boolean;
  readonly isFlagged?: boolean;
  readonly onToggleFlag?: () => void;
  readonly className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelectOption,
  onSubmitAnswer,
  isSubmitted = false,
  correctOption = null,
  isSubmitting = false,
  isFlagged = false,
  onToggleFlag,
  className = '',
}) => {
  // Normalize fields between Question and QuestionItemDto
  const year = 'year' in question ? question.year : question.examYear;
  const areaCode = 'subject' in question ? question.subject : question.knowledgeArea;
  const itemNumber = 'itemNumber' in question && question.itemNumber ? question.itemNumber : ('externalId' in question ? question.externalId : undefined);
  const figure = 'figureUrl' in question ? question.figureUrl : ('imageUrl' in question ? question.imageUrl : undefined);
  const figureAlt = 'figureAltText' in question ? question.figureAltText : 'Figura explicativa da questão ENEM';
  const topic = 'topic' in question ? question.topic : undefined;
  const discipline = 'discipline' in question ? question.discipline : undefined;
  const context = 'contextText' in question ? question.contextText : undefined;

  // Normalize options list
  const normalizedOptions: OptionItem[] = question.options.map((opt) => ({
    letter: 'letter' in opt ? opt.letter : opt.optionLetter,
    text: opt.text,
  }));

  // Resolve Subject Area Badge Variant and Label
  const areaLabels: Record<string, string> = {
    MT: 'Matemática e suas Tecnologias',
    CN: 'Ciências da Natureza',
    CH: 'Ciências Humanas',
    LC: 'Linguagens e Códigos',
  };

  const difficultyLabels: Record<string, { label: string; variant: 'primary' | 'secondary' | 'warning' | 'outline' }> = {
    EASY: { label: 'Fácil', variant: 'secondary' },
    MEDIUM: { label: 'Média', variant: 'warning' },
    HARD: { label: 'Difícil', variant: 'primary' },
  };

  const difficultyInfo = difficultyLabels[question.difficulty] || {
    label: question.difficulty,
    variant: 'outline' as const,
  };

  return (
    <Card
      className={`border-2 border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
      role="region"
      aria-labelledby="question-statement-heading"
    >
      {/* Question Metadata Header */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60 pb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Knowledge Area */}
          <Badge variant="primary" className="font-bold">
            {areaCode} &bull; {discipline || areaLabels[areaCode] || areaCode}
          </Badge>

          {/* Exam Edition */}
          <Badge variant="secondary">ENEM {year}</Badge>

          {/* Difficulty */}
          <Badge variant={difficultyInfo.variant}>{difficultyInfo.label}</Badge>

          {/* Item / Question Number */}
          {itemNumber && (
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              Questão #{itemNumber}
            </span>
          )}
        </div>

        {/* Flag Bookmark Toggle */}
        {onToggleFlag && (
          <button
            type="button"
            onClick={onToggleFlag}
            className={`self-end sm:self-auto p-1.5 rounded-brand border text-xs flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
              isFlagged
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-bold'
                : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-pressed={isFlagged}
            aria-label={isFlagged ? 'Remover marcação da questão' : 'Marcar questão para revisar'}
          >
            <Bookmark
              className={`h-4 w-4 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">
              {isFlagged ? 'Marcada' : 'Revisar'}
            </span>
          </button>
        )}
      </CardHeader>

      <CardBody className="space-y-5 p-4 sm:p-6">
        {/* Topic Title (if present) */}
        {topic && (
          <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
            {topic}
          </p>
        )}

        {/* Context Reference Document / Excerpt (if present) */}
        {context && (
          <blockquote className="p-3.5 sm:p-4 rounded-brand border-l-4 border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 text-xs sm:text-sm italic leading-relaxed">
            <MathRenderer content={context} />
          </blockquote>
        )}

        {/* Question Figure / Image (WebP with Lightbox Zoom) */}
        {figure && (
          <QuestionImage src={figure} alt={figureAlt} caption={figureAlt} />
        )}

        {/* Question Statement */}
        <div
          id="question-statement-heading"
          className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed"
        >
          <MathRenderer content={question.statement} />
        </div>

        {/* Option Selector List (A to E) */}
        <OptionSelector
          options={normalizedOptions}
          selectedOption={selectedOption}
          onSelectOption={onSelectOption}
          disabled={isSubmitted || isSubmitting}
          correctOption={correctOption}
          isSubmitted={isSubmitted}
        />
      </CardBody>

      {/* Card Action Footer */}
      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60 p-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          {!selectedOption && 'Selecione uma alternativa para responder (ou use as teclas A–E)'}
          {selectedOption && !isSubmitted && `Alternativa (${selectedOption}) selecionada`}
          {isSubmitted && 'Resposta submetida e computada'}
        </span>

        <div className="flex items-center justify-end gap-2.5">
          {onSubmitAnswer && !isSubmitted && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!selectedOption || isSubmitting}
              isLoading={isSubmitting}
              onClick={onSubmitAnswer}
              className="w-full sm:w-auto"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              Confirmar Resposta
            </Button>
          )}

          {isSubmitted && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Resposta Registrada
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
