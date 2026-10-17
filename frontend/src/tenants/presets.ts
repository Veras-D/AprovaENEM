import type { TenantConfig } from './types';
import { DEFAULT_TENANT } from './default';

export const TENANT_PRESETS: readonly TenantConfig[] = [
  DEFAULT_TENANT,
  {
    ...DEFAULT_TENANT,
    id: 'tenant-bandeirantes',
    slug: 'colegio-bandeirantes',
    name: 'Colégio Bandeirantes',
    shortName: 'Bandeirantes',
    tagline: 'Excelência Acadêmica e Formação Integral',
    logoUrl: '/tenants/bandeirantes.svg',
    faviconUrl: '/tenants/bandeirantes.svg',
    supportEmail: 'enem@colband.com.br',
    theme: {
      ...DEFAULT_TENANT.theme,
      primaryColor: '#15803d', // Emerald-700
      primaryDarkColor: '#166534', // Emerald-800
      secondaryColor: '#14532d', // Emerald-900
      accentColor: '#eab308', // Gold-500
      surfaceColor: '#f8fafc',
      surfaceDarkColor: '#051c10',
      borderRadius: '0.375rem',
      fontFamily: 'Merriweather, Georgia, "Times New Roman", serif',
    },
  },
  {
    ...DEFAULT_TENANT,
    id: 'tenant-seduc-sp',
    slug: 'seduc-sp',
    name: 'Secretaria da Educação SP',
    shortName: 'SEDUC-SP',
    tagline: 'Rede Pública Estadual de Ensino de São Paulo',
    logoUrl: '/tenants/seduc-sp.svg',
    faviconUrl: '/tenants/seduc-sp.svg',
    supportEmail: 'suporte.enem@educacao.sp.gov.br',
    theme: {
      ...DEFAULT_TENANT.theme,
      primaryColor: '#7c3aed', // Violet-600
      primaryDarkColor: '#6d28d9', // Violet-700
      secondaryColor: '#312e81', // Indigo-900
      accentColor: '#f97316', // Orange-500
      surfaceColor: '#ffffff',
      surfaceDarkColor: '#0d0b1a',
      borderRadius: '0.5rem',
      fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  },
  {
    ...DEFAULT_TENANT,
    id: 'tenant-instituto-federal',
    slug: 'instituto-federal',
    name: 'Instituto Federal (IF)',
    shortName: 'IF',
    tagline: 'Educação Profissional, Científica e Tecnológica',
    logoUrl: '/tenants/instituto-federal.svg',
    faviconUrl: '/tenants/instituto-federal.svg',
    supportEmail: 'acesso.enem@ifsp.edu.br',
    theme: {
      ...DEFAULT_TENANT.theme,
      primaryColor: '#dc2626', // Red-600
      primaryDarkColor: '#b91c1c', // Red-700
      secondaryColor: '#16a34a', // Emerald-600
      accentColor: '#22c55e', // Green-500
      surfaceColor: '#ffffff',
      surfaceDarkColor: '#110909',
      borderRadius: '0.25rem',
      fontFamily: 'Ubuntu, "Lucida Grande", system-ui, sans-serif',
    },
  },
  {
    ...DEFAULT_TENANT,
    id: 'tenant-positivo',
    slug: 'colegio-positivo',
    name: 'Colégio Positivo',
    shortName: 'Positivo',
    tagline: 'Preparação Forte para os Melhores Resultados',
    logoUrl: '/tenants/positivo.svg',
    faviconUrl: '/tenants/positivo.svg',
    supportEmail: 'preparatorio.enem@positivo.com.br',
    theme: {
      ...DEFAULT_TENANT.theme,
      primaryColor: '#d97706', // Amber-600
      primaryDarkColor: '#b45309', // Amber-700
      secondaryColor: '#1e3a8a', // Blue-900
      accentColor: '#0284c7', // Sky-600
      surfaceColor: '#ffffff',
      surfaceDarkColor: '#151006',
      borderRadius: '0.75rem',
      fontFamily: 'Poppins, Montserrat, -apple-system, sans-serif',
    },
  },
];
