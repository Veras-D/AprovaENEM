/**
 * AprovaENEM Domain Models & API Types
 * Strict TypeScript Definitions (Zero `any` policy)
 */

export type KnowledgeArea =
  | 'CH' // Ciências Humanas e suas Tecnologias
  | 'CN' // Ciências da Natureza e suas Tecnologias
  | 'LC' // Linguagens, Códigos e suas Tecnologias
  | 'MT'; // Matemática e suas Tecnologias

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type TimeAccommodationMode = 'STANDARD' | 'EXTENDED_INEP' | 'UNTIMED';

export type QuestionOptionLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export interface QuestionOption {
  readonly letter: QuestionOptionLetter;
  readonly text: string;
}

export interface Question {
  readonly id: string;
  readonly externalId: string;
  readonly examYear: number;
  readonly knowledgeArea: KnowledgeArea;
  readonly discipline: string;
  readonly difficulty: QuestionDifficulty;
  readonly statement: string;
  readonly contextText?: string;
  readonly imageUrl?: string;
  readonly options: readonly QuestionOption[];
  readonly competencyNumber?: number;
  readonly skillNumber?: number;
  readonly triParameters?: {
    readonly discrimination: number; // a
    readonly difficulty: number; // b
    readonly guessing: number; // c
  };
}

export interface QuestionResolution {
  readonly questionId: string;
  readonly correctOption: QuestionOptionLetter;
  readonly explanation: string;
  readonly inepResolutionText?: string;
  readonly distractorExplanations?: Record<QuestionOptionLetter, string>;
}

export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface PracticeSession {
  readonly id: string;
  readonly userId?: string;
  readonly anonymousSessionId?: string;
  readonly title: string;
  readonly questionCount: number;
  readonly status: SessionStatus;
  readonly currentQuestionIndex: number;
  readonly correctCount: number;
  readonly createdAt: string;
  readonly completedAt?: string;
  readonly timeMode?: TimeAccommodationMode;
}

export interface AnswerSubmissionPayload {
  readonly questionId: string;
  readonly selectedOption: QuestionOptionLetter;
  readonly timeSpentSeconds: number;
}

export interface AnswerEvaluationResult {
  readonly questionId: string;
  readonly selectedOption: QuestionOptionLetter;
  readonly correctOption: QuestionOptionLetter;
  readonly isCorrect: boolean;
  readonly explanation: string;
  readonly awardedXp: number;
  readonly currentStreakDays?: number;
}

export interface DiagnosticRadarArea {
  readonly knowledgeArea: KnowledgeArea;
  readonly scorePercentage: number;
  readonly totalQuestions: number;
  readonly correctQuestions: number;
  readonly masteryLevel: 'MASTERED' | 'ATTENTION_NEEDED' | 'CRITICAL';
}

export interface DiagnosticReport {
  readonly sessionId: string;
  readonly overallAccuracyPercentage: number;
  readonly radar: readonly DiagnosticRadarArea[];
  readonly recommendedStudyFocus: readonly string[];
}

export interface SocraticMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: string;
  readonly isFallback?: boolean;
}

export interface SocraticThread {
  readonly questionId: string;
  readonly remainingTurns: number;
  readonly maxTurns: number;
  readonly messages: readonly SocraticMessage[];
}

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly roles: readonly ('ROLE_STUDENT' | 'ROLE_PREMIUM_STUDENT' | 'ROLE_ADMIN' | 'ROLE_INSTITUTIONAL_ADMIN')[];
  readonly isEmailVerified: boolean;
  readonly createdAt: string;
  readonly schoolType?: 'PUBLIC_SCHOOL' | 'PRIVATE_SCHOOL';
  readonly targetDegree?: string;
}

export interface GamificationProfile {
  readonly userId: string;
  readonly currentXp: number;
  readonly level: number;
  readonly levelTitle: string;
  readonly currentStreakDays: number;
  readonly longestStreakDays: number;
  readonly streakFreezeAvailable: boolean;
  readonly dailyGoalTarget: number;
  readonly dailyGoalProgress: number;
  readonly weeklyLeague: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  readonly unlockedBadges: readonly string[];
}

export interface LeaderboardEntry {
  readonly rank: number;
  readonly userId: string;
  readonly studentName: string;
  readonly weeklyXp: number;
  readonly isCurrentUser: boolean;
}

export interface ApiProblemDetails {
  readonly type?: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly message?: string;
  readonly instance?: string;
  readonly code?: string;
  readonly invalidParams?: readonly {
    readonly name: string;
    readonly reason: string;
  }[];
}
