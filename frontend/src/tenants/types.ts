/**
 * White-Label B2B Multi-Tenant Type Specifications
 */

export interface TenantThemeTokens {
  readonly primaryColor: string;
  readonly primaryDarkColor: string;
  readonly secondaryColor: string;
  readonly accentColor: string;
  readonly surfaceColor: string;
  readonly surfaceDarkColor: string;
  readonly borderRadius: string;
  readonly fontFamily: string;
}

export interface TenantFeatureFlags {
  readonly socraticAiEnabled: boolean;
  readonly gamificationEnabled: boolean;
  readonly leaderboardEnabled: boolean;
  readonly diagnosticRadarEnabled: boolean;
  readonly institutionalAnalyticsEnabled: boolean;
}

export interface TenantConfig {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly shortName: string;
  readonly tagline: string;
  readonly logoUrl: string;
  readonly logoDarkUrl?: string;
  readonly faviconUrl: string;
  readonly supportEmail: string;
  readonly allowedDomains: readonly string[];
  readonly theme: TenantThemeTokens;
  readonly features: TenantFeatureFlags;
}
