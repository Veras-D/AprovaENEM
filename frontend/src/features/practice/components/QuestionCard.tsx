import React, { useEffect, useState } from 'react';
import type { Question, QuestionOptionLetter } from '@/types';
import type { QuestionItemDto } from '@/api/types';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MathRenderer } from '@/components/math/MathRenderer';
import { QuestionImage } from './QuestionImage';
import { OptionSelector, type OptionItem } from './OptionSelector';
import { QuestionAudioReader } from './QuestionAudioReader';
import { Bookmark, Sparkles, Send, Keyboard, Bot } from 'lucide-react';

export type UnifiedQuestion = Question | QuestionItemDto;

export interface QuestionCardProps {
  readonly question: UnifiedQuestion;
  readonly selectedOption: QuestionOptionLetter | null;
  readonly onSelectOption: (letter: QuestionOptionLetter) => void;
  readonly onSubmitAnswer?: () => void;
  readonly onOpenSocraticTutor?: () => void;
  readonly isSubmitted?: boolean;
  readonly correctOption?: QuestionOptionLetter | null;
  readonly isSubmitting?: boolean;
  readonly isFlagged?: boolean;
  readonly onToggleFlag?: () => void;
  readonly className?: string;
}

const AREA_LABELS: Record<string, string> = {
  MT: 'Matemática e suas Tecnologias',
  CN: 'Ciências da Natureza',
  CH: 'Ciências Humanas',
  LC: 'Linguagens e Códigos',
};

const DIFFICULTY_LABELS: Record<
  string,
  { label: string; variant: 'primary' | 'secondary' | 'warning' | 'outline' }
> = {
  EASY: { label: 'Fácil', variant: 'secondary' },
  MEDIUM: { label: 'Média', variant: 'warning' },
  HARD: { label: 'Difícil', variant: 'primary' },
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelectOption,
  onSubmitAnswer,
  onOpenSocraticTutor,
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
  const itemNumber =
    'itemNumber' in question && question.itemNumber
      ? question.itemNumber
      : 'externalId' in question
      ? question.externalId
      : undefined;
  const figure =
    'figureUrl' in question
      ? question.figureUrl
      : 'imageUrl' in question
      ? question.imageUrl
      : undefined;
  const figureAlt =
    'figureAltText' in question ? question.figureAltText : 'Figura explicativa da questão ENEM';
  const topic = 'topic' in question ? question.topic : undefined;
  const discipline = 'discipline' in question ? question.discipline : undefined;
  const context = 'contextText' in question ? question.contextText : undefined;

  // Normalize options list
  const normalizedOptions: OptionItem[] = question.options.map((opt) => ({
    letter: 'letter' in opt ? opt.letter : opt.optionLetter,
    text: opt.text,
  }));

  const difficultyInfo = DIFFICULTY_LABELS[question.difficulty] || {
    label: question.difficulty,
    variant: 'outline' as const,
  };

  // Live ARIA Status Announcement State (WCAG 4.1.3)
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');

  // Announce question change
  useEffect(() => {
    const areaName = AREA_LABELS[areaCode] || areaCode;
    setAriaAnnouncement(
      `Questão ${itemNumber ? '#' + itemNumber : ''} carregada. Caderno Azul, área de ${areaName}, ENEM ${year}. Dificuldade ${difficultyInfo.label}.`
    );
  }, [question.id, areaCode, itemNumber, year, difficultyInfo.label]);

  // Announce option selection
  useEffect(() => {
    if (selectedOption && !isSubmitted) {
      setAriaAnnouncement(`Alternativa (${selectedOption}) selecionada.`);
    }
  }, [selectedOption, isSubmitted]);

  // Announce submission grading result
  useEffect(() => {
    if (isSubmitted) {
      if (correctOption) {
        if (selectedOption === correctOption) {
          setAriaAnnouncement(
            `Resposta submetida e corrigida. Parabéns, resposta correta! Alternativa (${correctOption}).`
          );
        } else {
          setAriaAnnouncement(
            `Resposta submetida e corrigida. Resposta incorreta. A alternativa correta é a letra (${correctOption}).`
          );
        }
      } else {
        setAriaAnnouncement('Resposta submetida com sucesso.');
      }
    }
  }, [isSubmitted, correctOption, selectedOption]);

  // Spacebar hotkey to open Socratic AI Tutor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      if (e.code === 'Space' && onOpenSocraticTutor) {
        e.preventDefault();
        onOpenSocraticTutor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSocraticTutor]);

  return (
    <Card
      data-testid="question-card"
      className={`border-2 border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
      role="region"
      aria-labelledby="question-statement-heading"
    >
      {/* Live announcement region for screen readers (WCAG 4.1.3) */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {ariaAnnouncement}
      </div>

      {/* Question Metadata Header */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60 pb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Knowledge Area */}
          <Badge variant="primary" className="font-bold">
            {areaCode} &bull; {discipline || AREA_LABELS[areaCode] || areaCode}
          </Badge>

          {/* Exam Edition */}
          <Badge variant="secondary">ENEM {year}</Badge>

          {/* Booklet Color Badge */}
          <Badge
            variant="outline"
            className="border-sky-500/50 text-sky-700 dark:text-sky-300 bg-sky-50/60 dark:bg-sky-950/40 font-medium"
          >
            Caderno Azul
          </Badge>

          {/* Difficulty */}
          <Badge variant={difficultyInfo.variant}>{difficultyInfo.label}</Badge>

          {/* Item / Question Number */}
          {itemNumber && (
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              Questão #{itemNumber}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Web Speech Audio Reader Toolbar */}
          <QuestionAudioReader question={question} options={normalizedOptions} />

          {/* Flag Bookmark Toggle */}
          {onToggleFlag && (
            <button
              type="button"
              onClick={onToggleFlag}
              className={`p-1.5 rounded-brand border text-xs flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary min-h-[36px] ${
                isFlagged
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-bold'
                  : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-pressed={isFlagged}
              aria-label={
                isFlagged
                  ? 'Marcada para Revisão: Remover marcação da questão'
                  : 'Marcar para Revisão: Marcar questão para revisar'
              }
            >
              <Bookmark
                className={`h-4 w-4 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">{isFlagged ? 'Marcada para Revisão' : 'Marcar para Revisão'}</span>
            </button>
          )}
        </div>
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
        {figure && <QuestionImage src={figure} alt={figureAlt} caption={figureAlt} />}

        {/* Question Statement */}
        <div
          id="question-statement-heading"
          className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed"
        >
          <MathRenderer content={question.statement} />
        </div>

        {/* Option Selector List (A to E) with semantic fieldset */}
        <OptionSelector
          options={normalizedOptions}
          selectedOption={selectedOption}
          onSelectOption={onSelectOption}
          disabled={isSubmitted || isSubmitting}
          correctOption={correctOption}
          isSubmitted={isSubmitted}
          onSubmitAnswer={onSubmitAnswer}
        />
      </CardBody>

      {/* Card Action Footer */}
      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60 p-4">
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {!selectedOption && 'Selecione uma alternativa (ou use as teclas A–E)'}
            {selectedOption && !isSubmitted && `Alternativa (${selectedOption}) selecionada`}
            {isSubmitted && 'Resposta submetida e computada'}
          </span>

          {/* Accessible Hotkey Guide */}
          <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <Keyboard className="h-3 w-3" aria-hidden="true" />
            <span>[A–E] Escolher &bull; [Enter] Confirmar &bull; [← / →] Questões &bull; [Espaço] Tutor IA</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          {onOpenSocraticTutor && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSocraticTutor}
              aria-label="Tirar dúvida com o Tutor IA para esta questão"
              title="Tirar dúvida com o Tutor IA (Atalho: Espaço)"
              className="text-xs border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10"
            >
              <Bot className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              Tirar Dúvida (IA)
            </Button>
          )}

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
