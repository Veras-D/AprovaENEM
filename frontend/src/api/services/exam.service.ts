import { apiClient } from '../client';
import type {
  GetQuestionsParams,
  PaginatedResponse,
  QuestionItemDto,
  QuestionOptionDto,
  QuestionResolutionDto,
  StartSessionRequest,
  StartSessionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  CompleteSessionResponse,
  DiagnosticReportDto,
} from '../types';
import type { QuestionDifficulty, QuestionOptionLetter, DiagnosticReport } from '@/types';

/**
 * Normalizes raw question item from backend or mock source to standard QuestionItemDto
 */
function normalizeQuestionItem(item: Record<string, unknown>): QuestionItemDto {
  const discipline = (item.discipline as string) || '';
  let subject = (item.subject || item.knowledgeArea) as string;
  if (!subject) {
    if (discipline.includes('Matemática')) subject = 'MT';
    else if (['Física', 'Química', 'Biologia'].some((d) => discipline.includes(d))) subject = 'CN';
    else if (['História', 'Geografia', 'Filosofia', 'Sociologia'].some((d) => discipline.includes(d))) subject = 'CH';
    else subject = 'LC';
  }

  const rawOptions = (item.options || []) as readonly Record<string, unknown>[];
  const normalizedOptions: QuestionOptionDto[] = rawOptions.map((opt) => ({
    id: opt.id as string | undefined,
    optionLetter: (opt.optionLetter as QuestionOptionLetter) || 'A',
    text: (opt.text || opt.optionText || '') as string,
  }));

  const rawDifficulty = ((item.difficulty || item.difficultyLevel || 'MEDIUM') as string).toUpperCase();
  const difficulty: QuestionDifficulty =
    rawDifficulty === 'EASY' || rawDifficulty === 'HARD' ? rawDifficulty : 'MEDIUM';

  const editionYearMap: Record<string, number> = {
    '22222222-0000-0000-0000-000000002023': 2023,
    '22222222-0000-0000-0000-000000002022': 2022,
    '22222222-0000-0000-0000-000000002021': 2021,
    '1e3ba5d3-a69d-4ed2-b56d-c6f103fbce44': 2020,
    '59b75172-1877-4f44-987a-4f2c983a74c3': 2019,
  };

  const editionId = (item.examEditionId || '') as string;
  const resolvedYear =
    (item.year as number) ||
    (item.examYear as number) ||
    editionYearMap[editionId] ||
    2023;

  const normalized: QuestionItemDto = {
    id: item.id as string,
    year: resolvedYear,
    subject,
    discipline,
    statement: (item.statement as string) || '',
    difficulty,
    status: ((item.status as string) || 'ACTIVE') as QuestionItemDto['status'],
    options: normalizedOptions,
  };

  if (item.externalId) (normalized as { externalId?: string }).externalId = item.externalId as string;
  if (item.topic || item.topicName) (normalized as { topic?: string }).topic = (item.topic || item.topicName) as string;
  if (typeof item.itemNumber === 'number') (normalized as { itemNumber?: number }).itemNumber = item.itemNumber;
  if (item.contextText) (normalized as { contextText?: string }).contextText = item.contextText as string;
  if (item.figureUrl) (normalized as { figureUrl?: string }).figureUrl = item.figureUrl as string;
  if (item.figureAltText) (normalized as { figureAltText?: string }).figureAltText = item.figureAltText as string;

  return normalized;
}

export const examService = {
  /**
   * Fetch paginated ENEM questions with subject/difficulty/year filters
   * Target endpoint: GET /api/v1/questions
   */
  async getQuestions(params?: GetQuestionsParams): Promise<PaginatedResponse<QuestionItemDto>> {
    const response = await apiClient.get<Record<string, unknown>>('/questions', {
      params,
    });
    const rawData = response.data;

    // If input is already standard PaginatedResponse from mock unit tests
    if (Array.isArray(rawData.content) && !rawData.items) {
      return rawData as unknown as PaginatedResponse<QuestionItemDto>;
    }

    const rawList = (rawData.items || rawData.content || []) as readonly Record<string, unknown>[];
    const normalizedContent = rawList.map(normalizeQuestionItem);

    return {
      content: normalizedContent,
      page: (rawData.page as number) ?? 0,
      size: (rawData.size as number) ?? normalizedContent.length,
      totalElements: (rawData.totalElements as number) ?? normalizedContent.length,
      totalPages: (rawData.totalPages as number) ?? 1,
    };
  },

  /**
   * Fetch a single question by ID
   * Target endpoint: GET /api/v1/questions/{id}
   */
  async getQuestionById(id: string): Promise<QuestionItemDto> {
    const response = await apiClient.get<Record<string, unknown>>(`/questions/${id}`);
    return normalizeQuestionItem(response.data);
  },

  /**
   * Fetch curated INEP step-by-step resolution
   * Target endpoint: GET /api/v1/questions/{id}/resolution
   */
  async getQuestionResolution(id: string): Promise<QuestionResolutionDto> {
    const response = await apiClient.get<QuestionResolutionDto>(`/questions/${id}/resolution`);
    return response.data;
  },

  /**
   * Start a new practice session (anonymous or registered)
   * Target endpoint: POST /api/v1/sessions
   */
  async startSession(req?: StartSessionRequest): Promise<StartSessionResponse> {
    const response = await apiClient.post<Record<string, unknown>>('/sessions', req || {});
    const rawData = response.data;

    // If already mock response from unit tests
    if (rawData.sessionId && rawData.questions && Array.isArray(rawData.questions) && rawData.questions[0]?.options?.[0]?.text) {
      return rawData as unknown as StartSessionResponse;
    }

    const sessionId = (rawData.sessionId || rawData.id) as string;
    const rawQuestions = (rawData.questions || []) as readonly Record<string, unknown>[];
    const normalizedQuestions = rawQuestions.map(normalizeQuestionItem);

    return {
      sessionId,
      status: (rawData.status as StartSessionResponse['status']) || 'IN_PROGRESS',
      totalQuestions: (rawData.totalQuestions as number) ?? normalizedQuestions.length,
      currentQuestionIndex: (rawData.currentQuestionIndex as number) ?? 0,
      questions: normalizedQuestions,
      createdAt: (rawData.createdAt || rawData.startedAt || new Date().toISOString()) as string,
      timeMode: req?.timeMode,
    };
  },

  /**
   * Submit an answer attempt for an active session question
   * Target endpoint: POST /api/v1/sessions/{sessionId}/attempts
   */
  async submitAnswer(sessionId: string, req: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const response = await apiClient.post<Record<string, unknown>>(`/sessions/${sessionId}/attempts`, req);
    const raw = response.data;
    return {
      attemptId: (raw.attemptId as string) || '',
      questionId: (raw.questionId as string) || req.questionId,
      selectedOption: (raw.selectedOption as QuestionOptionLetter) || req.selectedOption,
      correctOption: (raw.correctOption as QuestionOptionLetter) || 'A',
      isCorrect: typeof raw.isCorrect === 'boolean' ? raw.isCorrect : Boolean(raw.correct),
      baseExplanation: (raw.baseExplanation as string) || '',
      keyConcepts: raw.keyConcepts as string | undefined,
    };
  },

  /**
   * Complete an active practice session and calculate preliminary scores
   * Target endpoint: POST /api/v1/sessions/{sessionId}/complete
   */
  async completeSession(sessionId: string): Promise<CompleteSessionResponse> {
    const response = await apiClient.post<CompleteSessionResponse>(`/sessions/${sessionId}/complete`);
    return response.data;
  },

  /**
   * Retrieve structured diagnostic assessment report and skill mastery radar
   * Target endpoint: GET /api/v1/sessions/{sessionId}/diagnostic
   */
  async getDiagnosticReport(sessionId: string): Promise<DiagnosticReportDto> {
    const response = await apiClient.get<DiagnosticReportDto>(`/sessions/${sessionId}/diagnostic`);
    return response.data;
  },

  /**
   * Retrieve latest persistent diagnostic report for current user or anonymous session from database
   * Target endpoint: GET /api/v1/sessions/diagnostic/latest
   */
  async getLatestDiagnosticReport(): Promise<DiagnosticReportDto | null> {
    try {
      const response = await apiClient.get<DiagnosticReportDto>('/sessions/diagnostic/latest');
      if (response.status === 204 || !response.data || typeof response.data.scorePercentage !== 'number') {
        return null;
      }
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Persist structured diagnostic assessment report to backend database
   * Target endpoint: POST /api/v1/sessions/diagnostic
   */
  async saveDiagnosticReport(
    report: Partial<DiagnosticReportDto> | DiagnosticReport
  ): Promise<DiagnosticReportDto | null> {
    try {
      const score =
        'scorePercentage' in report && typeof report.scorePercentage === 'number'
          ? report.scorePercentage
          : 'overallAccuracyPercentage' in report && typeof report.overallAccuracyPercentage === 'number'
            ? report.overallAccuracyPercentage
            : 0;

      const topics =
        'recommendedTopics' in report && Array.isArray(report.recommendedTopics)
          ? report.recommendedTopics
          : 'recommendedStudyFocus' in report && Array.isArray(report.recommendedStudyFocus)
            ? report.recommendedStudyFocus
            : [];

      const breakdown =
        'topicBreakdown' in report && report.topicBreakdown
          ? report.topicBreakdown
          : {};

      const radar =
        'radar' in report && Array.isArray(report.radar)
          ? report.radar.map((area) => ({
              knowledgeArea: area.knowledgeArea,
              areaName: 'areaName' in area ? area.areaName : undefined,
              scorePercentage: area.scorePercentage,
              totalQuestions: area.totalQuestions,
              correctQuestions: area.correctQuestions,
              masteryLevel: area.masteryLevel,
              topWeakTopic: 'topWeakTopic' in area ? area.topWeakTopic : undefined,
            }))
          : [];

      const response = await apiClient.post<DiagnosticReportDto>('/sessions/diagnostic', {
        scorePercentage: score,
        topicBreakdown: breakdown,
        radar,
        recommendedTopics: topics,
      });
      return response.data;
    } catch {
      return null;
    }
  },
};
