import { apiClient } from '../client';
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRegisterRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailResponse,
  ResendVerificationResponse,
} from '../types';
import type { UserProfile, AvatarConfig } from '@/types';

type UserRoleType = UserProfile['roles'][number];

interface RawBackendAuthPayload {
  readonly token?: string;
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
  readonly schoolType?: 'PUBLIC_SCHOOL' | 'PRIVATE_SCHOOL' | string;
  readonly targetDegree?: string;
  readonly avatarConfig?: AvatarConfig;
  readonly createdAt?: string;
}

function getStoredAvatarConfig(userId: string): AvatarConfig | undefined {
  if (typeof window === 'undefined' || !userId) return undefined;
  try {
    const stored = localStorage.getItem(`aprovaenem_avatar_${userId}`);
    if (stored) {
      return JSON.parse(stored) as AvatarConfig;
    }
  } catch {
    // Graceful fallback
  }
  return undefined;
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
  const userId = raw.id ?? raw.userId ?? '';
  let avatarConfig = getStoredAvatarConfig(userId);
  if (raw.avatarConfig) {
    if (typeof raw.avatarConfig === 'string') {
      try {
        avatarConfig = JSON.parse(raw.avatarConfig) as AvatarConfig;
      } catch {
        // Fallback to local cache
      }
    } else if (typeof raw.avatarConfig === 'object') {
      avatarConfig = raw.avatarConfig as AvatarConfig;
    }
  }

  return {
    id: userId,
    email: raw.email ?? '',
    name: raw.name ?? raw.fullName ?? '',
    roles: raw.roles && raw.roles.length > 0 ? raw.roles : [normalizeUserRole(raw.role)],
    isEmailVerified: Boolean(raw.isEmailVerified ?? raw.emailVerified),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    schoolType: raw.schoolType === 'PRIVATE_SCHOOL' ? 'PRIVATE_SCHOOL' : 'PUBLIC_SCHOOL',
    targetDegree: raw.targetDegree ?? '',
    avatarConfig,
  };
}

function normalizeAuthResponse(raw: RawBackendAuthPayload): AuthLoginResponse {
  if (raw.user) {
    return {
      token: raw.token ?? '',
      expiresInSeconds: raw.expiresInSeconds ?? 86400,
      user: raw.user,
    };
  }
  return {
    token: raw.token ?? '',
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
   * Update student personal profile details and/or password
   * Target endpoint: PUT /api/v1/auth/me
   */
  async updateProfile(req: {
    fullName?: string;
    schoolType?: 'PUBLIC_SCHOOL' | 'PRIVATE_SCHOOL';
    targetDegree?: string;
    currentPassword?: string;
    newPassword?: string;
    avatarConfig?: string;
  }): Promise<UserProfile> {
    const response = await apiClient.put<RawBackendAuthPayload>('/auth/me', req);
    return normalizeUserProfile(response.data);
  },

  /**
   * Update student subscription plan (Free vs Pro)
   * Target endpoint: PUT /api/v1/auth/me/plan
   */
  async updatePlan(plan: 'FREE' | 'PRO'): Promise<AuthLoginResponse> {
    const response = await apiClient.put<RawBackendAuthPayload>('/auth/me/plan', { plan });
    return normalizeAuthResponse(response.data);
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

  /**
   * Request password reset instructions
   * Target endpoint: POST /api/v1/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset student password using verified recovery token
   * Target endpoint: POST /api/v1/auth/reset-password
   */
  async resetPassword(req: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', req);
    return response.data;
  },

  /**
   * Verify student email address with verification token
   * Target endpoint: POST /api/v1/auth/verify-email
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const response = await apiClient.post<VerifyEmailResponse>('/auth/verify-email', { token });
    return response.data;
  },

  /**
   * Resend verification email link to student
   * Target endpoint: POST /api/v1/auth/resend-verification
   */
  async resendVerification(email: string): Promise<ResendVerificationResponse> {
    const response = await apiClient.post<ResendVerificationResponse>('/auth/resend-verification', { email });
    return response.data;
  },
};
