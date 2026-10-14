import { apiClient } from '../client';
import type { SocraticChatRequest, SocraticChatResponse, SocraticThreadDto } from '../types';

export const tutorService = {
  /**
   * Retrieve active conversation thread for a specific question
   * Target endpoint: GET /api/v1/questions/{id}/chat
   */
  async getSocraticThread(questionId: string): Promise<SocraticThreadDto> {
    const response = await apiClient.get<SocraticThreadDto>(`/questions/${questionId}/chat`);
    return response.data;
  },

  /**
   * Submit student query turn to Gemini Socratic AI Tutor
   * Target endpoint: POST /api/v1/questions/{id}/chat
   */
  async askSocraticTutor(questionId: string, req: SocraticChatRequest): Promise<SocraticChatResponse> {
    const response = await apiClient.post<SocraticChatResponse>(`/questions/${questionId}/chat`, req);
    return response.data;
  },

  /**
   * Reset conversation thread and start fresh
   * Target endpoint: DELETE /api/v1/questions/{id}/chat
   */
  async resetSocraticThread(questionId: string): Promise<void> {
    await apiClient.delete(`/questions/${questionId}/chat`);
  },
};
