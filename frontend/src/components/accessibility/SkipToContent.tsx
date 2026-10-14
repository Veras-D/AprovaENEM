import React from 'react';

export interface SkipToContentProps {
  readonly targetId?: string;
  readonly label?: string;
}

/**
 * Accessible Skip Link allowing keyboard and screen reader users to bypass
 * repetitive top header and navigation blocks directly to the main content area (WCAG 2.1 SC 2.4.1).
 */
export const SkipToContent: React.FC<SkipToContentProps> = ({
  targetId = 'main-content',
  label = 'Pular para o conteúdo principal',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-brand-primary focus:text-brand-primary-foreground focus:font-bold focus:text-sm focus:rounded-brand focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-brand-accent transition-all"
    >
      {label}
    </a>
  );
};
