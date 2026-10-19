import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface QuestionCarouselProps {
  readonly totalQuestions: number;
  readonly currentIndex: number;
  readonly onSelectIndex: (index: number) => void;
  readonly isAnswered?: (index: number) => boolean;
  readonly isCorrect?: (index: number) => boolean | undefined;
  readonly isFlagged?: (index: number) => boolean;
  readonly onNext?: () => void;
  readonly onPrevious?: () => void;
  readonly className?: string;
}

export const QuestionCarousel: React.FC<QuestionCarouselProps> = ({
  totalQuestions,
  currentIndex,
  onSelectIndex,
  isAnswered = () => false,
  isCorrect = () => undefined,
  isFlagged = () => false,
  onNext,
  onPrevious,
  className = '',
}) => {
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Scroll active item into view when index changes
  useEffect(() => {
    if (typeof activeBtnRef.current?.scrollIntoView === 'function') {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentIndex]);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalQuestions - 1;

  return (
    <nav
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${className}`}
      aria-label="Controles de navegação do simulado"
    >
      {/* Previous Button */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={onPrevious}
          aria-label="Questão anterior"
          title="Questão anterior (Atalho: ← ou PageUp)"
          aria-keyshortcuts="ArrowLeft PageUp"
          className="flex-1 sm:flex-none"
        >
          <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
          Anterior
        </Button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={!hasNext}
          onClick={onNext}
          aria-label="Próxima questão"
          title="Próxima questão (Atalho: → ou PageDown)"
          aria-keyshortcuts="ArrowRight PageDown"
          className="flex-1 sm:flex-none sm:hidden"
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
        </Button>
      </div>

      {/* Carousel Scrollable Question Palette */}
      <nav
        className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 px-1 scrollbar-none"
        aria-label="Paleta de questões"
      >
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isActive = i === currentIndex;
          const answered = isAnswered(i);
          const correct = isCorrect(i);
          const flagged = isFlagged(i);

          let itemStyles =
            'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-brand-primary';

          if (isActive) {
            itemStyles =
              'border-brand-primary bg-brand-primary text-brand-primary-foreground font-bold shadow-md ring-2 ring-brand-primary ring-offset-2 dark:ring-offset-slate-900';
          } else if (flagged) {
            itemStyles =
              'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-semibold';
          } else if (answered) {
            if (correct === false) {
              itemStyles =
                'border-rose-500/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 font-medium hover:border-rose-500';
            } else if (correct === true) {
              itemStyles =
                'border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium hover:border-emerald-500';
            } else {
              itemStyles =
                'border-slate-400/60 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium hover:border-slate-500';
            }
          }

          let statusText = '';
          if (answered) {
            if (correct === true) {
              statusText = ' (Correta)';
            } else if (correct === false) {
              statusText = ' (Incorreta)';
            } else {
              statusText = ' (Respondida)';
            }
          }

          return (
            <button
              key={i}
              ref={isActive ? activeBtnRef : null}
              type="button"
              onClick={() => onSelectIndex(i)}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Ir para a questão ${i + 1}${statusText}${
                flagged ? ' (Marcada para revisão)' : ''
              }`}
              className={`relative h-9 w-9 min-w-[36px] rounded-brand border flex items-center justify-center text-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${itemStyles}`}
            >
              <span>{i + 1}</span>

              {/* Status Icons Overlay */}
              {flagged && !isActive && (
                <span
                  className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-xs z-10"
                  aria-hidden="true"
                >
                  <Bookmark className="h-2 w-2 fill-current" />
                </span>
              )}
              {answered && !isActive && !flagged && (
                correct === false ? (
                  <span
                    className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-xs z-10"
                    aria-hidden="true"
                    data-testid="carousel-incorrect-badge"
                  >
                    <X className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <span
                    className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xs z-10"
                    aria-hidden="true"
                    data-testid="carousel-correct-badge"
                  >
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                )
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop Next Button */}
      <div className="hidden sm:flex items-center">
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={!hasNext}
          onClick={onNext}
          aria-label="Próxima questão"
          title="Próxima questão (Atalho: → ou PageDown)"
          aria-keyshortcuts="ArrowRight PageDown"
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
};
