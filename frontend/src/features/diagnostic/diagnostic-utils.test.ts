import { describe, it, expect } from 'vitest';
import {
  getAreaCode,
  getAreaMetadata,
  calculateMasteryLevel,
  formatScore,
  transformRadarDataForChart,
  evaluateDiagnosticLevel,
  generateDiagnosticFromSession,
  mergeDiagnosticWithSession,
  selectDiagnosticQuestions,
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

  describe('mergeDiagnosticWithSession', () => {
    it('cumulatively updates existing diagnostic report with newly completed practice session questions and attempts', () => {
      const existingReport = {
        id: 'initial-report',
        sessionId: 'initial-session',
        scorePercentage: 80,
        radar: [
          {
            knowledgeArea: 'MT',
            areaName: 'Matemática e suas Tecnologias',
            scorePercentage: 100,
            totalQuestions: 1,
            correctQuestions: 1,
            masteryLevel: 'MASTERED' as const,
          },
          {
            knowledgeArea: 'CN',
            areaName: 'Ciências da Natureza e suas Tecnologias',
            scorePercentage: 100,
            totalQuestions: 1,
            correctQuestions: 1,
            masteryLevel: 'MASTERED' as const,
          },
          {
            knowledgeArea: 'CH',
            areaName: 'Ciências Humanas e suas Tecnologias',
            scorePercentage: 0,
            totalQuestions: 1,
            correctQuestions: 0,
            masteryLevel: 'CRITICAL' as const,
            topWeakTopic: 'Filosofia',
          },
          {
            knowledgeArea: 'LC',
            areaName: 'Linguagens, Códigos e suas Tecnologias',
            scorePercentage: 100,
            totalQuestions: 2,
            correctQuestions: 2,
            masteryLevel: 'MASTERED' as const,
          },
        ],
        recommendedTopics: ['Filosofia'],
        generatedAt: '2026-10-25T00:00:00.000Z',
      };

      const dailyPracticeQuestions = [
        { id: 'dp1', knowledgeArea: 'MT', topic: 'Trigonometria' },
        { id: 'dp2', knowledgeArea: 'CN', topic: 'Ecologia' },
        { id: 'dp3', knowledgeArea: 'CH', topic: 'Sociologia Contemporânea' },
      ];

      const dailyPracticeAttempts = {
        dp1: { questionId: 'dp1', isCorrect: true },
        dp2: { questionId: 'dp2', isCorrect: false },
        dp3: { questionId: 'dp3', isCorrect: true },
      };

      const merged = mergeDiagnosticWithSession(
        existingReport,
        dailyPracticeQuestions,
        dailyPracticeAttempts,
        'daily-session-1'
      );

      expect(merged.sessionId).toBe('daily-session-1');
      // MT: 1/1 + 1/1 = 2/2 (100%)
      const mt = merged.radar?.find((r) => r.knowledgeArea === 'MT');
      expect(mt?.totalQuestions).toBe(2);
      expect(mt?.correctQuestions).toBe(2);
      expect(mt?.scorePercentage).toBe(100);

      // CN: 1/1 + 0/1 = 1/2 (50%)
      const cn = merged.radar?.find((r) => r.knowledgeArea === 'CN');
      expect(cn?.totalQuestions).toBe(2);
      expect(cn?.correctQuestions).toBe(1);
      expect(cn?.scorePercentage).toBe(50);
      expect(cn?.topWeakTopic).toBe('Ecologia');

      // CH: 0/1 + 1/1 = 1/2 (50%)
      const ch = merged.radar?.find((r) => r.knowledgeArea === 'CH');
      expect(ch?.totalQuestions).toBe(2);
      expect(ch?.correctQuestions).toBe(1);
      expect(ch?.scorePercentage).toBe(50);

      // LC: unchanged 2/2 (100%)
      const lc = merged.radar?.find((r) => r.knowledgeArea === 'LC');
      expect(lc?.totalQuestions).toBe(2);
      expect(lc?.correctQuestions).toBe(2);
      expect(lc?.scorePercentage).toBe(100);

      // Overall: (2 + 1 + 1 + 2) / (2 + 2 + 2 + 2) = 6/8 = 75%
      expect(merged.scorePercentage).toBe(75);
      expect(merged.recommendedTopics).toContain('Ecologia');
      expect(merged.recommendedTopics).toContain('Filosofia');
    });
  });

  describe('selectDiagnosticQuestions', () => {
    it('returns 5 starter questions with at least one from each knowledge area, ordered progressively by difficulty (1 easy, 3 medium, 1 hard)', () => {
      const questions = selectDiagnosticQuestions();
      expect(questions).toHaveLength(5);

      // Verify difficulties follow progressive order: start with easy, ends with hard
      expect(questions[0]?.difficulty).toBe('EASY');
      expect(questions[1]?.difficulty).toBe('MEDIUM');
      expect(questions[2]?.difficulty).toBe('MEDIUM');
      expect(questions[3]?.difficulty).toBe('MEDIUM');
      expect(questions[4]?.difficulty).toBe('HARD');

      // Verify all 4 ENEM knowledge areas are represented
      const areas = questions.map((q) => q.subject);
      expect(areas).toContain('MT');
      expect(areas).toContain('CN');
      expect(areas).toContain('CH');
      expect(areas).toContain('LC');
    });

    it('returns different starter questions when using different offsets instead of always returning the exact same questions', () => {
      const variant0 = selectDiagnosticQuestions(undefined, [], 5, 0);
      const variant1 = selectDiagnosticQuestions(undefined, [], 5, 1);
      const variant3 = selectDiagnosticQuestions(undefined, [], 5, 3);

      const ids0 = variant0.map((q) => q.id);
      const ids1 = variant1.map((q) => q.id);
      const ids3 = variant3.map((q) => q.id);

      // Variants should have different starter questions
      expect(ids0).not.toEqual(ids1);
      expect(ids0).not.toEqual(ids3);

      // All should preserve the progressive difficulty rule
      [variant0, variant1, variant3].forEach((v) => {
        expect(v).toHaveLength(5);
        expect(v[0]?.difficulty).toBe('EASY');
        expect(v[1]?.difficulty).toBe('MEDIUM');
        expect(v[2]?.difficulty).toBe('MEDIUM');
        expect(v[3]?.difficulty).toBe('MEDIUM');
        expect(v[4]?.difficulty).toBe('HARD');

        const areas = v.map((q) => q.subject);
        expect(areas).toContain('MT');
        expect(areas).toContain('CN');
        expect(areas).toContain('CH');
        expect(areas).toContain('LC');
      });
    });

    it('returns 5 distinct questions excluding the previously answered questions', () => {
      const initialQuestions = selectDiagnosticQuestions();
      const initialIds = initialQuestions.map((q) => q.id);

      const nextQuestions = selectDiagnosticQuestions(undefined, initialIds, 5, 0);
      expect(nextQuestions).toHaveLength(5);

      const nextIds = nextQuestions.map((q) => q.id);
      // Ensure zero overlap between initial and recalibration questions
      initialIds.forEach((id) => {
        expect(nextIds).not.toContain(id);
      });

      // Verify questions are from distinct ENEM areas
      const areas = nextQuestions.map((q) => q.subject);
      expect(areas).toContain('MT');
      expect(areas).toContain('CN');
      expect(areas).toContain('CH');
      expect(areas).toContain('LC');

      // Verify progression
      expect(nextQuestions[0]?.difficulty).toBe('EASY');
      expect(nextQuestions[4]?.difficulty).toBe('HARD');
    });

    it('supports multiple sequential recalibrations yielding novel question sets', () => {
      // Round 1
      const round1 = selectDiagnosticQuestions(undefined, [], 5, 0);
      const round1Ids = round1.map((q) => q.id);

      // Round 2
      const round2 = selectDiagnosticQuestions(undefined, round1Ids, 5, 0);
      const round2Ids = round2.map((q) => q.id);
      expect(round2Ids.some((id) => round1Ids.includes(id))).toBe(false);

      // Round 3
      const round3 = selectDiagnosticQuestions(undefined, [...round1Ids, ...round2Ids], 5, 0);
      const round3Ids = round3.map((q) => q.id);
      expect(round3Ids.some((id) => round1Ids.includes(id))).toBe(false);
      expect(round3Ids.some((id) => round2Ids.includes(id))).toBe(false);

      // All rounds maintain progressive difficulty
      [round1, round2, round3].forEach((round) => {
        expect(round).toHaveLength(5);
        expect(round[0]?.difficulty).toBe('EASY');
        expect(round[4]?.difficulty).toBe('HARD');
      });
    });

    it('gracefully cycles when candidate pool is exhausted while avoiding the immediate previous set', () => {
      const round1 = selectDiagnosticQuestions(undefined, [], 5, 0);
      const round1Ids = round1.map((q) => q.id);

      // Pass large list of exclusions
      const recycled = selectDiagnosticQuestions(undefined, round1Ids, 5, 0);
      expect(recycled).toHaveLength(5);
      const recycledIds = recycled.map((q) => q.id);
      expect(recycledIds.some((id) => round1Ids.includes(id))).toBe(false);
      expect(recycled[0]?.difficulty).toBe('EASY');
      expect(recycled[4]?.difficulty).toBe('HARD');
    });
  });
});
