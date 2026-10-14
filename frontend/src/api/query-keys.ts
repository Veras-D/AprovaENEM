import type { GetQuestionsParams } from './types';

export const queryKeys = {
  questions: {
    all: ['questions'] as const,
    list: (params?: GetQuestionsParams) => ['questions', 'list', params] as const,
    detail: (id: string) => ['questions', 'detail', id] as const,
    resolution: (id: string) => ['questions', 'resolution', id] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    detail: (id: string) => ['sessions', 'detail', id] as const,
    diagnostic: (id: string) => ['sessions', 'diagnostic', id] as const,
  },
  tutor: {
    all: ['tutor'] as const,
    thread: (questionId: string) => ['tutor', 'thread', questionId] as const,
  },
  gamification: {
    profile: ['gamification', 'profile'] as const,
    leaderboard: ['gamification', 'leaderboard'] as const,
  },
  tenants: {
    branding: (slug?: string) => ['tenants', 'branding', slug] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
} as const;
