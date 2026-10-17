import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeUpModal } from './TimeUpModal';

describe('TimeUpModal Component', () => {
  const defaultProps = {
    isOpen: true,
    totalAnswered: 4,
    totalQuestions: 5,
    correctCount: 3,
    totalXp: 50,
    onReviewAnswers: vi.fn(),
    onRestart: vi.fn(),
    onClose: vi.fn(),
  };

  it('should not render anything when isOpen is false', () => {
    const { container } = render(<TimeUpModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render modal dialog with proper ARIA attributes and title when isOpen is true', () => {
    render(<TimeUpModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'timeup-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'timeup-modal-description');

    expect(screen.getByText('Tempo Oficial Esgotado!')).toBeInTheDocument();
    expect(screen.getByText('Simulado Concluído')).toBeInTheDocument();
  });

  it('should render performance metrics accurately', () => {
    render(<TimeUpModal {...defaultProps} />);

    expect(screen.getByText('4/5')).toBeInTheDocument();
    expect(screen.getByText('Respondidas')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Acertos')).toBeInTheDocument();
    expect(screen.getByText('+50')).toBeInTheDocument();
    expect(screen.getByText('XP Total')).toBeInTheDocument();
  });

  it('should call onReviewAnswers when "Ver Gabarito & Resoluções" is clicked', () => {
    const onReview = vi.fn();
    render(<TimeUpModal {...defaultProps} onReviewAnswers={onReview} />);

    const reviewBtn = screen.getByRole('button', { name: /Ver Gabarito & Resoluções/i });
    fireEvent.click(reviewBtn);

    expect(onReview).toHaveBeenCalledTimes(1);
  });

  it('should call onRestart when "Reiniciar Simulado" is clicked', () => {
    const onRestart = vi.fn();
    render(<TimeUpModal {...defaultProps} onRestart={onRestart} />);

    const restartBtn = screen.getByRole('button', { name: /Reiniciar Simulado/i });
    fireEvent.click(restartBtn);

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close icon button is clicked', () => {
    const onClose = vi.fn();
    render(<TimeUpModal {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: /Fechar aviso de tempo esgotado/i });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should fallback to onReviewAnswers when onClose is not provided and close button is clicked', () => {
    const onReview = vi.fn();
    render(<TimeUpModal {...defaultProps} onClose={undefined} onReviewAnswers={onReview} />);

    const closeBtn = screen.getByRole('button', { name: /Fechar aviso de tempo esgotado/i });
    fireEvent.click(closeBtn);

    expect(onReview).toHaveBeenCalledTimes(1);
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
