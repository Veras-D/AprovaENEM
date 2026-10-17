import React from 'react';
import { Flame, Shield, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface DailyStreakCounterProps {
  readonly currentStreakDays: number;
  readonly longestStreakDays: number;
  readonly streakFreezeAvailable: boolean;
  readonly onActivateFreeze?: () => void;
  readonly className?: string;
}

export const DailyStreakCounter: React.FC<DailyStreakCounterProps> = ({
  currentStreakDays,
  longestStreakDays,
  streakFreezeAvailable,
  onActivateFreeze,
  className = '',
}) => {
  const isStreakActive = currentStreakDays > 0;

  return (
    <div
      className={`p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 ${className}`}
      role="region"
      aria-label="Sequência diária de estudos"
    >
      {/* Top Header: Flame & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-transform ${
              isStreakActive
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            <Flame className="h-5 w-5 fill-current" aria-hidden="true" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                {currentStreakDays} {currentStreakDays === 1 ? 'Dia Seguido' : 'Dias Seguidos'}
              </span>
              {isStreakActive && (
                <Badge
                  variant="outline"
                  className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 text-xs py-0 px-1.5"
                >
                  <Sparkles className="h-2.5 w-2.5 mr-1" aria-hidden="true" />
                  Em Chamas!
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isStreakActive
                ? 'Pratique hoje para manter sua chama acesa!'
                : 'Resolva 1 questão hoje para iniciar sua sequência.'}
            </p>
          </div>
        </div>

        {/* Record Badge */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
          <Trophy className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          <span>Recorde: <strong>{longestStreakDays} dias</strong></span>
        </div>
      </div>

      {/* Emergency Freeze Shield Section */}
      <div
        className={`p-3 rounded-brand border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
          streakFreezeAvailable
            ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/40 text-blue-900 dark:text-blue-200'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={`p-1.5 rounded-full shrink-0 mt-0.5 ${
              streakFreezeAvailable
                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}
          >
            {streakFreezeAvailable ? (
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Shield className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-0.5">
            <span className="font-bold block">
              {streakFreezeAvailable
                ? 'Escudo de Congelamento Disponível (1/1)'
                : 'Escudo Utilizado este Mês (0/1)'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
              {streakFreezeAvailable
                ? 'Se você esquecer de estudar por 1 dia, seu escudo ativará automaticamente para não zerar sua chama.'
                : 'Seu escudo de emergência mensal foi utilizado e recarregará no 1º dia do mês.'}
            </span>
          </div>
        </div>

        {streakFreezeAvailable && onActivateFreeze && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onActivateFreeze}
            className="text-xs h-7 py-0 px-2.5 self-end sm:self-auto shrink-0 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            aria-label="Proteção Ativa: Ver detalhes da proteção de congelamento de streak"
          >
            Proteção Ativa
          </Button>
        )}
      </div>
    </div>
  );
};
