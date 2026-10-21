import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Sparkles, Star, Award, X } from 'lucide-react';
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

interface Particle {
  readonly id: number;
  readonly left: number;
  readonly color: string;
  readonly size: number;
  readonly delay: number;
  readonly duration: number;
}

const CONFETTI_COLORS = [
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#ef4444', // red
];

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

  // Check prefers-reduced-motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  // Generate confetti particles
  const particles: Particle[] = useMemo(() => {
    if (prefersReducedMotion) return [];
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] || '#f59e0b',
      size: Math.floor(Math.random() * 8) + 6,
      delay: Math.random() * 1.5,
      duration: Math.random() * 2 + 2.5,
    }));
  }, [prefersReducedMotion]);

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

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 m-0"
      role="dialog"
      aria-modal="true"
      aria-hidden={isClosing || undefined}
      aria-labelledby="celebration-title"
      ref={modalRef}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs ${
          isClosing
            ? 'animate-out fade-out duration-150'
            : 'animate-in fade-in duration-200'
        }`}
        onClick={onClose}
        aria-hidden="true"
        data-testid="celebration-backdrop"
      />

      {/* Confetti Particles (skipped if reduced motion) */}
      {!prefersReducedMotion && (
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden z-50"
          aria-hidden="true"
          data-testid="confetti-container"
        >
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-xs animate-confetti"
              style={{
                left: `${p.left}%`,
                top: '-30px',
                width: `${p.size}px`,
                height: `${p.size * 1.4}px`,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Celebration Modal Card */}
      <div
        className={`relative z-50 w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400/60 dark:border-amber-500/40 shadow-2xl text-center space-y-4 ${
          isClosing
            ? 'animate-out fade-out zoom-out-95 duration-150'
            : 'animate-in fade-in zoom-in-95 duration-200'
        } ${className}`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
          aria-label="Fechar comemoração"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Radiant Trophy Illustration */}
        <div className="relative inline-block mx-auto">
          <div className="h-20 w-20 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
            <Trophy className="h-10 w-10 fill-current animate-pulse" aria-hidden="true" />
          </div>
          <div className="absolute -top-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-xs">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="absolute -bottom-1 -left-1 p-1 rounded-full bg-blue-500 text-white shadow-xs">
            <Star className="h-4 w-4 fill-current" aria-hidden="true" />
          </div>
        </div>

        {/* Heading & Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Award className="h-3.5 w-3.5" aria-hidden="true" />
            {title ? 'Conquista!' : 'Subiu de Nível!'}
          </div>

          <h2
            id="celebration-title"
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
          >
            {title || (level ? `Nível ${level} Alcançado!` : 'Parabéns!')}
          </h2>

          {(badgeName || levelTitle) && (
            <p className="text-base font-bold text-brand-primary">
              {badgeName ? `Medalha: ${badgeName}` : levelTitle}
            </p>
          )}

          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1">
            {subtitle ? (
              <p>{subtitle}</p>
            ) : (
              <p>
                Parabéns! Você conquistou <strong>+{awardedXp} XP</strong> e desbloqueou novos desafios nas ligas semanais do SISU.
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => {
              onClose();
              onContinuePractice?.();
            }}
            className="w-full text-sm font-bold shadow-md shadow-brand-primary/20"
          >
            Continuar Estudando
          </Button>
        </div>
      </div>
    </div>
  );

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('root') : null;
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent;
};
