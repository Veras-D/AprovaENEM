import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ColorBlindFilters } from './ColorBlindFilters';

describe('ColorBlindFilters component', () => {
  it('should render hidden SVG containing Daltonism filter definitions', () => {
    const { container } = render(<ColorBlindFilters />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');

    expect(container.querySelector('#filter-protanopia')).toBeInTheDocument();
    expect(container.querySelector('#filter-deuteranopia')).toBeInTheDocument();
    expect(container.querySelector('#filter-tritanopia')).toBeInTheDocument();
  });
});
