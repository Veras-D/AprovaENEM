import { create } from 'zustand';
import type { TenantConfig } from '@/tenants/types';
import { DEFAULT_TENANT } from '@/tenants/default';
import { applyTenantTheme } from '@/tenants/theme-loader';

interface TenantState {
  readonly currentTenant: TenantConfig;
  readonly isLoaded: boolean;
  readonly setTenant: (tenant: TenantConfig) => void;
  readonly resetToDefault: () => void;
}

export const useTenantStore = create<TenantState>((set) => {
  // Apply initial default theme
  if (typeof window !== 'undefined') {
    applyTenantTheme(DEFAULT_TENANT.theme);
  }

  return {
    currentTenant: DEFAULT_TENANT,
    isLoaded: true,
    setTenant: (tenant: TenantConfig) => {
      applyTenantTheme(tenant.theme);
      set({ currentTenant: tenant, isLoaded: true });
    },
    resetToDefault: () => {
      applyTenantTheme(DEFAULT_TENANT.theme);
      set({ currentTenant: DEFAULT_TENANT, isLoaded: true });
    },
  };
});
