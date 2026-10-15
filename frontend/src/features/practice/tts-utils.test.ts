import { describe, it, expect } from 'vitest';
import { cleanMathForSpeech, prepareQuestionSpeechText } from './tts-utils';
import type { UnifiedQuestion } from './components/QuestionCard';

describe('tts-utils', () => {
  describe('cleanMathForSpeech', () => {
    it('returns empty string for empty input', () => {
      expect(cleanMathForSpeech('')).toBe('');
    });

    it('translates fractions to spoken Portuguese', () => {
      const input = 'O tempo é dado por $t = \\frac{d}{v_1 + v_2}$';
      const result = cleanMathForSpeech(input);
      expect(result).toContain('d dividido por v_1 + v_2');
      expect(result).not.toContain('\\frac');
    });

    it('translates square roots and power notation', () => {
      const input = 'Calculando $\\sqrt{16} = 4$ e $x^2 + y^3$';
      const result = cleanMathForSpeech(input);
      expect(result).toContain('raiz quadrada de 16');
      expect(result).toContain('ao quadrado');
      expect(result).toContain('ao cubo');
    });

    it('translates scientific units (watts, kWh, km/h, m/s)', () => {
      const input = 'Consumo de $10\\text{ W}$ e $1{,}50\\text{ kWh}$ a $60\\text{ km/h}$';
      const result = cleanMathForSpeech(input);
      expect(result).toContain('10 watts');
      expect(result).toContain('quilowatts-hora');
      expect(result).toContain('quilômetros por hora');
    });

    it('translates mathematical relational symbols', () => {
      const input = 'Se $a \\le 10$, $b \\ge 20$, $c \\approx 3$ e $\\pi \\cdot r^2$';
      const result = cleanMathForSpeech(input);
      expect(result).toContain('menor ou igual a');
      expect(result).toContain('maior ou igual a');
      expect(result).toContain('aproximadamente');
      expect(result).toContain('pi vezes');
    });
  });

  describe('prepareQuestionSpeechText', () => {
    it('constructs a structured speech text with header, context, statement, and options', () => {
      const mockQuestion: UnifiedQuestion = {
        id: 'q-demo-1',
        externalId: '135',
        examYear: 2024,
        knowledgeArea: 'MT',
        discipline: 'Matemática',
        difficulty: 'MEDIUM',
        statement: 'Qual o valor de $2^3$?',
        contextText: 'Considere a operação de potenciação.',
        options: [
          { letter: 'A', text: '$6$' },
          { letter: 'B', text: '$8$' },
          { letter: 'C', text: '$16$' },
        ],
      };

      const speech = prepareQuestionSpeechText(mockQuestion);

      expect(speech).toContain('Questão número 135.');
      expect(speech).toContain('Área de Matemática e suas Tecnologias.');
      expect(speech).toContain('Exame ENEM do ano 2024.');
      expect(speech).toContain('Texto de apoio: Considere a operação de potenciação.');
      expect(speech).toContain('Enunciado: Qual o valor de 2 ao cubo?');
      expect(speech).toContain('Alternativa A: 6.');
      expect(speech).toContain('Alternativa B: 8.');
      expect(speech).toContain('Alternativa C: 16.');
    });

    it('handles QuestionItemDto without contextText', () => {
      const mockQuestionItem = {
        id: 'q-demo-2',
        year: 2023,
        subject: 'CN',
        discipline: 'Física',
        difficulty: 'EASY' as const,
        status: 'ACTIVE' as const,
        statement: 'A velocidade da luz no vácuo é constante.',
        options: [
          { optionLetter: 'A' as const, text: 'Verdadeiro' },
          { optionLetter: 'B' as const, text: 'Falso' },
        ],
      };

      const speech = prepareQuestionSpeechText(mockQuestionItem);

      expect(speech).toContain('Área de Ciências da Natureza e suas Tecnologias. Exame ENEM do ano 2023.');
      expect(speech).toContain('Enunciado: A velocidade da luz no vácuo é constante.');
      expect(speech).toContain('Alternativa A: Verdadeiro.');
      expect(speech).toContain('Alternativa B: Falso.');
      expect(speech).not.toContain('Texto de apoio');
    });
  });
});
