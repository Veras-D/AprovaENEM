/**
 * Weekly League Leaderboard Domain Logic & Utilities.
 * Handles league tiers (Bronze, Silver, Gold, Diamond), weekly Sunday reset countdowns,
 * and promotion (top 20%) / relegation (bottom 10%) zone evaluations.
 */

export type LeagueTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export type LeaderboardZone = 'PROMOTION' | 'MAINTENANCE' | 'RELEGATION';

export interface LeagueConfig {
  readonly id: LeagueTier;
  readonly name: string;
  readonly shortName: string;
  readonly description: string;
  readonly minRankPromotionPct: number;
  readonly canRelegate: boolean;
  readonly badgeBg: string;
  readonly badgeText: string;
  readonly borderColor: string;
  readonly gradientFrom: string;
}

export const LEAGUE_CONFIGS: Record<LeagueTier, LeagueConfig> = {
  BRONZE: {
    id: 'BRONZE',
    name: 'Liga Bronze',
    shortName: 'Bronze',
    description: 'Primeira divisão do simulado. Ganhe XP para subir à Liga Prata!',
    minRankPromotionPct: 20,
    canRelegate: false,
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-500/40',
    gradientFrom: 'from-amber-600/15',
  },
  SILVER: {
    id: 'SILVER',
    name: 'Liga Prata',
    shortName: 'Prata',
    description: 'Estudantes dedicados com ritmo constante de resolução de questões.',
    minRankPromotionPct: 20,
    canRelegate: true,
    badgeBg: 'bg-slate-200 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-400/40',
    gradientFrom: 'from-slate-400/15',
  },
  GOLD: {
    id: 'GOLD',
    name: 'Liga Ouro',
    shortName: 'Ouro',
    description: 'Focado no SISU! Alta intensidade e busca pelos melhores cursos.',
    minRankPromotionPct: 20,
    canRelegate: true,
    badgeBg: 'bg-yellow-100 dark:bg-yellow-950/60',
    badgeText: 'text-yellow-800 dark:text-yellow-300',
    borderColor: 'border-yellow-500/40',
    gradientFrom: 'from-yellow-500/15',
  },
  DIAMOND: {
    id: 'DIAMOND',
    name: 'Liga Diamante',
    shortName: 'Diamante',
    description: 'Elite dos vestibulandos! Os estudantes mais bem preparados do Brasil.',
    minRankPromotionPct: 0, // Top tier; cannot be promoted further
    canRelegate: true,
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    badgeText: 'text-cyan-800 dark:text-cyan-300',
    borderColor: 'border-cyan-500/40',
    gradientFrom: 'from-cyan-500/15',
  },
};

export const LEAGUE_TIERS_ORDER: readonly LeagueTier[] = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];

/**
 * Computes whether a student at a given rank is in the Promotion, Maintenance, or Relegation zone.
 * - Promotion: Top 20% of the league (for Bronze, Silver, Gold).
 * - Relegation: Bottom 10% of the league (for Silver, Gold, Diamond). Bronze cannot relegate.
 * - Maintenance: Remaining ranks.
 */
export function getZoneStatus(
  rank: number,
  totalParticipants: number,
  league: LeagueTier
): LeaderboardZone {
  const safeTotal = Math.max(1, totalParticipants);
  const safeRank = Math.max(1, rank);

  // Diamond is top league: no promotion available
  if (league === 'DIAMOND') {
    const relegationThreshold = Math.max(2, Math.floor(safeTotal * 0.9));
    if (safeTotal >= 5 && safeRank >= relegationThreshold) {
      return 'RELEGATION';
    }
    return 'MAINTENANCE';
  }

  // Top 20% promotion threshold
  const promotionCutoff = Math.max(1, Math.ceil(safeTotal * 0.2));
  if (safeRank <= promotionCutoff) {
    return 'PROMOTION';
  }

  // Bronze is baseline league: no relegation
  if (league === 'BRONZE') {
    return 'MAINTENANCE';
  }

  // Bottom 10% relegation threshold
  const relegationCutoff = Math.max(promotionCutoff + 1, Math.floor(safeTotal * 0.9));
  if (safeTotal >= 5 && safeRank >= relegationCutoff) {
    return 'RELEGATION';
  }

  return 'MAINTENANCE';
}

export interface TimeRemaining {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly formatted: string;
  readonly isExpired: boolean;
}

/**
 * Calculates time remaining until target ISO timestamp.
 */
export function calculateTimeRemaining(
  targetDateOrIso: string | Date,
  now: Date = new Date()
): TimeRemaining {
  const target = typeof targetDateOrIso === 'string' ? new Date(targetDateOrIso) : targetDateOrIso;
  const diffMs = target.getTime() - now.getTime();

  if (isNaN(diffMs) || diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: '00d 00h 00m',
      isExpired: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = days > 0
    ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
    : `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted,
    isExpired: false,
  };
}

/**
 * Computes the upcoming Sunday 23:59:59.999 BRT (Brasília Time, UTC-3).
 */
export function getNextSundayReset(now: Date = new Date()): Date {
  const result = new Date(now.getTime());
  // Determine day of week (0 = Sunday, 1 = Monday, ...)
  const dayOfWeek = result.getUTCDay();
  // Target next Sunday: if today is Sunday, check if 23:59 has passed
  let daysUntilSunday = (7 - dayOfWeek) % 7;
  if (daysUntilSunday === 0) {
    daysUntilSunday = 7;
  }
  result.setUTCDate(result.getUTCDate() + daysUntilSunday);
  // Set to Sunday 23:59:59.999 UTC
  result.setUTCHours(23, 59, 59, 999);
  return result;
}
