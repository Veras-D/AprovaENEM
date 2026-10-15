import type { MasteryLevel, DiagnosticRadarAreaDto } from '@/api/types';

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
