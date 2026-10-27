/**
 * LaTeX Math Tokenizer
 * Parses mixed text with inline and block LaTeX formulas.
 * Includes Brazilian Portuguese currency protection (defending against R$ 10,00 false-positives).
 */

export type MathTokenType = 'text' | 'inline-math' | 'block-math';

export interface LatexToken {
  readonly type: MathTokenType;
  readonly content: string;
  readonly raw: string;
}

interface MatchOccurrence {
  readonly index: number;
  readonly length: number;
  readonly type: 'inline-math' | 'block-math';
  readonly content: string;
  readonly raw: string;
}

// Regex patterns for LaTeX math expressions
// 1. Block math delimiters: $$...$$ and \[...\]
const BLOCK_DOLLAR_REGEX = /\$\$([\s\S]+?)\$\$/g;
const BLOCK_BRACKET_REGEX = /\\\[([\s\S]+?)\\\]/g;

// 2. Inline math delimiters: \(...\) and $...$
const INLINE_PAREN_REGEX = /\\\(([\s\S]+?)\\\)/g;

/**
 * Defensive Inline Dollar Regex:
 * - Does not match when preceded by 'R' or 'US' (Brazilian Real / US Dollar currency)
 * - Opening $ must be followed by non-whitespace
 * - Closing $ must be preceded by non-whitespace and not followed by a digit
 */
const INLINE_DOLLAR_REGEX = /(?<![RU]S\s?|[RU]S\\|R\$|R\\\$|\$)\$([^$\s\n](?:[^$\n]*?[^$\s\n])?)\$(?!\d|\$)/g;

/**
 * Sanitizes malformed or pseudo-escaped Brazilian currency notations like $R\$\ 4{,}50$ or R\$ 4,50
 * into clean standard text notation ("R$ 4,50") to prevent KaTeX math delimiter false positives.
 */
export function sanitizeCurrencyDelimiters(text: string): string {
  if (!text) return '';
  return text
    // Replace $R\$\ 4{,}50$ or $R\$ 4,50$ with R$ 4,50
    .replace(/\$R\\?\$\\?\s*([0-9]+(?:\{,\}[0-9]+|,[0-9]+)?)\$/g, (_m, val) => `R$ ${val.replace(/\{,\}/g, ',')}`)
    // Replace escaped R\$ with R$
    .replace(/R\\(?=\$)/g, 'R')
    // Replace R$ 4{,}50 with R$ 4,50
    .replace(/([RU]S?\$)\s*([0-9]+)\{,\}([0-9]+)/g, '$1 $2,$3');
}

export function parseLatexTokens(rawInput: string): readonly LatexToken[] {
  if (!rawInput) {
    return [];
  }

  const input = sanitizeCurrencyDelimiters(rawInput);
  const matches: MatchOccurrence[] = [];

  // Helper to extract matches from a regex
  const collectMatches = (
    regex: RegExp,
    type: 'inline-math' | 'block-math'
  ) => {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type,
        content: (match[1] || '').trim(),
        raw: match[0],
      });
    }
  };

  // Collect in priority order: Block ($$, \[) then Inline (\(, $)
  collectMatches(BLOCK_DOLLAR_REGEX, 'block-math');
  collectMatches(BLOCK_BRACKET_REGEX, 'block-math');
  collectMatches(INLINE_PAREN_REGEX, 'inline-math');
  collectMatches(INLINE_DOLLAR_REGEX, 'inline-math');

  // Sort matches by appearance in the text
  matches.sort((a, b) => a.index - b.index);

  // Filter overlapping matches (keep earlier/longer match)
  const nonOverlapping: MatchOccurrence[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.index >= lastEnd) {
      nonOverlapping.push(m);
      lastEnd = m.index + m.length;
    }
  }

  // Construct final token stream
  const tokens: LatexToken[] = [];
  let currentIndex = 0;

  for (const match of nonOverlapping) {
    if (match.index > currentIndex) {
      const textChunk = input.slice(currentIndex, match.index);
      if (textChunk) {
        tokens.push({
          type: 'text',
          content: textChunk,
          raw: textChunk,
        });
      }
    }

    tokens.push({
      type: match.type,
      content: match.content,
      raw: match.raw,
    });

    currentIndex = match.index + match.length;
  }

  // Append any trailing plain text
  if (currentIndex < input.length) {
    const trailingText = input.slice(currentIndex);
    if (trailingText) {
      tokens.push({
        type: 'text',
        content: trailingText,
        raw: trailingText,
      });
    }
  }

  return tokens;
}

/**
 * Splits content into block-level LaTeX math tokens ($$...$$, \[...\]) and text tokens,
 * preserving inline math ($...$, \(...\)) inside text tokens so Markdown block and inline
 * rules (lists, headings, bold around math like **$0$**) can be parsed cohesively.
 */
export function parseBlockLatexTokens(rawInput: string): readonly LatexToken[] {
  if (!rawInput) {
    return [];
  }

  const input = sanitizeCurrencyDelimiters(rawInput);
  const matches: MatchOccurrence[] = [];

  const collectMatches = (regex: RegExp) => {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: 'block-math',
        content: (match[1] || '').trim(),
        raw: match[0],
      });
    }
  };

  collectMatches(BLOCK_DOLLAR_REGEX);
  collectMatches(BLOCK_BRACKET_REGEX);

  matches.sort((a, b) => a.index - b.index);

  const nonOverlapping: MatchOccurrence[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.index >= lastEnd) {
      nonOverlapping.push(m);
      lastEnd = m.index + m.length;
    }
  }

  const tokens: LatexToken[] = [];
  let currentIndex = 0;

  for (const match of nonOverlapping) {
    if (match.index > currentIndex) {
      const textChunk = input.slice(currentIndex, match.index);
      if (textChunk) {
        tokens.push({
          type: 'text',
          content: textChunk,
          raw: textChunk,
        });
      }
    }

    tokens.push({
      type: 'block-math',
      content: match.content,
      raw: match.raw,
    });

    currentIndex = match.index + match.length;
  }

  if (currentIndex < input.length) {
    const trailingText = input.slice(currentIndex);
    if (trailingText) {
      tokens.push({
        type: 'text',
        content: trailingText,
        raw: trailingText,
      });
    }
  }

  return tokens;
}

/**
 * Extracts inline math expressions (\(...\) and $...$) into a lookup array and masks them
 * with private-use Unicode placeholders (\uE000{index}\uE001) so Markdown formatting
 * (**$0$**, lists, italics) never collides with or gets split by LaTeX syntax.
 */
export function extractInlineMathPlaceholders(rawText: string): {
  readonly maskedText: string;
  readonly mathSlots: readonly string[];
} {
  if (!rawText) {
    return { maskedText: '', mathSlots: [] };
  }

  const input = sanitizeCurrencyDelimiters(rawText);
  const matches: MatchOccurrence[] = [];

  const collectMatches = (regex: RegExp) => {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: 'inline-math',
        content: (match[1] || '').trim(),
        raw: match[0],
      });
    }
  };

  collectMatches(INLINE_PAREN_REGEX);
  collectMatches(INLINE_DOLLAR_REGEX);

  if (matches.length === 0) {
    return { maskedText: input, mathSlots: [] };
  }

  matches.sort((a, b) => a.index - b.index);

  const nonOverlapping: MatchOccurrence[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.index >= lastEnd) {
      nonOverlapping.push(m);
      lastEnd = m.index + m.length;
    }
  }

  const mathSlots: string[] = [];
  let maskedText = '';
  let currentIndex = 0;

  for (const match of nonOverlapping) {
    if (match.index > currentIndex) {
      maskedText += input.slice(currentIndex, match.index);
    }
    const slotIdx = mathSlots.length;
    mathSlots.push(match.content);
    maskedText += `\uE000${slotIdx}\uE001`;
    currentIndex = match.index + match.length;
  }

  if (currentIndex < input.length) {
    maskedText += input.slice(currentIndex);
  }

  return { maskedText, mathSlots };
}
