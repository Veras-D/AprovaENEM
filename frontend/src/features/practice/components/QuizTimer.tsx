import React, { useState, useEffect, useRef } from 'react';
import { Timer, AlertTriangle, Pause, Play } from 'lucide-react';

export interface QuizTimerProps {
  readonly initialSeconds?: number;
  readonly isCountdown?: boolean;
  readonly isPaused?: boolean;
  readonly onTimeUp?: () => void;
  readonly onTick?: (seconds: number) => void;
  readonly className?: string;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  initialSeconds = 900, // 15 minutes default
  isCountdown = true,
  isPaused: externalPaused = false,
  onTimeUp,
  onTick,
  className = '',
}) => {
  const [seconds, setSeconds] = useState<number>(isCountdown ? initialSeconds : 0);
  const [internalPaused, setInternalPaused] = useState<boolean>(false);
  const [srAnnouncement, setSrAnnouncement] = useState<string>('');
  const hasCalledTimeUp = useRef<boolean>(false);

  const isPaused = externalPaused || internalPaused;

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = isCountdown ? Math.max(0, prev - 1) : prev + 1;
        onTick?.(next);

        // Screen reader announcements at important thresholds
        if (isCountdown) {
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
  }, [isCountdown, isPaused, onTick, onTimeUp]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLowTime = isCountdown && seconds <= 60 && seconds > 0;
  const isTimeUp = isCountdown && seconds === 0;

  let timerStyles = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
  if (isLowTime) {
    timerStyles = 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-500 animate-pulse';
  } else if (isTimeUp) {
    timerStyles = 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-500';
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-brand border text-xs sm:text-sm font-mono font-bold shadow-sm select-none transition-colors ${timerStyles} ${className}`}
      role="timer"
      aria-label={`Tempo do simulado: ${formatTime(seconds)}`}
    >
      {/* Live announcement region for assistive technology */}
      <span className="sr-only" role="status" aria-live="polite">
        {srAnnouncement}
      </span>

      {isLowTime || isTimeUp ? (
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
      ) : (
        <Timer className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
      )}

      <span>{formatTime(seconds)}</span>

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
    </div>
  );
};
