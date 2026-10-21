import { describe, it, expect } from 'vitest';
import {
  OFFICIAL_EXAM_EDITIONS,
  getCompletedOfficialExams,
  getMixedExamQuestions,
  ENEM_2023_OFFICIAL_QUESTIONS,
  ENEM_2022_OFFICIAL_QUESTIONS,
  ALL_OFFICIAL_RESOLUTIONS,
} from './completed-exams';

describe('completed-exams module', () => {
  it('lists complete editions for 2023 and 2022 and excludes incomplete editions in getCompletedOfficialExams', () => {
    expect(OFFICIAL_EXAM_EDITIONS.length).toBeGreaterThanOrEqual(2);
    const completed = getCompletedOfficialExams();
    expect(completed.some((e) => e.year === 2023 && e.isComplete)).toBe(true);
    expect(completed.some((e) => e.year === 2022 && e.isComplete)).toBe(true);
    expect(completed.some((e) => !e.isComplete)).toBe(false);
  });

  it('has 180 questions for both ENEM 2023 and ENEM 2022', () => {
    expect(ENEM_2023_OFFICIAL_QUESTIONS.length).toBe(180);
    expect(ENEM_2022_OFFICIAL_QUESTIONS.length).toBe(180);
  });

  it('generates exactly 90 questions for Day 1 mixed simulation with 45 LC and 45 CH', () => {
    const day1Mixed = getMixedExamQuestions('DAY_1');
    expect(day1Mixed.length).toBe(90);

    const lcQuestions = day1Mixed.filter((q) => q.subject === 'LC');
    const chQuestions = day1Mixed.filter((q) => q.subject === 'CH');

    expect(lcQuestions.length).toBe(45);
    expect(chQuestions.length).toBe(45);

    // Verify questions come from different years
    const yearsInDay1 = new Set(day1Mixed.map((q) => q.year));
    expect(yearsInDay1.has(2022)).toBe(true);
    expect(yearsInDay1.has(2023)).toBe(true);

    // Verify item numbers are sequentially indexed from 1 to 90
    day1Mixed.forEach((q, idx) => {
      expect(q.itemNumber).toBe(idx + 1);
      // All questions have matching resolutions
      expect(ALL_OFFICIAL_RESOLUTIONS[q.id]).toBeDefined();
    });
  });

  it('generates exactly 90 questions for Day 2 mixed simulation with 45 CN and 45 MT', () => {
    const day2Mixed = getMixedExamQuestions('DAY_2');
    expect(day2Mixed.length).toBe(90);

    const cnQuestions = day2Mixed.filter((q) => q.subject === 'CN');
    const mtQuestions = day2Mixed.filter((q) => q.subject === 'MT');

    expect(cnQuestions.length).toBe(45);
    expect(mtQuestions.length).toBe(45);

    // Verify questions come from different years
    const yearsInDay2 = new Set(day2Mixed.map((q) => q.year));
    expect(yearsInDay2.has(2022)).toBe(true);
    expect(yearsInDay2.has(2023)).toBe(true);

    // Verify item numbers are sequentially indexed from 1 to 90
    day2Mixed.forEach((q, idx) => {
      expect(q.itemNumber).toBe(idx + 1);
      expect(ALL_OFFICIAL_RESOLUTIONS[q.id]).toBeDefined();
    });
  });
});
