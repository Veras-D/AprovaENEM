import { describe, it, expect } from 'vitest';
import {
  SISU_COURSES,
  findSisuCourse,
  getTargetMasteryThreshold,
  getCourseCutoffScore,
  DEFAULT_MASTERY_TARGET,
  DEFAULT_CUTOFF_SCORE,
} from './sisu-courses';

describe('SISU Courses Catalog & Benchmark Calculations', () => {
  it('should contain comprehensive catalog of top Brazilian university degrees', () => {
    expect(SISU_COURSES.length).toBeGreaterThanOrEqual(25);
    const medicine = SISU_COURSES.find((c) => c.id === 'medicina');
    expect(medicine).toBeDefined();
    expect(medicine?.averageCutoff).toBe(805);
    expect(medicine?.masteryTarget).toBe(85.0);
  });

  it('should find course by exact name or ID', () => {
    const byId = findSisuCourse('medicina');
    expect(byId?.name).toBe('Medicina');

    const byName = findSisuCourse('Direito');
    expect(byName?.id).toBe('direito');
    expect(byName?.averageCutoff).toBe(745);
  });

  it('should find course by case-insensitive name with accents', () => {
    const cs = findSisuCourse('ciência da computação');
    expect(cs?.id).toBe('ciencia-computacao');
    expect(cs?.masteryTarget).toBe(80.0);

    const history = findSisuCourse('História');
    expect(history?.id).toBe('historia');
    expect(history?.averageCutoff).toBe(625);
  });

  it('should find course when student typed custom university suffix (e.g. "Medicina (USP)")', () => {
    const match = findSisuCourse('Medicina (USP)');
    expect(match?.id).toBe('medicina');
    expect(match?.averageCutoff).toBe(805);

    const csUfmg = findSisuCourse('Ciência da Computação - UFMG');
    expect(csUfmg?.id).toBe('ciencia-computacao');
  });

  it('should return dynamic mastery targets and fallback on unlisted degrees', () => {
    expect(getTargetMasteryThreshold('Medicina')).toBe(85.0);
    expect(getTargetMasteryThreshold('Engenharia de Computação')).toBe(79.0);
    expect(getTargetMasteryThreshold('Pedagogia')).toBe(60.0);

    // Fallbacks
    expect(getTargetMasteryThreshold(null)).toBe(DEFAULT_MASTERY_TARGET);
    expect(getTargetMasteryThreshold('')).toBe(DEFAULT_MASTERY_TARGET);
    expect(getTargetMasteryThreshold('Curso Desconhecido Raro')).toBe(DEFAULT_MASTERY_TARGET);
  });

  it('should return cutoff scores and fallback on unlisted degrees', () => {
    expect(getCourseCutoffScore('Medicina')).toBe(805);
    expect(getCourseCutoffScore('Direito')).toBe(745);
    expect(getCourseCutoffScore(undefined)).toBe(DEFAULT_CUTOFF_SCORE);
    expect(getCourseCutoffScore('Curso Fictício')).toBe(DEFAULT_CUTOFF_SCORE);
  });
});
