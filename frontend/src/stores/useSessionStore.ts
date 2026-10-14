import { create } from 'zustand';
import type { PracticeSession, QuestionOptionLetter } from '@/types';

interface SessionState {
  readonly activeSession: PracticeSession | null;
  readonly anonymousSessionId: string;
  readonly selectedAnswers: Readonly<Record<string, QuestionOptionLetter>>;
  readonly setActiveSession: (session: PracticeSession | null) => void;
  readonly recordAnswer: (questionId: string, option: QuestionOptionLetter) => void;
  readonly clearSession: () => void;
}

const STORAGE_KEY_ANON_SESSION = 'aprovaenem_anon_session_id';

function getOrCreateAnonymousSessionId(): string {
  if (typeof window === 'undefined') {
    return 'anon-ssr-fallback';
  }
  let id = localStorage.getItem(STORAGE_KEY_ANON_SESSION);
  if (!id) {
    id = `anon-${crypto.randomUUID()}`;
    localStorage.setItem(STORAGE_KEY_ANON_SESSION, id);
  }
  return id;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSession: null,
  anonymousSessionId: getOrCreateAnonymousSessionId(),
  selectedAnswers: {},
  setActiveSession: (session) => set({ activeSession: session }),
  recordAnswer: (questionId, option) =>
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: option,
      },
    })),
  clearSession: () =>
    set({
      activeSession: null,
      selectedAnswers: {},
    }),
}));
