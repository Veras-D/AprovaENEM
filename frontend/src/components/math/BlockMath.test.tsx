import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlockMath } from './BlockMath';

describe('BlockMath component', () => {
  it('should render block formula in display mode with role="math"', () => {
    render(<BlockMath math="\\sum_{i=1}^n i = \\frac{n(n+1)}{2}" ariaLabel="soma de 1 a n" />);

    const element = screen.getByRole('math');
    expect(element).toBeInTheDocument();
    expect(element.getAttribute('aria-label')).toBe('soma de 1 a n');
    expect(element.querySelector('.katex-display')).not.toBeNull();
    expect(element.className).toContain('overflow-x-auto');
  });

  it('should apply custom className', () => {
    render(<BlockMath math="E = mc^2" className="my-8 shadow-sm" />);

    const element = screen.getByRole('math');
    expect(element.className).toContain('my-8');
    expect(element.className).toContain('shadow-sm');
  });

  it('should be keyboard focusable for accessibility with tabIndex={0}', () => {
    render(<BlockMath math="\\Delta = b^2 - 4ac" />);

    const element = screen.getByRole('math');
    expect(element).toHaveAttribute('tabIndex', '0');
  });
});
