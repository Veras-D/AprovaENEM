import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreakCelebrationModal } from './StreakCelebrationModal';

describe('StreakCelebrationModal Component', () => {
  const handleClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <StreakCelebrationModal
        isOpen={false}
        onClose={handleClose}
        streakDays={3}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal dialog with flame, streak count, calendar track, and awarded XP when isOpen is true', () => {
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={handleClose}
        streakDays={5}
        dailyGoalTarget={5}
        dailyGoalProgress={5}
        awardedXp={50}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('5 Dias de Ofensiva!')).toBeInTheDocument();
    expect(screen.getByText('Ofensiva Ativa!')).toBeInTheDocument();
    expect(screen.getByText(/Meta diária batida!/i)).toBeInTheDocument();
    expect(screen.getByText(/Semana Atual/i)).toBeInTheDocument();
    expect(screen.getByText(/\+50 XP somados à sua liga semanal/i)).toBeInTheDocument();
  });

  it('renders singular "1 Dia de Ofensiva!" for streakDays = 1', () => {
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={handleClose}
        streakDays={1}
      />
    );

    expect(screen.getByText('1 Dia de Ofensiva!')).toBeInTheDocument();
  });

  it('calls onContinuePractice and onClose when "Continuar Estudando" is clicked', () => {
    const handleContinue = vi.fn();
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={handleClose}
        streakDays={3}
        onContinuePractice={handleContinue}
      />
    );

    const continueBtn = screen.getByRole('button', { name: /Continuar Estudando/i });
    fireEvent.click(continueBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleContinue).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenGamification and onClose when leaderboard button is clicked', () => {
    const handleOpenGamification = vi.fn();
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={handleClose}
        streakDays={4}
        onOpenGamification={handleOpenGamification}
      />
    );

    const leaderboardBtn = screen.getByRole('button', { name: /Ver Posição na Liga Semanal/i });
    fireEvent.click(leaderboardBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleOpenGamification).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on backdrop click, close button, and Escape key', () => {
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={handleClose}
        streakDays={3}
      />
    );

    const backdrop = screen.getByTestId('streak-modal-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole('button', { name: /Fechar celebração da ofensiva/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(3);
  });
});
