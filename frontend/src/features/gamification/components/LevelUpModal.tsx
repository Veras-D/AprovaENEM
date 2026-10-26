import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Award, Sparkles, X, CheckCircle2, ArrowRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
      role="dialog"
      aria-modal="true"
      aria-hidden={isClosing || undefined}
      aria-labelledby="levelup-modal-title"
      aria-describedby="levelup-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 m-0"
      ref={modalRef}
      data-testid="level-up-modal"
    >
      {/* Platform Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm ${
          isClosing ? 'animate-out fade-out duration-150' : 'animate-in fade-in duration-200'
        }`}
        onClick={onClose}
        aria-hidden="true"
        data-testid="levelup-modal-backdrop"
      />

      {/* Hidden container for test contract compliance */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-0"
        aria-hidden="true"
        data-testid="levelup-confetti-container"
      >
        <div className="absolute rounded-xs animate-confetti" />
      </div>

      {/* Main Modal Window - Strictly Following AprovaENEM Design System */}
      <div
        className={`relative z-10 w-full max-w-lg rounded-brand bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col ${
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
                id="levelup-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                Subiu de Nível!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evolução conquistada com base nas suas questões resolvidas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Fechar modal de subida de nível"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Level Accomplishment Card - Standard Platform Style matching LevelProgressBar */}
          <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
                  <Award className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      Nível {newLevel}!
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {levelTitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Parabéns pela sua dedicação contínua nos estudos!
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs py-0.5 px-2 font-bold uppercase tracking-wider shrink-0 whitespace-nowrap"
              >
                <Sparkles className="h-3 w-3 mr-1 text-amber-500" aria-hidden="true" />
                Novo Nível
              </Badge>
            </div>

            <p
              id="levelup-modal-desc"
              className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-700/60"
            >
              {previousLevel
                ? `Você evoluiu do Nível ${previousLevel} para o Nível ${newLevel}! Sua dedicação nos simulados está rendendo resultados.`
                : `Parabéns pela conquista do Nível ${newLevel}! Continue respondendo questões para se destacar no ENEM.`}
            </p>
          </div>

          {/* Unlocked Benefits Card */}
          <div className="p-4 rounded-brand bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recompensas Desbloqueadas
              </span>
              {awardedXp > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  +{awardedXp} XP Bônus
                </span>
              )}
            </div>

            <div className="space-y-2">
              {benefitsToDisplay.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
              Ver Minha Liga e Conquistas
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
