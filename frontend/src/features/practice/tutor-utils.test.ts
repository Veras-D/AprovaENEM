import { describe, it, expect } from 'vitest';
import {
  calculateTimeUntilMidnightBrt,
  formatMessageTimestamp,
  isProOrAdmin,
  SOCRATIC_STARTER_PROMPTS,
} from './tutor-utils';
import type { UserProfile } from '@/types';

describe('tutor-utils', () => {
  describe('calculateTimeUntilMidnightBrt', () => {
    it('calculates countdown correctly for a given UTC date', () => {
      // 2026-10-15T15:30:00Z -> In America/Sao_Paulo (UTC-3), this is 12:30:00.
      // Remaining until midnight (24:00:00) is 11 hours and 30 minutes.
      const fixedDate = new Date('2026-10-15T15:30:00Z');
      const result = calculateTimeUntilMidnightBrt(fixedDate);

      expect(result.hours).toBe(11);
      expect(result.minutes).toBe(30);
      expect(result.formatted).toBe('11h 30m');
    });

    it('returns valid format even when no argument is passed', () => {
      const result = calculateTimeUntilMidnightBrt();
      expect(result.formatted).toMatch(/^\d{2}h \d{2}m$/);
      expect(result.hours).toBeGreaterThanOrEqual(0);
      expect(result.hours).toBeLessThanOrEqual(24);
      expect(result.minutes).toBeGreaterThanOrEqual(0);
      expect(result.minutes).toBeLessThanOrEqual(59);
    });
  });

  describe('formatMessageTimestamp', () => {
    it('formats a valid ISO timestamp to HH:mm in pt-BR', () => {
      const formatted = formatMessageTimestamp('2026-10-15T10:15:00Z');
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    it('returns fallback for invalid or missing timestamp', () => {
      expect(formatMessageTimestamp('')).toBe('--:--');
      expect(formatMessageTimestamp(undefined)).toBe('--:--');
      expect(formatMessageTimestamp('invalid-date')).toBe('--:--');
    });
  });

  describe('isProOrAdmin', () => {
    it('returns false for null or undefined user', () => {
      expect(isProOrAdmin(null)).toBe(false);
      expect(isProOrAdmin(undefined)).toBe(false);
    });

    it('returns false for regular student', () => {
      const student: UserProfile = {
        id: '1',
        email: 'student@example.com',
        name: 'Aluno Normal',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01',
      };
      expect(isProOrAdmin(student)).toBe(false);
    });

    it('returns true for premium student', () => {
      const premiumStudent: UserProfile = {
        id: '2',
        email: 'pro@example.com',
        name: 'Aluno Pro',
        roles: ['ROLE_PREMIUM_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01',
      };
      expect(isProOrAdmin(premiumStudent)).toBe(true);
    });

    it('returns true for admin users', () => {
      const admin: UserProfile = {
        id: '3',
        email: 'admin@example.com',
        name: 'Admin',
        roles: ['ROLE_ADMIN'],
        isEmailVerified: true,
        createdAt: '2026-01-01',
      };
      expect(isProOrAdmin(admin)).toBe(true);
    });
  });

  describe('SOCRATIC_STARTER_PROMPTS', () => {
    it('contains non-empty starter questions', () => {
      expect(SOCRATIC_STARTER_PROMPTS.length).toBeGreaterThan(0);
      SOCRATIC_STARTER_PROMPTS.forEach((prompt) => {
        expect(prompt.length).toBeGreaterThan(10);
      });
    });
  });
});
