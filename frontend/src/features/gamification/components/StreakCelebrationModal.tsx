import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Flame, Sparkles, Trophy, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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

interface Ember {
  readonly id: number;
  readonly left: number;
  readonly bottom: number;
  readonly size: number;
  readonly delay: number;
  readonly duration: number;
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

  const prefersReducedMotion = useMemo(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  // Floating fiery ember particles
  const embers: Ember[] = useMemo(() => {
    if (prefersReducedMotion) return [];
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: 20 + Math.random() * 60,
      bottom: 25 + Math.random() * 20,
      size: Math.floor(Math.random() * 4) + 3,
      delay: Math.random() * 1.5,
      duration: Math.random() * 1.5 + 1.2,
    }));
  }, [prefersReducedMotion]);

  // Compute 7 days of the current week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const today = new Date();
    // getDay returns 0 for Sunday, 1 for Monday, etc.
    const dayOfWeek = today.getDay();
    // Convert to Monday=0, Sunday=6
    const mondayIndex = (dayOfWeek + 6) % 7;

    return WEEK_DAY_LABELS.map((label, idx) => {
      const isToday = idx === mondayIndex;
      const isPast = idx < mondayIndex;
      // Mark as completed if today or within current streak in this week
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 m-0"
      role="dialog"
      aria-modal="true"
      aria-hidden={isClosing || undefined}
      aria-labelledby="streak-modal-title"
      aria-describedby="streak-modal-desc"
      ref={modalRef}
      data-testid="streak-celebration-modal"
    >
      {/* Dimmed Warm Backdrop */}
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-xs ${
          isClosing ? 'animate-out fade-out duration-150' : 'animate-in fade-in duration-200'
        }`}
        onClick={onClose}
        aria-hidden="true"
        data-testid="streak-modal-backdrop"
      />

      {/* Main Duolingo-style Ofensiva Card */}
      <div
        className={`relative z-50 w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-orange-500/40 dark:border-orange-500/30 shadow-2xl text-center space-y-5 overflow-hidden ${
          isClosing
            ? 'animate-out fade-out zoom-out-95 duration-150'
            : 'animate-in fade-in zoom-in-95 duration-200'
        } ${className}`}
      >
        {/* Ambient Warm Radial Background Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-radial from-orange-500/30 via-amber-500/10 to-transparent pointer-events-none rounded-full blur-2xl"
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          aria-label="Fechar celebração da ofensiva"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Hero Duolingo-style Pulsing Flame */}
        <div className="relative inline-block mx-auto pt-2">
          {/* Floating Embers */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {embers.map((ember) => (
                <div
                  key={ember.id}
                  className="absolute rounded-full bg-orange-400 animate-ember opacity-80"
                  style={{
                    left: `${ember.left}%`,
                    bottom: `${ember.bottom}%`,
                    width: `${ember.size}px`,
                    height: `${ember.size}px`,
                    animationDelay: `${ember.delay}s`,
                    animationDuration: `${ember.duration}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Radiant Flame Circle */}
          <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 shadow-xl shadow-orange-500/30">
            <div className="absolute inset-1.5 rounded-full bg-white dark:bg-slate-900 opacity-20" />
            <Flame
              className={`h-16 w-16 sm:h-20 sm:w-20 fill-white text-white drop-shadow-md ${
                !prefersReducedMotion ? 'animate-flame-pulse' : ''
              }`}
              aria-hidden="true"
            />
            {/* Sparkle Tag */}
            <div className="absolute -top-1 -right-1 p-1 rounded-full bg-amber-400 text-amber-950 shadow-md">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Streak Counter Heading */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            <Flame className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            Ofensiva Ativa!
          </div>

          <h2
            id="streak-modal-title"
            className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            {resolvedStreak} {resolvedStreak === 1 ? 'Dia de Ofensiva!' : 'Dias de Ofensiva!'}
          </h2>

          <p
            id="streak-modal-desc"
            className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs mx-auto"
          >
            Meta diária batida! Você praticou <strong>{dailyGoalProgress}/{dailyGoalTarget} questões</strong> hoje e garantiu sua chama de estudos acesa.
          </p>
        </div>

        {/* Weekly Calendar Strip (Duolingo Style) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Semana Atual
          </span>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((day) => (
              <div key={day.label} className="flex flex-col items-center gap-1">
                <span
                  className={`text-[10px] font-bold ${
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
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/30 ring-2 ring-orange-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                      : day.isCompleted
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500'
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

        {/* Bonus XP Reward Pill */}
        {awardedXp > 0 && (
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            <span>+{awardedXp} XP somados à sua liga semanal</span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="pt-2 space-y-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => {
              onClose();
              onContinuePractice?.();
            }}
            className="w-full text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
          >
            Continuar Estudando
          </Button>

          {onOpenGamification && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenGamification();
              }}
              className="w-full text-xs font-semibold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            >
              <Trophy className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              Ver Posição na Liga Semanal
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('root') : null;
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent;
};
