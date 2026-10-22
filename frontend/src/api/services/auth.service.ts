import { apiClient } from '../client';
import type { AuthLoginRequest, AuthLoginResponse, AuthRegisterRequest } from '../types';
import type { UserProfile } from '@/types';

type UserRoleType = UserProfile['roles'][number];

interface RawBackendAuthPayload {
  readonly token: string;
  readonly expiresInSeconds?: number;
  readonly user?: UserProfile;
  readonly userId?: string;
  readonly id?: string;
  readonly email?: string;
  readonly fullName?: string;
  readonly name?: string;
  readonly role?: string;
  readonly roles?: readonly UserRoleType[];
  readonly isEmailVerified?: boolean;
  readonly emailVerified?: boolean;
  readonly createdAt?: string;
}

function normalizeUserRole(role?: string): UserRoleType {
  if (
    role === 'ROLE_STUDENT' ||
    role === 'ROLE_PREMIUM_STUDENT' ||
    role === 'ROLE_ADMIN' ||
    role === 'ROLE_INSTITUTIONAL_ADMIN'
  ) {
    return role;
  }
  if (role === 'ADMIN') return 'ROLE_ADMIN';
  if (role === 'PREMIUM_STUDENT') return 'ROLE_PREMIUM_STUDENT';
  if (role === 'INSTITUTIONAL_ADMIN') return 'ROLE_INSTITUTIONAL_ADMIN';
  return 'ROLE_STUDENT';
}

function normalizeUserProfile(raw: RawBackendAuthPayload): UserProfile {
  if (raw.user) {
    return raw.user;
  }
  return {
    id: raw.id ?? raw.userId ?? '',
    email: raw.email ?? '',
    name: raw.name ?? raw.fullName ?? '',
    roles: raw.roles && raw.roles.length > 0 ? raw.roles : [normalizeUserRole(raw.role)],
    isEmailVerified: Boolean(raw.isEmailVerified ?? raw.emailVerified),
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

function normalizeAuthResponse(raw: RawBackendAuthPayload): AuthLoginResponse {
  if (raw.user) {
    return {
      token: raw.token,
      expiresInSeconds: raw.expiresInSeconds ?? 86400,
      user: raw.user,
    };
  }
  return {
    token: raw.token,
    expiresInSeconds: raw.expiresInSeconds ?? 86400,
    user: normalizeUserProfile(raw),
  };
}

function mapSchoolTypeToBackend(
  schoolType?: AuthRegisterRequest['schoolType']
): 'PUBLIC_SCHOOL' | 'PRIVATE_SCHOOL' {
  if (schoolType === 'PRIVATE_SCHOLARSHIP' || schoolType === 'PRIVATE_REGULAR') {
    return 'PRIVATE_SCHOOL';
  }
  return 'PUBLIC_SCHOOL';
}

export const authService = {
  /**
   * Authenticate student and obtain JWT Bearer token
   * Target endpoint: POST /api/v1/auth/login
   */
  async login(req: AuthLoginRequest): Promise<AuthLoginResponse> {
    const response = await apiClient.post<RawBackendAuthPayload>('/auth/login', req);
    return normalizeAuthResponse(response.data);
  },

  /**
   * Register new student account
   * Target endpoint: POST /api/v1/auth/register
   */
  async register(req: AuthRegisterRequest): Promise<AuthLoginResponse> {
    const payload = {
      ...req,
      ...(req.schoolType ? { schoolType: mapSchoolTypeToBackend(req.schoolType) } : {}),
    };
    const response = await apiClient.post<RawBackendAuthPayload>('/auth/register', payload);
    return normalizeAuthResponse(response.data);
  },

  /**
   * Fetch authenticated student profile
   * Target endpoint: GET /api/v1/auth/me
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<RawBackendAuthPayload>('/auth/me');
    if (
      response.data.name !== undefined &&
      response.data.roles !== undefined &&
      response.data.isEmailVerified !== undefined &&
      response.data.id !== undefined &&
      response.data.email !== undefined &&
      response.data.createdAt !== undefined
    ) {
      return response.data as unknown as UserProfile;
    }
    return normalizeUserProfile(response.data);
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
