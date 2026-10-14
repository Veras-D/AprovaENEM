import type { TenantConfig } from './types';

export const DEFAULT_TENANT: TenantConfig = {
  id: 'tenant-aprovaenem-default',
  slug: 'aprovaenem',
  name: 'AprovaENEM',
  shortName: 'AprovaENEM',
  tagline: 'Democratizando o Acesso ao Ensino Superior Público',
  logoUrl: '/favicon.svg',
  faviconUrl: '/favicon.svg',
  supportEmail: 'suporte@aprovaenem.org',
  allowedDomains: ['localhost', '127.0.0.1'],
  theme: {
    primaryColor: '#0284c7', // Sky-600
    primaryDarkColor: '#0369a1', // Sky-700
    secondaryColor: '#0f172a', // Slate-900
    accentColor: '#f59e0b', // Amber-500
    surfaceColor: '#ffffff',
    surfaceDarkColor: '#090d16',
    borderRadius: '0.5rem',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  features: {
    socraticAiEnabled: true,
    gamificationEnabled: true,
    leaderboardEnabled: true,
    diagnosticRadarEnabled: true,
    institutionalAnalyticsEnabled: false,
  },
};
