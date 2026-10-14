import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useTenantStore } from '@/stores/useTenantStore';

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
    config.headers.Authorization = `Bearer ${token}`;
  }

  const anonymousSessionId = useSessionStore.getState().anonymousSessionId;
  if (anonymousSessionId) {
    config.headers['X-Session-Id'] = anonymousSessionId;
  }

  const currentTenant = useTenantStore.getState().currentTenant;
  if (currentTenant) {
    config.headers['X-Tenant-Id'] = currentTenant.slug;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);
