import { create } from 'zustand';
import type {
  PracticeSession,
  Question,
  QuestionOptionLetter,
  DiagnosticReport,
} from '@/types';
import type { DiagnosticReportDto } from '@/api/types';

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
  readonly keyConcepts?: string;
  readonly authorAttribution?: string;
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
  readonly keyConcepts?: string;
  readonly authorAttribution?: string;
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
  readonly diagnosticReport: DiagnosticReport | DiagnosticReportDto | null;
  readonly savedDiagnosticReport: DiagnosticReportDto | null;
  readonly isDiagnosticCompleted: boolean;
  readonly elapsedSeconds: number;
  readonly questionElapsedSeconds: number;
  readonly flaggedQuestions: Readonly<Record<string, boolean>>;
  readonly isMigratingProgress: boolean;
  readonly seenDiagnosticQuestionIds: readonly string[];

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
  readonly completeSession: (report?: DiagnosticReport | DiagnosticReportDto) => void;
  readonly setDiagnosticReport: (report: DiagnosticReport | DiagnosticReportDto) => void;
  readonly resetDiagnostic: () => void;
  readonly clearSession: () => void;
  readonly recordDiagnosticSeenQuestions: (ids: readonly string[]) => void;
  readonly migrateAnonymousProgress: (userId: string) => MigrationResult;
}

const STORAGE_KEY_ANON_SESSION = 'aprovaenem_anon_session_id';
const STORAGE_KEY_MIGRATION = 'aprovaenem_migrated_progress';
const STORAGE_KEY_DIAGNOSTIC_COMPLETED = 'aprovaenem_diagnostic_completed';
const STORAGE_KEY_DIAGNOSTIC_REPORT = 'aprovaenem_diagnostic_report';

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

function getSavedDiagnosticCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_DIAGNOSTIC_COMPLETED) === 'true';
}

function getSavedDiagnosticReport(): DiagnosticReportDto | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DIAGNOSTIC_REPORT);
    return raw ? (JSON.parse(raw) as DiagnosticReportDto) : null;
  } catch {
    return null;
  }
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
  diagnosticReport: getSavedDiagnosticReport(),
  savedDiagnosticReport: getSavedDiagnosticReport(),
  isDiagnosticCompleted: getSavedDiagnosticCompleted(),
  elapsedSeconds: 0,
  questionElapsedSeconds: 0,
  isMigratingProgress: false,
  seenDiagnosticQuestionIds: [],

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
      keyConcepts: payload.keyConcepts,
      authorAttribution: payload.authorAttribution,
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
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_DIAGNOSTIC_COMPLETED, 'true');
          localStorage.setItem(STORAGE_KEY_DIAGNOSTIC_REPORT, JSON.stringify(report));
        } catch {
          // LocalStorage quota or privacy sandbox
        }
      }

      set({
        activeSession: completedSession,
        diagnosticReport: report,
        savedDiagnosticReport: (report as DiagnosticReportDto) ?? null,
        isDiagnosticCompleted: true,
        phase: 'DIAGNOSTIC',
      });
    } else {
      set({
        activeSession: completedSession,
        phase: 'COMPLETED',
      });
    }
  },

  setDiagnosticReport: (report) => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_DIAGNOSTIC_COMPLETED, 'true');
        localStorage.setItem(STORAGE_KEY_DIAGNOSTIC_REPORT, JSON.stringify(report));
      } catch {
        // Storage quota
      }
    }
    set({
      diagnosticReport: report,
      savedDiagnosticReport: (report as DiagnosticReportDto) ?? null,
      isDiagnosticCompleted: true,
      phase: 'DIAGNOSTIC',
    });
  },

  resetDiagnostic: () => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_DIAGNOSTIC_COMPLETED);
        localStorage.removeItem(STORAGE_KEY_DIAGNOSTIC_REPORT);
      } catch {
        // Storage quota
      }
    }
    set({
      isDiagnosticCompleted: false,
      savedDiagnosticReport: null,
      diagnosticReport: null,
      phase: 'IDLE',
      activeSession: null,
      questions: [],
      attempts: {},
      selectedAnswers: {},
      flaggedQuestions: {},
      currentQuestionIndex: 0,
      elapsedSeconds: 0,
      questionElapsedSeconds: 0,
    });
  },

  clearSession: () => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_DIAGNOSTIC_COMPLETED);
        localStorage.removeItem(STORAGE_KEY_DIAGNOSTIC_REPORT);
      } catch {
        // Storage quota
      }
    }
    set({
      phase: 'IDLE',
      activeSession: null,
      currentQuestionIndex: 0,
      questions: [],
      attempts: {},
      selectedAnswers: {},
      flaggedQuestions: {},
      diagnosticReport: null,
      savedDiagnosticReport: null,
      isDiagnosticCompleted: false,
      elapsedSeconds: 0,
      questionElapsedSeconds: 0,
      isMigratingProgress: false,
      seenDiagnosticQuestionIds: [],
    });
  },

  recordDiagnosticSeenQuestions: (ids) => {
    const { seenDiagnosticQuestionIds } = get();
    const updated = Array.from(new Set([...seenDiagnosticQuestionIds, ...ids]));
    set({ seenDiagnosticQuestionIds: updated });
  },

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
