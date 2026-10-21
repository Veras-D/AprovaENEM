import React, { useEffect, useRef, useCallback } from 'react';
import { Clock, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface TimeUpModalProps {
  readonly isOpen: boolean;
  readonly questionNumber?: number;
  readonly onContinue: () => void;
  readonly onNextQuestion?: () => void;
  readonly onSwitchUntimed?: () => void;
  readonly hasNextQuestion?: boolean;
  readonly onClose?: () => void;
}

/**
 * Accessible Question Pacing Alert dialog displayed when a student reaches the recommended 3-minute limit on a single question.
 * Informs the candidate about ENEM time management without disrupting or halting their study session.
 */
export const TimeUpModal: React.FC<TimeUpModalProps> = ({
  isOpen,
  questionNumber,
  onContinue,
  onNextQuestion,
  onSwitchUntimed,
  hasNextQuestion = false,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const handleDismiss = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      onContinue();
    }
  }, [onClose, onContinue]);

  // Focus trap and Escape key handling (WCAG 2.1 AA)
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
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

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, handleDismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 m-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeup-modal-title"
      aria-describedby="timeup-modal-description"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleDismiss}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md rounded-brand bg-white dark:bg-slate-900 border border-amber-500/40 dark:border-amber-500/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400">
              <Clock className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="timeup-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
              >
                Atenção ao Tempo da Questão
              </h2>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                {questionNumber ? `Questão #${questionNumber} • ` : ''}Ritmo de Prova ENEM (3 min)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Fechar aviso de tempo da questão"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <p
            id="timeup-modal-description"
            className="text-sm text-slate-700 dark:text-slate-200"
          >
            Você atingiu o tempo médio sugerido de <strong>3 minutos</strong> para resolver esta questão no ENEM.
          </p>

          <div className="flex items-start gap-3 p-3.5 rounded-brand bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <span className="font-semibold block">Dica de Gestão de Tempo:</span>
              <span>
                No exame oficial, ficar muito tempo preso em uma questão difícil pode comprometer as demais. Você pode continuar tentando responder agora ou avançar para a próxima.
              </span>
            </div>
          </div>

          {onSwitchUntimed && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={onSwitchUntimed}
                className="text-xs text-brand-primary hover:underline font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded"
              >
                Prefere praticar sem pressão de tempo? Ativar Modo Livre
              </button>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {hasNextQuestion && onNextQuestion && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onNextQuestion}
              className="w-full sm:w-auto"
            >
              Pular para Próxima
              <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onContinue}
            className="w-full sm:w-auto font-bold"
            autoFocus
          >
            Continuar Respondendo
          </Button>
        </div>
      </div>
    </div>
  );
};
