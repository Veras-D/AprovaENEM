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
  Gem,
  Activity,
} from 'lucide-react';
import {
  BADGE_CATALOG,
  BADGE_CATEGORIES,
  type BadgeCategory,
  computeVisibleBadges,
  type VisibleBadgeItem,
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
  Activity,
};

interface TierTheme {
  readonly cardUnlocked: string;
  readonly cardLocked: string;
  readonly iconUnlocked: string;
  readonly pill: string;
  readonly icon: React.ElementType;
  readonly iconColor: string;
  readonly progressBar: string;
}

const TIER_THEMES: Record<string, TierTheme> = {
  BRONZE: {
    cardUnlocked:
      'bg-amber-50/70 dark:bg-amber-950/25 border-amber-600/50 dark:border-amber-700/60 shadow-xs',
    cardLocked:
      'bg-slate-50/60 dark:bg-slate-800/30 border-amber-600/20 dark:border-amber-800/30',
    iconUnlocked:
      'bg-amber-700 text-amber-50 shadow-xs ring-2 ring-amber-600/40',
    pill:
      'bg-amber-100 text-amber-950 dark:bg-amber-950/70 dark:text-amber-200 border-amber-300 dark:border-amber-700/80',
    icon: Medal,
    iconColor: 'text-amber-700 dark:text-amber-400',
    progressBar: 'bg-amber-600 dark:bg-amber-500',
  },
  SILVER: {
    cardUnlocked:
      'bg-slate-100/80 dark:bg-slate-800/50 border-slate-400 dark:border-slate-500 shadow-xs',
    cardLocked:
      'bg-slate-50/60 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700',
    iconUnlocked:
      'bg-slate-500 dark:bg-slate-400 text-white shadow-xs ring-2 ring-slate-300 dark:ring-slate-500',
    pill:
      'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
    icon: Medal,
    iconColor: 'text-slate-600 dark:text-slate-300',
    progressBar: 'bg-slate-500 dark:bg-slate-400',
  },
  GOLD: {
    cardUnlocked:
      'bg-yellow-50/70 dark:bg-yellow-950/25 border-yellow-400 dark:border-yellow-500 shadow-xs',
    cardLocked:
      'bg-slate-50/60 dark:bg-slate-800/30 border-yellow-300/40 dark:border-yellow-800/40',
    iconUnlocked:
      'bg-amber-400 text-amber-950 font-bold shadow-xs ring-2 ring-yellow-400/50',
    pill:
      'bg-yellow-100 text-yellow-950 dark:bg-yellow-950/70 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700/80',
    icon: Crown,
    iconColor: 'text-amber-600 dark:text-yellow-400',
    progressBar: 'bg-amber-500 dark:bg-amber-400',
  },
  DIAMOND: {
    cardUnlocked:
      'bg-cyan-50/70 dark:bg-cyan-950/25 border-cyan-400 dark:border-cyan-500 shadow-xs',
    cardLocked:
      'bg-slate-50/60 dark:bg-slate-800/30 border-cyan-300/40 dark:border-cyan-800/40',
    iconUnlocked:
      'bg-cyan-600 dark:bg-cyan-500 text-white shadow-xs ring-2 ring-cyan-300 dark:ring-cyan-600',
    pill:
      'bg-cyan-100 text-cyan-950 dark:bg-cyan-950/70 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700/80',
    icon: Gem,
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    progressBar: 'bg-cyan-500 dark:bg-cyan-400',
  },
};

const TIER_PILL_STYLES: Record<string, string> = {
  BRONZE:
    'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700/80',
  SILVER:
    'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  GOLD:
    'bg-yellow-100 text-yellow-900 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700/80',
  DIAMOND:
    'bg-cyan-100 text-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700/80',
};

export const BadgeShelf: React.FC<BadgeShelfProps> = ({
  unlockedBadges,
  className = '',
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory>('ALL');

  const visibleBadges = useMemo(
    () => computeVisibleBadges(BADGE_CATALOG, unlockedBadges),
    [unlockedBadges]
  );

  const totalCount = visibleBadges.length;
  const unlockedCount = visibleBadges.filter((b) => b.isUnlocked).length;
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredBadges = useMemo(() => {
    return visibleBadges.filter((item) => {
      // Status filter
      if (statusFilter === 'UNLOCKED' && !item.isUnlocked) {
        return false;
      }
      if (statusFilter === 'LOCKED' && item.isUnlocked) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [visibleBadges, statusFilter, categoryFilter]);

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
              ? visibleBadges.length
              : visibleBadges.filter((b) => b.category === cat.id).length;

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
          {filteredBadges.map((item: VisibleBadgeItem) => {
            const IconComponent = BADGE_ICONS[item.iconName] || Trophy;
            const tierTheme = item.tierConfig ? TIER_THEMES[item.tierConfig.tier] : undefined;
            const TierVectorIcon = tierTheme?.icon;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-brand border transition-all flex flex-col justify-between gap-2.5 ${
                  item.isUnlocked
                    ? tierTheme?.cardUnlocked ??
                      'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs'
                    : tierTheme?.cardLocked ??
                      'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Badge Icon with corner rank emblem */}
                  <div className="relative shrink-0">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                        item.isUnlocked
                          ? tierTheme?.iconUnlocked ?? 'bg-amber-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.isUnlocked ? (
                        <IconComponent className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Lock className="h-4 w-4" aria-hidden="true" />
                      )}
                    </div>
                    {TierVectorIcon && (
                      <span
                        className={`absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-xs border ${
                          item.isUnlocked
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-70'
                        }`}
                        aria-hidden="true"
                      >
                        <TierVectorIcon className={`h-2.5 w-2.5 ${tierTheme.iconColor}`} />
                      </span>
                    )}
                  </div>

                  {/* Badge Metadata */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </span>
                        {item.tierConfig && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 inline-flex items-center gap-1 ${
                              tierTheme?.pill ?? TIER_PILL_STYLES[item.tierConfig.tier] ?? ''
                            }`}
                          >
                            {TierVectorIcon && (
                              <TierVectorIcon
                                className={`h-2.5 w-2.5 ${tierTheme?.iconColor}`}
                                aria-hidden="true"
                              />
                            )}
                            <span>{item.tierConfig.label}</span>
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full shrink-0 font-medium ${
                          item.isUnlocked
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 font-bold'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.isUnlocked ? 'Conquistada ✓' : 'A Conquistar'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        {item.categoryLabel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Single Clean Progress Bar */}
                {item.progress && (
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Progresso:
                      </span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.progress.current}/{item.progress.target} {item.progress.unit} ({item.progress.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.isUnlocked
                            ? 'bg-emerald-500'
                            : (tierTheme?.progressBar ?? 'bg-amber-500')
                        }`}
                        style={{ width: `${item.progress.percentage}%` }}
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

