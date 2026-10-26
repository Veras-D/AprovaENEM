import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Crown,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Shield,
  Sparkles,
  Medal,
  Lock,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  type LeagueTier,
  LEAGUE_CONFIGS,
  LEAGUE_TIERS_ORDER,
  isLeagueCompleted,
  getZoneStatus,
  calculateTimeRemaining,
  getNextSundayReset,
} from '../leaderboard-utils';
import { useLeaderboardQuery } from '@/api/hooks';
import type { LeaderboardResponseDto, LeaderboardUserEntryDto } from '@/api/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { AvatarRenderer } from '@/components/avatar/AvatarRenderer';
import type { AvatarConfig } from '@/types';

export interface WeeklyLeagueLeaderboardProps {
  readonly initialLeague?: LeagueTier;
  readonly leaderboardData?: LeaderboardResponseDto;
  readonly currentUserId?: string;
  readonly currentUserAvatarConfig?: AvatarConfig;
  readonly className?: string;
}

const TIER_ICONS: Record<LeagueTier, React.ElementType> = {
  BRONZE: Shield,
  SILVER: Medal,
  GOLD: Crown,
  DIAMOND: Sparkles,
};

const ACTIVE_TIER_STYLES: Record<
  LeagueTier,
  {
    cardBg: string;
    cardBorder: string;
    iconRing: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    pulseColor: string;
    titleColor: string;
  }
> = {
  BRONZE: {
    cardBg: 'bg-amber-50/80 dark:bg-amber-950/30',
    cardBorder: 'border-amber-600/40 dark:border-amber-600/50',
    iconRing: 'ring-2 ring-amber-600/40',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-600/30 dark:border-amber-700/40',
    pulseColor: 'bg-amber-600',
    titleColor: 'text-amber-900 dark:text-amber-200',
  },
  SILVER: {
    cardBg: 'bg-slate-100/80 dark:bg-slate-800/40',
    cardBorder: 'border-slate-400 dark:border-slate-500',
    iconRing: 'ring-2 ring-slate-400/40',
    badgeBg: 'bg-slate-200 dark:bg-slate-700',
    badgeText: 'text-slate-800 dark:text-slate-200',
    badgeBorder: 'border-slate-300 dark:border-slate-600',
    pulseColor: 'bg-slate-400',
    titleColor: 'text-slate-900 dark:text-slate-100',
  },
  GOLD: {
    cardBg: 'bg-amber-50/80 dark:bg-amber-950/30',
    cardBorder: 'border-amber-400/60 dark:border-amber-500/60',
    iconRing: 'ring-2 ring-amber-400/50',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
    badgeText: 'text-amber-800 dark:text-amber-200',
    badgeBorder: 'border-amber-300 dark:border-amber-700/50',
    pulseColor: 'bg-amber-500',
    titleColor: 'text-amber-950 dark:text-amber-100',
  },
  DIAMOND: {
    cardBg: 'bg-cyan-50/80 dark:bg-cyan-950/30',
    cardBorder: 'border-cyan-400/60 dark:border-cyan-500/60',
    iconRing: 'ring-2 ring-cyan-400/50',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-900/50',
    badgeText: 'text-cyan-800 dark:text-cyan-300',
    badgeBorder: 'border-cyan-300 dark:border-cyan-700/50',
    pulseColor: 'bg-cyan-500',
    titleColor: 'text-cyan-950 dark:text-cyan-100',
  },
};

function parseAvatarConfig(config: AvatarConfig | string | undefined): AvatarConfig | undefined {
  if (!config) return undefined;
  if (typeof config === 'object') return config;
  try {
    return JSON.parse(config) as AvatarConfig;
  } catch {
    return undefined;
  }
}

export const WeeklyLeagueLeaderboard: React.FC<WeeklyLeagueLeaderboardProps> = ({
  initialLeague = 'GOLD',
  leaderboardData: propData,
  currentUserId: propCurrentUserId,
  currentUserAvatarConfig,
  className = '',
}) => {
  const authUser = useAuthStore((s) => s.user);
  const currentUserId = propCurrentUserId ?? authUser?.id ?? 'usr-123';
  const effectiveUserAvatar = currentUserAvatarConfig ?? authUser?.avatarConfig;

  // Determine user's active league
  const userLeague: LeagueTier = useMemo(() => {
    if (propData?.league && LEAGUE_CONFIGS[propData.league]) {
      return propData.league;
    }
    if (propData?.leagueTier && LEAGUE_CONFIGS[propData.leagueTier]) {
      return propData.leagueTier;
    }
    return initialLeague;
  }, [propData, initialLeague]);

  const leaderboardQuery = useLeaderboardQuery();

  // Reset target: default to next Sunday 23:59:59 BRT
  const defaultResetDate = useMemo(() => getNextSundayReset(), []);

  // Compute countdown timer
  const [timeRemaining, setTimeRemaining] = useState(() =>
    calculateTimeRemaining(propData?.resetsAt || defaultResetDate.toISOString())
  );

  useEffect(() => {
    const target = propData?.resetsAt || defaultResetDate.toISOString();
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [propData?.resetsAt, defaultResetDate]);

  // Determine active league dataset for user's division
  const activeDataset: LeaderboardResponseDto = useMemo(() => {
    if (propData && (propData.league === userLeague || propData.leagueTier === userLeague)) {
      return propData;
    }
    if (
      leaderboardQuery.data &&
      (leaderboardQuery.data.league === userLeague ||
        leaderboardQuery.data.leagueTier === userLeague)
    ) {
      return leaderboardQuery.data;
    }
    // Never fall back to sample students: while loading (or on error) show an honest empty board.
    return { resetsAt: defaultResetDate.toISOString(), entries: [] };
  }, [propData, leaderboardQuery.data, userLeague, defaultResetDate]);

  // Normalize entries: compute rank & isCurrentUser
  const entries = useMemo(() => {
    const rawEntries: readonly LeaderboardUserEntryDto[] =
      activeDataset.entries || activeDataset.leaderboard || [];

    const normalized = rawEntries.map((e, index) => {
      const rank = e.rank || index + 1;
      const isCurrentUser = Boolean(
        e.isCurrentUser ||
        (currentUserId && e.userId === currentUserId) ||
        (authUser?.id && e.userId === authUser.id)
      );
      const studentName = isCurrentUser
        ? (authUser?.name || e.studentName || e.displayName || 'Você')
        : (e.studentName || e.displayName || 'Estudante Anônimo');
      return {
        ...e,
        rank,
        isCurrentUser,
        studentName,
      };
    });

    // Pin the signed-in student's own position when they rank outside the visible page.
    const ownRank = activeDataset.currentUserRank;
    if (ownRank && !normalized.some((e) => e.isCurrentUser)) {
      normalized.push({
        ...ownRank,
        isCurrentUser: true,
        studentName: authUser?.name || ownRank.studentName || ownRank.displayName || 'Você',
      });
    }
    return normalized;
  }, [activeDataset, currentUserId, authUser]);

  const totalParticipants = activeDataset.totalParticipants || entries.length;
  const currentConfig = LEAGUE_CONFIGS[userLeague];
  const TierIcon = TIER_ICONS[userLeague];

  // Current user entry in this league (if present)
  const currentUserEntry = useMemo(
    () => entries.find((e) => e.isCurrentUser),
    [entries]
  );

  return (
    <div
      className={`space-y-4 sm:space-y-6 ${className}`}
      role="region"
      aria-label="Ranking Semanal por Ligas do ENEM"
    >
      {/* Top Banner & Sunday Countdown Widget */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`h-12 w-12 rounded-full ${currentConfig.badgeBg} ${currentConfig.badgeText} flex items-center justify-center shrink-0 border ${currentConfig.borderColor} shadow-xs`}
          >
            <TierIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                {currentConfig.name}
              </h2>
              <Badge
                variant="outline"
                className={`${currentConfig.badgeBg} ${currentConfig.badgeText} ${currentConfig.borderColor} text-xs py-0 px-2 font-bold uppercase tracking-wider`}
              >
                Sua Divisão
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {currentConfig.description}
            </p>
          </div>
        </div>

        {/* Countdown Timer Widget */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shrink-0 self-start md:self-auto">
          <Clock className="h-4 w-4 text-brand-primary shrink-0 animate-pulse" aria-hidden="true" />
          <div>
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Reinício do Ranking
            </span>
            <div className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {timeRemaining.formatted}
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist League Progression Track (Non-clickable, mystery next league) */}
      <div
        className="p-3 sm:p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
        aria-label="Jornada das Ligas"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
            Jornada das Ligas
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {userLeague === 'DIAMOND'
              ? 'Divisão Máxima alcançada! Defenda seu lugar entre os melhores.'
              : 'Termine a semana no Top 20% para revelar e desbloquear a próxima liga'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LEAGUE_TIERS_ORDER.map((tier) => {
            const config = LEAGUE_CONFIGS[tier];
            const isCompleted = isLeagueCompleted(tier, userLeague);
            const isCurrent = tier === userLeague;
            const StepIcon = TIER_ICONS[tier];

            if (isCompleted) {
              return (
                <div
                  key={tier}
                  className="p-2.5 rounded-brand border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 flex items-center gap-2.5"
                >
                  <div className="relative shrink-0">
                    <div className={`h-7 w-7 rounded-full ${config.badgeBg} ${config.badgeText} flex items-center justify-center`}>
                      <StepIcon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black shadow-xs ring-1 ring-white dark:ring-slate-900"
                      title="Divisão Concluída"
                    >
                      ✓
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {config.shortName}
                    </span>
                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Concluída ✓
                    </span>
                  </div>
                </div>
              );
            }

            if (isCurrent) {
              const activeStyle = ACTIVE_TIER_STYLES[tier];
              return (
                <div
                  key={tier}
                  className={`p-2.5 rounded-brand border ${activeStyle.cardBorder} ${activeStyle.cardBg} flex items-center gap-2.5 shadow-xs`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`h-7 w-7 rounded-full ${config.badgeBg} ${config.badgeText} ${activeStyle.iconRing} flex items-center justify-center`}
                    >
                      <StepIcon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span
                      className="absolute -top-0.5 -right-0.5 flex h-2 w-2"
                      title="Sua divisão ativa"
                    >
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeStyle.pulseColor} opacity-75`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${activeStyle.pulseColor}`} />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className={`block text-xs font-black ${activeStyle.titleColor} truncate`}>
                      {config.shortName}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeStyle.badgeBg} ${activeStyle.badgeText} border ${activeStyle.badgeBorder} leading-none mt-0.5`}
                    >
                      Sua Liga
                    </span>
                  </div>
                </div>
              );
            }

            // Locked / Future Tier — Name and details hidden to stimulate user curiosity
            return (
              <div
                key={tier}
                className="p-2.5 rounded-brand border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40 flex items-center gap-2.5 opacity-75"
              >
                <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    ???
                  </span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Bloqueada
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>


          {/* Leaderboard Table */}
          <div className="rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" aria-label={`Tabela de classificação da ${currentConfig.name}`}>
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-3 sm:px-4 w-14 text-center">
                      Pos.
                    </th>
                    <th scope="col" className="py-3 px-3 sm:px-4">
                      Estudante
                    </th>
                    <th scope="col" className="py-3 px-2 sm:px-4 text-center hidden sm:table-cell">
                      Ofensiva
                    </th>
                    <th scope="col" className="py-3 px-3 sm:px-4 text-right">
                      XP Semanal
                    </th>
                    <th scope="col" className="py-3 px-3 sm:px-4 text-right">
                      Situação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {entries.length === 0 && (
                    <tr data-testid="leaderboard-empty-state">
                      <td colSpan={5} className="py-10 px-4 text-center">
                        <div className="mx-auto max-w-md space-y-1.5">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            Ninguém pontuou na {currentConfig.name} ainda esta semana
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Resolva questões para ganhar XP e aparecer aqui. Quem pontuar primeiro
                            lidera o ranking até o reinício de domingo.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {entries.map((entry) => {
                    const zone = getZoneStatus(entry.rank, totalParticipants, userLeague);
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;

                    return (
                      <tr
                        key={entry.userId || `${entry.rank}-${entry.studentName}`}
                        className={`transition-colors ${
                          entry.isCurrentUser
                            ? 'bg-brand-primary/10 dark:bg-brand-primary/15 font-bold border-l-4 border-l-brand-primary'
                            : zone === 'PROMOTION'
                            ? 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20'
                            : zone === 'RELEGATION'
                            ? 'hover:bg-amber-50/40 dark:hover:bg-amber-950/20'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Rank Position */}
                        <td className="py-3 px-3 sm:px-4 text-center font-mono">
                          {isTop1 ? (
                            <span
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 shadow-xs"
                              title="1º Lugar — Campeão da Semana"
                            >
                              <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0" aria-hidden="true" />
                              <span className="text-xs font-black">1º</span>
                            </span>
                          ) : isTop2 ? (
                            <span
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 shadow-xs"
                              title="2º Lugar — Prata"
                            >
                              <Medal className="h-3.5 w-3.5 text-slate-400 fill-slate-300 dark:fill-slate-500 shrink-0" aria-hidden="true" />
                              <span className="text-xs font-black">2º</span>
                            </span>
                          ) : isTop3 ? (
                            <span
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-600/30 dark:border-amber-700/40 text-amber-900 dark:text-amber-400 shadow-xs"
                              title="3º Lugar — Bronze"
                            >
                              <Medal className="h-3.5 w-3.5 text-amber-700 fill-amber-600/80 dark:fill-amber-600/60 shrink-0" aria-hidden="true" />
                              <span className="text-xs font-black">3º</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 text-xs font-bold text-slate-400 dark:text-slate-500">
                              {entry.rank}º
                            </span>
                          )}
                        </td>

                        {/* Student Identity */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-2.5">
                            {entry.isCurrentUser && effectiveUserAvatar ? (
                              <AvatarRenderer
                                config={effectiveUserAvatar}
                                size={32}
                                className="h-8 w-8 rounded-full shrink-0 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700"
                                ariaLabel={`Avatar de ${entry.studentName}`}
                              />
                            ) : parseAvatarConfig(entry.avatarConfig) ? (
                              <AvatarRenderer
                                config={parseAvatarConfig(entry.avatarConfig)!}
                                size={32}
                                className="h-8 w-8 rounded-full shrink-0 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700"
                                ariaLabel={`Avatar de ${entry.studentName}`}
                              />
                            ) : (
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                                  entry.isCurrentUser
                                    ? 'bg-brand-primary text-brand-primary-foreground shadow-xs'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                {entry.studentName.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="block truncate font-medium text-slate-900 dark:text-slate-100">
                                {entry.studentName}
                                {entry.isCurrentUser && (
                                  <span className="ml-1.5 text-xs text-brand-primary font-bold">
                                    (Você)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Streak (Ofensiva) */}
                        <td className="py-3 px-2 sm:px-4 text-center hidden sm:table-cell">
                          {entry.streakDays && entry.streakDays > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500 animate-pulse" aria-hidden="true" />
                              {entry.streakDays}d
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                          )}
                        </td>

                        {/* Weekly XP */}
                        <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          <span className="text-amber-600 dark:text-amber-400">+{entry.weeklyXp}</span>
                          <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">XP</span>
                        </td>

                        {/* League Zone Status */}
                        <td className="py-3 px-3 sm:px-4 text-right">
                          {zone === 'PROMOTION' ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs py-0.5 px-2 inline-flex items-center gap-1"
                            >
                              <TrendingUp className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                              <span className="hidden sm:inline">Classificado</span>
                              <span className="sm:hidden">▲</span>
                            </Badge>
                          ) : zone === 'RELEGATION' ? (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs py-0.5 px-2 inline-flex items-center gap-1"
                            >
                              <TrendingDown className="h-3 w-3 text-amber-600" aria-hidden="true" />
                              <span className="hidden sm:inline">Reforço</span>
                              <span className="sm:hidden">▼</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 text-xs py-0.5 px-2 inline-flex items-center gap-1"
                            >
                              <Minus className="h-3 w-3" aria-hidden="true" />
                              <span className="hidden sm:inline">Na Disputa</span>
                              <span className="sm:hidden">•</span>
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Position Summary Footer (if in current league) */}
          {currentUserEntry && (
            <div className="p-3.5 sm:p-4 rounded-brand border border-brand-primary/30 bg-brand-primary/5 dark:bg-brand-primary/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
                <span className="text-slate-800 dark:text-slate-200">
                  Sua posição nesta semana: <strong>{currentUserEntry.rank}º Lugar</strong> com <strong>{currentUserEntry.weeklyXp} XP</strong>.
                </span>
              </div>
              <span className="text-brand-primary font-bold">
                {getZoneStatus(currentUserEntry.rank, totalParticipants, userLeague) === 'PROMOTION'
                  ? '🎉 Você está na Zona de Classificação!'
                  : getZoneStatus(currentUserEntry.rank, totalParticipants, userLeague) === 'RELEGATION'
                  ? '💡 Pratique mais questões no Reforço para virar o jogo!'
                  : '💪 Você está na disputa! Continue firme para alcançar a classificação!'}
              </span>
            </div>
          )}
    </div>
  );
};
