import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Flame, Sparkles, Trophy, X, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface StreakCelebrationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly streakDays?: number;
  readonly dailyGoalTarget?: number;
  readonly dailyGoalProgress?: number;
  readonly awardedXp?: number;
  readonly onContinuePractice?: () => void;
  readonly onOpenGamification?: () => void;
  readonly className?: string;
}

const WEEK_DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  isOpen,
  onClose,
  streakDays = 1,
  dailyGoalTarget = 5,
  dailyGoalProgress = 5,
  awardedXp = 50,
  onContinuePractice,
  onOpenGamification,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      return undefined;
    }
    if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, shouldRender]);

  // Compute 7 days of the current week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayIndex = (dayOfWeek + 6) % 7;

    return WEEK_DAY_LABELS.map((label, idx) => {
      const isToday = idx === mondayIndex;
      const isPast = idx < mondayIndex;
      const isCompleted = isToday || (isPast && mondayIndex - idx < streakDays);

      return {
        label,
        isToday,
        isCompleted,
        isFuture: idx > mondayIndex,
      };
    });
  }, [streakDays]);

  // Accessibility and keyboard focus management
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const resolvedStreak = Math.max(1, streakDays);

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 m-0"
      role="dialog"
      aria-modal="true"
      aria-hidden={isClosing || undefined}
      aria-labelledby="streak-modal-title"
      aria-describedby="streak-modal-desc"
      ref={modalRef}
      data-testid="streak-celebration-modal"
    >
      {/* Platform Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm ${
          isClosing ? 'animate-out fade-out duration-150' : 'animate-in fade-in duration-200'
        }`}
        onClick={onClose}
        aria-hidden="true"
        data-testid="streak-modal-backdrop"
      />

      {/* Invisible test container for confetti */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-0"
        aria-hidden="true"
        data-testid="streak-confetti-container"
      >
        <div className="absolute rounded-xs animate-confetti" />
      </div>

      {/* Main Modal Window - Minimalist, Consistent Platform Style */}
      <div
        className={`relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-brand shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col ${
          isClosing
            ? 'animate-out fade-out zoom-out-95 duration-150'
            : 'animate-in fade-in zoom-in-95 duration-200'
        } ${className}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-brand bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="streak-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                Meta Diária Concluída!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Treino ENEM finalizado com sucesso
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Fechar celebração da ofensiva"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Streak Accomplishment Card - Minimalist Platform Style matching LevelUpModal */}
          <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/25">
                  <Flame className="h-5 w-5 fill-current" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 whitespace-nowrap">
                      {resolvedStreak} {resolvedStreak === 1 ? 'Dia de Ofensiva!' : 'Dias de Ofensiva!'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      Em Chamas!
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Sua sequência diária de estudos continua ativa e protegida!
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 text-xs py-0.5 px-2 font-bold uppercase tracking-wider shrink-0 whitespace-nowrap"
              >
                <Flame className="h-3 w-3 mr-1 fill-current" aria-hidden="true" />
                Ofensiva Ativa!
              </Badge>
            </div>

            <p
              id="streak-modal-desc"
              className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-700/60"
            >
              Meta diária batida! Você praticou <strong>{dailyGoalProgress}/{dailyGoalTarget} questões</strong> hoje e manteve sua chama de estudos acesa.
            </p>
          </div>

          {/* Weekly Progression Track Card */}
          <div className="p-4 rounded-brand bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Semana Atual
              </span>

              {awardedXp > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  +{awardedXp} XP somados à sua liga semanal
                </span>
              )}
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-0.5">
              {weekDays.map((day) => (
                <div key={day.label} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`text-[11px] font-bold ${
                      day.isToday
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {day.label}
                  </span>

                  <div
                    className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-all ${
                      day.isToday
                        ? 'bg-orange-500 text-white shadow-xs ring-2 ring-orange-400/40'
                        : day.isCompleted
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                    title={`${day.label}: ${
                      day.isToday ? 'Hoje (Meta Concluída)' : day.isCompleted ? 'Estudado' : 'Pendente'
                    }`}
                  >
                    {day.isToday ? (
                      <Flame className="h-4 w-4 fill-current text-white" aria-hidden="true" />
                    ) : day.isCompleted ? (
                      <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Toolbar */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-2.5">
          {onOpenGamification ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenGamification();
              }}
              className="text-xs font-semibold"
            >
              <Trophy className="h-3.5 w-3.5 mr-1.5 text-amber-500" aria-hidden="true" />
              Ver Posição na Liga Semanal
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onContinuePractice?.();
            }}
            className="text-xs font-bold"
          >
            <span>Continuar Estudando</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('root') : null;
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent;
};
