import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge component', () => {
  it('should render children text properly', () => {
    render(<Badge>Matemática</Badge>);
    expect(screen.getByText('Matemática')).toBeInTheDocument();
  });

  it('should apply primary variant classes by default', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge.className).toContain('bg-sky-100');
  });

  it('should apply custom variant classes when specified', () => {
    render(<Badge variant="success">Correto</Badge>);
    const badge = screen.getByText('Correto');
    expect(badge.className).toContain('bg-emerald-100');
  });

  it('should enforce whitespace-nowrap and shrink-0 to prevent multiline badge wrapping', () => {
    render(<Badge>Edital INEP</Badge>);
    const badge = screen.getByText('Edital INEP');
    expect(badge.className).toContain('whitespace-nowrap');
    expect(badge.className).toContain('shrink-0');
  });
});
