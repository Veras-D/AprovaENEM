import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReadingRuler } from './ReadingRuler';
import { useAccessibilityStore } from '@/stores/useAccessibilityStore';

describe('ReadingRuler component', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({ readingRuler: false, rulerY: 200 });
  });

  it('should not render when readingRuler is false', () => {
    const { container } = render(<ReadingRuler />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render ruler overlay when readingRuler is true', () => {
    useAccessibilityStore.setState({ readingRuler: true, rulerY: 300 });
    render(<ReadingRuler />);

    const ruler = screen.getByRole('presentation', { hidden: true });
    expect(ruler).toBeInTheDocument();
    expect(ruler).toHaveStyle({ top: '276px' });
  });

  it('should update ruler position on window mousemove event', () => {
    useAccessibilityStore.setState({ readingRuler: true, rulerY: 100 });
    render(<ReadingRuler />);

    fireEvent.mouseMove(window, { clientY: 450 });
    expect(useAccessibilityStore.getState().rulerY).toBe(450);
  });
});
