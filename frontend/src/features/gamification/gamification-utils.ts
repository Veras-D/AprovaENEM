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

      // Backward-compatibility aliases for streak
      if (badge.id === 'STREAK_DIAS') {
        if (
          tier.tier === 'BRONZE' &&
          (unlockedSet.has('STREAK_3_DIAS') ||
            unlockedSet.has('STREAK_3_DAYS') ||
            unlockedSet.has('STREAK_DIAS_BRONZE'))
        ) {
          return true;
        }
        if (
          tier.tier === 'SILVER' &&
          (unlockedSet.has('STREAK_7_DIAS') ||
            unlockedSet.has('STREAK_7_DAYS') ||
            unlockedSet.has('STREAK_DIAS_SILVER'))
        ) {
          return isTierCompleted(0);
        }
        if (
          tier.tier === 'GOLD' &&
          (unlockedSet.has('STREAK_14_DIAS') ||
            unlockedSet.has('STREAK_14_DAYS') ||
            unlockedSet.has('STREAK_DIAS_GOLD'))
        ) {
          return isTierCompleted(1);
        }
        if (
          tier.tier === 'DIAMOND' &&
          (unlockedSet.has('STREAK_30_DIAS') ||
            unlockedSet.has('STREAK_30_DAYS') ||
            unlockedSet.has('STREAK_DIAS_DIAMOND'))
        ) {
          return isTierCompleted(2);
        }
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
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 10, description: 'Resolva 10 questões no AprovaENEM rumo ao hábito de estudos.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 50, description: 'Resolva 50 questões no AprovaENEM consolidando sua preparação.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 150, description: 'Resolva 150 questões no AprovaENEM com alto ritmo de treino.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 500, description: 'Resolva 500 questões no AprovaENEM alcançando maestria total.' },
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
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 3, description: 'Complete 3 simulados oficiais do ENEM com controle de tempo.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 5, description: 'Complete 5 simulados oficiais do ENEM com controle de tempo.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 10, description: 'Complete 10 simulados oficiais do ENEM com controle de tempo.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 20, description: 'Complete 20 simulados oficiais do ENEM com controle de tempo.' },
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
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 3, description: 'Alcance o Nível 3 acumulando XP em simulados e questões.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 5, description: 'Alcance o Nível 5 acumulando XP em simulados e questões.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 10, description: 'Alcance o Nível 10 acumulando XP em simulados e questões.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 20, description: 'Alcance o Nível 20 multidisciplinar na plataforma.' },
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
    isProgressive: true,
    progress: { current: 1, target: 1, unit: 'questão', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 1, description: 'Resolveu sua primeira questão no AprovaENEM rumo à aprovação.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 5, description: 'Resolva 5 questões consolidando os primeiros passos.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 15, description: 'Resolva 15 questões mantendo o foco inicial.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 30, description: 'Resolva 30 questões completando o aquecimento de estreia.' },
    ],
  },
  {
    id: 'STREAK_DIAS',
    name: 'Chama Acesa',
    description: 'Mantenha sua ofensiva diária de estudos ativa sem interrupções.',
    iconName: 'Flame',
    category: 'STREAK_HABIT',
    categoryLabel: 'Ofensiva & Hábito',
    isProgressive: true,
    progress: { current: 4, target: 7, unit: 'dias', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      {
        tier: 'BRONZE',
        label: 'Bronze',
        shortLabel: 'Bronze',
        target: 3,
        description: 'Manteve uma sequência ininterrupta de 3 dias de prática.',
      },
      {
        tier: 'SILVER',
        label: 'Prata',
        shortLabel: 'Prata',
        target: 7,
        description: 'Pratique durante 7 dias seguidos construindo uma rotina consistente.',
      },
      {
        tier: 'GOLD',
        label: 'Ouro',
        shortLabel: 'Ouro',
        target: 14,
        description: 'Mantenha 14 dias ininterruptos de prática consolidando seu hábito.',
      },
      {
        tier: 'DIAMOND',
        label: 'Diamante',
        shortLabel: 'Diamante',
        target: 30,
        description: 'Mantenha 30 dias ininterruptos de prática ativa para consolidar o ritmo do vestibular.',
      },
    ],
  },
  {
    id: 'FIM_DE_SEMANA_ATIVO',
    name: 'Foco no Fim de Semana',
    description: 'Pratique no sábado e domingo mantendo a ofensiva de estudos sem interrupções.',
    iconName: 'Calendar',
    category: 'STREAK_HABIT',
    categoryLabel: 'Ofensiva & Hábito',
    isProgressive: true,
    progress: { current: 1, target: 2, unit: 'dias', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 2, description: 'Pratique no sábado e domingo mantendo a ofensiva sem interrupções.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 4, description: 'Pratique durante 2 finais de semana mantendo o ritmo consistente.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 8, description: 'Pratique durante 4 finais de semana demonstrando foco absoluto.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 16, description: 'Pratique durante 8 finais de semana consolidando maestria total.' },
    ],
  },
  {
    id: 'CORUJAO_ENEM',
    name: 'Corujão do ENEM',
    description: 'Pratique após as 20h adaptando os estudos à sua rotina pessoal.',
    iconName: 'Clock',
    category: 'STREAK_HABIT',
    categoryLabel: 'Ofensiva & Hábito',
    isProgressive: true,
    progress: { current: 1, target: 3, unit: 'sessões noturnas', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 3, description: 'Realize 3 sessões de estudos noturnas após as 20h.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 10, description: 'Realize 10 sessões de estudos noturnas adaptando seu cronograma.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 25, description: 'Realize 25 sessões de estudos noturnas com alta produtividade.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 50, description: 'Realize 50 sessões de estudos noturnas dominando seu horário de estudos.' },
    ],
  },
  {
    id: 'REVISAO_CADERNO',
    name: 'Caderno de Erros',
    description: 'Revise e refaça questões com erros para consolidar pontos fracos.',
    iconName: 'BookOpen',
    category: 'STREAK_HABIT',
    categoryLabel: 'Ofensiva & Hábito',
    isProgressive: true,
    progress: { current: 3, target: 5, unit: 'questões revisadas', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 5, description: 'Revise e refaça 5 questões com erros para consolidar pontos fracos.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 15, description: 'Revise 15 questões com erros fortalecendo os conceitos mais difíceis.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 35, description: 'Revise 35 questões com erros transformando pontos fracos em acertos.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 75, description: 'Revise 75 questões com erros alcançando domínio conceitual pleno.' },
    ],
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
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 50, description: 'Acerte 50 questões de Matemática e suas Tecnologias (MT).' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 100, description: 'Acerte 100 questões de Matemática e suas Tecnologias (MT).' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 250, description: 'Acerte 250 questões de Matemática e suas Tecnologias (MT).' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 500, description: 'Acerte 500 questões de Matemática e suas Tecnologias (MT).' },
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
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 50, description: 'Acerte 50 questões de Ciências da Natureza e suas Tecnologias (CN).' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 100, description: 'Acerte 100 questões de Ciências da Natureza e suas Tecnologias (CN).' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 250, description: 'Acerte 250 questões de Ciências da Natureza e suas Tecnologias (CN).' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 500, description: 'Acerte 500 questões de Ciências da Natureza e suas Tecnologias (CN).' },
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
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 50, description: 'Acerte 50 questões de Ciências Humanas e suas Tecnologias (CH).' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 100, description: 'Acerte 100 questões de Ciências Humanas e suas Tecnologias (CH).' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 250, description: 'Acerte 250 questões de Ciências Humanas e suas Tecnologias (CH).' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 500, description: 'Acerte 500 questões de Ciências Humanas e suas Tecnologias (CH).' },
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
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 50, description: 'Acerte 50 questões de Linguagens, Códigos e suas Tecnologias (LC).' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 100, description: 'Acerte 100 questões de Linguagens, Códigos e suas Tecnologias (LC).' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 250, description: 'Acerte 250 questões de Linguagens, Códigos e suas Tecnologias (LC).' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 500, description: 'Acerte 500 questões de Linguagens, Códigos e suas Tecnologias (LC).' },
    ],
  },

  // --- Grupo 4: Desafios & Precisão ---
  {
    id: 'PRECISAO_CIRURGICA',
    name: 'Precisão Cirúrgica',
    description: 'Acerte questões consecutivas em uma mesma sessão sem cometer nenhum erro.',
    iconName: 'Target',
    category: 'CHALLENGE',
    categoryLabel: 'Desafios & Precisão',
    isProgressive: true,
    progress: { current: 3, target: 5, unit: 'acertos seguidos', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 5, description: 'Acerte 5 questões consecutivas em uma mesma sessão sem cometer erros.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 10, description: 'Acerte 10 questões consecutivas em uma mesma sessão sem erros.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 15, description: 'Acerte 15 questões consecutivas em uma mesma sessão com alto foco.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 25, description: 'Acerte 25 questões consecutivas alcançando precisão cirúrgica absoluta.' },
    ],
  },
  {
    id: 'GABARITO_PERFEITO',
    name: 'Gabarito Perfeito',
    description: 'Finalize simulados de treino com 100% de aproveitamento.',
    iconName: 'Crown',
    category: 'CHALLENGE',
    categoryLabel: 'Desafios & Precisão',
    isProgressive: true,
    progress: { current: 1, target: 1, unit: 'simulado gabaritado', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 1, description: 'Finalize 1 simulado com 100% de acertos gabaritando a sessão.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 3, description: 'Finalize 3 simulados com 100% de aproveitamento.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 5, description: 'Finalize 5 simulados com 100% de aproveitamento impecável.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 10, description: 'Finalize 10 simulados gabaritados demonstrando domínio supremo.' },
    ],
  },
  {
    id: 'VELOCIDADE_E_FOCO',
    name: 'Gestão de Tempo ENEM',
    description: 'Responda questões mantendo a média de tempo ideal do INEP (até 3 min/questão).',
    iconName: 'Clock',
    category: 'CHALLENGE',
    categoryLabel: 'Desafios & Precisão',
    isProgressive: true,
    progress: { current: 6, target: 10, unit: 'questões no tempo', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 10, description: 'Responda 10 questões mantendo a média ideal do INEP (3 min/questão).' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 25, description: 'Responda 25 questões no ritmo ideal de prova do ENEM.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 50, description: 'Responda 50 questões no ritmo oficial sem perder precisão.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 100, description: 'Responda 100 questões com velocidade e foco magistrais.' },
    ],
  },
  {
    id: 'META_DIARIA_7',
    name: 'Semana Impecável',
    description: 'Cumpra sua meta diária de questões consecutivamente.',
    iconName: 'CheckCheck',
    category: 'CHALLENGE',
    categoryLabel: 'Desafios & Precisão',
    isProgressive: true,
    progress: { current: 4, target: 7, unit: 'dias cumpridos', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 3, description: 'Cumpra sua meta diária de estudos durante 3 dias seguidos.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 7, description: 'Cumpra sua meta diária durante 7 dias seguidos (1 semana impecável).' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 14, description: 'Cumpra sua meta diária durante 14 dias seguidos (2 semanas impecáveis).' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 30, description: 'Cumpra sua meta diária durante 30 dias seguidos com disciplina total.' },
    ],
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
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 10, description: 'Tire 10 dúvidas conceituais com o Tutor IA pedagógico.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 25, description: 'Tire 25 dúvidas conceituais com o Tutor IA pedagógico.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 50, description: 'Tire 50 dúvidas conceituais com o Tutor IA pedagógico.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 100, description: 'Tire 100 dúvidas conceituais com o Tutor IA pedagógico.' },
    ],
  },
  {
    id: 'PODIO_LIGA',
    name: 'Pódio da Liga',
    description: 'Termine rodadas semanais entre os primeiros colocados na sua liga.',
    iconName: 'Medal',
    category: 'SPECIAL',
    categoryLabel: 'Especiais & IA',
    isProgressive: true,
    progress: { current: 1, target: 1, unit: 'pódios', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 1, description: 'Termine 1 rodada semanal entre os 3 primeiros da sua liga.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 3, description: 'Termine 3 rodadas semanais no pódio da sua liga.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 5, description: 'Termine 5 rodadas semanais no pódio da sua liga.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 10, description: 'Termine 10 rodadas no pódio ou seja Campeão da Liga Diamante.' },
    ],
  },
  {
    id: 'ACESSIBILIDADE_TOTAL',
    name: 'Inclusão & Acessibilidade',
    description: 'Personalize seus recursos inclusivos (VLibras, Leitor por Voz, Alto Contraste ou Régua).',
    iconName: 'Sparkles',
    category: 'SPECIAL',
    categoryLabel: 'Especiais & IA',
    isProgressive: true,
    progress: { current: 1, target: 1, unit: 'recurso utilizado', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 1, description: 'Utilize 1 recurso inclusivo na plataforma.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 2, description: 'Personalize 2 recursos inclusivos para otimizar sua leitura.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 3, description: 'Personalize 3 recursos inclusivos adaptando seu ambiente de estudos.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 4, description: 'Utilize todos os 4 recursos inclusivos (VLibras, Leitor de Voz, Alto Contraste, Régua).' },
    ],
  },
  {
    id: 'NOTA_1000',
    name: 'Rumo à Nota 1000',
    description: 'Alcance o Nível 20 multidisciplinar consolidando o domínio de todas as áreas do ENEM.',
    iconName: 'GraduationCap',
    category: 'SPECIAL',
    categoryLabel: 'Especiais & IA',
    isProgressive: true,
    progress: { current: 3, target: 5, unit: 'nível de maestria', currentTier: 'BRONZE', nextTier: 'SILVER' },
    tiers: [
      { tier: 'BRONZE', label: 'Bronze', shortLabel: 'Bronze', target: 5, description: 'Alcance o Nível 5 multidisciplinar na plataforma.' },
      { tier: 'SILVER', label: 'Prata', shortLabel: 'Prata', target: 10, description: 'Alcance o Nível 10 multidisciplinar na plataforma.' },
      { tier: 'GOLD', label: 'Ouro', shortLabel: 'Ouro', target: 15, description: 'Alcance o Nível 15 multidisciplinar rumo à excelência.' },
      { tier: 'DIAMOND', label: 'Diamante', shortLabel: 'Diamante', target: 20, description: 'Alcance o Nível 20 multidisciplinar consolidando o domínio supremo para a Nota 1000.' },
    ],
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
