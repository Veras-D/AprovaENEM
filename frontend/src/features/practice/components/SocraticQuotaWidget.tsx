import React, { useMemo } from 'react';
import { Sparkles, Clock, AlertCircle, Crown, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { calculateTimeUntilMidnightBrt } from '../tutor-utils';

export interface SocraticQuotaWidgetProps {
  readonly remainingTurns: number;
  readonly maxTurns?: number;
  readonly isGuest?: boolean;
  readonly isPro?: boolean;
  readonly dailyQuestionsUnlocked?: number;
  readonly dailyQuestionsLimit?: number;
  readonly onUpgradePro?: () => void;
  readonly onRegisterGuest?: () => void;
  readonly className?: string;
}

export const SocraticQuotaWidget: React.FC<SocraticQuotaWidgetProps> = ({
  remainingTurns,
  maxTurns = 6,
  isGuest = false,
  isPro = false,
  dailyQuestionsUnlocked = 1,
  dailyQuestionsLimit = 1,
  onUpgradePro,
  onRegisterGuest,
  className = '',
}) => {
  const timeUntilReset = useMemo(() => calculateTimeUntilMidnightBrt(), []);
  const usedTurns = Math.max(0, maxTurns - remainingTurns);
  const isTurnQuotaExhausted = remainingTurns <= 0;
  const isDailyQuestionsExhausted = dailyQuestionsUnlocked >= dailyQuestionsLimit;

  return (
    <div
      className={`p-3 sm:p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 space-y-3 ${className}`}
      role="region"
      aria-label="Cota de uso do Tutor IA Socrático"
    >
      {/* Top Row: Turn Counter & Daily Quota Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Turns Indicator */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Turnos nesta questão:
          </span>
          <div
            className="flex items-center gap-1"
            role="progressbar"
            aria-valuenow={usedTurns}
            aria-valuemin={0}
            aria-valuemax={maxTurns}
            aria-label={`Turno ${usedTurns} de ${maxTurns}`}
          >
            {Array.from({ length: maxTurns }).map((_, idx) => {
              const isUsed = idx < usedTurns;
              return (
                <span
                  key={`turn-dot-${idx}`}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    isUsed
                      ? isTurnQuotaExhausted
                        ? 'bg-rose-500'
                        : 'bg-brand-primary'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  aria-hidden="true"
                />
              );
            })}
          </div>
          <span
            className={`font-mono text-xs font-bold ${
              isTurnQuotaExhausted
                ? 'text-rose-600 dark:text-rose-400'
                : remainingTurns <= 2
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-brand-primary'
            }`}
          >
            {usedTurns}/{maxTurns}
          </span>
        </div>

        {/* Daily Tier Badge */}
        {isPro ? (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1 text-xs"
          >
            <Crown className="h-3 w-3 text-amber-500" aria-hidden="true" />
            Plano Pro &bull; Ilimitado
          </Badge>
        ) : isGuest ? (
          <Badge
            variant="outline"
            className="bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 gap-1 text-xs"
          >
            Modo Visitante
          </Badge>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>Reseta em {timeUntilReset.formatted}</span>
          </div>
        )}
      </div>

      {/* Guest Mode Gate Banner */}
      {isGuest && (
        <div className="p-2.5 rounded-brand bg-brand-primary/10 border border-brand-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
            <span>
              <strong>1 questão diária gratuita</strong> ao cadastrar-se no AprovaENEM.
            </span>
          </div>
          {onRegisterGuest && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onRegisterGuest}
              className="text-xs h-7 py-0 px-2.5 self-end sm:self-auto shrink-0"
              aria-label="Criar conta gratuita para usar o Tutor Socrático"
            >
              <UserPlus className="h-3 w-3 mr-1" aria-hidden="true" />
              Cadastrar Grátis
            </Button>
          )}
        </div>
      )}

      {/* Turn Quota Exhausted Warning */}
      {isTurnQuotaExhausted && (
        <div
          className="p-2.5 rounded-brand bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong>Limite de turnos desta questão atingido ({maxTurns}/{maxTurns}).</strong>{' '}
            Você pode reiniciar esta conversa no botão acima ou avançar para a próxima questão do simulado.
          </div>
        </div>
      )}

      {/* Daily Free Question Quota Exhausted Alert for Registered Students */}
      {!isPro && !isGuest && isDailyQuestionsExhausted && (
        <div className="p-2.5 rounded-brand bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span>
                Cota diária de <strong>{dailyQuestionsLimit} questão</strong> desbloqueada atingida hoje.
                Sua cota renova à meia-noite (em {timeUntilReset.formatted}).
              </span>
            </div>
          </div>
          {onUpgradePro && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUpgradePro}
              className="text-xs h-7 py-0 px-2.5 self-end sm:self-auto shrink-0 border-amber-500/40 text-amber-700 dark:text-amber-300"
              aria-label="Conhecer o plano Pro para consultas ilimitadas"
            >
              <Crown className="h-3 w-3 mr-1 text-amber-500" aria-hidden="true" />
              Plano Pro
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
