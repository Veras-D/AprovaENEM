import type { TenantConfig } from './types';
import { DEFAULT_TENANT } from './default';
import { TENANT_PRESETS } from './presets';
import { tenantService } from '@/api/services/tenant.service';

export type ResolutionTier = 'query' | 'path' | 'subdomain' | 'cname' | 'default';

export interface TenantResolutionResult {
  readonly tier: ResolutionTier;
  readonly identifier: string;
}

interface CachedTenantEntry {
  readonly tenant: TenantConfig;
  readonly cachedAt: number;
}

export const TENANT_CACHE_PREFIX = 'aprovaenem_tenant_cache_';
export const TENANT_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export interface WindowLocationContext {
  readonly search?: string;
  readonly pathname?: string;
  readonly hostname?: string;
}

const PLATFORM_DOMAINS = [
  'aprovaenem.com.br',
  'aprovaenem.org',
  'aprovaenem.com',
  'localhost',
];

/**
 * 4-Tier Hierarchical Tenant Resolution Strategy:
 * Tier 1: Query param (?tenant=slug) or Route path (/t/:slug)
 * Tier 2: Subdomain matching ({tenant}.domain.com or {tenant}.localhost)
 * Tier 3: Custom CNAME lookup (simulado.escola.com.br)
 * Tier 4: Default platform fallback (DEFAULT_TENANT)
 */
export function resolveTenantIdentifier(
  loc: WindowLocationContext = typeof window !== 'undefined' ? window.location : {}
): TenantResolutionResult {
  const search = loc.search || '';
  const pathname = loc.pathname || '';
  const hostname = (loc.hostname || '').toLowerCase();

  // Tier 1a: Query parameter ?tenant=slug
  const queryParams = new URLSearchParams(search);
  const queryTenant = queryParams.get('tenant')?.trim();
  if (queryTenant) {
    return { tier: 'query', identifier: queryTenant };
  }

  // Tier 1b: Route path /t/:slug
  const pathMatch = pathname.match(/^\/t\/([a-zA-Z0-9_-]+)/);
  if (pathMatch && pathMatch[1]) {
    return { tier: 'path', identifier: pathMatch[1] };
  }

  // Tier 2: Subdomain extraction for platform domains
  for (const domain of PLATFORM_DOMAINS) {
    if (hostname.endsWith(`.${domain}`)) {
      const subdomain = hostname.slice(0, -(domain.length + 1));
      if (
        subdomain &&
        subdomain !== 'www' &&
        subdomain !== 'api' &&
        subdomain !== 'gateway'
      ) {
        return { tier: 'subdomain', identifier: subdomain };
      }
    }
  }

  // Tier 3: Custom Domain / CNAME (any non-platform domain)
  const isPlatformDomain =
    PLATFORM_DOMAINS.includes(hostname) ||
    PLATFORM_DOMAINS.some((d) => hostname.endsWith(`.${d}`)) ||
    hostname === '127.0.0.1' ||
    hostname === '';

  if (hostname && !isPlatformDomain) {
    return { tier: 'cname', identifier: hostname };
  }

  // Tier 4: Default fallback
  return { tier: 'default', identifier: DEFAULT_TENANT.slug };
}

export type RemoteTenantFetcher = (identifier: string) => Promise<TenantConfig>;

export const defaultRemoteTenantFetcher: RemoteTenantFetcher = async (identifier: string) => {
  const remoteDto = await tenantService.getTenantBranding(identifier);
  return {
    id: remoteDto.tenantId,
    slug: remoteDto.slug,
    name: remoteDto.name,
    shortName: remoteDto.shortName,
    tagline: remoteDto.tagline,
    logoUrl: remoteDto.logoUrl,
    faviconUrl: remoteDto.faviconUrl,
    supportEmail: 'suporte@aprovaenem.org',
    allowedDomains: [identifier],
    theme: remoteDto.theme,
    features: remoteDto.features,
  };
};

/**
 * Resolves full TenantConfig with 24-hour localStorage caching and preset fallbacks.
 */
export async function resolveTenantConfig(
  identifier: string,
  remoteFetcher: RemoteTenantFetcher = defaultRemoteTenantFetcher
): Promise<TenantConfig> {
  const normalizedId = identifier.toLowerCase().trim();

  // 1. Direct match with DEFAULT_TENANT
  if (
    normalizedId === DEFAULT_TENANT.slug ||
    normalizedId === DEFAULT_TENANT.id ||
    normalizedId === 'default' ||
    DEFAULT_TENANT.allowedDomains.includes(normalizedId)
  ) {
    return DEFAULT_TENANT;
  }

  // 2. Direct match with built-in presets (e.g. 'colegio-bandeirantes', 'seduc-sp')
  const presetMatch = TENANT_PRESETS.find(
    (p) =>
      p.slug.toLowerCase() === normalizedId ||
      p.id.toLowerCase() === normalizedId ||
      p.allowedDomains.some((d) => d.toLowerCase() === normalizedId)
  );
  if (presetMatch) {
    return presetMatch;
  }

  // 3. LocalStorage Cache Inspection (sub-10ms repeat load, zero FOUC)
  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem(`${TENANT_CACHE_PREFIX}${normalizedId}`);
      if (cached) {
        const entry = JSON.parse(cached) as CachedTenantEntry;
        if (Date.now() - entry.cachedAt < TENANT_CACHE_TTL_MS) {
          return entry.tenant;
        }
      }
    } catch {
      // LocalStorage read error or corrupt JSON, proceed to remote fetch
    }
  }

  // 4. Remote API Fetch
  try {
    const tenant = await remoteFetcher(normalizedId);

    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const entry: CachedTenantEntry = { tenant, cachedAt: Date.now() };
        localStorage.setItem(`${TENANT_CACHE_PREFIX}${normalizedId}`, JSON.stringify(entry));
      } catch {
        // LocalStorage quota or access error
      }
    }

    return tenant;
  } catch {
    // Remote fetch failed, fallback to DEFAULT_TENANT
  }

  return DEFAULT_TENANT;
}
