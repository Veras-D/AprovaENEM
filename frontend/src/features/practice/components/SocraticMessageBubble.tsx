import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bot, User, Copy, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { MathRenderer } from '@/components/math/MathRenderer';
import { Badge } from '@/components/ui/Badge';
import { AvatarRenderer } from '@/components/avatar/AvatarRenderer';
import { useAuthStore } from '@/stores/useAuthStore';
import { DEFAULT_AVATAR_CONFIG, type AvatarConfig } from '@/types';
import { formatMessageTimestamp } from '../tutor-utils';
import type { SocraticMessageItemDto } from '@/api/types';

export interface SocraticMessageBubbleProps {
  readonly message: SocraticMessageItemDto;
  readonly className?: string;
  readonly animateStream?: boolean;
  readonly onStreamTick?: () => void;
  readonly onStreamComplete?: () => void;
}

export const SocraticMessageBubble: React.FC<SocraticMessageBubbleProps> = ({
  message,
  className = '',
  animateStream = false,
  onStreamTick,
  onStreamComplete,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const user = useAuthStore((s) => s.user);
  const isUser = message.role === 'user';
  const timeFormatted = formatMessageTimestamp(message.timestamp);

  const resolvedAvatarConfig = useMemo<AvatarConfig | null>(() => {
    if (!user) return null;
    if (user.avatarConfig) return user.avatarConfig;
    if (typeof window !== 'undefined' && user.id) {
      try {
        const raw = localStorage.getItem(`aprovaenem_avatar_${user.id}`);
        if (raw) {
          return JSON.parse(raw) as AvatarConfig;
        }
      } catch {
        // Ignore storage error
      }
    }
    return DEFAULT_AVATAR_CONFIG;
  }, [user]);

  const isTestEnv = import.meta.env.MODE === 'test';
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const shouldStream = !isUser && animateStream && !isTestEnv && !prefersReducedMotion;
  const safeContent = message.content ?? '';

  const [displayedContent, setDisplayedContent] = useState<string>(() =>
    shouldStream ? '' : safeContent
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(() => shouldStream);

  const onStreamTickRef = useRef(onStreamTick);
  const onStreamCompleteRef = useRef(onStreamComplete);
  onStreamTickRef.current = onStreamTick;
  onStreamCompleteRef.current = onStreamComplete;

  useEffect(() => {
    if (!shouldStream) {
      setDisplayedContent(safeContent);
      setIsGenerating(false);
      return undefined;
    }

    const fullText = safeContent;
    // Keep bold/italic LaTeX formulas (**$...$**), block/inline LaTeX, and words atomic during stream
    const tokens = fullText
      ? (fullText.match(/\*{1,3}\$[^$\n]+\$\*{1,3}\s*|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\S+\s*/g) ?? [fullText])
      : [''];
    let currentIndex = 0;
    setDisplayedContent('');
    setIsGenerating(true);

    const interval = window.setInterval(() => {
      // Advance 1 token every 55ms (~18 words/sec) for a calm, ChatGPT-like live generation feel
      currentIndex = Math.min(tokens.length, currentIndex + 1);
      const nextSlice = tokens.slice(0, currentIndex).join('');
      setDisplayedContent(nextSlice);
      onStreamTickRef.current?.();

      if (currentIndex >= tokens.length) {
        window.clearInterval(interval);
        setIsGenerating(false);
        onStreamCompleteRef.current?.();
      }
    }, 55);

    return () => {
      window.clearInterval(interval);
    };
  }, [message.id, safeContent, shouldStream]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(safeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failure fallback
    }
  };

  if (isUser) {
    return (
      <div
        className={`flex justify-end gap-2.5 max-w-[85%] sm:max-w-[78%] ml-auto animate-fade-up ${className}`}
        style={{ animationDuration: '320ms' }}
        role="group"
        aria-label="Sua pergunta"
      >
        <div className="flex flex-col items-end space-y-1">
          {/* Student Header Info (Name + Timestamp) */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              {timeFormatted}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {user?.name || 'Você'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl rounded-tr-xs bg-slate-900 dark:bg-brand-primary text-white shadow-sm text-sm">
            <MathRenderer content={safeContent} />
          </div>
        </div>

        {resolvedAvatarConfig ? (
          <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
            <AvatarRenderer config={resolvedAvatarConfig} size={32} ariaHidden />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
            <User className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex justify-start gap-2.5 max-w-[90%] sm:max-w-[85%] mr-auto animate-fade-up ${className}`}
      style={{ animationDuration: '360ms' }}
      role="group"
      aria-label="Resposta do Tutor Socrático"
      aria-busy={isGenerating}
    >
      <div className="h-7 w-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <Bot className={`h-4 w-4 ${isGenerating ? 'animate-pulse' : ''}`} aria-hidden="true" />
      </div>

      <div className="flex flex-col items-start space-y-1 w-full">
        {/* Tutor Header Info */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand-primary" aria-hidden="true" />
            Tutor Socrático
          </span>

          {message.isFallback && (
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1"
            >
              <AlertTriangle className="h-2.5 w-2.5 text-amber-500" aria-hidden="true" />
              Resposta base INEP
            </Badge>
          )}

          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            {timeFormatted}
          </span>
        </div>

        {/* Tutor Message Body with Math, Streaming Cursor, and Copy action */}
        <div className="relative group p-3.5 sm:p-4 rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs text-sm text-slate-800 dark:text-slate-200 w-full transition-all">
          <div className="inline">
            <MathRenderer content={displayedContent} />
            {isGenerating && (
              <span
                className="inline-block w-1.5 h-4 ml-1 align-middle bg-brand-primary rounded-xs animate-pulse"
                aria-hidden="true"
                data-testid="streaming-cursor"
              />
            )}
          </div>

          {!isGenerating && (
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100/60 dark:bg-slate-700/60 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              title={copied ? 'Copiado!' : 'Copiar resposta'}
              aria-label={copied ? 'Resposta copiada para a área de transferência' : 'Copiar resposta do tutor'}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
