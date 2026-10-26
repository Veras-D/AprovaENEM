import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Sparkles, Star, Award, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface LevelUpModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly newLevel: number;
  readonly previousLevel?: number;
  readonly levelTitle?: string;
  readonly awardedXp?: number;
  readonly weeklyLeague?: string;
  readonly unlockedBenefits?: readonly string[];
  readonly onContinuePractice?: () => void;
  readonly onOpenGamification?: () => void;
  readonly className?: string;
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

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  previousLevel,
  levelTitle = 'Calouro Iniciante',
  awardedXp = 50,
  weeklyLeague,
  unlockedBenefits,
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

  // Confetti particles generator
  const particles: Particle[] = useMemo(() => {
    if (prefersReducedMotion) return [];
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] || '#f59e0b',
      size: Math.floor(Math.random() * 8) + 6,
      delay: Math.random() * 1.5,
      duration: Math.random() * 2 + 2.5,
    }));
  }, [prefersReducedMotion]);

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

  const defaultBenefits = [
    `+${awardedXp} XP de bônus de evolução de nível`,
    `Título desbloqueado: ${levelTitle}`,
    weeklyLeague
      ? `Avanço na Liga Semanal ${weeklyLeague}`
      : 'Mais prestígio no ranking das ligas semanais',
  ];

  const benefitsToDisplay = unlockedBenefits && unlockedBenefits.length > 0
    ? unlockedBenefits
    : defaultBenefits;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 m-0"
      role="dialog"
      aria-modal="true"
      aria-hidden={isClosing || undefined}
      aria-labelledby="levelup-modal-title"
      aria-describedby="levelup-modal-desc"
      ref={modalRef}
      data-testid="level-up-modal"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-xs ${
          isClosing ? 'animate-out fade-out duration-150' : 'animate-in fade-in duration-200'
        }`}
        onClick={onClose}
        aria-hidden="true"
        data-testid="levelup-modal-backdrop"
      />

      {/* Confetti Particles (skipped if reduced motion) */}
      {!prefersReducedMotion && (
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden z-50"
          aria-hidden="true"
          data-testid="levelup-confetti-container"
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

      {/* Main Level Up Card */}
      <div
        className={`relative z-50 w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/80 dark:border-amber-500/70 shadow-2xl text-center space-y-5 overflow-hidden ${
          isClosing
            ? 'animate-out fade-out zoom-out-95 duration-150'
            : 'animate-in fade-in zoom-in-95 duration-200'
        } ${className}`}
      >
        {/* Ambient Warm Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-radial from-amber-400/30 via-yellow-500/10 to-transparent pointer-events-none rounded-full blur-2xl"
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          aria-label="Fechar modal de subida de nível"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Radiant Level Trophy / Star Icon */}
        <div className="relative inline-block mx-auto pt-2">
          <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-xl shadow-amber-500/30">
            <div className="absolute inset-1.5 rounded-full bg-white dark:bg-slate-900 opacity-20" />
            <Trophy
              className="h-16 w-16 sm:h-18 sm:w-18 fill-white text-white drop-shadow-md animate-pulse"
              aria-hidden="true"
            />
            {/* Sparkle Tag */}
            <div className="absolute -top-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-md">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            {/* Star Tag */}
            <div className="absolute -bottom-1 -left-1 p-1 rounded-full bg-blue-500 text-white shadow-md">
              <Star className="h-5 w-5 fill-current" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Level Up Announcement */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Award className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            Subiu de Nível!
          </div>

          <h2
            id="levelup-modal-title"
            className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Nível {newLevel}!
          </h2>

          <p className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">
            {levelTitle}
          </p>

          <p
            id="levelup-modal-desc"
            className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs mx-auto"
          >
            {previousLevel
              ? `Você evoluiu do Nível ${previousLevel} para o Nível ${newLevel}! Sua dedicação nos simulados está rendendo resultados.`
              : `Parabéns pela conquista do Nível ${newLevel}! Continue respondendo questões para se destacar no ENEM.`}
          </p>
        </div>

        {/* Benefits & Unlocked Perks Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left space-y-2.5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recompensas Desbloqueadas
          </span>

          <div className="space-y-2">
            {benefitsToDisplay.map((benefit) => (
              <div key={benefit} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => {
              onClose();
              onContinuePractice?.();
            }}
            className="w-full text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
          >
            <span>Continuar Estudando</span>
            <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
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
              <Trophy className="h-3.5 w-3.5 mr-1.5 text-amber-500" aria-hidden="true" />
              Ver Minha Liga e Conquistas
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('root') : null;
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent;
};
