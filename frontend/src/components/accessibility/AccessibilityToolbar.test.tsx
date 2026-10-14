import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import { useAccessibilityStore } from '@/stores/useAccessibilityStore';

describe('AccessibilityToolbar component', () => {
  beforeEach(() => {
    useAccessibilityStore.getState().resetAccessibility();
    useAccessibilityStore.setState({ isToolbarOpen: false });
  });

  it('should render floating action trigger button with accessible label', () => {
    render(<AccessibilityToolbar />);

    const trigger = screen.getByRole('button', {
      name: /Menu de ferramentas de acessibilidade/i,
    });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should open and close modal dialog when trigger is clicked', () => {
    render(<AccessibilityToolbar />);

    const trigger = screen.getByRole('button', {
      name: /Menu de ferramentas de acessibilidade/i,
    });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Acessibilidade Digital/i })).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', {
      name: /Fechar painel de acessibilidade/i,
    });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should toggle toolbar open and close via Alt+A keyboard shortcut', () => {
    render(<AccessibilityToolbar />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'a', altKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should adjust font scaling when font scale button is clicked', () => {
    useAccessibilityStore.setState({ isToolbarOpen: true });
    render(<AccessibilityToolbar />);

    const scale150Btn = screen.getByRole('button', { name: '150%' });
    fireEvent.click(scale150Btn);

    expect(useAccessibilityStore.getState().fontScale).toBe(150);
    expect(scale150Btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('should change typography when OpenDyslexic or Atkinson button is clicked', () => {
    useAccessibilityStore.setState({ isToolbarOpen: true });
    render(<AccessibilityToolbar />);

    const dyslexicBtn = screen.getByRole('button', { name: 'OpenDyslexic' });
    fireEvent.click(dyslexicBtn);
    expect(useAccessibilityStore.getState().fontFamily).toBe('dyslexic');

    const atkinsonBtn = screen.getByRole('button', { name: 'Atkinson' });
    fireEvent.click(atkinsonBtn);
    expect(useAccessibilityStore.getState().fontFamily).toBe('atkinson');
  });

  it('should change contrast mode when contrast button is clicked', () => {
    useAccessibilityStore.setState({ isToolbarOpen: true });
    render(<AccessibilityToolbar />);

    const highContrastBtn = screen.getByRole('button', { name: 'Alto Contraste' });
    fireEvent.click(highContrastBtn);
    expect(useAccessibilityStore.getState().contrastMode).toBe('high-contrast');

    const invertedBtn = screen.getByRole('button', { name: 'Invertido' });
    fireEvent.click(invertedBtn);
    expect(useAccessibilityStore.getState().contrastMode).toBe('inverted');
  });

  it('should change Daltonism colorblindness filter via dropdown', () => {
    useAccessibilityStore.setState({ isToolbarOpen: true });
    render(<AccessibilityToolbar />);

    const select = screen.getByLabelText(/Filtros para Daltonismo/i);
    fireEvent.change(select, { target: { value: 'protanopia' } });

    expect(useAccessibilityStore.getState().colorBlindness).toBe('protanopia');
  });

  it('should toggle text spacing, highlight links, reading ruler, and VLibras', () => {
    useAccessibilityStore.setState({ isToolbarOpen: true });
    render(<AccessibilityToolbar />);

    const spacingBtn = screen.getByRole('button', { name: /Espaçamento/i });
    fireEvent.click(spacingBtn);
    expect(useAccessibilityStore.getState().textSpacing).toBe('expanded');

    const linksBtn = screen.getByRole('button', { name: /Destacar Links/i });
    fireEvent.click(linksBtn);
    expect(useAccessibilityStore.getState().highlightLinks).toBe(true);

    const rulerBtn = screen.getByRole('button', { name: /Guia de Foco/i });
    fireEvent.click(rulerBtn);
    expect(useAccessibilityStore.getState().readingRuler).toBe(true);

    const vlibrasBtn = screen.getByRole('button', { name: /VLibras 3D/i });
    fireEvent.click(vlibrasBtn);
    expect(useAccessibilityStore.getState().vlibrasEnabled).toBe(true);
  });

  it('should reset preferences to default when Restaurar Padrão is clicked', () => {
    useAccessibilityStore.setState({
      isToolbarOpen: true,
      fontScale: 200,
      contrastMode: 'high-contrast',
    });
    render(<AccessibilityToolbar />);

    const resetBtn = screen.getByRole('button', { name: /Restaurar Padrão/i });
    fireEvent.click(resetBtn);

    expect(useAccessibilityStore.getState().fontScale).toBe(100);
    expect(useAccessibilityStore.getState().contrastMode).toBe('normal');
  });
});
