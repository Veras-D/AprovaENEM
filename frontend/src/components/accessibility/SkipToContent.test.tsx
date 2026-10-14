import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkipToContent } from './SkipToContent';

describe('SkipToContent component', () => {
  it('should render skip link with accessible label', () => {
    render(<SkipToContent />);

    const link = screen.getByRole('link', { name: /Pular para o conteúdo principal/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('should focus and scroll to the target element on click', () => {
    const mainEl = document.createElement('main');
    mainEl.id = 'main-content';
    mainEl.scrollIntoView = vi.fn();
    document.body.appendChild(mainEl);

    render(<SkipToContent targetId="main-content" />);

    const link = screen.getByRole('link', { name: /Pular para o conteúdo principal/i });
    fireEvent.click(link);

    expect(mainEl).toHaveAttribute('tabindex', '-1');
    expect(mainEl.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(mainEl);
  });
});
