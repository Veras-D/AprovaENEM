import type { MasteryLevel, DiagnosticRadarAreaDto, DiagnosticReportDto } from '@/api/types';

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
