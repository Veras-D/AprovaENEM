import { describe, it, expect } from 'vitest';
import {
  getLevelTitle,
  calculateLevelProgress,
  formatXp,
  BADGE_CATALOG,
} from './gamification-utils';

describe('gamification-utils', () => {
  describe('getLevelTitle', () => {
    it('returns Calouro Iniciante for levels 1 to 4', () => {
      expect(getLevelTitle(1)).toBe('Calouro Iniciante');
      expect(getLevelTitle(4)).toBe('Calouro Iniciante');
    });

    it('returns Focado no SISU for levels 5 to 9', () => {
      expect(getLevelTitle(5)).toBe('Focado no SISU');
      expect(getLevelTitle(9)).toBe('Focado no SISU');
    });

    it('returns Mestre dos Simulados for levels 10 to 19', () => {
      expect(getLevelTitle(10)).toBe('Mestre dos Simulados');
      expect(getLevelTitle(19)).toBe('Mestre dos Simulados');
    });

    it('returns Nota 1000 for levels 20 and above', () => {
      expect(getLevelTitle(20)).toBe('Nota 1000');
      expect(getLevelTitle(50)).toBe('Nota 1000');
    });
  });

  describe('calculateLevelProgress', () => {
    it('calculates progress correctly at level 1 with 50 XP', () => {
      const result = calculateLevelProgress(50, 1);
      expect(result.currentLevel).toBe(1);
      expect(result.baseLevelXp).toBe(0);
      expect(result.xpNextLevel).toBe(200);
      expect(result.xpInCurrentLevel).toBe(50);
      expect(result.xpNeededForNextLevel).toBe(150);
      expect(result.progressPercentage).toBe(25);
      expect(result.levelTitle).toBe('Calouro Iniciante');
    });

    it('calculates progress correctly at level 3 with 550 XP', () => {
      // Level 3: base is (3 - 1) * 200 = 400. Next is 3 * 200 = 600.
      // Current in level = 550 - 400 = 150. Needed = 50. Progress = 150 / 200 = 75%.
      const result = calculateLevelProgress(550, 3);
      expect(result.currentLevel).toBe(3);
      expect(result.baseLevelXp).toBe(400);
      expect(result.xpNextLevel).toBe(600);
      expect(result.xpInCurrentLevel).toBe(150);
      expect(result.xpNeededForNextLevel).toBe(50);
      expect(result.progressPercentage).toBe(75);
      expect(result.levelTitle).toBe('Calouro Iniciante');
    });

    it('caps progress at 100%', () => {
      const result = calculateLevelProgress(800, 3);
      expect(result.progressPercentage).toBe(100);
      expect(result.xpNeededForNextLevel).toBe(0);
    });
  });

  describe('formatXp', () => {
    it('formats XP with pt-BR number formatting', () => {
      expect(formatXp(350)).toBe('350 XP');
      expect(formatXp(1500)).toMatch(/1\.500 XP|1500 XP/);
    });
  });

  describe('BADGE_CATALOG', () => {
    it('contains unique badge identifiers and valid metadata', () => {
      const ids = BADGE_CATALOG.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
      expect(BADGE_CATALOG.length).toBeGreaterThanOrEqual(8);

      BADGE_CATALOG.forEach((badge) => {
        expect(badge.name).toBeTruthy();
        expect(badge.description).toBeTruthy();
        expect(badge.category).toBeTruthy();
      });
    });
  });
});
