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

    it('strips markdown image syntax and raw URLs while preserving alt text', () => {
      const inputWithAlt = 'Conforme ilustrado na figura: ![Gráfico de dispersão térmica](https://enem.dev/images/q136.png), determine a taxa.';
      const resultAlt = cleanMathForSpeech(inputWithAlt);
      expect(resultAlt).toContain('Gráfico de dispersão térmica');
      expect(resultAlt).not.toContain('https://enem.dev');
      expect(resultAlt).not.toContain('![');
      expect(resultAlt).not.toContain('.png');

      const inputEmptyAlt = 'Observe a imagem a seguir:\n\n![](https://enem.dev/2023/questions/136/uuid-565c2.png)\n\nQual é a massa da escultura?';
      const resultEmpty = cleanMathForSpeech(inputEmptyAlt);
      expect(resultEmpty).toBe('Observe a imagem a seguir: Qual é a massa da escultura?');
      expect(resultEmpty).not.toContain('https');
      expect(resultEmpty).not.toContain('uuid-565c2');
      expect(resultEmpty).not.toContain('![');
    });

    it('cleans markdown links and raw URLs', () => {
      const input = 'Disponível em: [Portal do INEP](https://inep.gov.br/enem). Acesse também https://enem.dev/noticias para mais dados.';
      const result = cleanMathForSpeech(input);
      expect(result).toContain('Portal do INEP');
      expect(result).not.toContain('https://inep.gov.br');
      expect(result).not.toContain('https://enem.dev');
      expect(result).not.toContain('[');
    });

    it('cleans markdown formatting (bold, italic, code) without leaving asterisks or backticks', () => {
      const input = 'O **Texto I** aborda a *Interseccionalidade* e a constante `c = 300000 km/s`.';
      const result = cleanMathForSpeech(input);
      expect(result).toBe('O Texto I aborda a Interseccionalidade e a constante c = 300000 quilômetros por segundo.');
      expect(result).not.toContain('*');
      expect(result).not.toContain('`');
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

    it('cleans image links from statement and options so raw URLs are never spoken', () => {
      const mockQuestionWithImages: UnifiedQuestion = {
        id: 'q-demo-3',
        externalId: '136',
        examYear: 2023,
        knowledgeArea: 'MT',
        discipline: 'Matemática',
        difficulty: 'HARD',
        statement: 'Considere a escultura:\n\n![](https://enem.dev/2023/questions/136/uuid-565c2.png)\n\nQual o volume?',
        options: [
          { letter: 'A', text: '![Diagrama de forças](https://enem.dev/img-a.jpg)' },
          { letter: 'B', text: '![](https://enem.dev/img-b.jpg)' },
          { letter: 'C', text: '$100\\text{ cm}^3$' },
        ],
      };

      const speech = prepareQuestionSpeechText(mockQuestionWithImages);

      // Statement image link should be stripped completely
      expect(speech).toContain('Enunciado: Considere a escultura: Qual o volume?');
      expect(speech).not.toContain('https://enem.dev');
      expect(speech).not.toContain('uuid-565c2');
      expect(speech).not.toContain('![');

      // Option A with alt text should speak the alt text without URL
      expect(speech).toContain('Alternativa A: Diagrama de forças.');
      expect(speech).not.toContain('img-a.jpg');

      // Option B with empty alt should fall back to description rather than silence or raw URL
      expect(speech).toContain('Alternativa B: Figura da alternativa.');
      expect(speech).not.toContain('img-b.jpg');

      // Option C should format scientific units
      expect(speech).toContain('Alternativa C: 100 centímetros cúbicos.');
    });

    it('announces standalone figure when not already embedded in statement', () => {
      const mockQuestionStandaloneFigure: UnifiedQuestion = {
        id: 'q-demo-4',
        externalId: '103',
        examYear: 2022,
        knowledgeArea: 'CN',
        discipline: 'Física',
        difficulty: 'MEDIUM',
        statement: 'Analise o comportamento do circuito elétrico.',
        figureUrl: 'https://enem.dev/2022/circuito.png',
        figureAltText: 'Diagrama esquemático de resistores em série',
        options: [
          { letter: 'A', text: '$5\\text{ A}$' },
          { letter: 'B', text: '$10\\text{ A}$' },
        ],
      };

      const speech = prepareQuestionSpeechText(mockQuestionStandaloneFigure);

      expect(speech).toContain('Figura da questão: Diagrama esquemático de resistores em série.');
      expect(speech).not.toContain('https://enem.dev');
    });
  });
});
