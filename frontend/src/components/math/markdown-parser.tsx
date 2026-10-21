import React from 'react';
import { ZoomableImage } from '@/components/ui/ZoomableImage';

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
const BOLD_ITALIC_REGEX = /\*\*\*([^\s*](?:[^*\n]*?[^\s*])?)\*\*\*/g;

// 5. Bold: **text** or __text__
const BOLD_ASTERISK_REGEX = /\*\*([^\s*](?:[^*\n]*?[^\s*])?)\*\*/g;
const BOLD_UNDERSCORE_REGEX = /(?<![a-zA-Z0-9_])__([^\s_](?:[^_\n]*?[^\s_])?)__(?![a-zA-Z0-9_])/g;

// 6. Italic: *text* or _text_
const ITALIC_ASTERISK_REGEX = /(?<!\*)\*([^\s*](?:[^*\n]*?[^\s*])?)\*(?!\*)/g;
const ITALIC_UNDERSCORE_REGEX = /(?<![a-zA-Z0-9_])_([^\s_](?:[^_\n]*?[^\s_])?)_(?![a-zA-Z0-9_])/g;

// 7. Strikethrough: ~~text~~
const STRIKE_REGEX = /~~([^~\n]+)~~/g;

// 8. Block image check (the entire line contains only the image)
const BLOCK_IMAGE_REGEX = /^\s*!\[(.*?)\]\((https?:\/\/[^\s)]+|\/[^\s)]+|data:image\/[^\s)]+)\)\s*$/;

/**
 * Parses inline markdown tokens (bold, italic, code, links, inline images) within a single line.
 */
export function parseInlineMarkdown(text: string, keyPrefix: string): readonly React.ReactNode[] {
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
    content: m[1] ?? '',
  }));
  collectMatches(BOLD_ASTERISK_REGEX, 'bold', (m) => ({
    content: m[1] ?? '',
  }));
  collectMatches(BOLD_UNDERSCORE_REGEX, 'bold', (m) => ({
    content: m[1] ?? '',
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
    return [text];
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
      nodes.push(text.slice(currentIdx, match.index));
    }

    const key = `${keyPrefix}-m-${matchCounter}`;

    switch (match.type) {
      case 'image':
        if (isSafeUrl(match.url)) {
          nodes.push(
            <img
              key={key}
              src={match.url}
              alt={match.alt || 'Figura de apoio da questão'}
              className="inline-block max-h-7 sm:max-h-8 align-middle mx-1 object-contain rounded"
              loading="lazy"
            />
          );
        } else if (match.alt && !match.alt.toLowerCase().includes('broken')) {
          nodes.push(match.alt);
        }
        break;

      case 'link':
        if (isSafeUrl(match.url)) {
          nodes.push(
            <a
              key={key}
              href={match.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary underline hover:opacity-80 transition-opacity"
            >
              {match.content}
            </a>
          );
        } else {
          nodes.push(match.content);
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
            <em>{match.content}</em>
          </strong>
        );
        break;

      case 'bold':
        nodes.push(
          <strong key={key} className="font-semibold text-slate-900 dark:text-slate-100">
            {match.content}
          </strong>
        );
        break;

      case 'italic':
        nodes.push(
          <em key={key} className="italic text-slate-800 dark:text-slate-200">
            {match.content}
          </em>
        );
        break;

      case 'strikethrough':
        nodes.push(
          <del key={key} className="line-through text-slate-500">
            {match.content}
          </del>
        );
        break;
    }

    currentIdx = match.index + match.length;
  }

  // Trailing text
  if (currentIdx < text.length) {
    nodes.push(text.slice(currentIdx));
  }

  return nodes;
}

export interface RenderMarkdownOptions {
  readonly preserveNewlines?: boolean;
  readonly keyPrefix?: string;
}

/**
 * Renders Markdown text containing bold, italic, code, block/inline images, links,
 * blockquotes, and preserved linebreaks into safe React elements.
 */
export function renderMarkdown(
  text: string,
  options: RenderMarkdownOptions = {}
): readonly React.ReactNode[] {
  if (!text) return [];

  const { preserveNewlines = true, keyPrefix = 'md' } = options;

  if (!preserveNewlines && !text.includes('\n')) {
    return parseInlineMarkdown(text, keyPrefix);
  }

  const lines = text.split('\n');
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
        result.push(
          <ZoomableImage
            key={lineKey}
            src={src}
            alt={alt || 'Figura explicativa da questão ENEM'}
            caption={alt || undefined}
          />
        );
        continue;
      }
    }

    // 2. Check if line is a Blockquote: > quote
    if (line.startsWith('> ')) {
      const quoteContent = line.slice(2).trim();
      result.push(
        <blockquote
          key={lineKey}
          className="p-3 my-2 border-l-4 border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 italic text-slate-700 dark:text-slate-300 rounded-r"
        >
          {parseInlineMarkdown(quoteContent, lineKey)}
        </blockquote>
      );
      continue;
    }

    // 3. Regular line with inline markdown
    const inlineNodes = parseInlineMarkdown(line, lineKey);
    result.push(
      <React.Fragment key={lineKey}>
        {inlineNodes}
        {preserveNewlines && i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  }

  return result;
}
