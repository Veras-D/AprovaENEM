import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InlineMath } from './InlineMath';

describe('InlineMath component', () => {
  it('should render inline formula with role="math" and KaTeX classes', () => {
    render(<InlineMath math="f(x) = x^2" ariaLabel="função f de x igual a x ao quadrado" />);

    const element = screen.getByRole('math');
    expect(element).toBeInTheDocument();
    expect(element.getAttribute('aria-label')).toBe('função f de x igual a x ao quadrado');
    expect(element.querySelector('.katex')).not.toBeNull();
  });

  it('should apply custom className', () => {
    render(<InlineMath math="a + b" className="text-primary-600 font-bold" />);

    const element = screen.getByRole('math');
    expect(element.className).toContain('text-primary-600');
    expect(element.className).toContain('font-bold');
  });

  it('should gracefully handle KaTeX rendering without crashing on invalid LaTeX', () => {
    // Unclosed bracket or invalid command
    render(<InlineMath math="\\invalidCommand{abc" />);

    // Since throwOnError is false, KaTeX will render error span or fallback
    const container = screen.getByRole('math');
    expect(container).toBeInTheDocument();
  });
});
