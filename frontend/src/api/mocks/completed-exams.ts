import type { QuestionItemDto, QuestionResolutionDto } from '@/api/types';
import enem2023Data from './enem-2023-complete.json';

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

const countDay1 = ENEM_2023_OFFICIAL_QUESTIONS.filter(
  (q) => q.subject === 'LC' || q.subject === 'CH'
).length;

const countDay2 = ENEM_2023_OFFICIAL_QUESTIONS.filter(
  (q) => q.subject === 'CN' || q.subject === 'MT'
).length;

export const OFFICIAL_EXAM_EDITIONS: readonly OfficialExamEdition[] = [
  {
    year: 2023,
    title: 'ENEM 2023 — Aplicação Regular',
    isComplete: true,
    day1QuestionCount: countDay1,
    day2QuestionCount: countDay2,
    totalQuestions: ENEM_2023_OFFICIAL_QUESTIONS.length,
    status: 'AVAILABLE',
    statusLabel: 'Oficial Completo',
  },
  {
    year: 2022,
    title: 'ENEM 2022 — Amostra Pedagógica',
    isComplete: false,
    day1QuestionCount: 2,
    day2QuestionCount: 3,
    totalQuestions: 5,
    status: 'IN_CATALOGING',
    statusLabel: 'Amostra Reduzida (5 questões)',
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
