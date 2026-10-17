import React, { useMemo } from 'react';
import katex from 'katex';

export interface BlockMathProps {
  readonly math: string;
  readonly className?: string;
  readonly ariaLabel?: string;
}

/**
 * Renders a display-mode LaTeX mathematical formula with mobile overflow protection and MathML accessibility.
 */
export const BlockMath: React.FC<BlockMathProps> = ({
  math,
  className = '',
  ariaLabel,
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: true,
        throwOnError: false,
        output: 'html',
        strict: 'ignore',
        trust: false,
        maxSize: 25,
        maxExpand: 100,
      });
    } catch {
      return null;
    }
  }, [math]);

  if (!html) {
    return (
      <div
        className={`block-math-error my-3 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-mono text-sm rounded border border-red-200 dark:border-red-900 ${className}`}
      >
        {math}
      </div>
    );
  }

  return (
    <div
      className={`block-math overflow-x-auto my-3 py-2 text-center focus:outline-none ${className}`}
      role="math"
      tabIndex={0}
      aria-label={ariaLabel || math}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
