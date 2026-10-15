import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SocraticQuotaWidget } from './SocraticQuotaWidget';

describe('SocraticQuotaWidget', () => {
  it('renders turn counter and progress bar correctly', () => {
    render(<SocraticQuotaWidget remainingTurns={4} maxTurns={6} />);

    expect(screen.getByText('Turnos nesta questão:')).toBeInTheDocument();
    expect(screen.getByText('2/6')).toBeInTheDocument();

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '2');
    expect(progressbar).toHaveAttribute('aria-valuemax', '6');
  });

  it('renders Pro tier badge with unlimited message when isPro is true', () => {
    render(<SocraticQuotaWidget remainingTurns={5} isPro={true} />);

    expect(screen.getByText(/Plano Pro/i)).toBeInTheDocument();
    expect(screen.getByText(/Ilimitado/i)).toBeInTheDocument();
    expect(screen.queryByText(/Modo Visitante/i)).not.toBeInTheDocument();
  });

  it('renders Guest mode banner and triggers onRegisterGuest callback', () => {
    const handleRegister = vi.fn();
    render(
      <SocraticQuotaWidget
        remainingTurns={6}
        isGuest={true}
        onRegisterGuest={handleRegister}
      />
    );

    expect(screen.getByText('Modo Visitante')).toBeInTheDocument();
    expect(screen.getByText(/1 questão diária gratuita/i)).toBeInTheDocument();

    const registerBtn = screen.getByRole('button', { name: /Criar conta gratuita/i });
    fireEvent.click(registerBtn);

    expect(handleRegister).toHaveBeenCalledTimes(1);
  });

  it('renders warning alert when remaining turns is zero', () => {
    render(<SocraticQuotaWidget remainingTurns={0} maxTurns={6} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(/Limite de turnos desta questão atingido/i)).toBeInTheDocument();
  });

  it('renders daily quota alert and triggers onUpgradePro when quota is exhausted', () => {
    const handleUpgrade = vi.fn();
    render(
      <SocraticQuotaWidget
        remainingTurns={3}
        isGuest={false}
        isPro={false}
        dailyQuestionsUnlocked={1}
        dailyQuestionsLimit={1}
        onUpgradePro={handleUpgrade}
      />
    );

    expect(screen.getByText(/Cota diária de/i)).toBeInTheDocument();
    const upgradeBtn = screen.getByRole('button', { name: /Conhecer o plano Pro/i });
    fireEvent.click(upgradeBtn);

    expect(handleUpgrade).toHaveBeenCalledTimes(1);
  });
});
