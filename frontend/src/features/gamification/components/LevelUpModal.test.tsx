import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LevelUpModal } from './LevelUpModal';

describe('LevelUpModal Component', () => {
  const handleClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <LevelUpModal
        isOpen={false}
        onClose={handleClose}
        newLevel={3}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal dialog with new level, level title, default benefits and confetti when isOpen is true', () => {
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        newLevel={4}
        previousLevel={3}
        levelTitle="Calouro Dedicado"
        awardedXp={50}
        weeklyLeague="PRATA"
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Nível 4!')).toBeInTheDocument();
    expect(screen.getByText('Subiu de Nível!')).toBeInTheDocument();
    expect(screen.getByText('Calouro Dedicado')).toBeInTheDocument();
    expect(screen.getByText(/Você evoluiu do Nível 3 para o Nível 4!/i)).toBeInTheDocument();
    expect(screen.getByText(/\+50 XP de bônus de evolução de nível/i)).toBeInTheDocument();
    expect(screen.getByText(/Avanço na Liga Semanal PRATA/i)).toBeInTheDocument();

    const confetti = screen.getByTestId('levelup-confetti-container');
    expect(confetti).toBeInTheDocument();
  });

  it('renders custom unlocked benefits when provided', () => {
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        newLevel={5}
        levelTitle="Focado no SISU"
        unlockedBenefits={['Acesso a simulados avançados', 'Novo avatar dourado']}
      />
    );

    expect(screen.getByText('Acesso a simulados avançados')).toBeInTheDocument();
    expect(screen.getByText('Novo avatar dourado')).toBeInTheDocument();
  });

  it('calls onContinuePractice and onClose when "Continuar Estudando" is clicked', () => {
    const handleContinue = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        newLevel={3}
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
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        newLevel={3}
        onOpenGamification={handleOpenGamification}
      />
    );

    const leaderboardBtn = screen.getByRole('button', { name: /Ver Minha Liga e Conquistas/i });
    fireEvent.click(leaderboardBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleOpenGamification).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on backdrop click, close button, and Escape key', () => {
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        newLevel={3}
      />
    );

    const backdrop = screen.getByTestId('levelup-modal-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole('button', { name: /Fechar modal de subida de nível/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(3);
  });
});
