import { describe, it, expect } from 'vitest';
import {
  getAreaCode,
  getAreaMetadata,
  calculateMasteryLevel,
  formatScore,
  transformRadarDataForChart,
  evaluateDiagnosticLevel,
  generateDiagnosticFromSession,
  ENEM_AREAS,
  MASTERY_CONFIGS,
  NATIONAL_ENEM_BASELINE,
  MASTERY_TARGET_THRESHOLD,
} from './diagnostic-utils';
import type { DiagnosticRadarAreaDto } from '@/api/types';

describe('diagnostic-utils', () => {
  describe('getAreaCode', () => {
    it('normalizes uppercase subject area names and abbreviations', () => {
      expect(getAreaCode('MATHEMATICS')).toBe('MT');
      expect(getAreaCode('NATURAL_SCIENCES')).toBe('CN');
      expect(getAreaCode('HUMANITIES')).toBe('CH');
      expect(getAreaCode('LANGUAGES')).toBe('LC');
      expect(getAreaCode('mt')).toBe('MT');
      expect(getAreaCode('CN')).toBe('CN');
    });

    it('falls back to MT for unknown area code', () => {
      expect(getAreaCode('UNKNOWN_DISCIPLINE')).toBe('MT');
    });
  });

  describe('getAreaMetadata', () => {
    it('returns official color tokens and labels for ENEM areas', () => {
      const mt = getAreaMetadata('MT');
      expect(mt.code).toBe('MT');
      expect(mt.name).toBe('Matemática e suas Tecnologias');
      expect(mt.shortName).toBe('Matemática');
      expect(mt.color).toBe(ENEM_AREAS.MT!.color);

      const cn = getAreaMetadata('NATURAL_SCIENCES');
      expect(cn.code).toBe('CN');
      expect(cn.name).toBe('Ciências da Natureza e suas Tecnologias');
    });
  });

  describe('calculateMasteryLevel', () => {
    it('returns MASTERED for score >= 70%', () => {
      expect(calculateMasteryLevel(70)).toBe('MASTERED');
      expect(calculateMasteryLevel(100)).toBe('MASTERED');
      expect(calculateMasteryLevel(85.5)).toBe('MASTERED');
    });

    it('returns ATTENTION_NEEDED for 50% <= score < 70%', () => {
      expect(calculateMasteryLevel(50)).toBe('ATTENTION_NEEDED');
      expect(calculateMasteryLevel(69.9)).toBe('ATTENTION_NEEDED');
      expect(calculateMasteryLevel(65)).toBe('ATTENTION_NEEDED');
    });

    it('returns CRITICAL for score < 50%', () => {
      expect(calculateMasteryLevel(49.9)).toBe('CRITICAL');
      expect(calculateMasteryLevel(0)).toBe('CRITICAL');
      expect(calculateMasteryLevel(30)).toBe('CRITICAL');
    });
  });

  describe('MASTERY_CONFIGS', () => {
    it('has configurations for all mastery levels', () => {
      expect(MASTERY_CONFIGS.MASTERED.label).toBe('Domínio Consolidado');
      expect(MASTERY_CONFIGS.ATTENTION_NEEDED.label).toBe('Requer Atenção');
      expect(MASTERY_CONFIGS.CRITICAL.label).toBe('Prioridade Crítica');
    });
  });

  describe('formatScore', () => {
    it('formats numbers into rounded percentages', () => {
      expect(formatScore(78.4)).toBe('78%');
      expect(formatScore(78.6)).toBe('79%');
      expect(formatScore(100)).toBe('100%');
    });
  });

  describe('transformRadarDataForChart', () => {
    it('transforms radar DTOs into chart data items', () => {
      const input: DiagnosticRadarAreaDto[] = [
        {
          knowledgeArea: 'MT',
          areaName: 'Matemática e suas Tecnologias',
          scorePercentage: 85.0,
          totalQuestions: 20,
          correctQuestions: 17,
          masteryLevel: 'MASTERED',
          topWeakTopic: 'Análise Combinatória',
        },
        {
          knowledgeArea: 'CH',
          areaName: 'Ciências Humanas e suas Tecnologias',
          scorePercentage: 45.0,
          totalQuestions: 10,
          correctQuestions: 4,
          masteryLevel: 'CRITICAL',
          topWeakTopic: 'Brasil República',
        },
      ];

      const result = transformRadarDataForChart(input);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        areaKey: 'MT',
        areaName: 'Matemática',
        score: 85,
        target: MASTERY_TARGET_THRESHOLD,
        baseline: NATIONAL_ENEM_BASELINE,
        totalQuestions: 20,
        correctQuestions: 17,
      });
      expect(result[1]).toMatchObject({
        areaKey: 'CH',
        areaName: 'Humanas',
        score: 45,
        masteryLevel: 'CRITICAL',
      });
    });
  });

  describe('evaluateDiagnosticLevel', () => {
    it('calibrates estimated TRI score and qualitative level according to accuracy', () => {
      const exec = evaluateDiagnosticLevel(90);
      expect(exec.proficiencyTier).toBe('EXCELENTE');
      expect(exec.estimatedTriScore).toBeGreaterThanOrEqual(800);

      const adv = evaluateDiagnosticLevel(75);
      expect(adv.proficiencyTier).toBe('AVANÇADO');
      expect(adv.tierLabel).toBe('Nível Avançado');

      const inter = evaluateDiagnosticLevel(60);
      expect(inter.proficiencyTier).toBe('INTERMEDIÁRIO');
      expect(inter.estimatedTriScore).toBe(660);

      const basic = evaluateDiagnosticLevel(40);
      expect(basic.proficiencyTier).toBe('BÁSICO');

      const init = evaluateDiagnosticLevel(10);
      expect(init.proficiencyTier).toBe('INICIANTE');
    });
  });

  describe('generateDiagnosticFromSession', () => {
    it('generates an authentic DiagnosticReportDto mapping attempts to ENEM areas', () => {
      const mockQuestions = [
        { id: 'q1', knowledgeArea: 'MT', topic: 'Potência Elétrica' },
        { id: 'q2', knowledgeArea: 'CN', topic: 'Cinemática' },
        { id: 'q3', knowledgeArea: 'CH', topic: 'Brasil Colônia' },
        { id: 'q4', knowledgeArea: 'LC', topic: 'Figuras de Linguagem' },
      ];

      const mockAttempts = {
        q1: { questionId: 'q1', isCorrect: true },
        q2: { questionId: 'q2', isCorrect: true },
        q3: { questionId: 'q3', isCorrect: false },
        q4: { questionId: 'q4', isCorrect: true },
      };

      const report = generateDiagnosticFromSession(mockQuestions, mockAttempts, 'sess-test-1');
      expect(report.sessionId).toBe('sess-test-1');
      expect(report.scorePercentage).toBe(75); // 3 of 4 = 75%
      expect(report.radar).toHaveLength(4);

      const mtArea = report.radar?.find((r: DiagnosticRadarAreaDto) => r.knowledgeArea === 'MT');
      expect(mtArea?.scorePercentage).toBe(100);
      expect(mtArea?.masteryLevel).toBe('MASTERED');

      const chArea = report.radar?.find((r: DiagnosticRadarAreaDto) => r.knowledgeArea === 'CH');
      expect(chArea?.scorePercentage).toBe(0);
      expect(chArea?.masteryLevel).toBe('CRITICAL');
      expect(chArea?.topWeakTopic).toBe('Brasil Colônia');
      expect(report.recommendedTopics).toContain('Brasil Colônia');
    });
  });
});
