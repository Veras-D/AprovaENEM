import { apiClient } from '../client';
import type { GamificationProfileDto, LeaderboardResponseDto } from '../types';

type LeagueTier = GamificationProfileDto['weeklyLeague'];

/**
 * Raw payload returned by auth-service `GamificationProfileResponse`.
 * Every field is optional so partially populated profiles (e.g. a freshly
 * created account) never leak `undefined`/`NaN` into the UI.
 */
interface RawGamificationProfile {
  readonly userId?: string;
  readonly level?: number;
  readonly levelTitle?: string;
  readonly currentXp?: number;
  readonly streakDays?: number;
  readonly currentStreakDays?: number;
  readonly longestStreakDays?: number;
  readonly streakFreezeAvailable?: number | boolean;
  readonly dailyGoal?: {
    readonly targetQuestions?: number;
    readonly completedQuestions?: number;
  };
  readonly dailyGoalTarget?: number;
  readonly dailyGoalProgress?: number;
  readonly currentLeague?: string;
  readonly weeklyLeague?: string;
  readonly unlockedBadges?: readonly string[];
}

const DEFAULT_DAILY_GOAL_TARGET = 10;

function toNonNegativeInt(value: number | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : fallback;
}

function normalizeLeague(league?: string): LeagueTier {
  const upper = (league ?? '').toUpperCase();
  if (upper === 'SILVER' || upper === 'GOLD' || upper === 'DIAMOND') {
    return upper;
  }
  return 'BRONZE';
}

function normalizeGamificationProfile(raw: RawGamificationProfile): GamificationProfileDto {
  const currentStreakDays = toNonNegativeInt(raw.currentStreakDays ?? raw.streakDays);
  const dailyGoalTarget = toNonNegativeInt(
    raw.dailyGoalTarget ?? raw.dailyGoal?.targetQuestions,
    DEFAULT_DAILY_GOAL_TARGET
  ) || DEFAULT_DAILY_GOAL_TARGET;

  return {
    userId: raw.userId ?? '',
    currentXp: toNonNegativeInt(raw.currentXp),
    level: Math.max(1, toNonNegativeInt(raw.level, 1)),
    levelTitle: raw.levelTitle ?? 'Calouro Iniciante',
    currentStreakDays,
    longestStreakDays: Math.max(currentStreakDays, toNonNegativeInt(raw.longestStreakDays)),
    streakFreezeAvailable:
      typeof raw.streakFreezeAvailable === 'boolean'
        ? raw.streakFreezeAvailable
        : toNonNegativeInt(raw.streakFreezeAvailable) > 0,
    dailyGoalTarget,
    dailyGoalProgress: toNonNegativeInt(raw.dailyGoalProgress ?? raw.dailyGoal?.completedQuestions),
    weeklyLeague: normalizeLeague(raw.weeklyLeague ?? raw.currentLeague),
    unlockedBadges: raw.unlockedBadges ?? [],
  };
}

export const gamificationService = {
  /**
   * Retrieve student gamification profile (XP, level, streak, badges)
   * Target endpoint: GET /api/v1/gamification/profile
   */
  async getGamificationProfile(): Promise<GamificationProfileDto> {
    const response = await apiClient.get<RawGamificationProfile>('/gamification/profile');
    return normalizeGamificationProfile(response.data);
  },

  /**
   * Retrieve active weekly leaderboard and rankings (Redis ZSET)
   * Target endpoint: GET /api/v1/gamification/leaderboard/weekly
   */
  async getWeeklyLeaderboard(): Promise<LeaderboardResponseDto> {
    const response = await apiClient.get<LeaderboardResponseDto>('/gamification/leaderboard/weekly');
    return response.data;
  },

  /**
   * Update student daily study goal target
   * Target endpoint: PUT /api/v1/gamification/daily-goal
   */
  async updateDailyGoal(target: number): Promise<void> {
    await apiClient.put('/gamification/daily-goal', { target });
  },
};
