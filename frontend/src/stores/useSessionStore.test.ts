import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from './useSessionStore';
import type { PracticeSession, Question, DiagnosticReport } from '@/types';

const mockQuestions: readonly Question[] = [
  {
    id: 'q-1',
    externalId: 'ENEM-2023-01',
    examYear: 2023,
    knowledgeArea: 'MT',
    discipline: 'Matemática',
    difficulty: 'EASY',
    statement: 'Questão de Matemática 1',
    options: [
      { letter: 'A', text: 'Opção A' },
      { letter: 'B', text: 'Opção B' },
      { letter: 'C', text: 'Opção C' },
      { letter: 'D', text: 'Opção D' },
      { letter: 'E', text: 'Opção E' },
    ],
  },
  {
    id: 'q-2',
    externalId: 'ENEM-2023-02',
    examYear: 2023,
    knowledgeArea: 'CN',
    discipline: 'Física',
    difficulty: 'MEDIUM',
    statement: 'Questão de Física 2',
    options: [
      { letter: 'A', text: 'Opção A' },
      { letter: 'B', text: 'Opção B' },
      { letter: 'C', text: 'Opção C' },
      { letter: 'D', text: 'Opção D' },
      { letter: 'E', text: 'Opção E' },
    ],
  },
];

const mockSession: PracticeSession = {
  id: 'sess-100',
  title: 'Simulado ENEM Diagnóstico',
  questionCount: 2,
  status: 'IN_PROGRESS',
  currentQuestionIndex: 0,
  correctCount: 0,
  createdAt: '2026-10-14T10:00:00Z',
};

describe('useSessionStore — Student Session State Machine', () => {
  beforeEach(() => {
    useSessionStore.getState().clearSession();
    localStorage.clear();
  });

  describe('Initial State & Lifecycle Phases', () => {
    it('should initialize with IDLE phase and default anonymous identifier', () => {
      const state = useSessionStore.getState();
      expect(state.phase).toBe('IDLE');
      expect(state.anonymousSessionId).toMatch(/^anon-/);
      expect(state.activeSession).toBeNull();
      expect(state.attempts).toEqual({});
      expect(state.selectedAnswers).toEqual({});
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.elapsedSeconds).toBe(0);
    });

    it('should start a session and transition to ACTIVE phase', () => {
      useSessionStore.getState().startSession(mockSession, mockQuestions);

      const state = useSessionStore.getState();
      expect(state.phase).toBe('ACTIVE');
      expect(state.activeSession).toEqual(mockSession);
      expect(state.questions).toHaveLength(2);
      expect(state.currentQuestionIndex).toBe(0);
    });

    it('should transition between phases via setPhase', () => {
      useSessionStore.getState().setPhase('STARTING');
      expect(useSessionStore.getState().phase).toBe('STARTING');

      useSessionStore.getState().setPhase('SUBMITTING');
      expect(useSessionStore.getState().phase).toBe('SUBMITTING');
    });
  });

  describe('Attempt Recording & Answer Evaluation', () => {
    beforeEach(() => {
      useSessionStore.getState().startSession(mockSession, mockQuestions);
    });

    it('should record an attempt, update correctCount, and transition to REVIEWING', () => {
      useSessionStore.getState().recordAttempt({
        questionId: 'q-1',
        selectedOption: 'B',
        correctOption: 'B',
        isCorrect: true,
        explanation: 'Resolução detalhada da questão 1.',
        awardedXp: 10,
        timeSpentSeconds: 45,
      });

      const state = useSessionStore.getState();
      expect(state.phase).toBe('REVIEWING');
      expect(state.selectedAnswers['q-1']).toBe('B');
      expect(state.attempts['q-1']).toMatchObject({
        questionId: 'q-1',
        selectedOption: 'B',
        correctOption: 'B',
        isCorrect: true,
        explanation: 'Resolução detalhada da questão 1.',
        awardedXp: 10,
        timeSpentSeconds: 45,
      });
      expect(state.activeSession?.correctCount).toBe(1);
    });

    it('should not increment correctCount twice for the same question', () => {
      useSessionStore.getState().recordAttempt({
        questionId: 'q-1',
        selectedOption: 'B',
        isCorrect: true,
      });
      expect(useSessionStore.getState().activeSession?.correctCount).toBe(1);

      // Re-recording attempt
      useSessionStore.getState().recordAttempt({
        questionId: 'q-1',
        selectedOption: 'B',
        isCorrect: true,
      });
      expect(useSessionStore.getState().activeSession?.correctCount).toBe(1);
    });

    it('should maintain backward compatibility with recordAnswer', () => {
      useSessionStore.getState().recordAnswer('q-1', 'C');
      expect(useSessionStore.getState().selectedAnswers['q-1']).toBe('C');
    });
  });

  describe('Question Navigation & Boundary Checking', () => {
    beforeEach(() => {
      useSessionStore.getState().startSession(mockSession, mockQuestions);
    });

    it('should advance to next question and reset question timer', () => {
      useSessionStore.getState().tickTimer(30);
      expect(useSessionStore.getState().questionElapsedSeconds).toBe(30);

      const hasNext = useSessionStore.getState().nextQuestion();
      expect(hasNext).toBe(true);

      const state = useSessionStore.getState();
      expect(state.currentQuestionIndex).toBe(1);
      expect(state.questionElapsedSeconds).toBe(0);
      expect(state.phase).toBe('ACTIVE');
    });

    it('should transition to COMPLETED when nextQuestion is called on the last question', () => {
      useSessionStore.getState().goToQuestion(1);
      const hasNext = useSessionStore.getState().nextQuestion();

      expect(hasNext).toBe(false);
      expect(useSessionStore.getState().phase).toBe('COMPLETED');
    });

    it('should navigate back to previous question', () => {
      useSessionStore.getState().goToQuestion(1);
      const hasPrev = useSessionStore.getState().previousQuestion();

      expect(hasPrev).toBe(true);
      expect(useSessionStore.getState().currentQuestionIndex).toBe(0);
      expect(useSessionStore.getState().phase).toBe('ACTIVE');
    });

    it('should return false on previousQuestion when already at the first question', () => {
      const hasPrev = useSessionStore.getState().previousQuestion();
      expect(hasPrev).toBe(false);
      expect(useSessionStore.getState().currentQuestionIndex).toBe(0);
    });

    it('should jump to a valid question index via goToQuestion', () => {
      const success = useSessionStore.getState().goToQuestion(1);
      expect(success).toBe(true);
      expect(useSessionStore.getState().currentQuestionIndex).toBe(1);

      const invalid = useSessionStore.getState().goToQuestion(99);
      expect(invalid).toBe(false);
      expect(useSessionStore.getState().currentQuestionIndex).toBe(1);
    });
  });

  describe('Timer Tracking', () => {
    beforeEach(() => {
      useSessionStore.getState().startSession(mockSession, mockQuestions);
    });

    it('should tick elapsed timer only when phase is ACTIVE', () => {
      useSessionStore.getState().tickTimer(5);
      expect(useSessionStore.getState().elapsedSeconds).toBe(5);
      expect(useSessionStore.getState().questionElapsedSeconds).toBe(5);

      // In REVIEWING phase, timer should freeze
      useSessionStore.getState().setPhase('REVIEWING');
      useSessionStore.getState().tickTimer(5);
      expect(useSessionStore.getState().elapsedSeconds).toBe(5);
    });

    it('should reset question timer on resetQuestionTimer', () => {
      useSessionStore.getState().tickTimer(10);
      expect(useSessionStore.getState().questionElapsedSeconds).toBe(10);

      useSessionStore.getState().resetQuestionTimer();
      expect(useSessionStore.getState().questionElapsedSeconds).toBe(0);
      expect(useSessionStore.getState().elapsedSeconds).toBe(10);
    });
  });

  describe('Session Completion & Diagnostic Report', () => {
    beforeEach(() => {
      useSessionStore.getState().startSession(mockSession, mockQuestions);
    });

    it('should complete session without report and mark status COMPLETED', () => {
      useSessionStore.getState().completeSession();

      const state = useSessionStore.getState();
      expect(state.phase).toBe('COMPLETED');
      expect(state.activeSession?.status).toBe('COMPLETED');
      expect(state.activeSession?.completedAt).toBeDefined();
    });

    it('should complete session with report and transition to DIAGNOSTIC', () => {
      const mockReport: DiagnosticReport = {
        sessionId: 'sess-100',
        overallAccuracyPercentage: 85,
        radar: [
          {
            knowledgeArea: 'MT',
            scorePercentage: 90,
            totalQuestions: 10,
            correctQuestions: 9,
            masteryLevel: 'MASTERED',
          },
        ],
        recommendedStudyFocus: ['Geometria Espacial'],
      };

      useSessionStore.getState().completeSession(mockReport);

      const state = useSessionStore.getState();
      expect(state.phase).toBe('DIAGNOSTIC');
      expect(state.diagnosticReport).toEqual(mockReport);
      expect(state.activeSession?.status).toBe('COMPLETED');
    });

    it('should clear session state when clearSession is invoked', () => {
      useSessionStore.getState().recordAnswer('q-1', 'C');
      useSessionStore.getState().clearSession();

      const state = useSessionStore.getState();
      expect(state.phase).toBe('IDLE');
      expect(state.selectedAnswers).toEqual({});
      expect(state.activeSession).toBeNull();
      expect(state.attempts).toEqual({});
    });
  });

  describe('Anonymous Progress Migration', () => {
    it('should migrate anonymous practice attempts to authenticated user ID', () => {
      useSessionStore.getState().startSession(mockSession, mockQuestions);
      useSessionStore.getState().recordAttempt({
        questionId: 'q-1',
        selectedOption: 'A',
        isCorrect: true,
      });

      const migration = useSessionStore.getState().migrateAnonymousProgress('user-student-999');

      expect(migration.targetUserId).toBe('user-student-999');
      expect(migration.migratedAttemptsCount).toBe(1);
      expect(migration.previousSessionId).toMatch(/^anon-/);

      const state = useSessionStore.getState();
      expect(state.activeSession?.userId).toBe('user-student-999');

      // Check localStorage migration log
      const log = localStorage.getItem('aprovaenem_migrated_progress');
      expect(log).not.toBeNull();
      expect(JSON.parse(log!).targetUserId).toBe('user-student-999');
    });
  });
});
