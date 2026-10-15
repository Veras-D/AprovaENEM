import React, { useState, useEffect } from 'react';
import { Volume2, Pause, Play, Square, Gauge } from 'lucide-react';
import type { UnifiedQuestion } from './QuestionCard';
import type { OptionItem } from './OptionSelector';
import { useQuestionReader } from '../useQuestionReader';

export interface QuestionAudioReaderProps {
  readonly question: UnifiedQuestion | null;
  readonly options?: readonly OptionItem[];
  readonly className?: string;
}

export const QuestionAudioReader: React.FC<QuestionAudioReaderProps> = ({
  question,
  options,
  className = '',
}) => {
  const {
    isSupported,
    isSpeaking,
    isPaused,
    rate,
    togglePlay,
    stop,
    cycleRate,
  } = useQuestionReader({ question, options });

  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');

  useEffect(() => {
    if (isSpeaking && !isPaused) {
      setAriaAnnouncement('Iniciando leitura em voz alta da questão.');
    } else if (isPaused) {
      setAriaAnnouncement('Leitura em voz alta pausada.');
    } else if (!isSpeaking) {
      setAriaAnnouncement('Leitura em voz alta encerrada.');
    }
  }, [isSpeaking, isPaused]);

  if (!isSupported) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 dark:text-slate-500 ${className}`}
        title="Síntese de voz não suportada pelo navegador"
      >
        <Volume2 className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
        <span className="hidden sm:inline">Voz indisponível</span>
      </div>
    );
  }

  const isPlaying = isSpeaking && !isPaused;

  return (
    <div
      role="region"
      aria-label="Controles de leitura de questão em voz alta"
      className={`inline-flex items-center gap-1.5 p-1 rounded-brand bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}
    >
      {/* Live announcement region for screen readers */}
      <span className="sr-only" role="status" aria-live="polite">
        {ariaAnnouncement}
      </span>

      {/* Main Play / Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary min-h-[36px] ${
          isPlaying
            ? 'bg-brand-primary text-brand-primary-foreground shadow-sm animate-pulse'
            : isPaused
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        aria-label={
          isPlaying
            ? 'Pausar leitura em voz alta'
            : isPaused
            ? 'Continuar leitura em voz alta'
            : 'Ouvir questão em voz alta'
        }
        title={
          isPlaying
            ? 'Pausar leitura (Atalho: L)'
            : isPaused
            ? 'Continuar leitura (Atalho: L)'
            : 'Ouvir questão (Atalho: L)'
        }
      >
        {isPlaying ? (
          <>
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="inline">Pausar</span>
            {/* Visual audio wave bars */}
            <span className="flex items-end gap-0.5 h-3 ml-0.5" aria-hidden="true">
              <span className="w-0.5 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-0.5 h-3 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-0.5 h-1.5 bg-current rounded-full animate-bounce" />
            </span>
          </>
        ) : isPaused ? (
          <>
            <Play className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            <span className="inline">Continuar</span>
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
            <span className="inline">Ouvir Questão</span>
          </>
        )}
      </button>

      {/* Stop Button (visible while active or paused) */}
      {(isSpeaking || isPaused) && (
        <button
          type="button"
          onClick={stop}
          className="p-1.5 rounded text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 min-h-[36px] min-w-[36px] flex items-center justify-center"
          aria-label="Parar leitura em voz alta"
          title="Parar leitura"
        >
          <Square className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}

      {/* Speed Rate Toggle Button */}
      <button
        type="button"
        onClick={cycleRate}
        className="px-1.5 py-1 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary min-h-[36px] flex items-center gap-1"
        aria-label={`Velocidade de leitura atual: ${rate}x. Clique para alterar.`}
        title="Alterar velocidade de leitura (1.0x, 1.25x, 0.85x)"
      >
        <Gauge className="h-3 w-3 text-slate-400" aria-hidden="true" />
        <span>{rate}x</span>
      </button>
    </div>
  );
};
