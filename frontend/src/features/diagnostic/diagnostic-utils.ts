import type {
  MasteryLevel,
  DiagnosticRadarAreaDto,
  DiagnosticReportDto,
  QuestionItemDto,
} from '@/api/types';
import { MOCK_QUESTIONS } from '@/api/mocks/mock-data';

export interface AreaMetadata {
  readonly code: string;
  readonly name: string;
  readonly shortName: string;
  readonly color: string;
  readonly bgLight: string;
  readonly borderLight: string;
}

export const ENEM_AREAS: Record<string, AreaMetadata> = {
  MT: {
    code: 'MT',
    name: 'Matemática e suas Tecnologias',
    shortName: 'Matemática',
    color: '#3b82f6', // blue-500
    bgLight: 'bg-blue-500/10',
    borderLight: 'border-blue-500/30',
  },
  CN: {
    code: 'CN',
    name: 'Ciências da Natureza e suas Tecnologias',
    shortName: 'Natureza',
    color: '#10b981', // emerald-500
    bgLight: 'bg-emerald-500/10',
    borderLight: 'border-emerald-500/30',
  },
  CH: {
    code: 'CH',
    name: 'Ciências Humanas e suas Tecnologias',
    shortName: 'Humanas',
    color: '#f59e0b', // amber-500
    bgLight: 'bg-amber-500/10',
    borderLight: 'border-amber-500/30',
  },
  LC: {
    code: 'LC',
    name: 'Linguagens, Códigos e suas Tecnologias',
    shortName: 'Linguagens',
    color: '#8b5cf6', // purple-500
    bgLight: 'bg-purple-500/10',
    borderLight: 'border-purple-500/30',
  },
};

export const SUBJECT_AREA_TO_CODE: Record<string, string> = {
  MATHEMATICS: 'MT',
  NATURAL_SCIENCES: 'CN',
  HUMANITIES: 'CH',
  LANGUAGES: 'LC',
  MATEMATICA: 'MT',
  CIENCIAS_NATUREZA: 'CN',
  CIENCIAS_HUMANAS: 'CH',
  LINGUAGENS: 'LC',
  MT: 'MT',
  CN: 'CN',
  CH: 'CH',
  LC: 'LC',
};

export const NATIONAL_ENEM_BASELINE = 60.0;
export const MASTERY_TARGET_THRESHOLD = 70.0;

export function getAreaCode(rawArea: string): string {
  const upper = rawArea.toUpperCase().trim();
  return SUBJECT_AREA_TO_CODE[upper] || 'MT';
}

export function getAreaMetadata(rawArea: string): AreaMetadata {
  const code = getAreaCode(rawArea);
  return (
    ENEM_AREAS[code] || {
      code,
      name: rawArea,
      shortName: rawArea,
      color: '#64748b',
      bgLight: 'bg-slate-500/10',
      borderLight: 'border-slate-500/30',
    }
  );
}

export function calculateMasteryLevel(scorePercentage: number): MasteryLevel {
  if (scorePercentage >= MASTERY_TARGET_THRESHOLD) {
    return 'MASTERED';
  }
  if (scorePercentage >= 50.0) {
    return 'ATTENTION_NEEDED';
  }
  return 'CRITICAL';
}

export interface MasteryConfig {
  readonly label: string;
  readonly badgeBg: string;
  readonly textColor: string;
  readonly borderColor: string;
  readonly fullBadgeClass: string;
}

export const MASTERY_CONFIGS: Record<MasteryLevel, MasteryConfig> = {
  MASTERED: {
    label: 'Domínio Consolidado',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    fullBadgeClass:
      'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  },
  ATTENTION_NEEDED: {
    label: 'Requer Atenção',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    fullBadgeClass:
      'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  CRITICAL: {
    label: 'Prioridade Crítica',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    textColor: 'text-rose-700 dark:text-rose-400',
    borderColor: 'border-rose-500/30',
    fullBadgeClass:
      'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30',
  },
};

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function transformRadarDataForChart(areas: readonly DiagnosticRadarAreaDto[]) {
  return areas.map((a) => {
    const meta = getAreaMetadata(a.knowledgeArea);
    return {
      areaKey: meta.code,
      areaName: meta.shortName,
      fullName: meta.name,
      score: Math.round(a.scorePercentage),
      target: MASTERY_TARGET_THRESHOLD,
      baseline: NATIONAL_ENEM_BASELINE,
      totalQuestions: a.totalQuestions,
      correctQuestions: a.correctQuestions,
      masteryLevel: a.masteryLevel,
      topWeakTopic: a.topWeakTopic,
    };
  });
}

export interface DiagnosticEvaluationSummary {
  readonly estimatedTriScore: number;
  readonly proficiencyTier: 'INICIANTE' | 'BÁSICO' | 'INTERMEDIÁRIO' | 'AVANÇADO' | 'EXCELENTE';
  readonly tierLabel: string;
  readonly qualitativeFeedback: string;
}

/**
 * Calibrates the student's initial ENEM TRI score range and qualitative level of understanding.
 */
export function evaluateDiagnosticLevel(scorePercentage: number): DiagnosticEvaluationSummary {
  const estimatedTriScore = Math.round(360 + (scorePercentage / 100) * 500);

  if (scorePercentage >= 85) {
    return {
      estimatedTriScore,
      proficiencyTier: 'EXCELENTE',
      tierLabel: 'Excelente Domínio',
      qualitativeFeedback:
        'Desempenho excelente! Você demonstrou forte consistência conceitual e leitura crítica. Mantenha o ritmo com simulados oficiais completos.',
    };
  }
  if (scorePercentage >= 70) {
    return {
      estimatedTriScore,
      proficiencyTier: 'AVANÇADO',
      tierLabel: 'Nível Avançado',
      qualitativeFeedback:
        'Ótima base de conhecimentos! Você acertou a maioria dos conceitos-chave. Foque nos tópicos de atenção identificados para maximizar sua nota TRI.',
    };
  }
  if (scorePercentage >= 50) {
    return {
      estimatedTriScore,
      proficiencyTier: 'INTERMEDIÁRIO',
      tierLabel: 'Nível Intermediário',
      qualitativeFeedback:
        'Bom ponto de partida. Você domina questões fundamentais, mas precisa reforçar tópicos específicos e interpretação para elevar sua proficiência TRI.',
    };
  }
  if (scorePercentage >= 30) {
    return {
      estimatedTriScore,
      proficiencyTier: 'BÁSICO',
      tierLabel: 'Nível Básico',
      qualitativeFeedback:
        'Diagnóstico calibrado. Recomendamos focar na revisão das áreas prioritárias com auxílio da tutoria socrática inteligente antes de simulados extensos.',
    };
  }
  return {
    estimatedTriScore,
    proficiencyTier: 'INICIANTE',
    tierLabel: 'Nível Inicial',
    qualitativeFeedback:
      'Diagnóstico inicial concluído. O primeiro passo foi dado! Vamos construir sua base área por área com revisões guiadas e questões fáceis.',
  };
}

export interface SessionQuestionLike {
  readonly id: string;
  readonly knowledgeArea?: string;
  readonly discipline?: string;
  readonly subject?: string;
  readonly topic?: string;
}

export interface SessionAttemptLike {
  readonly questionId: string;
  readonly isCorrect?: boolean;
}

/**
 * Generates an authentic, individualized DiagnosticReportDto from session questions and attempts.
 */
export function generateDiagnosticFromSession(
  questions: readonly SessionQuestionLike[],
  attempts: Readonly<Record<string, SessionAttemptLike>>,
  sessionId: string = 'session-diagnostic-initial'
): DiagnosticReportDto {
  const areaCodes: readonly ('MT' | 'CN' | 'CH' | 'LC')[] = ['MT', 'CN', 'CH', 'LC'];

  let totalQuestionsCount = 0;
  let totalCorrectCount = 0;
  const recommendedTopics: string[] = [];

  const radar: DiagnosticRadarAreaDto[] = areaCodes.map((code) => {
    const areaQuestions = questions.filter(
      (q) => getAreaCode(q.knowledgeArea || q.discipline || '') === code
    );
    const total = areaQuestions.length;
    let correct = 0;
    let weakTopic = '';

    areaQuestions.forEach((q) => {
      const att = attempts[q.id];
      if (att?.isCorrect) {
        correct++;
      } else {
        const topic = q.topic || q.discipline || ENEM_AREAS[code]?.name || code;
        if (!weakTopic) {
          weakTopic = topic;
        }
        if (!recommendedTopics.includes(topic)) {
          recommendedTopics.push(topic);
        }
      }
    });

    totalQuestionsCount += total;
    totalCorrectCount += correct;

    // If an area had no questions in this session, fall back to a baseline 60%
    const scorePct = total > 0 ? Math.round((correct / total) * 100) : 60;
    const meta = getAreaMetadata(code);

    return {
      knowledgeArea: code,
      areaName: meta.name,
      scorePercentage: scorePct,
      totalQuestions: total > 0 ? total : 5,
      correctQuestions: total > 0 ? correct : 3,
      masteryLevel: calculateMasteryLevel(scorePct),
      topWeakTopic: weakTopic || (scorePct < 70 ? 'Revisão Recomendada' : undefined),
    };
  });

  const overallScorePercentage =
    totalQuestionsCount > 0 ? Math.round((totalCorrectCount / totalQuestionsCount) * 100) : 0;

  return {
    id: `report-${Date.now()}`,
    sessionId,
    scorePercentage: overallScorePercentage,
    radar,
    recommendedTopics:
      recommendedTopics.length > 0
        ? recommendedTopics
        : ['Interpretação Textual e Gráficos', 'Geometria e Proporcionalidade'],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Merges a newly completed practice session into an existing DiagnosticReportDto,
 * accumulating total questions, correct answers, updated proficiency percentages,
 * and newly identified weak topics across all 4 ENEM knowledge areas.
 */
export function mergeDiagnosticWithSession(
  existingReport: DiagnosticReportDto,
  questions: readonly SessionQuestionLike[],
  attempts: Readonly<Record<string, SessionAttemptLike>>,
  sessionId?: string
): DiagnosticReportDto {
  const areaCodes: readonly ('MT' | 'CN' | 'CH' | 'LC')[] = ['MT', 'CN', 'CH', 'LC'];

  let totalQuestionsCount = 0;
  let totalCorrectCount = 0;
  const newRecommendedTopics: string[] = [];

  const updatedRadar: DiagnosticRadarAreaDto[] = areaCodes.map((code) => {
    const existingArea = existingReport.radar?.find((r) => r.knowledgeArea === code);
    const existingTotal = existingArea?.totalQuestions ?? 0;
    const existingCorrect = existingArea?.correctQuestions ?? 0;

    const areaQuestions = questions.filter(
      (q) => getAreaCode(q.knowledgeArea || q.discipline || q.subject || '') === code
    );

    let newCorrect = 0;
    let newWeakTopic = '';

    areaQuestions.forEach((q) => {
      const att = attempts[q.id];
      if (att?.isCorrect) {
        newCorrect++;
      } else {
        const topic = q.topic || q.discipline || q.subject || ENEM_AREAS[code]?.name || code;
        if (!newWeakTopic) {
          newWeakTopic = topic;
        }
        if (!newRecommendedTopics.includes(topic)) {
          newRecommendedTopics.push(topic);
        }
      }
    });

    const combinedTotal = existingTotal + areaQuestions.length;
    const combinedCorrect = existingCorrect + newCorrect;

    totalQuestionsCount += combinedTotal;
    totalCorrectCount += combinedCorrect;

    const scorePct =
      combinedTotal > 0
        ? Math.round((combinedCorrect / combinedTotal) * 100)
        : existingArea?.scorePercentage ?? 60;

    const meta = getAreaMetadata(code);

    return {
      knowledgeArea: code,
      areaName: meta.name,
      scorePercentage: scorePct,
      totalQuestions: combinedTotal > 0 ? combinedTotal : 5,
      correctQuestions: combinedTotal > 0 ? combinedCorrect : 3,
      masteryLevel: calculateMasteryLevel(scorePct),
      topWeakTopic:
        newWeakTopic ||
        existingArea?.topWeakTopic ||
        (scorePct < 70 ? 'Revisão Recomendada' : undefined),
    };
  });

  const overallScorePercentage =
    totalQuestionsCount > 0
      ? Math.round((totalCorrectCount / totalQuestionsCount) * 100)
      : existingReport.scorePercentage;

  const combinedTopics = [...newRecommendedTopics];
  (existingReport.recommendedTopics || []).forEach((topic) => {
    if (!combinedTopics.includes(topic)) {
      combinedTopics.push(topic);
    }
  });

  return {
    id: existingReport.id || `report-${Date.now()}`,
    sessionId: sessionId || existingReport.sessionId,
    scorePercentage: overallScorePercentage,
    radar: updatedRadar,
    recommendedTopics:
      combinedTopics.length > 0
        ? combinedTopics
        : ['Interpretação Textual e Gráficos', 'Geometria e Proporcionalidade'],
    generatedAt: new Date().toISOString(),
  };
}

export interface DiagnosticAreaDifficultyBlueprint {
  readonly easyArea: 'LC' | 'CH' | 'CN' | 'MT';
  readonly mediumAreas: readonly ['LC' | 'CH' | 'CN' | 'MT', 'LC' | 'CH' | 'CN' | 'MT'];
  readonly repeatMediumArea: 'LC' | 'CH' | 'CN' | 'MT';
  readonly hardArea: 'LC' | 'CH' | 'CN' | 'MT';
}

export const DIAGNOSTIC_BLUEPRINTS: readonly DiagnosticAreaDifficultyBlueprint[] = [
  { easyArea: 'LC', mediumAreas: ['CH', 'CN'], repeatMediumArea: 'MT', hardArea: 'MT' },
  { easyArea: 'LC', mediumAreas: ['CH', 'MT'], repeatMediumArea: 'CN', hardArea: 'CN' },
  { easyArea: 'LC', mediumAreas: ['CN', 'MT'], repeatMediumArea: 'CH', hardArea: 'CH' },
  { easyArea: 'CH', mediumAreas: ['LC', 'CN'], repeatMediumArea: 'MT', hardArea: 'MT' },
  { easyArea: 'CH', mediumAreas: ['LC', 'MT'], repeatMediumArea: 'CN', hardArea: 'CN' },
  { easyArea: 'CH', mediumAreas: ['CN', 'MT'], repeatMediumArea: 'LC', hardArea: 'LC' },
  { easyArea: 'CN', mediumAreas: ['LC', 'CH'], repeatMediumArea: 'MT', hardArea: 'MT' },
  { easyArea: 'CN', mediumAreas: ['LC', 'MT'], repeatMediumArea: 'CH', hardArea: 'CH' },
  { easyArea: 'CN', mediumAreas: ['CH', 'MT'], repeatMediumArea: 'LC', hardArea: 'LC' },
  { easyArea: 'MT', mediumAreas: ['LC', 'CH'], repeatMediumArea: 'CN', hardArea: 'CN' },
  { easyArea: 'MT', mediumAreas: ['LC', 'CN'], repeatMediumArea: 'CH', hardArea: 'CH' },
  { easyArea: 'MT', mediumAreas: ['CH', 'CN'], repeatMediumArea: 'LC', hardArea: 'LC' },
];

export function difficultyRank(diff?: string): number {
  if (diff === 'EASY') return 1;
  if (diff === 'MEDIUM') return 2;
  if (diff === 'HARD') return 3;
  return 2;
}

export function getSessionVariantIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Selects a balanced set of diagnostic questions across the 4 ENEM knowledge areas
 * (MT, CN, CH, LC), ordered progressively by difficulty (start with easy, ends with hard:
 * 1 Easy, 3 Medium, 1 Hard for 5 questions), ensuring distinct starter questions across attempts.
 *
 * @param pool The full question catalog (defaults to MOCK_QUESTIONS)
 * @param excludeIds List of question IDs that were previously seen or answered
 * @param count Total number of questions to pick (default: 5 for starter ENEM diagnostic)
 * @param variantOffset Deterministic variant/session offset to rotate starter sets
 */
export function selectDiagnosticQuestions(
  pool: readonly QuestionItemDto[] = MOCK_QUESTIONS,
  excludeIds: readonly string[] = [],
  count: number = 5,
  variantOffset: number = 0
): readonly QuestionItemDto[] {
  if (pool.length <= count) {
    return [...pool].sort((a, b) => difficultyRank(a.difficulty) - difficultyRank(b.difficulty));
  }

  // Identify unseen candidates outside excludeIds
  let candidatePool = pool.filter((q) => !excludeIds.includes(q.id));

  // If candidate pool has fewer than count questions, recycle history while excluding the most recent count items
  if (candidatePool.length < count) {
    const recentExclude = excludeIds.slice(-count);
    const fallback = pool.filter((q) => !recentExclude.includes(q.id));
    candidatePool = fallback.length >= count ? fallback : [...pool];
  }

  const selected: QuestionItemDto[] = [];
  const selectedIds = new Set<string>();

  // Determine blueprint index based on variant offset and exclude count
  const blueprintIndex =
    Math.abs(variantOffset + Math.floor(excludeIds.length / count)) % DIAGNOSTIC_BLUEPRINTS.length;
  const blueprint = DIAGNOSTIC_BLUEPRINTS[blueprintIndex]!;

  const slotSpecifications: Array<{
    area: 'LC' | 'CH' | 'CN' | 'MT';
    diff: 'EASY' | 'MEDIUM' | 'HARD';
  }> = [
    { area: blueprint.easyArea, diff: 'EASY' },
    { area: blueprint.mediumAreas[0], diff: 'MEDIUM' },
    { area: blueprint.mediumAreas[1], diff: 'MEDIUM' },
    { area: blueprint.repeatMediumArea, diff: 'MEDIUM' },
    { area: blueprint.hardArea, diff: 'HARD' },
  ];

  function pickQuestionForSlot(
    area: 'LC' | 'CH' | 'CN' | 'MT',
    targetDiff: 'EASY' | 'MEDIUM' | 'HARD'
  ): QuestionItemDto | null {
    // 1. Exact area + exact difficulty in candidatePool
    const exactCandidates = candidatePool.filter(
      (q) =>
        !selectedIds.has(q.id) &&
        getAreaCode(q.subject || q.knowledgeArea || '') === area &&
        q.difficulty === targetDiff
    );
    if (exactCandidates.length > 0) {
      const idx = Math.abs(variantOffset) % exactCandidates.length;
      return exactCandidates[idx]!;
    }

    // 2. Exact area + exact difficulty in entire pool (recycled if needed)
    const exactInPool = pool.filter(
      (q) =>
        !selectedIds.has(q.id) &&
        getAreaCode(q.subject || q.knowledgeArea || '') === area &&
        q.difficulty === targetDiff
    );
    if (exactInPool.length > 0) {
      const idx = Math.abs(variantOffset) % exactInPool.length;
      return exactInPool[idx]!;
    }

    // 3. Exact area with closest difficulty in candidatePool
    const diffPreference: ('EASY' | 'MEDIUM' | 'HARD')[] =
      targetDiff === 'EASY'
        ? ['MEDIUM', 'HARD']
        : targetDiff === 'HARD'
        ? ['MEDIUM', 'EASY']
        : ['EASY', 'HARD'];

    for (const altDiff of diffPreference) {
      const altCandidates = candidatePool.filter(
        (q) =>
          !selectedIds.has(q.id) &&
          getAreaCode(q.subject || q.knowledgeArea || '') === area &&
          q.difficulty === altDiff
      );
      if (altCandidates.length > 0) {
        return altCandidates[0]!;
      }
    }

    // 4. Exact area in pool
    for (const altDiff of diffPreference) {
      const altInPool = pool.filter(
        (q) =>
          !selectedIds.has(q.id) &&
          getAreaCode(q.subject || q.knowledgeArea || '') === area &&
          q.difficulty === altDiff
      );
      if (altInPool.length > 0) {
        return altInPool[0]!;
      }
    }

    // 5. Any candidate in candidatePool
    const fallbackCand = candidatePool.find((q) => !selectedIds.has(q.id));
    if (fallbackCand) return fallbackCand;

    // 6. Any candidate in pool
    return pool.find((q) => !selectedIds.has(q.id)) || null;
  }

  // Populate slots from blueprint
  for (const slot of slotSpecifications) {
    if (selected.length >= count) break;
    const picked = pickQuestionForSlot(slot.area, slot.diff);
    if (picked) {
      selected.push(picked);
      selectedIds.add(picked.id);
    }
  }

  // Fill remaining slots if count > 5
  if (selected.length < count) {
    for (const q of candidatePool) {
      if (selected.length >= count) break;
      if (!selectedIds.has(q.id)) {
        selected.push(q);
        selectedIds.add(q.id);
      }
    }
  }

  // Final fallback to pool
  if (selected.length < count) {
    for (const q of pool) {
      if (selected.length >= count) break;
      if (!selectedIds.has(q.id)) {
        selected.push(q);
        selectedIds.add(q.id);
      }
    }
  }

  // Ensure strict progressive ordering: starts with EASY, ends with HARD
  selected.sort((a, b) => difficultyRank(a.difficulty) - difficultyRank(b.difficulty));

  return selected;
}
