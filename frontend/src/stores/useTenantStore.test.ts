import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTenantStore } from './useTenantStore';
import { DEFAULT_TENANT } from '@/tenants/default';
import type { TenantConfig } from '@/tenants/types';

describe('useTenantStore', () => {
  beforeEach(() => {
    useTenantStore.getState().resetToDefault();
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-high-contrast');
    document.documentElement.removeAttribute('data-dyslexic-font');
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize with DEFAULT_TENANT', () => {
    const state = useTenantStore.getState();
    expect(state.currentTenant.id).toBe(DEFAULT_TENANT.id);
    expect(state.isLoaded).toBe(true);
    expect(state.isDarkMode).toBe(false);
    expect(state.isHighContrast).toBe(false);
    expect(state.isDyslexicFont).toBe(false);
    expect(state.resolutionTier).toBe('default');
  });

  it('should set tenant and update theme variables and document metadata', () => {
    const customTenant: TenantConfig = {
      ...DEFAULT_TENANT,
      id: 'tenant-custom',
      slug: 'custom-school',
      name: 'Custom School',
      tagline: 'Leading education',
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
    expect(document.title).toContain('Custom School');
  });

  it('should toggle dark mode on and off', () => {
    expect(useTenantStore.getState().isDarkMode).toBe(false);

    useTenantStore.getState().toggleDarkMode();
    expect(useTenantStore.getState().isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    useTenantStore.getState().toggleDarkMode();
    expect(useTenantStore.getState().isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should toggle high contrast and dyslexic font modes', () => {
    useTenantStore.getState().toggleHighContrast();
    expect(useTenantStore.getState().isHighContrast).toBe(true);
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');

    useTenantStore.getState().toggleDyslexicFont();
    expect(useTenantStore.getState().isDyslexicFont).toBe(true);
    expect(document.documentElement.getAttribute('data-dyslexic-font')).toBe('true');
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
    expect(useTenantStore.getState().resolutionTier).toBe('default');
  });

  it('should resolve and apply tenant from location context', async () => {
    const tenant = await useTenantStore.getState().resolveAndApplyTenant({
      search: '?tenant=seduc-sp',
    });

    expect(tenant.slug).toBe('seduc-sp');
    const state = useTenantStore.getState();
    expect(state.currentTenant.slug).toBe('seduc-sp');
    expect(state.resolutionTier).toBe('query');
    expect(document.title).toContain('Secretaria da Educação SP');
  });

  it('should resolve custom tenant with remote fetcher in resolveAndApplyTenant', async () => {
    const mockRemoteTenant: TenantConfig = {
      ...DEFAULT_TENANT,
      id: 'tenant-custom-remote',
      slug: 'colegio-dynamo',
      name: 'Colégio Dynamo',
      theme: {
        ...DEFAULT_TENANT.theme,
        primaryColor: '#059669',
      },
    };

    const mockFetcher = vi.fn().mockResolvedValue(mockRemoteTenant);

    const tenant = await useTenantStore.getState().resolveAndApplyTenant(
      { search: '?tenant=colegio-dynamo' },
      mockFetcher
    );

    expect(tenant.slug).toBe('colegio-dynamo');
    expect(useTenantStore.getState().currentTenant.id).toBe('tenant-custom-remote');
    expect(useTenantStore.getState().resolutionTier).toBe('query');
    expect(mockFetcher).toHaveBeenCalledWith('colegio-dynamo');
  });
});
