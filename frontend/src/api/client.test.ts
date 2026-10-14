import { describe, it, expect } from 'vitest';
import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { apiClient, ApiError } from './client';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTenantStore } from '@/stores/useTenantStore';

describe('apiClient', () => {
  it('should be configured with default baseURL and JSON headers', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    expect(apiClient.defaults.headers['Accept']).toBe('application/json');
    expect(apiClient.defaults.timeout).toBe(15000);
  });

  it('should intercept requests and attach Authorization and tenant headers', async () => {
    useAuthStore.getState().setAuth('test-token', {
      id: 'usr-1',
      email: 'test@example.com',
      name: 'Test',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      createdAt: '2026-10-14T00:00:00Z',
    });

    const tenant = useTenantStore.getState().currentTenant;

    const config: InternalAxiosRequestConfig = {
      headers: new AxiosHeaders(),
    };

    // @ts-expect-error accessing internal interceptor handler for unit testing
    const requestInterceptor = apiClient.interceptors.request.handlers[0]?.fulfilled;

    if (requestInterceptor) {
      const processedConfig = (await requestInterceptor(config)) as InternalAxiosRequestConfig;
      expect(processedConfig.headers.get('Authorization')).toBe('Bearer test-token');
      expect(processedConfig.headers.get('X-Tenant-Id')).toBe(tenant.slug);
      expect(processedConfig.headers.get('X-Session-Id')).toBeDefined();
    }
  });

  it('should instantiate ApiError with RFC 7807 problem details and retry-after', () => {
    const problem = {
      title: 'Too Many Requests',
      status: 429,
      detail: 'Daily Socratic quota exhausted (1 free question/day).',
      code: 'DAILY_AI_QUOTA_EXHAUSTED',
    };

    const error = new ApiError(429, problem.detail, problem, 60);

    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(429);
    expect(error.code).toBe('DAILY_AI_QUOTA_EXHAUSTED');
    expect(error.message).toBe(problem.detail);
    expect(error.retryAfterSeconds).toBe(60);
    expect(error.problemDetails).toEqual(problem);
  });

  it('should clear auth store when response interceptor receives 401', async () => {
    useAuthStore.getState().setAuth('test-token', {
      id: 'usr-1',
      email: 'test@example.com',
      name: 'Test',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      createdAt: '2026-10-14T00:00:00Z',
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // @ts-expect-error accessing internal response interceptor handler for unit testing
    const responseReject = apiClient.interceptors.response.handlers[0]?.rejected;

    if (responseReject) {
      const mockAxiosError = {
        message: 'Unauthorized',
        response: {
          status: 401,
          headers: {},
          data: {
            title: 'Unauthorized',
            status: 401,
            detail: 'Full authentication is required.',
          },
        },
      };

      try {
        await responseReject(mockAxiosError);
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).status).toBe(401);
      }

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().token).toBeNull();
    }
  });
});
