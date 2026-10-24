/**
 * BFF API Request and Response DTOs
 * Strictly typed interfaces matching AprovaENEM backend microservices contracts
 */

import type { QuestionDifficulty, QuestionOptionLetter, KnowledgeArea, TimeAccommodationMode, AvatarConfig } from '@/types';

export interface PaginatedResponse<T> {
  readonly content: readonly T[];
  readonly page: number;
  readonly size: number;
  readonly totalElements: number;
  readonly totalPages: number;
}

export interface QuestionOptionDto {
  readonly id?: string;
  readonly optionLetter: QuestionOptionLetter;
  readonly text: string;
}

export interface QuestionItemDto {
  readonly id: string;
  readonly externalId?: string;
  readonly year: number;
  readonly subject: KnowledgeArea | string;
  readonly knowledgeArea?: KnowledgeArea;
  readonly discipline: string;
  readonly topic?: string;
  readonly itemNumber?: number;
  readonly contextText?: string;
  readonly statement: string;
  readonly difficulty: QuestionDifficulty;
  readonly status: 'ACTIVE' | 'SUSPENDED' | 'NEEDS_REVIEW' | 'DRAFT' | 'ANNULLED';
  readonly figureUrl?: string;
  readonly figureAltText?: string;
  readonly options: readonly QuestionOptionDto[];
}

export interface GetQuestionsParams {
  readonly year?: number;
  readonly subject?: string;
  readonly topicId?: string;
  readonly difficulty?: QuestionDifficulty;
  readonly page?: number;
  readonly size?: number;
}

export interface QuestionResolutionDto {
  readonly questionId: string;
  readonly correctOption: QuestionOptionLetter;
  readonly baseExplanation: string;
  readonly keyConcepts?: string;
  readonly distractorAnalysis?: Readonly<Record<QuestionOptionLetter, string>>;
  readonly attribution?: string;
}

export interface StartSessionRequest {
  readonly questionCount?: number;
  readonly subject?: string;
  readonly difficulty?: QuestionDifficulty;
  readonly timeMode?: TimeAccommodationMode;
}

export interface StartSessionResponse {
  readonly sessionId: string;
  readonly status: 'IN_PROGRESS' | 'COMPLETED';
  readonly totalQuestions: number;
  readonly currentQuestionIndex: number;
  readonly questions: readonly QuestionItemDto[];
  readonly createdAt: string;
  readonly timeMode?: TimeAccommodationMode;
}

export interface SubmitAnswerRequest {
  readonly questionId: string;
  readonly selectedOption: QuestionOptionLetter;
  readonly timeSpentSeconds: number;
}

export interface SubmitAnswerResponse {
  readonly attemptId: string;
  readonly questionId: string;
  readonly selectedOption: QuestionOptionLetter;
  readonly correctOption: QuestionOptionLetter;
  readonly isCorrect: boolean;
  readonly baseExplanation: string;
  readonly keyConcepts?: string;
}

export interface TopicAccuracyBreakdown {
  readonly accuracy: number;
  readonly total: number;
  readonly correct: number;
  readonly status: 'MASTERED' | 'ATTENTION_NEEDED' | 'CRITICAL';
}

export interface CompleteSessionResponse {
  readonly sessionId: string;
  readonly status: 'COMPLETED';
  readonly totalQuestions: number;
  readonly correctCount: number;
  readonly scorePercentage: number;
  readonly durationSeconds: number;
  readonly diagnosticRadar?: Readonly<Record<string, Record<string, Record<string, TopicAccuracyBreakdown>>>>;
  readonly recommendedAction?: string;
}

export type MasteryLevel = 'MASTERED' | 'ATTENTION_NEEDED' | 'CRITICAL';

export interface DiagnosticRadarAreaDto {
  readonly knowledgeArea: string; // 'MT' | 'CN' | 'CH' | 'LC'
  readonly areaName: string;
  readonly scorePercentage: number;
  readonly totalQuestions: number;
  readonly correctQuestions: number;
  readonly masteryLevel: MasteryLevel;
  readonly topWeakTopic?: string;
}

export interface DiagnosticReportDto {
  readonly id: string;
  readonly sessionId: string;
  readonly studentName?: string;
  readonly scorePercentage: number;
  readonly radar?: readonly DiagnosticRadarAreaDto[];
  readonly topicBreakdown?: Readonly<Record<string, TopicAccuracyBreakdown>>;
  readonly recommendedTopics: readonly string[];
  readonly generatedAt: string;
}

export interface InstitutionalAreaBreakdown {
  readonly subjectArea: string; // 'MATHEMATICS' | 'NATURAL_SCIENCES' | 'HUMANITIES' | 'LANGUAGES'
  readonly areaName?: string;
  readonly averageScorePercentage: number;
  readonly status: MasteryLevel;
  readonly topWeakTopic: string;
}

export interface InstitutionalDistractorPitfall {
  readonly questionId: string;
  readonly questionTitle?: string;
  readonly correctOption: string;
  readonly misleadingOption: string;
  readonly failedPercentage: number;
  readonly pedagogicalExplanation: string;
}

export interface InstitutionalCohortDiagnosticResponse {
  readonly cohortId: string;
  readonly cohortName: string;
  readonly tenantId: string;
  readonly totalEnrolledStudents: number;
  readonly activeParticipants: number;
  readonly participationRate: number;
  readonly averageScorePercentage: number;
  readonly areasBreakdown: readonly InstitutionalAreaBreakdown[];
  readonly commonDistractorPitfalls: readonly InstitutionalDistractorPitfall[];
  readonly generatedAt: string;
}

export interface SocraticChatRequest {
  readonly message: string;
}

export interface SocraticQuotaDto {
  readonly dailyUnlockedQuestionsLimit: number;
  readonly unlockedQuestionsToday: number;
  readonly remainingQuestionUnlocksToday: number;
  readonly resetsAt: string;
}

export interface SocraticContextChunkDto {
  readonly documentTitle: string;
  readonly similarityScore: number;
  readonly sourceType: string;
}

export interface SocraticChatResponse {
  readonly threadId: string;
  readonly questionId: string;
  readonly turnNumber: number;
  readonly maxTurnsPerThread: number;
  readonly remainingTurnsInThread: number;
  readonly socraticResponse: string;
  readonly pedagogicalGoal?: string;
  readonly modelUsed: string;
  readonly isFallback: boolean;
  readonly quota?: SocraticQuotaDto;
  readonly retrievedContext?: readonly SocraticContextChunkDto[];
}

export interface SocraticMessageItemDto {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: string;
  readonly isFallback?: boolean;
}

export interface SocraticThreadDto {
  readonly threadId: string;
  readonly questionId: string;
  readonly remainingTurns: number;
  readonly maxTurns: number;
  readonly messages: readonly SocraticMessageItemDto[];
}

export interface GamificationProfileDto {
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

export interface RecordActivityRequest {
  readonly questionsSolved: number;
  readonly correctCount: number;
  readonly sessionCompleted: boolean;
}

export interface LeaderboardUserEntryDto {
  readonly rank: number;
  readonly userId: string;
  readonly studentName?: string;
  readonly displayName?: string;
  readonly weeklyXp: number;
  readonly streakDays?: number;
  readonly promotionZone?: boolean;
  readonly isCurrentUser: boolean;
  readonly avatarConfig?: AvatarConfig;
}

export interface LeaderboardResponseDto {
  readonly league?: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  readonly leagueTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  readonly weekNumber?: number;
  readonly year?: number;
  readonly resetsAt: string;
  readonly totalParticipants?: number;
  readonly currentUserRank?: LeaderboardUserEntryDto;
  readonly entries?: readonly LeaderboardUserEntryDto[];
  readonly leaderboard?: readonly LeaderboardUserEntryDto[];
}

export interface TenantBrandingDto {
  readonly tenantId: string;
  readonly slug: string;
  readonly name: string;
  readonly shortName: string;
  readonly tagline: string;
  readonly logoUrl: string;
  readonly faviconUrl: string;
  readonly theme: {
    readonly primaryColor: string;
    readonly primaryDarkColor: string;
    readonly secondaryColor: string;
    readonly accentColor: string;
    readonly surfaceColor: string;
    readonly surfaceDarkColor: string;
    readonly borderRadius: string;
    readonly fontFamily: string;
  };
  readonly features: {
    readonly socraticAiEnabled: boolean;
    readonly gamificationEnabled: boolean;
    readonly leaderboardEnabled: boolean;
    readonly diagnosticRadarEnabled: boolean;
    readonly institutionalAnalyticsEnabled: boolean;
  };
}

export interface AuthLoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface AuthLoginResponse {
  readonly token: string;
  readonly expiresInSeconds: number;
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly name: string;
    readonly roles: readonly (
      | 'ROLE_STUDENT'
      | 'ROLE_PREMIUM_STUDENT'
      | 'ROLE_ADMIN'
      | 'ROLE_INSTITUTIONAL_ADMIN'
    )[];
    readonly isEmailVerified: boolean;
    readonly createdAt: string;
  };
}

export interface AuthRegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly schoolType?: 'PUBLIC_SCHOOL' | 'PRIVATE_SCHOLARSHIP' | 'PRIVATE_REGULAR';
  readonly targetDegree?: string;
}
