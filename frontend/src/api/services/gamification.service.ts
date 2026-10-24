import { apiClient } from '../client';
import type { GamificationProfileDto, LeaderboardResponseDto, RecordActivityRequest } from '../types';

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

let activityQueue: Promise<void> = Promise.resolve();

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

  const dailyGoalProgress = toNonNegativeInt(
    raw.dailyGoalProgress ?? raw.dailyGoal?.completedQuestions
  );
  // The backend only returns a badge count, so derive the badges that real activity proves:
  const unlockedBadges = new Set(raw.unlockedBadges ?? []);
  if (currentStreakDays > 0 || dailyGoalProgress > 0) {
    unlockedBadges.add('PRIMEIRA_QUESTAO');
  }
  if (
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('aprovaenem_diagnostic_completed') === 'true'
  ) {
    unlockedBadges.add('DIAGNOSTICO_COMPLETO');
  }
  if (dailyGoalProgress >= 10) {
    unlockedBadges.add('MARATONISTA_QUESTOES');
    unlockedBadges.add('MARATONISTA_QUESTOES_BRONZE');
  }

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
    dailyGoalProgress,
    weeklyLeague: normalizeLeague(raw.weeklyLeague ?? raw.currentLeague),
    unlockedBadges: [...unlockedBadges],
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

  /**
   * Report study activity so XP, streak, daily goal and the weekly league are updated
   * Target endpoint: POST /api/v1/gamification/activity
   */
  async recordActivity(req: RecordActivityRequest): Promise<GamificationProfileDto> {
    // The backend applies activity as read-modify-write on the student's profile, so concurrent
    // requests overwrite each other (e.g. the last answer and the "session completed" report).
    // Serialize them so every answer is counted exactly once.
    const run = activityQueue.then(() =>
      apiClient.post<RawGamificationProfile>('/gamification/activity', req)
    );
    activityQueue = run.then(
      () => undefined,
      () => undefined
    );
    const response = await run;
    return normalizeGamificationProfile(response.data);
  },
};
