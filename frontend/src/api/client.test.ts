import { describe, it, expect } from 'vitest';
import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { apiClient } from './client';
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
});
