import React, { useMemo } from 'react';
import katex from 'katex';

export interface InlineMathProps {
  readonly math: string;
  readonly className?: string;
  readonly ariaLabel?: string;
}

/**
 * Renders an inline LaTeX mathematical formula using KaTeX with MathML accessibility.
 */
export const InlineMath: React.FC<InlineMathProps> = ({
  math,
  className = '',
  ariaLabel,
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: false,
        throwOnError: false,
        output: 'html',
        strict: 'ignore',
      });
    } catch {
      return null;
    }
  }, [math]);

  if (!html) {
    return (
      <span className={`inline-math-error text-red-500 font-mono text-sm ${className}`}>
        {math}
      </span>
    );
  }

  return (
    <span
      className={`inline-math inline-block align-middle px-0.5 ${className}`}
      role="math"
      aria-label={ariaLabel || math}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
