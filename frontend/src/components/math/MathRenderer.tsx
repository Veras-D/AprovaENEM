import React, { useMemo } from 'react';
import { parseLatexTokens } from './latex-parser';
import { renderMarkdown } from './markdown-parser';
import { InlineMath } from './InlineMath';
import { BlockMath } from './BlockMath';

export interface MathRendererProps {
  readonly content: string;
  readonly className?: string;
  readonly inlineClassName?: string;
  readonly blockClassName?: string;
  readonly preserveNewlines?: boolean;
  readonly as?: 'div' | 'span' | 'article' | 'section';
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
}) => {
  const tokens = useMemo(() => parseLatexTokens(content), [content]);

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

        if (token.type === 'inline-math') {
          return (
            <InlineMath
              key={`inline-${index}`}
              math={token.content}
              className={inlineClassName}
            />
          );
        }

        // Markdown-aware text token
        return (
          <React.Fragment key={`text-${index}`}>
            {renderMarkdown(token.content, {
              preserveNewlines,
              keyPrefix: `text-${index}`,
            })}
          </React.Fragment>
        );
      })}
    </Component>
  );
};
