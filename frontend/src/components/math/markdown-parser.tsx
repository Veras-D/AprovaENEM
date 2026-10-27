import React from 'react';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { InlineMath } from './InlineMath';
import { extractInlineMathPlaceholders } from './latex-parser';

/**
 * Validates that an image or link URL uses safe protocols to prevent XSS.
 * Permitted: https://, http://, /, ./, data:image/
 */
export function isSafeUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();

  // Reject third-party broken image placeholders and PR ads (e.g. enem.dev/broken-image.svg)
  if (trimmed.includes('broken-image') || trimmed.includes('broken_image')) {
    return false;
  }

  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('data:image/')
  );
}

interface InlineMatch {
  readonly index: number;
  readonly length: number;
  readonly type: 'image' | 'link' | 'code' | 'bold-italic' | 'bold' | 'italic' | 'strikethrough';
  readonly content: string;
  readonly url?: string;
  readonly alt?: string;
}

// Regex patterns for inline markdown elements
// 1. Inline image: ![alt](url)
const INLINE_IMAGE_REGEX = /!\[(.*?)\]\((https?:\/\/[^\s)]+|\/[^\s)]+|data:image\/[^\s)]+)\)/g;

// 2. Link: [text](url) - not preceded by !
const INLINE_LINK_REGEX = /(?<!!)\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;

// 3. Inline code: `code`
const INLINE_CODE_REGEX = /`([^`\n]+)`/g;

// 4. Bold + Italic: ***text***
const BOLD_ITALIC_REGEX = /\*\*\*(?!\s*\*\*\*)([^*\n]+?)\*\*\*/g;

// 5. Bold: **text** or __text__
const BOLD_ASTERISK_REGEX = /\*\*(?!\s*\*\*)([^*\n]+?)\*\*/g;
const BOLD_UNDERSCORE_REGEX = /(?<![a-zA-Z0-9_])__([^\s_](?:[^_\n]*?[^\s_])?)__(?![a-zA-Z0-9_])/g;

// 6. Italic: *text* or _text_
const ITALIC_ASTERISK_REGEX = /(?<!\*)\*([^\s*](?:[^*\n]*?[^\s*])?)\*(?!\*)/g;
const ITALIC_UNDERSCORE_REGEX = /(?<![a-zA-Z0-9_])_([^\s_](?:[^_\n]*?[^\s_])?)_(?![a-zA-Z0-9_])/g;

// 7. Strikethrough: ~~text~~
const STRIKE_REGEX = /~~([^~\n]+)~~/g;

// 8. Block image check (the entire line contains only the image)
const BLOCK_IMAGE_REGEX = /^\s*!\[(.*?)\]\((https?:\/\/[^\s)]+|\/[^\s)]+|data:image\/[^\s)]+)\)\s*$/;

// 9. Horizontal rule: ---, ***, ___
const HORIZONTAL_RULE_REGEX = /^\s*(?:---+|\*\*\*+|___+)\s*$/;

// 10. Heading: # to ####
const HEADING_REGEX = /^\s*(#{1,4})\s+(.+)$/;

// 11. Unordered list item: - item, * item, • item
const UNORDERED_LIST_ITEM_REGEX = /^\s*[-*•]\s+(.+)$/;

// 12. Inline math placeholder token: \uE000{idx}\uE001
const MATH_PLACEHOLDER_SPLIT_REGEX = /(\uE000\d+\uE001)/g;
const MATH_PLACEHOLDER_EXACT_REGEX = /^\uE000(\d+)\uE001$/;

/**
 * Unescapes standard Markdown backslash-escaped punctuation characters (CommonMark § 2.4).
 * Specifically converts escaped punctuation such as "1\." -> "1.", "\*" -> "*", "\[" -> "[", etc.
 */
export function unescapeMarkdown(text: string): string {
  if (!text) return '';
  return text.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, '$1');
}

/**
 * Replaces inline math placeholders (\uE000{idx}\uE001) with <InlineMath /> components
 * and unescapes Markdown punctuation on plain text segments.
 */
function renderTextWithMath(
  text: string,
  mathSlots: readonly string[],
  keyPrefix: string,
  inlineClassName = ''
): readonly React.ReactNode[] {
  if (!text) return [];
  if (mathSlots.length === 0 || !text.includes('\uE000')) {
    return [unescapeMarkdown(text)];
  }

  const parts = text.split(MATH_PLACEHOLDER_SPLIT_REGEX);
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    const exactMatch = part.match(MATH_PLACEHOLDER_EXACT_REGEX);
    if (exactMatch) {
      const slotIdx = Number(exactMatch[1]);
      const mathFormula = mathSlots[slotIdx];
      if (mathFormula !== undefined) {
        nodes.push(
          <InlineMath
            key={`${keyPrefix}-math-${slotIdx}-${i}`}
            math={mathFormula}
            className={inlineClassName}
          />
        );
        continue;
      }
    }

    nodes.push(unescapeMarkdown(part));
  }

  return nodes;
}

/**
 * Parses inline markdown tokens (bold, italic, code, links, inline images, and inline math) within a single line.
 */
export function parseInlineMarkdown(
  text: string,
  keyPrefix: string,
  disableInteractive = false,
  mathSlots: readonly string[] = [],
  inlineClassName = ''
): readonly React.ReactNode[] {
  if (!text) return [];

  const matches: InlineMatch[] = [];

  const collectMatches = (
    regex: RegExp,
    type: InlineMatch['type'],
    extractor: (match: RegExpExecArray) => { content: string; url?: string; alt?: string }
  ) => {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const extracted = extractor(match);
      matches.push({
        index: match.index,
        length: match[0].length,
        type,
        content: extracted.content,
        url: extracted.url,
        alt: extracted.alt,
      });
    }
  };

  // Collect matches in priority order
  collectMatches(INLINE_IMAGE_REGEX, 'image', (m) => ({
    content: m[1] ?? '',
    alt: m[1] ?? '',
    url: m[2],
  }));
  collectMatches(INLINE_LINK_REGEX, 'link', (m) => ({
    content: m[1] ?? '',
    url: m[2],
  }));
  collectMatches(INLINE_CODE_REGEX, 'code', (m) => ({
    content: m[1] ?? '',
  }));
  collectMatches(BOLD_ITALIC_REGEX, 'bold-italic', (m) => ({
    content: (m[1] ?? '').trim(),
  }));
  collectMatches(BOLD_ASTERISK_REGEX, 'bold', (m) => ({
    content: (m[1] ?? '').trim(),
  }));
  collectMatches(BOLD_UNDERSCORE_REGEX, 'bold', (m) => ({
    content: (m[1] ?? '').trim(),
  }));
  collectMatches(ITALIC_ASTERISK_REGEX, 'italic', (m) => ({
    content: m[1] ?? '',
  }));
  collectMatches(ITALIC_UNDERSCORE_REGEX, 'italic', (m) => ({
    content: m[1] ?? '',
  }));
  collectMatches(STRIKE_REGEX, 'strikethrough', (m) => ({
    content: m[1] ?? '',
  }));

  if (matches.length === 0) {
    return renderTextWithMath(text, mathSlots, `${keyPrefix}-txt`, inlineClassName);
  }

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  // Filter overlapping matches
  const nonOverlapping: InlineMatch[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.index >= lastEnd) {
      nonOverlapping.push(m);
      lastEnd = m.index + m.length;
    }
  }

  // Build React nodes
  const nodes: React.ReactNode[] = [];
  let currentIdx = 0;
  let matchCounter = 0;

  for (const match of nonOverlapping) {
    matchCounter++;

    // Text prior to match
    if (match.index > currentIdx) {
      nodes.push(
        ...renderTextWithMath(
          text.slice(currentIdx, match.index),
          mathSlots,
          `${keyPrefix}-pre-${matchCounter}`,
          inlineClassName
        )
      );
    }

    const key = `${keyPrefix}-m-${matchCounter}`;

    switch (match.type) {
      case 'image':
        if (isSafeUrl(match.url)) {
          nodes.push(
            <img
              key={key}
              src={match.url}
              alt={unescapeMarkdown(match.alt || 'Figura de apoio da questão')}
              className="inline-block max-h-7 sm:max-h-8 align-middle mx-1 object-contain rounded"
              loading="lazy"
            />
          );
        } else if (match.alt && !match.alt.toLowerCase().includes('broken')) {
          nodes.push(unescapeMarkdown(match.alt));
        }
        break;

      case 'link':
        if (isSafeUrl(match.url)) {
          if (disableInteractive) {
            nodes.push(
              <span key={key} className="text-brand-primary underline font-medium">
                {renderTextWithMath(match.content, mathSlots, key, inlineClassName)}
              </span>
            );
          } else {
            nodes.push(
              <a
                key={key}
                href={match.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary underline hover:opacity-80 transition-opacity"
              >
                {renderTextWithMath(match.content, mathSlots, key, inlineClassName)}
              </a>
            );
          }
        } else {
          nodes.push(...renderTextWithMath(match.content, mathSlots, key, inlineClassName));
        }
        break;

      case 'code':
        nodes.push(
          <code
            key={key}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-primary font-mono text-xs sm:text-sm"
          >
            {match.content}
          </code>
        );
        break;

      case 'bold-italic':
        nodes.push(
          <strong key={key} className="font-semibold text-slate-900 dark:text-slate-100">
            <em>{renderTextWithMath(match.content, mathSlots, key, inlineClassName)}</em>
          </strong>
        );
        break;

      case 'bold':
        nodes.push(
          <strong key={key} className="font-semibold text-slate-900 dark:text-slate-100">
            {renderTextWithMath(match.content, mathSlots, key, inlineClassName)}
          </strong>
        );
        break;

      case 'italic':
        nodes.push(
          <em key={key} className="italic text-slate-800 dark:text-slate-200">
            {renderTextWithMath(match.content, mathSlots, key, inlineClassName)}
          </em>
        );
        break;

      case 'strikethrough':
        nodes.push(
          <del key={key} className="line-through text-slate-500">
            {renderTextWithMath(match.content, mathSlots, key, inlineClassName)}
          </del>
        );
        break;
    }

    currentIdx = match.index + match.length;
  }

  // Trailing text
  if (currentIdx < text.length) {
    nodes.push(
      ...renderTextWithMath(
        text.slice(currentIdx),
        mathSlots,
        `${keyPrefix}-post`,
        inlineClassName
      )
    );
  }

  return nodes;
}

export interface RenderMarkdownOptions {
  readonly preserveNewlines?: boolean;
  readonly keyPrefix?: string;
  readonly disableInteractive?: boolean;
  readonly inlineClassName?: string;
}

/**
 * Renders Markdown text containing bold, italic, code, block/inline images, links,
 * blockquotes, lists, headings, horizontal rules, inline math, and preserved linebreaks into safe React elements.
 */
export function renderMarkdown(
  text: string,
  options: RenderMarkdownOptions = {}
): readonly React.ReactNode[] {
  if (!text) return [];

  const {
    preserveNewlines = true,
    keyPrefix = 'md',
    disableInteractive = false,
    inlineClassName = '',
  } = options;

  const { maskedText, mathSlots } = extractInlineMathPlaceholders(text);

  if (!preserveNewlines && !maskedText.includes('\n')) {
    return parseInlineMarkdown(maskedText, keyPrefix, disableInteractive, mathSlots, inlineClassName);
  }

  const lines = maskedText.split('\n');
  const result: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const lineKey = `${keyPrefix}-l-${i}`;

    // 1. Check if line is a Block Image: ![alt](url)
    const blockImageMatch = line.match(BLOCK_IMAGE_REGEX);
    if (blockImageMatch) {
      const alt = blockImageMatch[1] ?? '';
      const src = blockImageMatch[2];
      if (isSafeUrl(src)) {
        if (disableInteractive) {
          result.push(
            <figure
              key={lineKey}
              className="my-2 flex flex-col items-center rounded-brand overflow-hidden p-1"
            >
              <img
                src={src}
                alt={alt || 'Figura explicativa da questão ENEM'}
                className="max-h-36 sm:max-h-48 w-auto object-contain rounded-brand mx-auto"
                loading="lazy"
              />
              {alt && (
                <figcaption className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 text-center italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
        } else {
          result.push(
            <ZoomableImage
              key={lineKey}
              src={src}
              alt={alt || 'Figura explicativa da questão ENEM'}
              caption={alt || undefined}
            />
          );
        }
        continue;
      }
    }

    // 2. Check if line is a Horizontal Rule: ---, ***, ___
    if (HORIZONTAL_RULE_REGEX.test(line)) {
      result.push(
        <hr
          key={lineKey}
          className="my-3 border-t border-slate-200 dark:border-slate-700"
        />
      );
      continue;
    }

    // 3. Check if line is a Markdown Heading: # to ####
    const headingMatch = line.match(HEADING_REGEX);
    if (headingMatch) {
      const level = (headingMatch[1] ?? '#').length;
      const headingContent = headingMatch[2] ?? '';
      const headingClass =
        level <= 2
          ? 'text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-2.5 mb-1 block'
          : 'text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 mb-0.5 block';
      result.push(
        <strong key={lineKey} className={headingClass}>
          {parseInlineMarkdown(headingContent, lineKey, disableInteractive, mathSlots, inlineClassName)}
        </strong>
      );
      continue;
    }

    // 4. Check if line is a Blockquote: > quote
    if (line.startsWith('> ')) {
      const quoteContent = line.slice(2).trim();
      result.push(
        <blockquote
          key={lineKey}
          className="p-3 my-2 border-l-4 border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 italic text-slate-700 dark:text-slate-300 rounded-r"
        >
          {parseInlineMarkdown(quoteContent, lineKey, disableInteractive, mathSlots, inlineClassName)}
        </blockquote>
      );
      continue;
    }

    // 5. Check if line starts an Unordered Bullet List: - item, * item, • item
    const listMatch = line.match(UNORDERED_LIST_ITEM_REGEX);
    if (listMatch) {
      const listItems: { key: string; content: string }[] = [];
      let j = i;
      while (j < lines.length) {
        const candidateLine = lines[j] ?? '';
        const itemMatch = candidateLine.match(UNORDERED_LIST_ITEM_REGEX);
        if (!itemMatch) break;
        listItems.push({
          key: `${keyPrefix}-li-${j}`,
          content: itemMatch[1] ?? '',
        });
        j++;
      }
      i = j - 1;
      result.push(
        <ul
          key={lineKey}
          className="my-1.5 pl-4 space-y-1 list-disc marker:text-brand-primary"
        >
          {listItems.map((item) => (
            <li key={item.key} className="leading-relaxed">
              {parseInlineMarkdown(
                item.content,
                item.key,
                disableInteractive,
                mathSlots,
                inlineClassName
              )}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 6. Regular line with inline markdown & inline math
    const inlineNodes = parseInlineMarkdown(
      line,
      lineKey,
      disableInteractive,
      mathSlots,
      inlineClassName
    );
    const nextLine = lines[i + 1] ?? '';
    const isNextBlock =
      HORIZONTAL_RULE_REGEX.test(nextLine) ||
      HEADING_REGEX.test(nextLine) ||
      UNORDERED_LIST_ITEM_REGEX.test(nextLine) ||
      nextLine.startsWith('> ') ||
      BLOCK_IMAGE_REGEX.test(nextLine);

    result.push(
      <React.Fragment key={lineKey}>
        {inlineNodes}
        {preserveNewlines && i < lines.length - 1 && !isNextBlock && <br />}
      </React.Fragment>
    );
  }

  return result;
}
