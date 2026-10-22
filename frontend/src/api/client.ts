import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useTenantStore } from '@/stores/useTenantStore';
import type { ApiProblemDetails } from '@/types';

/**
 * Standardized API Error wrapping RFC 7807 problem details
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly problemDetails?: ApiProblemDetails;
  readonly retryAfterSeconds?: number;

  constructor(status: number, message: string, problemDetails?: ApiProblemDetails, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problemDetails = problemDetails;
    this.code = problemDetails?.code || problemDetails?.title;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * BFF API Client SDK
 * Strictly targets `frontend-api` via relative `/api/v1` base route.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  const anonymousSessionId = useSessionStore.getState().anonymousSessionId;
  if (anonymousSessionId) {
    config.headers.set('X-Session-Id', anonymousSessionId);
  }

  const currentTenant = useTenantStore.getState().currentTenant;
  if (currentTenant) {
    config.headers.set('X-Tenant-Id', currentTenant.slug);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiProblemDetails>) => {
    const status = error.response?.status || 500;
    const data = error.response?.data;

    // Read Rate Limit Retry-After if present
    const retryHeader = error.response?.headers['retry-after'];
    const retryAfterSeconds = retryHeader ? parseInt(retryHeader, 10) : undefined;

    // Handle 401 Unauthorized
    if (status === 401) {
      useAuthStore.getState().clearAuth();
    }

    const message =
      data?.detail || data?.message || data?.title || error.message || 'An unexpected error occurred.';
    return Promise.reject(new ApiError(status, message, data, retryAfterSeconds));
  }
);
