import React, { useState, useEffect, useRef } from 'react';
import { Timer, AlertTriangle, Pause, Play, Clock, HeartHandshake } from 'lucide-react';
import type { TimeAccommodationMode } from '@/types';

export interface QuizTimerProps {
  readonly initialSeconds?: number;
  readonly isCountdown?: boolean;
  readonly isPaused?: boolean;
  readonly timeMode?: TimeAccommodationMode;
  readonly onTimeUp?: () => void;
  readonly onTick?: (seconds: number) => void;
  readonly onOpenAccommodations?: () => void;
  readonly className?: string;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  initialSeconds = 180, // 3 minutes per question default
  isCountdown = true,
  isPaused: externalPaused = false,
  timeMode = 'STANDARD',
  onTimeUp,
  onTick,
  onOpenAccommodations,
  className = '',
}) => {
  // Calculate effective countdown mode and starting seconds based on INEP accommodations
  const effectiveIsCountdown = timeMode === 'UNTIMED' ? false : isCountdown;
  const effectiveInitialSeconds =
    timeMode === 'UNTIMED'
      ? 0
      : timeMode === 'EXTENDED_INEP'
      ? Math.max(initialSeconds, 300) // 5 minutes (300s) for INEP Extended Time
      : initialSeconds;

  const [seconds, setSeconds] = useState<number>(
    effectiveIsCountdown ? effectiveInitialSeconds : 0
  );
  const [internalPaused, setInternalPaused] = useState<boolean>(false);
  const [srAnnouncement, setSrAnnouncement] = useState<string>('');
  const hasCalledTimeUp = useRef<boolean>(false);

  // Sync timer when timeMode or initialSeconds changes
  useEffect(() => {
    hasCalledTimeUp.current = false;
    setSeconds(effectiveIsCountdown ? effectiveInitialSeconds : 0);
  }, [timeMode, effectiveIsCountdown, effectiveInitialSeconds]);

  const isPaused = externalPaused || internalPaused;

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = effectiveIsCountdown ? Math.max(0, prev - 1) : prev + 1;
        onTick?.(next);

        // Screen reader announcements at important thresholds
        if (effectiveIsCountdown) {
          if (next === 300) {
            setSrAnnouncement('Atenção: restam 5 minutos para o término do simulado.');
          } else if (next === 60) {
            setSrAnnouncement('Atenção: resta 1 minuto para o término do simulado.');
          } else if (next === 0 && !hasCalledTimeUp.current) {
            hasCalledTimeUp.current = true;
            setSrAnnouncement('Tempo esgotado.');
            onTimeUp?.();
          }
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [effectiveIsCountdown, isPaused, onTick, onTimeUp]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLowTime = effectiveIsCountdown && seconds <= 60 && seconds > 0;
  const isTimeUp = effectiveIsCountdown && seconds === 0;

  let timerStyles =
    'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
  if (isLowTime) {
    timerStyles =
      'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-500 animate-pulse';
  } else if (isTimeUp) {
    timerStyles =
      'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-500';
  } else if (timeMode === 'EXTENDED_INEP') {
    timerStyles =
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-500/40';
  } else if (timeMode === 'UNTIMED') {
    timerStyles =
      'bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 border-blue-500/40';
  }

  const ariaLabelText =
    timeMode === 'UNTIMED'
      ? `Tempo decorrido: ${formatTime(seconds)} (Sem limite de tempo)`
      : timeMode === 'EXTENDED_INEP'
      ? `Tempo estendido INEP restante: ${formatTime(seconds)}`
      : `Tempo do simulado restante: ${formatTime(seconds)}`;

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-brand border text-xs sm:text-sm font-mono font-bold shadow-sm select-none transition-colors shrink-0 whitespace-nowrap ${timerStyles} ${className}`}
      role="timer"
      aria-label={ariaLabelText}
    >
      {/* Live announcement region for assistive technology */}
      <span className="sr-only" role="status" aria-live="polite">
        {srAnnouncement}
      </span>

      {isLowTime || isTimeUp ? (
        <AlertTriangle
          className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0"
          aria-hidden="true"
        />
      ) : timeMode === 'EXTENDED_INEP' ? (
        <HeartHandshake
          className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0"
          aria-hidden="true"
        />
      ) : timeMode === 'UNTIMED' ? (
        <Clock
          className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0"
          aria-hidden="true"
        />
      ) : (
        <Timer className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
      )}

      <span className="shrink-0 whitespace-nowrap">{formatTime(seconds)}</span>

      {/* Accommodation Badge */}
      {timeMode === 'EXTENDED_INEP' && (
        <span
          className="text-[10px] font-sans font-bold px-1 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 hidden sm:inline shrink-0 whitespace-nowrap"
          title="Atendimento Especializado INEP: +60 minutos"
        >
          +60m INEP
        </span>
      )}

      {timeMode === 'UNTIMED' && (
        <span
          className="text-[10px] font-sans font-bold px-1 py-0.5 rounded bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 hidden sm:inline shrink-0 whitespace-nowrap"
          title="Modo Livre de Ansiedade (Sem contagem regressiva)"
        >
          Livre
        </span>
      )}

      {/* Quick Pause / Resume Control */}
      <button
        type="button"
        onClick={() => setInternalPaused(!internalPaused)}
        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
        aria-label={internalPaused ? 'Retomar cronômetro' : 'Pausar cronômetro'}
      >
        {internalPaused ? (
          <Play className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        ) : (
          <Pause className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
        )}
      </button>

      {/* Open INEP Accommodations Settings Button */}
      {onOpenAccommodations && (
        <button
          type="button"
          onClick={onOpenAccommodations}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-primary-light transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
          aria-label="Configurar acomodações de tempo INEP"
          title="Ajustar tempo de prova (INEP)"
        >
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
