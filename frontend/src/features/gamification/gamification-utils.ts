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

export interface BadgeTierConfig {
  readonly tier: BadgeTierLevel;
  readonly label: string;
  readonly shortLabel: string;
  readonly target: number;
  readonly description?: string;
}

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
  readonly tiers?: readonly BadgeTierConfig[];
}

export interface VisibleBadgeItem {
  readonly id: string;
  readonly baseId: string;
  readonly name: string;
  readonly description: string;
  readonly iconName: string;
  readonly category: BadgeCategory;
  readonly categoryLabel: string;
  readonly isUnlocked: boolean;
  readonly tierConfig?: BadgeTierConfig;
  readonly progress?: {
    readonly current: number;
    readonly target: number;
    readonly unit: string;
    readonly percentage: number;
  };
  readonly remaining: number;
}

/**
 * Computes the visible list of badge cards for the badge shelf.
 * Progressive badges with completed tiers show each completed tier as a completed card,
 * and spawn the very next active tier to be completed, while hiding further ranks.
 */
export function computeVisibleBadges(
  catalog: readonly BadgeDefinition[],
  unlockedBadges: readonly string[]
): VisibleBadgeItem[] {
  const unlockedSet = new Set(unlockedBadges);
  const result: VisibleBadgeItem[] = [];

  for (const badge of catalog) {
    if (!badge.isProgressive || !badge.tiers || badge.tiers.length === 0) {
      const isUnlocked = unlockedSet.has(badge.id);
      const rawCurrent = badge.progress?.current ?? 0;
      const target = badge.progress?.target ?? 1;
      const unit = badge.progress?.unit ?? '';

      const current = isUnlocked
        ? target
        : Math.min(rawCurrent, Math.max(0, target - 1));

      const percentage = isUnlocked
        ? 100
        : Math.min(99, Math.round((current / target) * 100));

      const remaining = Math.max(0, target - current);

      result.push({
        id: badge.id,
        baseId: badge.id,
        name: badge.name,
        description: badge.description,
        iconName: badge.iconName,
        category: badge.category,
        categoryLabel: badge.categoryLabel,
        isUnlocked,
        progress: badge.progress ? { current, target, unit, percentage } : undefined,
        remaining,
      });
      continue;
    }

    // Progressive badge with tiers
    const tiers = badge.tiers;
    const rawCurrent = badge.progress?.current ?? 0;
    const unit = badge.progress?.unit ?? '';

    // Check which tiers are completed
    const isTierCompleted = (tierIdx: number): boolean => {
      const tier = tiers[tierIdx];
      if (!tier) return false;

      // Explicit tier ID in unlockedSet (e.g. 'MESTRE_MATEMATICA_SILVER')
      if (unlockedSet.has(`${badge.id}_${tier.tier}`)) {
        return tierIdx === 0 || isTierCompleted(tierIdx - 1);
      }

      // Tier 0 is unlocked if the base badge ID is in unlockedSet
      if (tierIdx === 0) {
        return unlockedSet.has(badge.id);
      }

      return false;
    };

    let firstIncompleteIdx = -1;

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      if (tier && isTierCompleted(i)) {
        // Emit completed tier card
        result.push({
          id: `${badge.id}_${tier.tier}`,
          baseId: badge.id,
          name: badge.name,
          description: tier.description ?? badge.description,
          iconName: badge.iconName,
          category: badge.category,
          categoryLabel: badge.categoryLabel,
          isUnlocked: true,
          tierConfig: tier,
          progress: {
            current: tier.target,
            target: tier.target,
            unit,
            percentage: 100,
          },
          remaining: 0,
        });
      } else {
        firstIncompleteIdx = i;
        break; // Stop! Do not emit future ranks!
      }
    }

    // Spawn the active incomplete tier, if any
    if (firstIncompleteIdx !== -1) {
      const tier = tiers[firstIncompleteIdx];
      if (tier) {
        const current = Math.min(rawCurrent, Math.max(0, tier.target - 1));
        const percentage =
          tier.target > 0 ? Math.min(99, Math.round((current / tier.target) * 100)) : 0;
        const remaining = Math.max(0, tier.target - current);

        result.push({
          id: `${badge.id}_${tier.tier}`,
          baseId: badge.id,
          name: badge.name,
          description: tier.description ?? badge.description,
          iconName: badge.iconName,
          category: badge.category,
          categoryLabel: badge.categoryLabel,
          isUnlocked: false,
          tierConfig: tier,
          progress: {
            current,
            target: tier.target,
            unit,
            percentage,
          },
          remaining,
        });
      }
    }
  }

  return result;
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
    tiers: [
      { tier: 'BRONZE', label: 'Bronze 🥉', shortLabel: 'Bronze', target: 10, description: 'Resolva 10 questões no AprovaENEM rumo ao hábito de estudos.' },
      { tier: 'SILVER', label: 'Prata 🥈', shortLabel: 'Prata', target: 50, description: 'Resolva 50 questões no AprovaENEM consolidando sua preparação.' },
      { tier: 'GOLD', label: 'Ouro 🥇', shortLabel: 'Ouro', target: 150, description: 'Resolva 150 questões no AprovaENEM com alto ritmo de treino.' },
      { tier: 'DIAMOND', label: 'Diamante 💎', shortLabel: 'Diamante', target: 500, description: 'Resolva 500 questões no AprovaENEM alcançando maestria total.' },
    ],
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
    tiers: [
      { tier: 'BRONZE', label: 'Bronze 🥉', shortLabel: 'Bronze', target: 3, description: 'Complete 3 simulados oficiais do ENEM com controle de tempo.' },
      { tier: 'SILVER', label: 'Prata 🥈', shortLabel: 'Prata', target: 5, description: 'Complete 5 simulados oficiais do ENEM com controle de tempo.' },
      { tier: 'GOLD', label: 'Ouro 🥇', shortLabel: 'Ouro', target: 10, description: 'Complete 10 simulados oficiais do ENEM com controle de tempo.' },
      { tier: 'DIAMOND', label: 'Diamante 💎', shortLabel: 'Diamante', target: 20, description: 'Complete 20 simulados oficiais do ENEM com controle de tempo.' },
    ],
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
    tiers: [
      { tier: 'BRONZE', label: 'Bronze 🥉', shortLabel: 'Bronze', target: 3, description: 'Alcance o Nível 3 acumulando XP em simulados e questões.' },
      { tier: 'SILVER', label: 'Prata 🥈', shortLabel: 'Prata', target: 5, description: 'Alcance o Nível 5 acumulando XP em simulados e questões.' },
      { tier: 'GOLD', label: 'Ouro 🥇', shortLabel: 'Ouro', target: 10, description: 'Alcance o Nível 10 acumulando XP em simulados e questões.' },
      { tier: 'DIAMOND', label: 'Diamante 💎', shortLabel: 'Diamante', target: 20, description: 'Alcance o Nível 20 multidisciplinar na plataforma.' },
    ],
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
    progress: { current: 125, target: 250, unit: 'acertos', currentTier: 'SILVER', nextTier: 'GOLD' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze 🥉', shortLabel: 'Bronze', target: 50, description: 'Acerte 50 questões de Matemática e suas Tecnologias (MT).' },
      { tier: 'SILVER', label: 'Prata 🥈', shortLabel: 'Prata', target: 100, description: 'Acerte 100 questões de Matemática e suas Tecnologias (MT).' },
      { tier: 'GOLD', label: 'Ouro 🥇', shortLabel: 'Ouro', target: 250, description: 'Acerte 250 questões de Matemática e suas Tecnologias (MT).' },
      { tier: 'DIAMOND', label: 'Diamante 💎', shortLabel: 'Diamante', target: 500, description: 'Acerte 500 questões de Matemática e suas Tecnologias (MT).' },
    ],
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
    tiers: [
      { tier: 'BRONZE', label: 'Bronze 🥉', shortLabel: 'Bronze', target: 50, description: 'Acerte 50 questões de Ciências da Natureza e suas Tecnologias (CN).' },
      { tier: 'SILVER', label: 'Prata 🥈', shortLabel: 'Prata', target: 100, description: 'Acerte 100 questões de Ciências da Natureza e suas Tecnologias (CN).' },
      { tier: 'GOLD', label: 'Ouro 🥇', shortLabel: 'Ouro', target: 250, description: 'Acerte 250 questões de Ciências da Natureza e suas Tecnologias (CN).' },
      { tier: 'DIAMOND', label: 'Diamante 💎', shortLabel: 'Diamante', target: 500, description: 'Acerte 500 questões de Ciências da Natureza e suas Tecnologias (CN).' },
    ],
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
    tiers: [
      { tier: 'BRONZE', label: 'Bronze 🥉', shortLabel: 'Bronze', target: 50, description: 'Acerte 50 questões de Ciências Humanas e suas Tecnologias (CH).' },
      { tier: 'SILVER', label: 'Prata 🥈', shortLabel: 'Prata', target: 100, description: 'Acerte 100 questões de Ciências Humanas e suas Tecnologias (CH).' },
      { tier: 'GOLD', label: 'Ouro 🥇', shortLabel: 'Ouro', target: 250, description: 'Acerte 250 questões de Ciências Humanas e suas Tecnologias (CH).' },
      { tier: 'DIAMOND', label: 'Diamante 💎', shortLabel: 'Diamante', target: 500, description: 'Acerte 500 questões de Ciências Humanas e suas Tecnologias (CH).' },
    ],
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
    tiers: [
      { tier: 'BRONZE', label: 'Bronze 🥉', shortLabel: 'Bronze', target: 50, description: 'Acerte 50 questões de Linguagens, Códigos e suas Tecnologias (LC).' },
      { tier: 'SILVER', label: 'Prata 🥈', shortLabel: 'Prata', target: 100, description: 'Acerte 100 questões de Linguagens, Códigos e suas Tecnologias (LC).' },
      { tier: 'GOLD', label: 'Ouro 🥇', shortLabel: 'Ouro', target: 250, description: 'Acerte 250 questões de Linguagens, Códigos e suas Tecnologias (LC).' },
      { tier: 'DIAMOND', label: 'Diamante 💎', shortLabel: 'Diamante', target: 500, description: 'Acerte 500 questões de Linguagens, Códigos e suas Tecnologias (LC).' },
    ],
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
    tiers: [
      { tier: 'BRONZE', label: 'Bronze 🥉', shortLabel: 'Bronze', target: 10, description: 'Tire 10 dúvidas conceituais com o Tutor IA pedagógico.' },
      { tier: 'SILVER', label: 'Prata 🥈', shortLabel: 'Prata', target: 25, description: 'Tire 25 dúvidas conceituais com o Tutor IA pedagógico.' },
      { tier: 'GOLD', label: 'Ouro 🥇', shortLabel: 'Ouro', target: 50, description: 'Tire 50 dúvidas conceituais com o Tutor IA pedagógico.' },
      { tier: 'DIAMOND', label: 'Diamante 💎', shortLabel: 'Diamante', target: 100, description: 'Tire 100 dúvidas conceituais com o Tutor IA pedagógico.' },
    ],
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
