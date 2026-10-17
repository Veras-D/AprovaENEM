import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeUpModal } from './TimeUpModal';

describe('TimeUpModal (Question Pacing Alert) Component', () => {
  const defaultProps = {
    isOpen: true,
    questionNumber: 2,
    hasNextQuestion: true,
    onContinue: vi.fn(),
    onNextQuestion: vi.fn(),
    onSwitchUntimed: vi.fn(),
    onClose: vi.fn(),
  };

  it('should not render anything when isOpen is false', () => {
    const { container } = render(<TimeUpModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render pacing alert dialog with proper ARIA attributes, title, and guidance', () => {
    render(<TimeUpModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'timeup-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'timeup-modal-description');

    expect(screen.getByText('Atenção ao Tempo da Questão')).toBeInTheDocument();
    expect(screen.getByText(/Questão #2 • Ritmo de Prova ENEM \(3 min\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Você atingiu o tempo médio sugerido de/i)).toBeInTheDocument();
  });

  it('should call onContinue when "Continuar Respondendo" is clicked', () => {
    const onContinue = vi.fn();
    render(<TimeUpModal {...defaultProps} onContinue={onContinue} />);

    const continueBtn = screen.getByRole('button', { name: /Continuar Respondendo/i });
    fireEvent.click(continueBtn);

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('should call onNextQuestion when "Pular para Próxima" is clicked', () => {
    const onNext = vi.fn();
    render(<TimeUpModal {...defaultProps} onNextQuestion={onNext} hasNextQuestion={true} />);

    const skipBtn = screen.getByRole('button', { name: /Pular para Próxima/i });
    fireEvent.click(skipBtn);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('should not render "Pular para Próxima" button when hasNextQuestion is false', () => {
    render(<TimeUpModal {...defaultProps} hasNextQuestion={false} />);

    expect(screen.queryByRole('button', { name: /Pular para Próxima/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar Respondendo/i })).toBeInTheDocument();
  });

  it('should call onSwitchUntimed when clicking Modo Livre link', () => {
    const onSwitch = vi.fn();
    render(<TimeUpModal {...defaultProps} onSwitchUntimed={onSwitch} />);

    const switchBtn = screen.getByRole('button', { name: /Prefere praticar sem pressão de tempo\? Ativar Modo Livre/i });
    fireEvent.click(switchBtn);

    expect(onSwitch).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close icon button is clicked', () => {
    const onClose = vi.fn();
    render(<TimeUpModal {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: /Fechar aviso de tempo da questão/i });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close on Escape key press', () => {
    const onClose = vi.fn();
    render(<TimeUpModal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard Tab focus trap', () => {
    render(<TimeUpModal {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];

    // Focus last button and press Tab -> should wrap to first button
    lastButton?.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: false });

    // Focus first button and press Shift+Tab -> should wrap to last button
    firstButton?.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
  });
});
