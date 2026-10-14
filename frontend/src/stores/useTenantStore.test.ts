import { describe, it, expect, beforeEach } from 'vitest';
import { useTenantStore } from './useTenantStore';
import { DEFAULT_TENANT } from '@/tenants/default';
import type { TenantConfig } from '@/tenants/types';

describe('useTenantStore', () => {
  beforeEach(() => {
    useTenantStore.getState().resetToDefault();
  });

  it('should initialize with DEFAULT_TENANT', () => {
    const state = useTenantStore.getState();
    expect(state.currentTenant.id).toBe(DEFAULT_TENANT.id);
    expect(state.isLoaded).toBe(true);
  });

  it('should set tenant and update theme variables', () => {
    const customTenant: TenantConfig = {
      ...DEFAULT_TENANT,
      id: 'tenant-custom',
      slug: 'custom-school',
      name: 'Custom School',
      theme: {
        ...DEFAULT_TENANT.theme,
        primaryColor: '#16a34a',
      },
    };

    useTenantStore.getState().setTenant(customTenant);

    const state = useTenantStore.getState();
    expect(state.currentTenant.id).toBe('tenant-custom');
    expect(state.currentTenant.name).toBe('Custom School');
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#16a34a');
  });

  it('should reset back to default tenant', () => {
    const customTenant: TenantConfig = {
      ...DEFAULT_TENANT,
      id: 'tenant-custom',
      slug: 'custom-school',
      name: 'Custom School',
    };

    useTenantStore.getState().setTenant(customTenant);
    expect(useTenantStore.getState().currentTenant.id).toBe('tenant-custom');

    useTenantStore.getState().resetToDefault();
    expect(useTenantStore.getState().currentTenant.id).toBe(DEFAULT_TENANT.id);
  });
});
