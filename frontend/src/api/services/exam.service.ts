import { apiClient } from '../client';
import type {
  GetQuestionsParams,
  PaginatedResponse,
  QuestionItemDto,
  QuestionResolutionDto,
  StartSessionRequest,
  StartSessionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  CompleteSessionResponse,
  DiagnosticReportDto,
} from '../types';

export const examService = {
  /**
   * Fetch paginated ENEM questions with subject/difficulty/year filters
   * Target endpoint: GET /api/v1/questions
   */
  async getQuestions(params?: GetQuestionsParams): Promise<PaginatedResponse<QuestionItemDto>> {
    const response = await apiClient.get<PaginatedResponse<QuestionItemDto>>('/questions', {
      params,
    });
    return response.data;
  },

  /**
   * Fetch a single question by ID
   * Target endpoint: GET /api/v1/questions/{id}
   */
  async getQuestionById(id: string): Promise<QuestionItemDto> {
    const response = await apiClient.get<QuestionItemDto>(`/questions/${id}`);
    return response.data;
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
    const response = await apiClient.post<StartSessionResponse>('/sessions', req || {});
    return response.data;
  },

  /**
   * Submit an answer attempt for an active session question
   * Target endpoint: POST /api/v1/sessions/{sessionId}/attempts
   */
  async submitAnswer(sessionId: string, req: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const response = await apiClient.post<SubmitAnswerResponse>(`/sessions/${sessionId}/attempts`, req);
    return response.data;
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
};
