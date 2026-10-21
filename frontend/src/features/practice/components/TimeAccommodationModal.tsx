import React, { useEffect, useRef } from 'react';
import { X, Clock, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { TimeAccommodationMode } from '@/types';

import { TIME_ACCOMMODATION_OPTIONS } from '../time-accommodation-constants';

export interface TimeAccommodationModalProps {
  readonly isOpen: boolean;
  readonly currentMode: TimeAccommodationMode;
  readonly onSelectMode: (mode: TimeAccommodationMode) => void;
  readonly onClose: () => void;
}

export const TimeAccommodationModal: React.FC<TimeAccommodationModalProps> = ({
  isOpen,
  currentMode,
  onSelectMode,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Keyboard accessibility: Escape to dismiss and Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accommodations-modal-title"
      aria-describedby="accommodations-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 m-0"
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-xl rounded-brand bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-brand bg-brand-primary/10 text-brand-primary">
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="accommodations-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                Acomodações de Tempo de Prova INEP
              </h2>
              <p
                id="accommodations-modal-desc"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                Ajuste o ritmo do simulado de acordo com suas necessidades pedagógicas ou legais.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Fechar janela de acomodações de tempo"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body: Mode List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5">
          {TIME_ACCOMMODATION_OPTIONS.map((option) => {
            const isSelected = currentMode === option.mode;

            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => {
                  onSelectMode(option.mode);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-brand border-2 transition-all flex flex-col gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                  isSelected
                    ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-brand-primary/40 bg-white dark:bg-slate-900'
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {option.title}
                    </span>
                    {option.legalBadge && (
                      <Badge variant="secondary" className="text-[10px]">
                        {option.legalBadge}
                      </Badge>
                    )}
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-primary shrink-0">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      <span>Ativo</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-brand-primary dark:text-brand-primary-light">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{option.timeDescription}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {option.audience}
                </p>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Alinhado às diretrizes WCAG 2.1 AA e e-MAG</span>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
};
