import React, { useMemo } from 'react';
import { Award, Zap, Sparkles } from 'lucide-react';
import { calculateLevelProgress, formatXp } from '../gamification-utils';

export interface LevelProgressBarProps {
  readonly currentXp: number;
  readonly currentLevel: number;
  readonly className?: string;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  currentXp,
  currentLevel,
  className = '',
}) => {
  const stats = useMemo(
    () => calculateLevelProgress(currentXp, currentLevel),
    [currentXp, currentLevel]
  );

  return (
    <div
      className={`p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 ${className}`}
      role="region"
      aria-label="Progresso de nível e XP"
    >
      {/* Header: Level Badge & Title */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Nível {stats.currentLevel}
              </span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {stats.levelTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Próximo: {stats.nextLevelTitle} (Nível {stats.currentLevel + 1})
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Zap className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            {formatXp(currentXp)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>{stats.xpInCurrentLevel} / 200 XP no nível</span>
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            {stats.progressPercentage}%
          </span>
        </div>

        <div
          className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50"
          role="progressbar"
          aria-valuenow={stats.progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso do Nível ${stats.currentLevel}: ${stats.progressPercentage}% (${stats.xpInCurrentLevel} de 200 XP)`}
        >
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand-primary" aria-hidden="true" />
            Faltam <strong>{stats.xpNeededForNextLevel} XP</strong> para o Nível {stats.currentLevel + 1}
          </span>
          <span>+10 XP por acerto &bull; +50 XP por simulado</span>
        </div>
      </div>
    </div>
  );
};
