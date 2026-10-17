import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Flame,
  Zap,
  Calculator,
  Atom,
  Globe,
  BookOpen,
  Shield,
  Crown,
  Lock,
  Trophy,
} from 'lucide-react';
import { BADGE_CATALOG, type BadgeDefinition } from '../gamification-utils';
import { Badge } from '@/components/ui/Badge';

export interface BadgeShelfProps {
  readonly unlockedBadges: readonly string[];
  readonly className?: string;
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  CheckCircle2,
  Flame,
  Zap,
  Calculator,
  Atom,
  Globe,
  BookOpen,
  Shield,
  Crown,
};

export const BadgeShelf: React.FC<BadgeShelfProps> = ({
  unlockedBadges,
  className = '',
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

  const unlockedSet = useMemo(() => new Set(unlockedBadges), [unlockedBadges]);
  const totalCount = BADGE_CATALOG.length;
  const unlockedCount = BADGE_CATALOG.filter((b) => unlockedSet.has(b.id)).length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = useMemo(() => {
    if (filter === 'UNLOCKED') {
      return BADGE_CATALOG.filter((b) => unlockedSet.has(b.id));
    }
    if (filter === 'LOCKED') {
      return BADGE_CATALOG.filter((b) => !unlockedSet.has(b.id));
    }
    return BADGE_CATALOG;
  }, [filter, unlockedSet]);

  return (
    <div
      className={`p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 ${className}`}
      role="region"
      aria-label="Prateleira de conquistas e medalhas"
    >
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Conquistas e Medalhas
              </h3>
              <Badge variant="outline" className="text-xs py-0 px-1.5 font-semibold">
                {unlockedCount}/{totalCount} ({percentage}%)
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desbloqueie medalhas exclusivas conforme pratica no AprovaENEM
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div
          className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs self-start sm:self-auto"
          role="tablist"
          aria-label="Filtro de medalhas"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todas ({totalCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'UNLOCKED'}
            onClick={() => setFilter('UNLOCKED')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'UNLOCKED'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Desbloqueadas ({unlockedCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'LOCKED'}
            onClick={() => setFilter('LOCKED')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'LOCKED'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            A Conquistar ({totalCount - unlockedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBadges.map((badge: BadgeDefinition) => {
          const isUnlocked = unlockedSet.has(badge.id);
          const IconComponent = BADGE_ICONS[badge.iconName] || Trophy;

          return (
            <div
              key={badge.id}
              className={`p-3 rounded-brand border transition-all flex items-start gap-3 ${
                isUnlocked
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  isUnlocked
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {isUnlocked ? (
                  <IconComponent className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Lock className="h-4 w-4" aria-hidden="true" />
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {badge.name}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                      isUnlocked
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isUnlocked ? 'Conquistada' : 'Bloqueada'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
