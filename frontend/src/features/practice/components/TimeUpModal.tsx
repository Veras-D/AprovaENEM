import React, { useEffect, useRef } from 'react';
import { Clock, AlertTriangle, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface TimeUpModalProps {
  readonly isOpen: boolean;
  readonly totalAnswered: number;
  readonly totalQuestions: number;
  readonly correctCount: number;
  readonly totalXp: number;
  readonly onReviewAnswers: () => void;
  readonly onRestart: () => void;
  readonly onClose?: () => void;
}

/**
 * Accessible Modal dialog displayed when the official exam countdown timer expires (00:00).
 * Prevents abrupt disruption by summarizing student progress and offering options to review answers or restart.
 */
export const TimeUpModal: React.FC<TimeUpModalProps> = ({
  isOpen,
  totalAnswered,
  totalQuestions,
  correctCount,
  totalXp,
  onReviewAnswers,
  onRestart,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Focus trap and Escape key handling (WCAG 2.1 AA)
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose ? onClose() : onReviewAnswers();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, onClose, onReviewAnswers]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (onClose) {
      onClose();
    } else {
      onReviewAnswers();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeup-modal-title"
      aria-describedby="timeup-modal-description"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-brand bg-white dark:bg-slate-900 border border-rose-500/30 dark:border-rose-500/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
              <Clock className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="timeup-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Tempo Oficial Esgotado!
              </h2>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Simulado Concluído
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Fechar aviso de tempo esgotado"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <p
            id="timeup-modal-description"
            className="text-sm text-slate-600 dark:text-slate-300"
          >
            O cronômetro deste simulado chegou a zero. Confira o resumo do seu desempenho até o momento:
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-brand bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="block text-xl font-black text-slate-900 dark:text-white">
                {totalAnswered}/{totalQuestions}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Respondidas</span>
            </div>

            <div className="p-3 rounded-brand bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">
                {correctCount}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Acertos</span>
            </div>

            <div className="p-3 rounded-brand bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="block text-xl font-black text-amber-500">
                +{totalXp}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">XP Total</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-brand bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>
              Você pode revisar a resolução de todas as questões respondidas ou reiniciar o simulado para tentar novamente com o cronômetro zerado.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onRestart}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
            Reiniciar Simulado
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onReviewAnswers}
            className="w-full sm:w-auto font-bold"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Ver Gabarito & Resoluções
          </Button>
        </div>
      </div>
    </div>
  );
};
