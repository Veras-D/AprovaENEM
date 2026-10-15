/**
 * AprovaENEM Gamification Utilities & Badge Catalog
 * Level calculations, XP thresholds, level titles, and achievement badges.
 */

export interface BadgeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly iconName: string;
  readonly category: 'STARTER' | 'STREAK' | 'SUBJECT' | 'ELITE' | 'PROTECTION';
}

export const BADGE_CATALOG: readonly BadgeDefinition[] = [
  {
    id: 'PRIMEIRA_QUESTAO',
    name: 'Primeiro Passo',
    description: 'Resolveu sua primeira questão no AprovaENEM.',
    iconName: 'CheckCircle2',
    category: 'STARTER',
  },
  {
    id: 'STREAK_3_DIAS',
    name: 'Chama Acesa',
    description: 'Manteve uma sequência ininterrupta de 3 dias de prática.',
    iconName: 'Flame',
    category: 'STREAK',
  },
  {
    id: 'STREAK_7_DIAS',
    name: 'Semana de Ouro',
    description: 'Praticou durante 7 dias seguidos rumo à aprovação.',
    iconName: 'Zap',
    category: 'STREAK',
  },
  {
    id: 'MESTRE_MATEMATICA',
    name: 'Mestre da Matemática',
    description: 'Completou questões e dominou fórmulas de Matemática (MT).',
    iconName: 'Calculator',
    category: 'SUBJECT',
  },
  {
    id: 'MESTRE_NATUREZA',
    name: 'Cientista da Natureza',
    description: 'Acertou questões de Física, Química e Biologia (CN).',
    iconName: 'Atom',
    category: 'SUBJECT',
  },
  {
    id: 'MESTRE_HUMANAS',
    name: 'Pensador Crítico',
    description: 'Demonstrou análise histórica e social em Ciências Humanas (CH).',
    iconName: 'Globe',
    category: 'SUBJECT',
  },
  {
    id: 'MESTRE_LINGUAGENS',
    name: 'Poliglota do ENEM',
    description: 'Dominou interpretação textual e gêneros em Linguagens (LC).',
    iconName: 'BookOpen',
    category: 'SUBJECT',
  },
  {
    id: 'ESCUDO_ATIVADO',
    name: 'Imunidade Criogênica',
    description: 'Utilizou o escudo de congelamento de streak para proteger seu progresso.',
    iconName: 'Shield',
    category: 'PROTECTION',
  },
  {
    id: 'NOTA_1000',
    name: 'Rumo à Nota 1000',
    description: 'Alcançou o nível 20 demonstrando excelência multidisciplinar.',
    iconName: 'Crown',
    category: 'ELITE',
  },
] as const;

/**
 * Returns human-readable level title based on student level.
 * Synchronized with backend UserGamificationProfile.java.
 */
export function getLevelTitle(level: number): string {
  if (level <= 4) {
    return 'Calouro Iniciante';
  } else if (level <= 9) {
    return 'Focado no SISU';
  } else if (level <= 19) {
    return 'Mestre dos Simulados';
  } else {
    return 'Nota 1000';
  }
}

/**
 * Computes XP thresholds and percentage progress for the current level.
 * Each level requires 200 XP.
 */
export function calculateLevelProgress(currentXp: number, currentLevel: number): {
  readonly currentLevel: number;
  readonly baseLevelXp: number;
  readonly xpNextLevel: number;
  readonly xpInCurrentLevel: number;
  readonly xpNeededForNextLevel: number;
  readonly progressPercentage: number;
  readonly levelTitle: string;
  readonly nextLevelTitle: string;
} {
  const level = Math.max(1, currentLevel);
  const baseLevelXp = (level - 1) * 200;
  const xpNextLevel = level * 200;
  const xpInCurrentLevel = Math.max(0, currentXp - baseLevelXp);
  const xpNeededForNextLevel = Math.max(0, xpNextLevel - currentXp);
  const rawProgress = (xpInCurrentLevel / 200) * 100;
  const progressPercentage = Math.min(100, Math.max(0, Math.round(rawProgress * 10) / 10));

  return {
    currentLevel: level,
    baseLevelXp,
    xpNextLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage,
    levelTitle: getLevelTitle(level),
    nextLevelTitle: getLevelTitle(level + 1),
  };
}

/**
 * Formats XP with thousands separators (e.g. 1.250 XP).
 */
export function formatXp(xp: number): string {
  return `${xp.toLocaleString('pt-BR')} XP`;
}
