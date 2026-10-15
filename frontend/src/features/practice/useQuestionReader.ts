import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { UnifiedQuestion } from './components/QuestionCard';
import type { OptionItem } from './components/OptionSelector';
import { prepareQuestionSpeechText } from './tts-utils';

export interface UseQuestionReaderOptions {
  readonly question: UnifiedQuestion | null;
  readonly options?: readonly OptionItem[];
  readonly lang?: string;
  readonly initialRate?: number;
}

export interface UseQuestionReaderReturn {
  readonly isSupported: boolean;
  readonly isSpeaking: boolean;
  readonly isPaused: boolean;
  readonly rate: number;
  readonly speechText: string;
  readonly speak: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly stop: () => void;
  readonly togglePlay: () => void;
  readonly cycleRate: () => void;
  readonly setRate: (rate: number) => void;
}

const AVAILABLE_RATES = [1.0, 1.25, 0.85] as const;

export function useQuestionReader({
  question,
  options,
  lang = 'pt-BR',
  initialRate = 1.0,
}: UseQuestionReaderOptions): UseQuestionReaderReturn {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [rate, setRateState] = useState<number>(initialRate);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check Web Speech API browser support safely
  const isSupported = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance !== 'undefined'
    );
  }, []);

  const speechText = useMemo(() => {
    if (!question) return '';
    return prepareQuestionSpeechText(question, options);
  }, [question, options]);

  // Stop speech when question changes or component unmounts
  const stop = useCallback(() => {
    if (isSupported && typeof window !== 'undefined') {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Fallback if speechSynthesis is inaccessible
      }
    }
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, [isSupported]);

  useEffect(() => {
    stop();
  }, [question?.id, stop]);

  const speak = useCallback(() => {
    if (!isSupported || !speechText || typeof window === 'undefined') return;

    try {
      window.speechSynthesis.cancel();

      const utterance = new window.SpeechSynthesisUtterance(speechText);
      utterance.lang = lang;
      utterance.rate = rate;

      // Select pt-BR voice if available
      const voices = window.speechSynthesis.getVoices();
      const ptVoice =
        voices.find((v) => v.lang === 'pt-BR') ||
        voices.find((v) => v.lang.startsWith('pt')) ||
        null;
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  }, [isSupported, speechText, lang, rate]);

  const pause = useCallback(() => {
    if (isSupported && typeof window !== 'undefined' && isSpeaking && !isPaused) {
      try {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } catch {
        // Fallback
      }
    }
  }, [isSupported, isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isSupported && typeof window !== 'undefined' && isSpeaking && isPaused) {
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } catch {
        // Fallback
      }
    }
  }, [isSupported, isSpeaking, isPaused]);

  const togglePlay = useCallback(() => {
    if (!isSpeaking) {
      speak();
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isSpeaking, isPaused, speak, resume, pause]);

  const setRate = useCallback(
    (newRate: number) => {
      setRateState(newRate);
      if (isSpeaking && !isPaused) {
        // Restart speech at new rate
        speak();
      }
    },
    [isSpeaking, isPaused, speak]
  );

  const cycleRate = useCallback(() => {
    const currentIndex = AVAILABLE_RATES.indexOf(rate as (typeof AVAILABLE_RATES)[number]);
    const nextIndex = (currentIndex + 1) % AVAILABLE_RATES.length;
    const nextRate = AVAILABLE_RATES[nextIndex] ?? 1.0;
    setRate(nextRate);
  }, [rate, setRate]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    rate,
    speechText,
    speak,
    pause,
    resume,
    stop,
    togglePlay,
    cycleRate,
    setRate,
  };
}
