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
  Info,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  type LeagueTier,
  LEAGUE_CONFIGS,
  LEAGUE_TIERS_ORDER,
  isLeagueLocked,
  isLeagueCompleted,
  getZoneStatus,
  calculateTimeRemaining,
  getNextSundayReset,
} from '../leaderboard-utils';
import { useLeaderboardQuery } from '@/api/hooks';
import { MOCK_LEAGUE_LEADERBOARDS } from '@/api/mocks/mock-data';
import type { LeaderboardResponseDto, LeaderboardUserEntryDto } from '@/api/types';

export interface WeeklyLeagueLeaderboardProps {
  readonly initialLeague?: LeagueTier;
  readonly leaderboardData?: LeaderboardResponseDto;
  readonly currentUserId?: string;
  readonly className?: string;
}

const TIER_ICONS: Record<LeagueTier, React.ElementType> = {
  BRONZE: Shield,
  SILVER: Medal,
  GOLD: Crown,
  DIAMOND: Sparkles,
};

export const WeeklyLeagueLeaderboard: React.FC<WeeklyLeagueLeaderboardProps> = ({
  initialLeague = 'GOLD',
  leaderboardData: propData,
  currentUserId = 'usr-123',
  className = '',
}) => {
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

  const [selectedLeague, setSelectedLeague] = useState<LeagueTier>(userLeague);
  const leaderboardQuery = useLeaderboardQuery();

  // Keep selectedLeague in sync when userLeague changes
  useEffect(() => {
    setSelectedLeague(userLeague);
  }, [userLeague]);

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

  const isViewingUserLeague = selectedLeague === userLeague;

  // Determine active league dataset (only used when viewing user's active league)
  const activeDataset: LeaderboardResponseDto = useMemo(() => {
    if (propData && (propData.league === selectedLeague || propData.leagueTier === selectedLeague)) {
      return propData;
    }
    if (
      leaderboardQuery.data &&
      (leaderboardQuery.data.league === selectedLeague ||
        leaderboardQuery.data.leagueTier === selectedLeague)
    ) {
      return leaderboardQuery.data;
    }
    return MOCK_LEAGUE_LEADERBOARDS[selectedLeague] || MOCK_LEAGUE_LEADERBOARDS.GOLD;
  }, [propData, leaderboardQuery.data, selectedLeague]);

  // Normalize entries: compute rank & isCurrentUser
  const entries = useMemo(() => {
    const rawEntries: readonly LeaderboardUserEntryDto[] =
      activeDataset.entries || activeDataset.leaderboard || [];

    return rawEntries.map((e, index) => {
      const rank = e.rank || index + 1;
      const isCurrentUser = Boolean(
        e.isCurrentUser || (currentUserId && e.userId === currentUserId)
      );
      const studentName = e.studentName || e.displayName || 'Estudante Anônimo';
      return {
        ...e,
        rank,
        isCurrentUser,
        studentName,
      };
    });
  }, [activeDataset, currentUserId]);

  const totalParticipants = activeDataset.totalParticipants || entries.length;
  const currentConfig = LEAGUE_CONFIGS[selectedLeague];
  const TierIcon = TIER_ICONS[selectedLeague];

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
              {isViewingUserLeague ? (
                <Badge
                  variant="outline"
                  className={`${currentConfig.badgeBg} ${currentConfig.badgeText} ${currentConfig.borderColor} text-xs py-0 px-2 font-bold uppercase tracking-wider`}
                >
                  Sua Divisão
                </Badge>
              ) : isLeagueLocked(selectedLeague, userLeague) ? (
                <Badge
                  variant="outline"
                  className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-500/40 text-xs py-0 px-2 font-bold uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Divisão Bloqueada
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 text-xs py-0 px-2 font-bold uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  Divisão Concluída
                </Badge>
              )}
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

      {/* League Tier Switcher Tabs */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        role="tablist"
        aria-label="Selecionar liga semanal"
      >
        {LEAGUE_TIERS_ORDER.map((tier) => {
          const config = LEAGUE_CONFIGS[tier];
          const Icon = TIER_ICONS[tier];
          const isSelected = selectedLeague === tier;
          const isThisUserLeague = userLeague === tier;
          const isLocked = isLeagueLocked(tier, userLeague);
          const isCompleted = isLeagueCompleted(tier, userLeague);

          return (
            <button
              key={tier}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedLeague(tier)}
              className={`p-3 rounded-brand border text-left transition-all flex flex-col justify-between gap-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 ring-2 ring-brand-primary/20 shadow-xs font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-full ${config.badgeBg} ${config.badgeText}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                {isThisUserLeague ? (
                  <Badge variant="outline" className="text-[10px] py-0 px-1 bg-brand-primary/10 text-brand-primary border-brand-primary/30 font-semibold">
                    Sua Liga
                  </Badge>
                ) : isCompleted ? (
                  <Badge variant="outline" className="text-[10px] py-0 px-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold inline-flex items-center gap-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                    Concluída
                  </Badge>
                ) : isLocked ? (
                  <Badge variant="outline" className="text-[10px] py-0 px-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 font-semibold inline-flex items-center gap-0.5">
                    <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                    Bloqueada
                  </Badge>
                ) : null}
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                  {config.shortName}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isThisUserLeague
                    ? 'Sua divisão ativa'
                    : isCompleted
                    ? 'Divisão superada'
                    : isLocked
                    ? 'Requer promoção'
                    : tier === 'DIAMOND'
                    ? 'Top Liga'
                    : 'Top 20% sobem'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!isViewingUserLeague ? (
        /* Locked / Restricted View for non-active leagues (avoids leaking participants) */
        <div
          className="p-8 sm:p-12 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center shadow-xs flex flex-col items-center justify-center space-y-4"
          role="status"
          aria-live="polite"
        >
          {isLeagueLocked(selectedLeague, userLeague) ? (
            <>
              <div className="h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                <Lock className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                  Classificação Bloqueada
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Os participantes da <strong>{currentConfig.name}</strong> são exclusivos desta divisão. Para desbloquear o acesso e disputar nesta liga, termine a semana na{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400">Zona de Promoção (Top 20%)</strong> da sua liga atual.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                  Divisão Concluída
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Você já superou esta divisão e atualmente compete na{' '}
                  <strong className="text-brand-primary">{LEAGUE_CONFIGS[userLeague].name}</strong>. A classificação das divisões anteriores é exclusiva para os estudantes em disputa ativa nelas.
                </p>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => setSelectedLeague(userLeague)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-brand bg-brand-primary text-brand-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Voltar para Minha Liga ({LEAGUE_CONFIGS[userLeague].shortName})
          </button>
        </div>
      ) : (
        <>
          {/* Promotion / Relegation Zone Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-brand bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {selectedLeague !== 'DIAMOND' && (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                  Zona de Promoção (Top 20%)
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                Zona de Permanência
              </span>
              {selectedLeague !== 'BRONZE' && (
                <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium">
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                  Zona de Rebaixamento (Últimos 10%)
                </span>
              )}
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
              <Info className="h-3 w-3" aria-hidden="true" />
              {totalParticipants} participantes nesta liga
            </span>
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
                  {entries.map((entry) => {
                    const zone = getZoneStatus(entry.rank, totalParticipants, selectedLeague);
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
                            ? 'hover:bg-rose-50/40 dark:hover:bg-rose-950/20'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Rank Position */}
                        <td className="py-3 px-3 sm:px-4 text-center font-mono">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-xs" title="1º Lugar">
                              🥇
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs shadow-xs" title="2º Lugar">
                              🥈
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-amber-600 text-white font-black text-xs shadow-xs" title="3º Lugar">
                              🥉
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              {entry.rank}º
                            </span>
                          )}
                        </td>

                        {/* Student Identity */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                                entry.isCurrentUser
                                  ? 'bg-brand-primary text-brand-primary-foreground shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {entry.studentName.charAt(0)}
                            </div>
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
                              <span className="hidden sm:inline">Promoção</span>
                              <span className="sm:hidden">▲</span>
                            </Badge>
                          ) : zone === 'RELEGATION' ? (
                            <Badge
                              variant="outline"
                              className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-500/30 text-xs py-0.5 px-2 inline-flex items-center gap-1"
                            >
                              <TrendingDown className="h-3 w-3 text-rose-600" aria-hidden="true" />
                              <span className="hidden sm:inline">Rebaixamento</span>
                              <span className="sm:hidden">▼</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 text-xs py-0.5 px-2 inline-flex items-center gap-1"
                            >
                              <Minus className="h-3 w-3" aria-hidden="true" />
                              <span className="hidden sm:inline">Permanência</span>
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
                {getZoneStatus(currentUserEntry.rank, totalParticipants, selectedLeague) === 'PROMOTION'
                  ? '🎉 Você está na Zona de Promoção!'
                  : getZoneStatus(currentUserEntry.rank, totalParticipants, selectedLeague) === 'RELEGATION'
                  ? '⚠️ Pratique mais questões para sair da Zona de Rebaixamento!'
                  : '💪 Continue firme para alcançar a Zona de Promoção!'}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
