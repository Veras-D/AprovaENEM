/**
 * AprovaENEM Gamification Utilities & Badge Catalog
 * Level calculations, XP thresholds, level titles, and achievement badges.
 */

export type BadgeCategory =
  | 'ALL'
  | 'PROGRESSION'
  | 'SUBJECT'
  | 'STREAK_HABIT'
  | 'CHALLENGE'
  | 'SPECIAL'
  | 'STARTER'
  | 'STREAK'
  | 'ELITE'
  | 'PROTECTION';

export type BadgeTierLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface BadgeProgress {
  readonly current: number;
  readonly target: number;
  readonly unit: string;
  readonly currentTier?: BadgeTierLevel;
  readonly nextTier?: BadgeTierLevel;
}

export interface BadgeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly iconName: string;
  readonly category: BadgeCategory;
  readonly categoryLabel: string;
  readonly isProgressive?: boolean;
  readonly progress?: BadgeProgress;
}

export const BADGE_CATEGORIES: readonly {
  readonly id: BadgeCategory;
  readonly label: string;
}[] = [
  { id: 'ALL', label: 'Todas' },
  { id: 'PROGRESSION', label: 'Jornada & Volume' },
  { id: 'SUBJECT', label: 'Áreas do ENEM' },
  { id: 'STREAK_HABIT', label: 'Ofensiva & Hábito' },
  { id: 'CHALLENGE', label: 'Desafios & Precisão' },
  { id: 'SPECIAL', label: 'Especiais & IA' },
] as const;

export const BADGE_CATALOG: readonly BadgeDefinition[] = [
  // --- Grupo 1: Jornada & Volume (Progressivas com Tiers) ---
  {
    id: 'MARATONISTA_QUESTOES',
    name: 'Maratonista do ENEM',
    description: 'Resolva questões para subir de Bronze (10) até Diamante (500 questões).',
    iconName: 'Trophy',
    category: 'PROGRESSION',
    categoryLabel: 'Jornada & Volume',
    isProgressive: true,
    progress: { current: 35, target: 50, unit: 'questões', currentTier: 'BRONZE', nextTier: 'SILVER' },
  },
  {
    id: 'SIMULADOS_COMPLETOS',
    name: 'Simulado Oficial ENEM',
    description: 'Simule e complete edições oficiais do ENEM por ano e dia de aplicação com controle de tempo.',
    iconName: 'Award',
    category: 'PROGRESSION',
    categoryLabel: 'Jornada & Volume',
    isProgressive: true,
    progress: { current: 3, target: 5, unit: 'simulados', currentTier: 'BRONZE', nextTier: 'SILVER' },
  },
  {
    id: 'ESCALADA_NIVEL',
    name: 'Escalada de Nível',
    description: 'Acumule XP em simulados e avance de nível na plataforma.',
    iconName: 'TrendingUp',
    category: 'PROGRESSION',
    categoryLabel: 'Jornada & Volume',
    isProgressive: true,
    progress: { current: 3, target: 5, unit: 'nível', currentTier: 'BRONZE', nextTier: 'SILVER' },
  },

  // --- Grupo 2: Ofensiva & Hábito Diário ---
  {
    id: 'PRIMEIRA_QUESTAO',
    name: 'Primeiro Passo',
    description: 'Resolveu sua primeira questão no AprovaENEM rumo à aprovação.',
    iconName: 'CheckCircle2',
    category: 'STREAK_HABIT',
    categoryLabel: 'Ofensiva & Hábito',
    progress: { current: 1, target: 1, unit: 'questão' },
  },
  {
    id: 'STREAK_3_DIAS',
    name: 'Chama Acesa',
    description: 'Manteve uma sequência ininterrupta de 3 dias de prática.',
    iconName: 'Flame',
    category: 'STREAK_HABIT',
    categoryLabel: 'Ofensiva & Hábito',
    progress: { current: 3, target: 3, unit: 'dias' },
  },
  {
    id: 'STREAK_7_DIAS',
    name: 'Semana de Ouro',
    description: 'Pratique durante 7 dias seguidos construindo uma rotina consistente.',
    iconName: 'Zap',
    category: 'STREAK_HABIT',
    categoryLabel: 'Ofensiva & Hábito',
    progress: { current: 4, target: 7, unit: 'dias' },
  },
  {
    id: 'STREAK_30_DIAS',
    name: 'Hábito Imparável',
    description: 'Mantenha 30 dias ininterruptos de prática ativa para consolidar o ritmo do vestibular.',
    iconName: 'Flame',
    category: 'STREAK_HABIT',
    categoryLabel: 'Ofensiva & Hábito',
    progress: { current: 7, target: 30, unit: 'dias' },
  },
  {
    id: 'FIM_DE_SEMANA_ATIVO',
    name: 'Foco no Fim de Semana',
    description: 'Pratique no sábado e domingo mantendo a ofensiva de estudos sem interrupções.',
    iconName: 'Calendar',
    category: 'STREAK_HABIT',
    categoryLabel: 'Ofensiva & Hábito',
    progress: { current: 1, target: 2, unit: 'dias' },
  },

  // --- Grupo 3: Áreas do Conhecimento do ENEM (Progressivas por Matéria) ---
  {
    id: 'MESTRE_MATEMATICA',
    name: 'Mestre da Matemática',
    description: 'Acerte questões de Matemática e suas Tecnologias (MT) dominando raciocínio lógico.',
    iconName: 'Calculator',
    category: 'SUBJECT',
    categoryLabel: 'Áreas do ENEM',
    isProgressive: true,
    progress: { current: 24, target: 50, unit: 'acertos', currentTier: 'BRONZE', nextTier: 'SILVER' },
  },
  {
    id: 'MESTRE_NATUREZA',
    name: 'Cientista da Natureza',
    description: 'Acerte questões de Física, Química e Biologia (CN) aplicando o método científico.',
    iconName: 'Atom',
    category: 'SUBJECT',
    categoryLabel: 'Áreas do ENEM',
    isProgressive: true,
    progress: { current: 18, target: 50, unit: 'acertos', currentTier: 'BRONZE', nextTier: 'SILVER' },
  },
  {
    id: 'MESTRE_HUMANAS',
    name: 'Pensador Crítico',
    description: 'Acerte questões de História, Geografia, Filosofia e Sociologia (CH).',
    iconName: 'Globe',
    category: 'SUBJECT',
    categoryLabel: 'Áreas do ENEM',
    isProgressive: true,
    progress: { current: 30, target: 50, unit: 'acertos', currentTier: 'BRONZE', nextTier: 'SILVER' },
  },
  {
    id: 'MESTRE_LINGUAGENS',
    name: 'Poliglota do ENEM',
    description: 'Acerte questões de Língua Portuguesa, Literatura e Língua Estrangeira (LC).',
    iconName: 'BookOpen',
    category: 'SUBJECT',
    categoryLabel: 'Áreas do ENEM',
    isProgressive: true,
    progress: { current: 15, target: 50, unit: 'acertos', currentTier: 'BRONZE', nextTier: 'SILVER' },
  },

  // --- Grupo 4: Desafios & Precisão ---
  {
    id: 'PRECISAO_CIRURGICA',
    name: 'Precisão Cirúrgica',
    description: 'Acerte 5 questões consecutivas em uma mesma sessão sem cometer nenhum erro.',
    iconName: 'Target',
    category: 'CHALLENGE',
    categoryLabel: 'Desafios & Precisão',
    progress: { current: 3, target: 5, unit: 'acertos seguidos' },
  },
  {
    id: 'GABARITO_PERFEITO',
    name: 'Gabarito Perfeito',
    description: 'Finalize um simulado de 10 questões com 100% de aproveitamento.',
    iconName: 'Crown',
    category: 'CHALLENGE',
    categoryLabel: 'Desafios & Precisão',
    progress: { current: 8, target: 10, unit: 'acertos' },
  },
  {
    id: 'VELOCIDADE_E_FOCO',
    name: 'Gestão de Tempo ENEM',
    description: 'Responda 10 questões mantendo a média de tempo ideal do INEP (até 3 min/questão).',
    iconName: 'Clock',
    category: 'CHALLENGE',
    categoryLabel: 'Desafios & Precisão',
    progress: { current: 6, target: 10, unit: 'questões no tempo' },
  },
  {
    id: 'META_DIARIA_7',
    name: 'Semana Impecável',
    description: 'Cumpra sua meta diária de questões durante 7 dias seguidos.',
    iconName: 'CheckCheck',
    category: 'CHALLENGE',
    categoryLabel: 'Desafios & Precisão',
    progress: { current: 4, target: 7, unit: 'dias cumpridos' },
  },

  // --- Grupo 5: Especiais & IA Socrática ---
  {
    id: 'TUTOR_SOCRATICO',
    name: 'Espírito Socrático',
    description: 'Tire dúvidas conceituais e aprofunde resoluções com o Tutor IA pedagógico.',
    iconName: 'Brain',
    category: 'SPECIAL',
    categoryLabel: 'Especiais & IA',
    isProgressive: true,
    progress: { current: 8, target: 10, unit: 'dúvidas', currentTier: 'BRONZE', nextTier: 'SILVER' },
  },
  {
    id: 'PODIO_LIGA',
    name: 'Pódio da Liga',
    description: 'Termine uma rodada semanal entre os 3 primeiros colocados na sua liga.',
    iconName: 'Medal',
    category: 'SPECIAL',
    categoryLabel: 'Especiais & IA',
    progress: { current: 2, target: 3, unit: 'posição atual' },
  },
  {
    id: 'ACESSIBILIDADE_TOTAL',
    name: 'Inclusão & Acessibilidade',
    description: 'Personalize seus recursos inclusivos (VLibras, Leitor por Voz, Alto Contraste ou Régua).',
    iconName: 'Sparkles',
    category: 'SPECIAL',
    categoryLabel: 'Especiais & IA',
    progress: { current: 0, target: 1, unit: 'recurso utilizado' },
  },
  {
    id: 'NOTA_1000',
    name: 'Rumo à Nota 1000',
    description: 'Alcance o Nível 20 multidisciplinar consolidando o domínio de todas as áreas do ENEM.',
    iconName: 'GraduationCap',
    category: 'SPECIAL',
    categoryLabel: 'Especiais & IA',
    progress: { current: 3, target: 20, unit: 'nível' },
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
