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
    theme: {
      ...DEFAULT_TENANT.theme,
      primaryColor: '#15803d', // Emerald-700
      primaryDarkColor: '#166534', // Emerald-800
      accentColor: '#eab308',
    },
  },
  {
    ...DEFAULT_TENANT,
    id: 'tenant-seduc-sp',
    slug: 'seduc-sp',
    name: 'Secretaria da Educação SP',
    shortName: 'SEDUC-SP',
    tagline: 'Rede Pública Estadual de Ensino de São Paulo',
    theme: {
      ...DEFAULT_TENANT.theme,
      primaryColor: '#7c3aed', // Violet-600
      primaryDarkColor: '#6d28d9', // Violet-700
      accentColor: '#f97316',
    },
  },
  {
    ...DEFAULT_TENANT,
    id: 'tenant-instituto-federal',
    slug: 'instituto-federal',
    name: 'Instituto Federal (IF)',
    shortName: 'IF',
    tagline: 'Educação Profissional, Científica e Tecnológica',
    theme: {
      ...DEFAULT_TENANT.theme,
      primaryColor: '#dc2626', // Red-600
      primaryDarkColor: '#b91c1c', // Red-700
      accentColor: '#16a34a',
    },
  },
  {
    ...DEFAULT_TENANT,
    id: 'tenant-positivo',
    slug: 'colegio-positivo',
    name: 'Colégio Positivo',
    shortName: 'Positivo',
    tagline: 'Preparação Forte para os Melhores Resultados',
    theme: {
      ...DEFAULT_TENANT.theme,
      primaryColor: '#d97706', // Amber-600
      primaryDarkColor: '#b45309', // Amber-700
      accentColor: '#0284c7',
    },
  },
];
