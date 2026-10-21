import type { QuestionItemDto, QuestionResolutionDto } from '@/api/types';
import enem2023Data from './enem-2023-complete.json';
import enem2022Data from './enem-2022-complete.json';

export interface OfficialExamEdition {
  readonly year: number;
  readonly title: string;
  readonly isComplete: boolean;
  readonly day1QuestionCount: number;
  readonly day2QuestionCount: number;
  readonly totalQuestions: number;
  readonly status: 'AVAILABLE' | 'IN_CATALOGING';
  readonly statusLabel: string;
}

export const ENEM_2023_OFFICIAL_QUESTIONS: readonly QuestionItemDto[] =
  enem2023Data.questions as unknown as QuestionItemDto[];

export const ENEM_2023_OFFICIAL_RESOLUTIONS: Readonly<Record<string, QuestionResolutionDto>> =
  enem2023Data.resolutions as unknown as Record<string, QuestionResolutionDto>;

export const ENEM_2022_OFFICIAL_QUESTIONS: readonly QuestionItemDto[] =
  enem2022Data.questions as unknown as QuestionItemDto[];

export const ENEM_2022_OFFICIAL_RESOLUTIONS: Readonly<Record<string, QuestionResolutionDto>> =
  enem2022Data.resolutions as unknown as Record<string, QuestionResolutionDto>;

export const ALL_OFFICIAL_RESOLUTIONS: Readonly<Record<string, QuestionResolutionDto>> = {
  ...ENEM_2022_OFFICIAL_RESOLUTIONS,
  ...ENEM_2023_OFFICIAL_RESOLUTIONS,
};

const count2023Day1 = ENEM_2023_OFFICIAL_QUESTIONS.filter(
  (q) => q.subject === 'LC' || q.subject === 'CH'
).length;

const count2023Day2 = ENEM_2023_OFFICIAL_QUESTIONS.filter(
  (q) => q.subject === 'CN' || q.subject === 'MT'
).length;

const count2022Day1 = ENEM_2022_OFFICIAL_QUESTIONS.filter(
  (q) => q.subject === 'LC' || q.subject === 'CH'
).length;

const count2022Day2 = ENEM_2022_OFFICIAL_QUESTIONS.filter(
  (q) => q.subject === 'CN' || q.subject === 'MT'
).length;

export const OFFICIAL_EXAM_EDITIONS: readonly OfficialExamEdition[] = [
  {
    year: 2023,
    title: 'ENEM 2023 — Aplicação Regular',
    isComplete: true,
    day1QuestionCount: count2023Day1,
    day2QuestionCount: count2023Day2,
    totalQuestions: ENEM_2023_OFFICIAL_QUESTIONS.length,
    status: 'AVAILABLE',
    statusLabel: 'Oficial Completo',
  },
  {
    year: 2022,
    title: 'ENEM 2022 — Aplicação Regular',
    isComplete: true,
    day1QuestionCount: count2022Day1,
    day2QuestionCount: count2022Day2,
    totalQuestions: ENEM_2022_OFFICIAL_QUESTIONS.length,
    status: 'AVAILABLE',
    statusLabel: 'Oficial Completo',
  },
  {
    year: 2021,
    title: 'ENEM 2021 — Amostra Pedagógica',
    isComplete: false,
    day1QuestionCount: 2,
    day2QuestionCount: 3,
    totalQuestions: 5,
    status: 'IN_CATALOGING',
    statusLabel: 'Amostra Reduzida (5 questões)',
  },
  {
    year: 2020,
    title: 'ENEM 2020 — Amostra Pedagógica',
    isComplete: false,
    day1QuestionCount: 2,
    day2QuestionCount: 3,
    totalQuestions: 5,
    status: 'IN_CATALOGING',
    statusLabel: 'Amostra Reduzida (5 questões)',
  },
  {
    year: 2019,
    title: 'ENEM 2019 — Amostra Pedagógica',
    isComplete: false,
    day1QuestionCount: 2,
    day2QuestionCount: 3,
    totalQuestions: 5,
    status: 'IN_CATALOGING',
    statusLabel: 'Amostra Reduzida (5 questões)',
  },
];

/**
 * Returns only official exam editions that are complete.
 * Incomplete editions with small question amounts are strictly excluded from the available simulation list.
 */
export function getCompletedOfficialExams(
  editions: readonly OfficialExamEdition[] = OFFICIAL_EXAM_EDITIONS
): readonly OfficialExamEdition[] {
  return editions.filter((edition) => edition.isComplete);
}

/**
 * Generates an authentic 90-question mixed official exam session
 * blending questions across multiple exam editions (2022 and 2023),
 * strictly maintaining the official INEP structure of 45 questions per subject:
 * - Day 1: 45 questions of Linguagens e Códigos (LC) + 45 questions of Ciências Humanas (CH)
 * - Day 2: 45 questions of Ciências da Natureza (CN) + 45 questions of Matemática (MT)
 */
export function getMixedExamQuestions(day: 'DAY_1' | 'DAY_2'): readonly QuestionItemDto[] {
  if (day === 'DAY_1') {
    // 45 LC questions: alternating between 2023 and 2022
    const lc2023 = ENEM_2023_OFFICIAL_QUESTIONS.filter((q) => q.subject === 'LC');
    const lc2022 = ENEM_2022_OFFICIAL_QUESTIONS.filter((q) => q.subject === 'LC');
    const mixedLc: QuestionItemDto[] = [];
    for (let i = 0; i < 45; i++) {
      const source = i % 2 === 0 ? lc2023 : lc2022;
      const index = Math.floor(i / 2);
      const chosen = source[index] ?? lc2023[index] ?? lc2022[index];
      if (chosen) {
        mixedLc.push({ ...chosen, itemNumber: i + 1 });
      }
    }

    // 45 CH questions: alternating between 2022 and 2023
    const ch2023 = ENEM_2023_OFFICIAL_QUESTIONS.filter((q) => q.subject === 'CH');
    const ch2022 = ENEM_2022_OFFICIAL_QUESTIONS.filter((q) => q.subject === 'CH');
    const mixedCh: QuestionItemDto[] = [];
    for (let i = 0; i < 45; i++) {
      const source = i % 2 === 0 ? ch2022 : ch2023;
      const index = Math.floor(i / 2);
      const chosen = source[index] ?? ch2023[index] ?? ch2022[index];
      if (chosen) {
        mixedCh.push({ ...chosen, itemNumber: 45 + i + 1 });
      }
    }

    return [...mixedLc, ...mixedCh];
  } else {
    // 45 CN questions: alternating between 2023 and 2022
    const cn2023 = ENEM_2023_OFFICIAL_QUESTIONS.filter((q) => q.subject === 'CN');
    const cn2022 = ENEM_2022_OFFICIAL_QUESTIONS.filter((q) => q.subject === 'CN');
    const mixedCn: QuestionItemDto[] = [];
    for (let i = 0; i < 45; i++) {
      const source = i % 2 === 0 ? cn2023 : cn2022;
      const index = Math.floor(i / 2);
      const chosen = source[index] ?? cn2023[index] ?? cn2022[index];
      if (chosen) {
        mixedCn.push({ ...chosen, itemNumber: i + 1 });
      }
    }

    // 45 MT questions: alternating between 2022 and 2023
    const mt2023 = ENEM_2023_OFFICIAL_QUESTIONS.filter((q) => q.subject === 'MT');
    const mt2022 = ENEM_2022_OFFICIAL_QUESTIONS.filter((q) => q.subject === 'MT');
    const mixedMt: QuestionItemDto[] = [];
    for (let i = 0; i < 45; i++) {
      const source = i % 2 === 0 ? mt2022 : mt2023;
      const index = Math.floor(i / 2);
      const chosen = source[index] ?? mt2023[index] ?? mt2022[index];
      if (chosen) {
        mixedMt.push({ ...chosen, itemNumber: 45 + i + 1 });
      }
    }

    return [...mixedCn, ...mixedMt];
  }
}
