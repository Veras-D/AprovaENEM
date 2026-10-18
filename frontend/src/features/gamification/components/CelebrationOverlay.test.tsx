import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CelebrationOverlay } from './CelebrationOverlay';

describe('CelebrationOverlay Component', () => {
  const handleClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CelebrationOverlay
        isOpen={false}
        onClose={handleClose}
        level={4}
        levelTitle="Calouro Iniciante"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal dialog, trophy, level title, and awarded XP when isOpen is true', () => {
    render(
      <CelebrationOverlay
        isOpen={true}
        onClose={handleClose}
        level={5}
        levelTitle="Focado no SISU"
        awardedXp={50}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Nível 5 Alcançado!')).toBeInTheDocument();
    expect(screen.getByText('Focado no SISU')).toBeInTheDocument();
    expect(screen.getByText(/\+50 XP/i)).toBeInTheDocument();
    const confettiContainer = screen.getByTestId('confetti-container');
    expect(confettiContainer).toBeInTheDocument();
    const particle = confettiContainer.querySelector('.animate-confetti');
    expect(particle).toBeInTheDocument();
  });

  it('calls onContinuePractice when provided and CTA button is clicked', () => {
    const handleContinuePractice = vi.fn();
    render(
      <CelebrationOverlay
        isOpen={true}
        onClose={handleClose}
        level={5}
        levelTitle="Focado no SISU"
        onContinuePractice={handleContinuePractice}
      />
    );

    const ctaBtn = screen.getByRole('button', { name: /Continuar Estudando/i });
    fireEvent.click(ctaBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleContinuePractice).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button, backdrop, or CTA button is clicked', () => {
    render(
      <CelebrationOverlay
        isOpen={true}
        onClose={handleClose}
        level={5}
        levelTitle="Focado no SISU"
      />
    );

    const ctaBtn = screen.getByRole('button', { name: /Continuar Estudando/i });
    fireEvent.click(ctaBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const backdrop = screen.getByTestId('celebration-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(2);

    const closeBtn = screen.getByRole('button', { name: /Fechar comemoração/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(3);
  });

  it('dismisses when Escape key is pressed', () => {
    render(
      <CelebrationOverlay
        isOpen={true}
        onClose={handleClose}
        level={5}
        levelTitle="Focado no SISU"
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
