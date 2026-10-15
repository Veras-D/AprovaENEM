import { create } from 'zustand';
import type {
  PracticeSession,
  Question,
  QuestionOptionLetter,
  DiagnosticReport,
} from '@/types';

export type SessionPhase =
  | 'IDLE'
  | 'STARTING'
  | 'ACTIVE'
  | 'SUBMITTING'
  | 'REVIEWING'
  | 'COMPLETED'
  | 'DIAGNOSTIC';

export interface SessionAttemptRecord {
  readonly questionId: string;
  readonly selectedOption: QuestionOptionLetter;
  readonly correctOption?: QuestionOptionLetter;
  readonly isCorrect?: boolean;
  readonly explanation?: string;
  readonly awardedXp?: number;
  readonly timeSpentSeconds: number;
  readonly answeredAt: string;
}

export interface RecordAttemptPayload {
  readonly questionId: string;
  readonly selectedOption: QuestionOptionLetter;
  readonly correctOption?: QuestionOptionLetter;
  readonly isCorrect?: boolean;
  readonly explanation?: string;
  readonly awardedXp?: number;
  readonly timeSpentSeconds?: number;
}

export interface MigrationResult {
  readonly previousSessionId: string;
  readonly targetUserId: string;
  readonly migratedAttemptsCount: number;
  readonly migratedAt: string;
}

export interface SessionState {
  readonly phase: SessionPhase;
  readonly activeSession: PracticeSession | null;
  readonly anonymousSessionId: string;
  readonly currentQuestionIndex: number;
  readonly questions: readonly Question[];
  readonly attempts: Readonly<Record<string, SessionAttemptRecord>>;
  readonly selectedAnswers: Readonly<Record<string, QuestionOptionLetter>>;
  readonly diagnosticReport: DiagnosticReport | null;
  readonly elapsedSeconds: number;
  readonly questionElapsedSeconds: number;
  readonly flaggedQuestions: Readonly<Record<string, boolean>>;
  readonly isMigratingProgress: boolean;

  readonly startSession: (session: PracticeSession, questions?: readonly Question[]) => void;
  readonly setPhase: (phase: SessionPhase) => void;
  readonly recordAttempt: (payload: RecordAttemptPayload) => void;
  readonly recordAnswer: (questionId: string, option: QuestionOptionLetter) => void;
  readonly toggleFlagQuestion: (questionId: string) => void;
  readonly nextQuestion: () => boolean;
  readonly previousQuestion: () => boolean;
  readonly goToQuestion: (index: number) => boolean;
  readonly tickTimer: (deltaSeconds?: number) => void;
  readonly resetQuestionTimer: () => void;
  readonly completeSession: (report?: DiagnosticReport) => void;
  readonly setDiagnosticReport: (report: DiagnosticReport) => void;
  readonly clearSession: () => void;
  readonly migrateAnonymousProgress: (userId: string) => MigrationResult;
}

const STORAGE_KEY_ANON_SESSION = 'aprovaenem_anon_session_id';
const STORAGE_KEY_MIGRATION = 'aprovaenem_migrated_progress';

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

export const useSessionStore = create<SessionState>((set, get) => ({
  phase: 'IDLE',
  activeSession: null,
  anonymousSessionId: getOrCreateAnonymousSessionId(),
  currentQuestionIndex: 0,
  questions: [],
  attempts: {},
  selectedAnswers: {},
  flaggedQuestions: {},
  diagnosticReport: null,
  elapsedSeconds: 0,
  questionElapsedSeconds: 0,
  isMigratingProgress: false,

  startSession: (session, questions = []) =>
    set({
      phase: 'ACTIVE',
      activeSession: session,
      questions,
      currentQuestionIndex: session.currentQuestionIndex || 0,
      attempts: {},
      selectedAnswers: {},
      flaggedQuestions: {},
      diagnosticReport: null,
      elapsedSeconds: 0,
      questionElapsedSeconds: 0,
    }),

  setPhase: (phase) => set({ phase }),

  toggleFlagQuestion: (questionId) =>
    set((state) => ({
      flaggedQuestions: {
        ...state.flaggedQuestions,
        [questionId]: !state.flaggedQuestions[questionId],
      },
    })),

  recordAttempt: (payload) => {
    const { activeSession, attempts, selectedAnswers, questionElapsedSeconds } = get();
    const timeSpent = payload.timeSpentSeconds ?? questionElapsedSeconds;

    const attempt: SessionAttemptRecord = {
      questionId: payload.questionId,
      selectedOption: payload.selectedOption,
      correctOption: payload.correctOption,
      isCorrect: payload.isCorrect,
      explanation: payload.explanation,
      awardedXp: payload.awardedXp,
      timeSpentSeconds: timeSpent,
      answeredAt: new Date().toISOString(),
    };

    let updatedSession = activeSession;
    if (activeSession && payload.isCorrect) {
      const alreadyCorrect = attempts[payload.questionId]?.isCorrect;
      if (!alreadyCorrect) {
        updatedSession = {
          ...activeSession,
          correctCount: activeSession.correctCount + 1,
        };
      }
    }

    set({
      phase: 'REVIEWING',
      attempts: {
        ...attempts,
        [payload.questionId]: attempt,
      },
      selectedAnswers: {
        ...selectedAnswers,
        [payload.questionId]: payload.selectedOption,
      },
      activeSession: updatedSession,
    });
  },

  recordAnswer: (questionId, option) =>
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: option,
      },
    })),

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (questions.length > 0 && currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        questionElapsedSeconds: 0,
        phase: 'ACTIVE',
      });
      return true;
    }
    // Reached the end of questions
    set({ phase: 'COMPLETED' });
    return false;
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({
        currentQuestionIndex: currentQuestionIndex - 1,
        questionElapsedSeconds: 0,
        phase: 'ACTIVE',
      });
      return true;
    }
    return false;
  },

  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && (questions.length === 0 || index < questions.length)) {
      set({
        currentQuestionIndex: index,
        questionElapsedSeconds: 0,
        phase: 'ACTIVE',
      });
      return true;
    }
    return false;
  },

  tickTimer: (deltaSeconds = 1) => {
    const { phase, elapsedSeconds, questionElapsedSeconds } = get();
    if (phase === 'ACTIVE') {
      set({
        elapsedSeconds: elapsedSeconds + deltaSeconds,
        questionElapsedSeconds: questionElapsedSeconds + deltaSeconds,
      });
    }
  },

  resetQuestionTimer: () => set({ questionElapsedSeconds: 0 }),

  completeSession: (report) => {
    const { activeSession } = get();
    const completedSession: PracticeSession | null = activeSession
      ? {
          ...activeSession,
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
        }
      : null;

    if (report) {
      set({
        activeSession: completedSession,
        diagnosticReport: report,
        phase: 'DIAGNOSTIC',
      });
    } else {
      set({
        activeSession: completedSession,
        phase: 'COMPLETED',
      });
    }
  },

  setDiagnosticReport: (report) =>
    set({
      diagnosticReport: report,
      phase: 'DIAGNOSTIC',
    }),

  clearSession: () =>
    set({
      phase: 'IDLE',
      activeSession: null,
      currentQuestionIndex: 0,
      questions: [],
      attempts: {},
      selectedAnswers: {},
      flaggedQuestions: {},
      diagnosticReport: null,
      elapsedSeconds: 0,
      questionElapsedSeconds: 0,
      isMigratingProgress: false,
    }),

  migrateAnonymousProgress: (userId: string): MigrationResult => {
    const { anonymousSessionId, activeSession, attempts } = get();
    set({ isMigratingProgress: true });

    let updatedSession = activeSession;
    if (activeSession && (!activeSession.userId || activeSession.userId !== userId)) {
      updatedSession = {
        ...activeSession,
        userId,
      };
    }

    const migrationResult: MigrationResult = {
      previousSessionId: anonymousSessionId,
      targetUserId: userId,
      migratedAttemptsCount: Object.keys(attempts).length,
      migratedAt: new Date().toISOString(),
    };

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_MIGRATION, JSON.stringify(migrationResult));
      } catch {
        // LocalStorage quota or access error
      }
    }

    set({
      activeSession: updatedSession,
      isMigratingProgress: false,
    });

    return migrationResult;
  },
}));
