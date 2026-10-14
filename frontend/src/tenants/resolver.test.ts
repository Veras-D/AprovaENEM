import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  resolveTenantIdentifier,
  resolveTenantConfig,
  TENANT_CACHE_PREFIX,
  TENANT_CACHE_TTL_MS,
  type RemoteTenantFetcher,
} from './resolver';
import { DEFAULT_TENANT } from './default';
import { TENANT_PRESETS } from './presets';
import type { TenantConfig } from './types';

describe('resolver.ts — Hierarchical Tenant Resolution Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('resolveTenantIdentifier', () => {
    it('Tier 1a: should resolve from query parameter ?tenant=slug', () => {
      const result = resolveTenantIdentifier({
        search: '?tenant=seduc-sp',
        pathname: '/',
        hostname: 'aprovaenem.org',
      });
      expect(result).toEqual({ tier: 'query', identifier: 'seduc-sp' });
    });

    it('Tier 1b: should resolve from route path /t/:slug', () => {
      const result = resolveTenantIdentifier({
        search: '',
        pathname: '/t/colegio-positivo/simulados',
        hostname: 'aprovaenem.org',
      });
      expect(result).toEqual({ tier: 'path', identifier: 'colegio-positivo' });
    });

    it('Tier 1 priority: query param should take precedence over route path', () => {
      const result = resolveTenantIdentifier({
        search: '?tenant=instituto-federal',
        pathname: '/t/colegio-positivo',
        hostname: 'aprovaenem.org',
      });
      expect(result).toEqual({ tier: 'query', identifier: 'instituto-federal' });
    });

    it('Tier 2: should resolve subdomain on platform domains (*.aprovaenem.org)', () => {
      const result = resolveTenantIdentifier({
        search: '',
        pathname: '/',
        hostname: 'colegio-bandeirantes.aprovaenem.org',
      });
      expect(result).toEqual({ tier: 'subdomain', identifier: 'colegio-bandeirantes' });
    });

    it('Tier 2: should resolve subdomain on localhost (*.localhost)', () => {
      const result = resolveTenantIdentifier({
        search: '',
        pathname: '/',
        hostname: 'alfa.localhost',
      });
      expect(result).toEqual({ tier: 'subdomain', identifier: 'alfa' });
    });

    it('Tier 2: should ignore system subdomains (www, api, gateway)', () => {
      const resultWww = resolveTenantIdentifier({
        search: '',
        pathname: '/',
        hostname: 'www.aprovaenem.com.br',
      });
      expect(resultWww).toEqual({ tier: 'default', identifier: DEFAULT_TENANT.slug });

      const resultApi = resolveTenantIdentifier({
        search: '',
        pathname: '/',
        hostname: 'api.aprovaenem.org',
      });
      expect(resultApi).toEqual({ tier: 'default', identifier: DEFAULT_TENANT.slug });
    });

    it('Tier 3: should resolve custom CNAME domains', () => {
      const result = resolveTenantIdentifier({
        search: '',
        pathname: '/',
        hostname: 'simulado.colegioelite.com.br',
      });
      expect(result).toEqual({ tier: 'cname', identifier: 'simulado.colegioelite.com.br' });
    });

    it('Tier 4: should fallback to default tenant on platform root domains or empty context', () => {
      const resultRoot = resolveTenantIdentifier({
        hostname: 'aprovaenem.com.br',
      });
      expect(resultRoot).toEqual({ tier: 'default', identifier: DEFAULT_TENANT.slug });

      const resultLocalhost = resolveTenantIdentifier({
        hostname: 'localhost',
      });
      expect(resultLocalhost).toEqual({ tier: 'default', identifier: DEFAULT_TENANT.slug });

      const resultEmpty = resolveTenantIdentifier({});
      expect(resultEmpty).toEqual({ tier: 'default', identifier: DEFAULT_TENANT.slug });
    });
  });

  describe('resolveTenantConfig', () => {
    it('should return DEFAULT_TENANT directly for default slugs', async () => {
      const config1 = await resolveTenantConfig('aprovaenem');
      expect(config1).toEqual(DEFAULT_TENANT);

      const config2 = await resolveTenantConfig('default');
      expect(config2).toEqual(DEFAULT_TENANT);
    });

    it('should return matching preset configuration without remote fetch', async () => {
      const mockFetcher = vi.fn();
      const config = await resolveTenantConfig('colegio-bandeirantes', mockFetcher);

      const expectedPreset = TENANT_PRESETS.find((p) => p.slug === 'colegio-bandeirantes');
      expect(config).toEqual(expectedPreset);
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    it('should retrieve cached tenant from localStorage if within TTL', async () => {
      const mockCustomTenant: TenantConfig = {
        ...DEFAULT_TENANT,
        id: 'tenant-custom-cached',
        slug: 'escola-futuro',
        name: 'Escola do Futuro',
      };

      localStorage.setItem(
        `${TENANT_CACHE_PREFIX}escola-futuro`,
        JSON.stringify({
          tenant: mockCustomTenant,
          cachedAt: Date.now() - 1000 * 60, // 1 minute ago
        })
      );

      const mockFetcher = vi.fn();
      const config = await resolveTenantConfig('escola-futuro', mockFetcher);

      expect(config).toEqual(mockCustomTenant);
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    it('should invoke remote fetcher and cache result when cache is expired', async () => {
      const mockFetchedTenant: TenantConfig = {
        ...DEFAULT_TENANT,
        id: 'tenant-remote-123',
        slug: 'escola-remota',
        name: 'Escola Remota',
      };

      // Set expired cache (older than 24h)
      localStorage.setItem(
        `${TENANT_CACHE_PREFIX}escola-remota`,
        JSON.stringify({
          tenant: mockFetchedTenant,
          cachedAt: Date.now() - (TENANT_CACHE_TTL_MS + 5000),
        })
      );

      const mockFetcher: RemoteTenantFetcher = vi.fn().mockResolvedValue(mockFetchedTenant);
      const config = await resolveTenantConfig('escola-remota', mockFetcher);

      expect(config).toEqual(mockFetchedTenant);
      expect(mockFetcher).toHaveBeenCalledWith('escola-remota');

      // Check updated cache
      const cachedRaw = localStorage.getItem(`${TENANT_CACHE_PREFIX}escola-remota`);
      expect(cachedRaw).not.toBeNull();
      const cached = JSON.parse(cachedRaw!);
      expect(cached.tenant.id).toBe('tenant-remote-123');
    });

    it('should invoke remote fetcher when no cache exists and cache the result', async () => {
      const mockFetchedTenant: TenantConfig = {
        ...DEFAULT_TENANT,
        id: 'tenant-novo',
        slug: 'colegio-novo',
        name: 'Colégio Novo',
      };

      const mockFetcher: RemoteTenantFetcher = vi.fn().mockResolvedValue(mockFetchedTenant);
      const config = await resolveTenantConfig('colegio-novo', mockFetcher);

      expect(config).toEqual(mockFetchedTenant);
      expect(mockFetcher).toHaveBeenCalledWith('colegio-novo');

      const cachedRaw = localStorage.getItem(`${TENANT_CACHE_PREFIX}colegio-novo`);
      expect(cachedRaw).not.toBeNull();
    });

    it('should fallback gracefully to DEFAULT_TENANT when remote fetcher rejects', async () => {
      const mockFetcher: RemoteTenantFetcher = vi.fn().mockRejectedValue(new Error('Network error 500'));
      const config = await resolveTenantConfig('non-existent-tenant', mockFetcher);

      expect(config).toEqual(DEFAULT_TENANT);
    });
  });
});
