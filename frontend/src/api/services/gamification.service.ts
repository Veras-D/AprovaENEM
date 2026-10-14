import { apiClient } from '../client';
import type { GamificationProfileDto, LeaderboardResponseDto } from '../types';

export const gamificationService = {
  /**
   * Retrieve student gamification profile (XP, level, streak, badges)
   * Target endpoint: GET /api/v1/gamification/profile
   */
  async getGamificationProfile(): Promise<GamificationProfileDto> {
    const response = await apiClient.get<GamificationProfileDto>('/gamification/profile');
    return response.data;
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
