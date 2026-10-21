import type { UnifiedQuestion } from './components/QuestionCard';
import type { OptionItem } from './components/OptionSelector';

/**
 * Normalizes LaTeX, mathematical notation, Markdown elements, and URLs into readable natural Brazilian Portuguese
 * text for browser SpeechSynthesis / assistive text-to-speech engines.
 */
export function cleanMathForSpeech(text: string): string {
  if (!text) return '';

  let speech = text;

  // 0a. Markdown Images: ![alt](url) -> if alt exists, read "Figura: alt" or "alt", never speak raw URLs
  speech = speech.replace(/!\[([^\]]*)\]\([^)]+\)/g, (_, alt: string) => {
    const cleanAlt = alt.trim();
    if (!cleanAlt) return ' ';
    return cleanAlt.match(/^(figura|imagem|gráfico|tabela|diagrama|esquema)\b/i)
      ? ` ${cleanAlt} `
      : ` Figura: ${cleanAlt} `;
  });

  // 0b. Markdown Links: [text](url) -> keep visible text only, strip the URL
  speech = speech.replace(/(?<!!)\[([^\]]+)\]\([^)]+\)/g, ' $1 ');

  // 0c. Raw URLs: https://... or http://... -> strip so they aren't spelled out letter-by-letter
  speech = speech.replace(/https?:\/\/[^\s)]+/g, '');

  // 0d. Markdown formatting: bold, italic, strikethrough, inline code
  speech = speech.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  speech = speech.replace(/\*\*([^*]+)\*\*/g, '$1');
  speech = speech.replace(/__([^_]+)__/g, '$1');
  speech = speech.replace(/\*([^*]+)\*/g, '$1');
  speech = speech.replace(/(?<![a-zA-Z0-9])_([^_]+)_(?![a-zA-Z0-9])/g, '$1');
  speech = speech.replace(/~~([^~]+)~~/g, '$1');
  speech = speech.replace(/`([^`]+)`/g, '$1');

  // 0e. HTML tags and common entities
  speech = speech.replace(/<[^>]+>/g, ' ');
  speech = speech.replace(/&nbsp;/g, ' ');
  speech = speech.replace(/&bull;/g, ' ');
  speech = speech.replace(/&amp;/g, ' e ');
  speech = speech.replace(/&lt;/g, ' menor que ');
  speech = speech.replace(/&gt;/g, ' maior que ');

  // 1. Fractions: \frac{a}{b} -> "a dividido por b"
  speech = speech.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 dividido por $2');

  // 2. Square roots: \sqrt{x} -> "raiz quadrada de x", \sqrt[n]{x} -> "raiz de índice n de x"
  speech = speech.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, 'raiz de índice $1 de $2');
  speech = speech.replace(/\\sqrt\{([^}]+)\}/g, 'raiz quadrada de $1');

  // 3. Units & Scientific dimensions
  speech = speech.replace(/\\text\{\s*km\/s\s*\}|km\/s\b/g, ' quilômetros por segundo');
  speech = speech.replace(/\\text\{\s*km\/h\s*\}|km\/h\b/g, ' quilômetros por hora');
  speech = speech.replace(/\\text\{\s*m\/s\s*\}\^2|m\/s\^2\b/g, ' metros por segundo ao quadrado');
  speech = speech.replace(/\\text\{\s*m\/s\s*\}|m\/s\b/g, ' metros por segundo');
  speech = speech.replace(/\\text\{\s*kWh\s*\}|kWh\b/g, ' quilowatts-hora');
  speech = speech.replace(/\\text\{\s*W\s*\}|(?<=\d\s*)W\b/g, ' watts');
  speech = speech.replace(/\\text\{\s*kg\s*\}|kg\b/g, ' quilogramas');
  speech = speech.replace(/\\text\{\s*cm\s*\}\^3|\\text\{\s*cm³\s*\}|cm\^3|cm³\b/g, ' centímetros cúbicos');
  speech = speech.replace(/\\text\{\s*m\s*\}\^3|\\text\{\s*m³\s*\}|m\^3|m³\b/g, ' metros cúbicos');
  speech = speech.replace(/\\text\{\s*cm\s*\}\^2|\\text\{\s*cm²\s*\}|cm\^2|cm²\b/g, ' centímetros quadrados');
  speech = speech.replace(/\\text\{\s*m\s*\}\^2|\\text\{\s*m²\s*\}|m\^2|m²\b/g, ' metros quadrados');
  speech = speech.replace(/\\text\{\s*cm\s*\}|cm\b/g, ' centímetros');
  speech = speech.replace(/\\text\{\s*mm\s*\}|mm\b/g, ' milímetros');
  speech = speech.replace(/\\text\{\s*°C\s*\}|\^\\circ\s*C\b/g, ' graus Celsius');
  speech = speech.replace(/\\text\{\s*cal\s*\}|cal\b/g, ' calorias');
  speech = speech.replace(/\\text\{\s*J\s*\}|(?<=\d\s*)J\b/g, ' joules');
  speech = speech.replace(/\\text\{\s*V\s*\}|(?<=\d\s*)V\b/g, ' volts');
  speech = speech.replace(/\\text\{\s*A\s*\}|(?<=\d\s*)A\b/g, ' amperes');

  // 4. Superscripts & Powers: ^2 -> "ao quadrado", ^3 -> "ao cubo", ^{n} -> "elevado a n"
  speech = speech.replace(/\^2\b|\^\{2\}/g, ' ao quadrado');
  speech = speech.replace(/\^3\b|\^\{3\}/g, ' ao cubo');
  speech = speech.replace(/\^\{([^}]+)\}|\^([a-zA-Z0-9])/g, ' elevado a $1$2');

  // 5. Mathematical symbols and relational operators
  speech = speech.replace(/\\times|\\cdot/g, ' vezes ');
  speech = speech.replace(/\\approx/g, ' aproximadamente ');
  speech = speech.replace(/\\leq|\\le/g, ' menor ou igual a ');
  speech = speech.replace(/\\geq|\\ge/g, ' maior ou igual a ');
  speech = speech.replace(/\\neq/g, ' diferente de ');
  speech = speech.replace(/\\pm/g, ' mais ou menos ');
  speech = speech.replace(/\\pi/g, ' pi ');
  speech = speech.replace(/\\Delta/g, ' delta ');
  speech = speech.replace(/\\theta/g, ' teta ');
  speech = speech.replace(/\\alpha/g, ' alfa ');
  speech = speech.replace(/\\beta/g, ' beta ');
  speech = speech.replace(/\\lambda/g, ' lambda ');

  // 6. Generic \text{...} wrappers
  speech = speech.replace(/\\text\{([^}]+)\}/g, '$1');

  // 7. Strip delimiters and leftover LaTeX symbols
  speech = speech.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  speech = speech.replace(/\$([^$]+)\$/g, '$1');
  speech = speech.replace(/[{}]/g, '');
  speech = speech.replace(/\\/g, '');

  // 8. Clean up spaces and punctuation
  speech = speech
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.,;:!?])\s*([.,;:!?])+/g, '$1')
    .replace(/([.?!])\./g, '$1')
    .trim();

  return speech;
}

/**
 * Appends terminal punctuation if not already present on clean speech text.
 */
function withTerminalPunctuation(text: string): string {
  const clean = text.trim();
  if (!clean) return '';
  return clean.match(/[.?!;:]$/) ? clean : `${clean}.`;
}

/**
 * Builds a natural, pedagogical speech script for an entire ENEM question,
 * including its metadata header, context excerpt, statement, and options A through E.
 */
export function prepareQuestionSpeechText(
  question: UnifiedQuestion,
  options?: readonly OptionItem[]
): string {
  const year = 'year' in question ? question.year : question.examYear;
  const areaCode = 'subject' in question ? question.subject : question.knowledgeArea;
  const itemNumber =
    'itemNumber' in question && question.itemNumber
      ? question.itemNumber
      : 'externalId' in question
      ? question.externalId
      : '';
  const context = 'contextText' in question ? question.contextText : undefined;
  const figure = 'imageUrl' in question ? question.imageUrl : question.figureUrl;
  const figureAlt =
    'figureAltText' in question && question.figureAltText
      ? question.figureAltText
      : undefined;

  const hasEmbeddedMarkdownFigure =
    typeof question.statement === 'string' &&
    Boolean(question.statement.match(/!\[.*?\]\(.*?\)/));

  const areaNames: Record<string, string> = {
    MT: 'Matemática e suas Tecnologias',
    CN: 'Ciências da Natureza e suas Tecnologias',
    CH: 'Ciências Humanas e suas Tecnologias',
    LC: 'Linguagens, Códigos e suas Tecnologias',
  };

  const areaLabel = areaNames[areaCode] || areaCode;

  const parts: string[] = [];

  // 1. Header intro
  if (itemNumber) {
    parts.push(`Questão número ${itemNumber}.`);
  }
  parts.push(`Área de ${areaLabel}. Exame ENEM do ano ${year}.`);

  // 2. Context reference text
  if (context && context.trim().length > 0) {
    parts.push(`Texto de apoio: ${withTerminalPunctuation(cleanMathForSpeech(context))}`);
  }

  // 3. Standalone figure (if present and not embedded in statement)
  if (figure && !hasEmbeddedMarkdownFigure && figureAlt) {
    parts.push(`Figura da questão: ${withTerminalPunctuation(cleanMathForSpeech(figureAlt))}`);
  }

  // 4. Question statement
  parts.push(`Enunciado: ${withTerminalPunctuation(cleanMathForSpeech(question.statement))}`);

  // 5. Options
  const resolvedOptions: OptionItem[] =
    options && options.length > 0
      ? [...options]
      : question.options.map((opt) => ({
          letter: 'letter' in opt ? opt.letter : opt.optionLetter,
          text: opt.text,
        }));

  if (resolvedOptions.length > 0) {
    parts.push('Alternativas:');
    for (const opt of resolvedOptions) {
      let cleanOpt = cleanMathForSpeech(opt.text);
      if (!cleanOpt.trim()) {
        cleanOpt = 'Figura da alternativa';
      }
      parts.push(`Alternativa ${opt.letter}: ${withTerminalPunctuation(cleanOpt)}`);
    }
  }

  return parts.join(' ');
}
