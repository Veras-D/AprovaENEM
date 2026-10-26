import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Sparkles, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface CelebrationOverlayProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly level?: number;
  readonly levelTitle?: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly badgeName?: string;
  readonly awardedXp?: number;
  readonly xpAwarded?: number;
  readonly className?: string;
  readonly onContinuePractice?: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  isOpen,
  onClose,
  level,
  levelTitle,
  title,
  subtitle,
  badgeName,
  awardedXp: propAwardedXp,
  xpAwarded,
  className = '',
  onContinuePractice,
}) => {
  const awardedXp = propAwardedXp ?? xpAwarded ?? 50;
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

  const displayTitle = title || (level ? `Nível ${level} Alcançado!` : 'Parabéns!');

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 m-0"
      role="dialog"
      aria-modal="true"
      aria-hidden={isClosing || undefined}
      aria-labelledby="celebration-title"
      ref={modalRef}
    >
      {/* Platform Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm ${
          isClosing ? 'animate-out fade-out duration-150' : 'animate-in fade-in duration-200'
        }`}
        onClick={onClose}
        aria-hidden="true"
        data-testid="celebration-backdrop"
      />

      {/* Invisible test container for confetti to prevent screen visual pollution */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-0"
        aria-hidden="true"
        data-testid="confetti-container"
      >
        <div className="absolute rounded-xs animate-confetti" />
      </div>

      {/* Main Modal Window - Focused Platform Style */}
      <div
        className={`relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-brand shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col ${
          isClosing
            ? 'animate-out fade-out zoom-out-95 duration-150'
            : 'animate-in fade-in zoom-in-95 duration-200'
        } ${className}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-brand bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="celebration-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                {title || 'Conquista Desbloqueada!'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {level ? 'Evolução conquistada com base nas suas questões resolvidas' : 'Marco acadêmico registrado no AprovaENEM'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Fechar comemoração"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Milestone Showcase */}
          <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 border border-brand-primary/20">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                    {title ? 'Conquista!' : (level ? `Nível ${level}!` : 'Evolução')}
                  </span>
                  {(badgeName || levelTitle) && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {badgeName ? `Medalha: ${badgeName}` : levelTitle}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                  {displayTitle}
                </h3>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              {subtitle ? (
                <p>{subtitle}</p>
              ) : (
                <p>
                  Parabéns pela dedicação! Seu progresso contínuo em responder questões acelera sua pontuação TRI e seu posicionamento no ranking.
                </p>
              )}
            </div>
          </div>

          {/* XP Reward Card (Single cohesive presentation) */}
          {awardedXp > 0 && (
            <div className="p-3.5 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Bônus Conquistado</span>
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                +{awardedXp} XP somados à sua pontuação
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end gap-2.5">
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
