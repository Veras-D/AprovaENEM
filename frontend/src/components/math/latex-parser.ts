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
const INLINE_DOLLAR_REGEX = /(?<![RU]S\s?|R\$|\$)\$([^$\s\n](?:[^$\n]*?[^$\s\n])?)\$(?!\d|\$)/g;

export function parseLatexTokens(input: string): readonly LatexToken[] {
  if (!input) {
    return [];
  }

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
