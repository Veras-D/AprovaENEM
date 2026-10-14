import { apiClient } from '../client';
import type { AuthLoginRequest, AuthLoginResponse, AuthRegisterRequest } from '../types';
import type { UserProfile } from '@/types';

export const authService = {
  /**
   * Authenticate student and obtain JWT Bearer token
   * Target endpoint: POST /api/v1/auth/login
   */
  async login(req: AuthLoginRequest): Promise<AuthLoginResponse> {
    const response = await apiClient.post<AuthLoginResponse>('/auth/login', req);
    return response.data;
  },

  /**
   * Register new student account
   * Target endpoint: POST /api/v1/auth/register
   */
  async register(req: AuthRegisterRequest): Promise<AuthLoginResponse> {
    const response = await apiClient.post<AuthLoginResponse>('/auth/register', req);
    return response.data;
  },

  /**
   * Fetch authenticated student profile
   * Target endpoint: GET /api/v1/auth/me
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },

  /**
   * Export all student personal data (LGPD Art. 18, V Portabilidade)
   * Target endpoint: GET /api/v1/auth/export
   */
  async exportUserData(): Promise<Record<string, unknown>> {
    const response = await apiClient.get<Record<string, unknown>>('/auth/export');
    return response.data;
  },

  /**
   * Irrevocably delete account and purge all PII (LGPD Art. 18, VI Direito à Eliminação)
   * Target endpoint: DELETE /api/v1/auth/me
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/auth/me');
  },
};
