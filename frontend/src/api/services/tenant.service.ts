import { apiClient } from '../client';
import type { TenantBrandingDto } from '../types';

export const tenantService = {
  /**
   * Retrieve dynamic white-label branding configuration for active or specified tenant
   * Target endpoint: GET /api/v1/tenants/branding
   */
  async getTenantBranding(tenantSlug?: string): Promise<TenantBrandingDto> {
    const response = await apiClient.get<TenantBrandingDto>('/tenants/branding', {
      params: tenantSlug ? { slug: tenantSlug } : undefined,
    });
    return response.data;
  },
};
