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
  Target,
  Clock,
  Sparkles,
  Brain,
  Medal,
  Calendar,
  Award,
  CheckCheck,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import {
  BADGE_CATALOG,
  BADGE_CATEGORIES,
  type BadgeDefinition,
  type BadgeCategory,
} from '../gamification-utils';
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
  Trophy,
  Target,
  Clock,
  Sparkles,
  Brain,
  Medal,
  Calendar,
  Award,
  CheckCheck,
  GraduationCap,
  TrendingUp,
};

const TIER_PILLS: Record<string, { label: string; className: string }> = {
  BRONZE: {
    label: 'Bronze',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
  },
  SILVER: {
    label: 'Prata',
    className: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  },
  GOLD: {
    label: 'Ouro',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  },
  DIAMOND: {
    label: 'Diamante',
    className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700',
  },
};

export const BadgeShelf: React.FC<BadgeShelfProps> = ({
  unlockedBadges,
  className = '',
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory>('ALL');

  const unlockedSet = useMemo(() => new Set(unlockedBadges), [unlockedBadges]);
  const totalCount = BADGE_CATALOG.length;
  const unlockedCount = BADGE_CATALOG.filter((b) => unlockedSet.has(b.id)).length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = useMemo(() => {
    return BADGE_CATALOG.filter((badge) => {
      // Status filter
      if (statusFilter === 'UNLOCKED' && !unlockedSet.has(badge.id)) {
        return false;
      }
      if (statusFilter === 'LOCKED' && unlockedSet.has(badge.id)) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'ALL' && badge.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [statusFilter, categoryFilter, unlockedSet]);

  return (
    <div
      className={`p-4 sm:p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 ${className}`}
      role="region"
      aria-label="Prateleira de conquistas e medalhas"
    >
      {/* Header & Status Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Conquistas e Medalhas
              </h3>
              <Badge variant="outline" className="text-xs py-0 px-1.5 font-semibold">
                {unlockedCount}/{totalCount} ({percentage}%)
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Metas progressivas e desafios para impulsionar seu ritmo de estudos
            </p>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div
          className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs self-start sm:self-auto"
          role="tablist"
          aria-label="Filtro de medalhas"
        >
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'ALL'}
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todas ({totalCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'UNLOCKED'}
            onClick={() => setStatusFilter('UNLOCKED')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'UNLOCKED'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Desbloqueadas ({unlockedCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'LOCKED'}
            onClick={() => setStatusFilter('LOCKED')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'LOCKED'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            A Conquistar ({totalCount - unlockedCount})
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs"
        role="group"
        aria-label="Filtrar conquistas por categoria"
      >
        {BADGE_CATEGORIES.map((cat) => {
          const isActive = categoryFilter === cat.id;
          const count =
            cat.id === 'ALL'
              ? totalCount
              : BADGE_CATALOG.filter((b) => b.category === cat.id).length;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                isActive
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-2xs font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      {filteredBadges.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-brand">
          Nenhuma conquista encontrada com os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBadges.map((badge: BadgeDefinition) => {
            const isUnlocked = unlockedSet.has(badge.id);
            const IconComponent = BADGE_ICONS[badge.iconName] || Trophy;

            // Calculate progress percentage if available
            const rawProgress = badge.progress;
            // Consistency rule:
            // 1. If unlocked: progress is 100% (target / target) and renders in emerald
            // 2. If locked: progress cannot reach 100%. If current >= target, clamp to at most target - 1 (or 0 if target is 1)
            const progress = rawProgress
              ? {
                  ...rawProgress,
                  current: isUnlocked
                    ? rawProgress.target
                    : Math.min(rawProgress.current, Math.max(0, rawProgress.target - 1)),
                }
              : undefined;

            const progressPct = progress
              ? isUnlocked
                ? 100
                : Math.min(99, Math.round((progress.current / progress.target) * 100))
              : isUnlocked
              ? 100
              : 0;

            const tierInfo = progress?.currentTier ? TIER_PILLS[progress.currentTier] : null;

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-brand border transition-all flex flex-col justify-between gap-2.5 ${
                  isUnlocked
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Badge Icon */}
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                      isUnlocked
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isUnlocked ? (
                      <IconComponent className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Lock className="h-4 w-4" aria-hidden="true" />
                    )}
                  </div>

                  {/* Badge Metadata */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {badge.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${
                          isUnlocked
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isUnlocked ? 'Conquistada ✓' : 'A Conquistar'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        {badge.categoryLabel}
                      </span>
                      {tierInfo && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0 rounded-full border ${tierInfo.className}`}
                        >
                          {tierInfo.label}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Target Indicator */}
                {progress && (
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Progresso:
                      </span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {isUnlocked ? progress.target : progress.current}/{progress.target}{' '}
                        {progress.unit} ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
