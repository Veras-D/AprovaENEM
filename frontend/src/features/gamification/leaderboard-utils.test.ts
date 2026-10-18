import { describe, it, expect } from 'vitest';
import {
  LEAGUE_CONFIGS,
  LEAGUE_TIERS_ORDER,
  isLeagueLocked,
  isLeagueCompleted,
  getZoneStatus,
  calculateTimeRemaining,
  getNextSundayReset,
} from './leaderboard-utils';

describe('leaderboard-utils', () => {
  describe('LEAGUE_CONFIGS', () => {
    it('defines configs for all 4 league tiers in order', () => {
      expect(LEAGUE_TIERS_ORDER).toEqual(['BRONZE', 'SILVER', 'GOLD', 'DIAMOND']);
      expect(LEAGUE_CONFIGS.BRONZE.name).toBe('Liga Bronze');
      expect(LEAGUE_CONFIGS.SILVER.name).toBe('Liga Prata');
      expect(LEAGUE_CONFIGS.GOLD.name).toBe('Liga Ouro');
      expect(LEAGUE_CONFIGS.DIAMOND.name).toBe('Liga Diamante');
    });

    it('specifies that Bronze cannot relegate and Diamond cannot promote', () => {
      expect(LEAGUE_CONFIGS.BRONZE.canRelegate).toBe(false);
      expect(LEAGUE_CONFIGS.DIAMOND.minRankPromotionPct).toBe(0);
      expect(LEAGUE_CONFIGS.SILVER.canRelegate).toBe(true);
      expect(LEAGUE_CONFIGS.GOLD.canRelegate).toBe(true);
    });

    it('determines if a league tier is locked or completed relative to user league', () => {
      // User is in GOLD:
      // BRONZE and SILVER are completed
      expect(isLeagueCompleted('BRONZE', 'GOLD')).toBe(true);
      expect(isLeagueCompleted('SILVER', 'GOLD')).toBe(true);
      expect(isLeagueCompleted('GOLD', 'GOLD')).toBe(false);
      expect(isLeagueCompleted('DIAMOND', 'GOLD')).toBe(false);

      // DIAMOND is locked
      expect(isLeagueLocked('DIAMOND', 'GOLD')).toBe(true);
      expect(isLeagueLocked('GOLD', 'GOLD')).toBe(false);
      expect(isLeagueLocked('SILVER', 'GOLD')).toBe(false);
      expect(isLeagueLocked('BRONZE', 'GOLD')).toBe(false);
    });
  });

  describe('getZoneStatus', () => {
    it('returns PROMOTION for top 20% in Bronze, Silver, and Gold', () => {
      // 10 participants: rank 1 and 2 are top 20%
      expect(getZoneStatus(1, 10, 'BRONZE')).toBe('PROMOTION');
      expect(getZoneStatus(2, 10, 'BRONZE')).toBe('PROMOTION');
      expect(getZoneStatus(1, 10, 'SILVER')).toBe('PROMOTION');
      expect(getZoneStatus(2, 10, 'GOLD')).toBe('PROMOTION');
    });

    it('returns MAINTENANCE for middle ranks (ranks 3 to 9 in cohort of 10)', () => {
      expect(getZoneStatus(3, 10, 'GOLD')).toBe('MAINTENANCE');
      expect(getZoneStatus(5, 10, 'BRONZE')).toBe('MAINTENANCE');
      expect(getZoneStatus(5, 10, 'SILVER')).toBe('MAINTENANCE');
      expect(getZoneStatus(5, 10, 'GOLD')).toBe('MAINTENANCE');
      expect(getZoneStatus(9, 10, 'GOLD')).toBe('MAINTENANCE');
    });

    it('never relegates Bronze players even at the bottom', () => {
      expect(getZoneStatus(10, 10, 'BRONZE')).toBe('MAINTENANCE');
    });

    it('returns RELEGATION for bottom 10% in Silver, Gold, and Diamond', () => {
      // 10 participants: rank 10 is bottom 10%
      expect(getZoneStatus(10, 10, 'SILVER')).toBe('RELEGATION');
      expect(getZoneStatus(10, 10, 'GOLD')).toBe('RELEGATION');
      expect(getZoneStatus(10, 10, 'DIAMOND')).toBe('RELEGATION');
    });

    it('never promotes Diamond players even if rank 1', () => {
      expect(getZoneStatus(1, 10, 'DIAMOND')).toBe('MAINTENANCE');
    });
  });

  describe('calculateTimeRemaining', () => {
    it('correctly calculates days, hours, and minutes for a future date', () => {
      const now = new Date('2026-10-15T12:00:00Z');
      const target = new Date('2026-10-18T23:59:59Z');

      const remaining = calculateTimeRemaining(target, now);
      expect(remaining.isExpired).toBe(false);
      expect(remaining.days).toBe(3);
      expect(remaining.hours).toBe(11);
      expect(remaining.minutes).toBe(59);
      expect(remaining.formatted).toContain('3d 11h 59m');
    });

    it('formats with hours, minutes, and seconds when less than 1 day remains', () => {
      const now = new Date('2026-10-18T20:00:00Z');
      const target = new Date('2026-10-18T23:59:59Z');

      const remaining = calculateTimeRemaining(target, now);
      expect(remaining.isExpired).toBe(false);
      expect(remaining.days).toBe(0);
      expect(remaining.hours).toBe(3);
      expect(remaining.minutes).toBe(59);
      expect(remaining.seconds).toBe(59);
      expect(remaining.formatted).toContain('03h 59m 59s');
    });

    it('handles past target timestamp as expired', () => {
      const now = new Date('2026-10-19T00:00:00Z');
      const target = new Date('2026-10-18T23:59:59Z');

      const remaining = calculateTimeRemaining(target, now);
      expect(remaining.isExpired).toBe(true);
      expect(remaining.formatted).toBe('00d 00h 00m');
    });
  });

  describe('getNextSundayReset', () => {
    it('returns a future Sunday ending at 23:59:59 UTC', () => {
      const thursday = new Date('2026-10-15T10:00:00Z');
      const nextSunday = getNextSundayReset(thursday);

      expect(nextSunday.getUTCDay()).toBe(0); // Sunday
      expect(nextSunday.getUTCHours()).toBe(23);
      expect(nextSunday.getUTCMinutes()).toBe(59);
      expect(nextSunday.getTime()).toBeGreaterThan(thursday.getTime());
    });
  });
});
