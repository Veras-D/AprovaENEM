import React, { useMemo } from 'react';
import { parseBlockLatexTokens } from './latex-parser';
import { renderMarkdown } from './markdown-parser';
import { BlockMath } from './BlockMath';

export interface MathRendererProps {
  readonly content: string;
  readonly className?: string;
  readonly inlineClassName?: string;
  readonly blockClassName?: string;
  readonly preserveNewlines?: boolean;
  readonly as?: 'div' | 'span' | 'article' | 'section';
  readonly disableInteractive?: boolean;
}

/**
 * Universal Math and Markdown formula renderer for ENEM exam questions.
 * Accurately parses and renders inline ($...$, \(...\)) and block ($$...$$, \[...\])
 * LaTeX formulas, Markdown formatting (**bold**, *italic*, images ![alt](url), code, links),
 * while protecting Brazilian currency notation (e.g. R$ 50,00).
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  inlineClassName = '',
  blockClassName = '',
  preserveNewlines = true,
  as: Component = 'div',
  disableInteractive = false,
}) => {
  const tokens = useMemo(() => parseBlockLatexTokens(content), [content]);

  if (!content) {
    return null;
  }

  return (
    <Component className={`math-renderer leading-relaxed ${className}`}>
      {tokens.map((token, index) => {
        if (token.type === 'block-math') {
          return (
            <BlockMath
              key={`block-${index}`}
              math={token.content}
              className={blockClassName}
            />
          );
        }

        // Markdown-aware text token (handles inline math, lists, bold, italic, hr, headings)
        return (
          <React.Fragment key={`text-${index}`}>
            {renderMarkdown(token.content, {
              preserveNewlines,
              keyPrefix: `text-${index}`,
              disableInteractive,
              inlineClassName,
            })}
          </React.Fragment>
        );
      })}
    </Component>
  );
};
