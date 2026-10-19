import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav } from './BottomNav';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UserProfile } from '@/types';

describe('BottomNav component', () => {
  const mockStudent: UserProfile = {
    id: 'usr-student-1',
    email: 'aluno@enem.com',
    name: 'Estudante ENEM',
    roles: ['ROLE_STUDENT'] as const,
    isEmailVerified: true,
    createdAt: '2026-10-14T10:00:00Z',
  };

  it('should render all 4 primary action items and the "Mais" drawer trigger when user is authenticated', () => {
    useAuthStore.setState({ user: mockStudent, isAuthenticated: true });
    render(<BottomNav onOpenDrawer={vi.fn()} activeSection="practice" />);

    expect(screen.getByRole('button', { name: /Início/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Praticar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ranking/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Diagnóstico/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abrir menu de opções/i })).toBeInTheDocument();
  });

  it('should render only public action items and hide Ranking/Diagnóstico when user is unauthenticated', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    render(<BottomNav onOpenDrawer={vi.fn()} activeSection="practice" />);

    expect(screen.getByRole('button', { name: /Início/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Praticar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abrir menu de opções/i })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /Ranking/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Diagnóstico/i })).not.toBeInTheDocument();
  });

  it('should mark the active section with aria-current="page"', () => {
    useAuthStore.setState({ user: mockStudent, isAuthenticated: true });
    render(<BottomNav onOpenDrawer={vi.fn()} activeSection="leaderboard" />);

    const leaderboardBtn = screen.getByRole('button', { name: /Ranking/i });
    expect(leaderboardBtn).toHaveAttribute('aria-current', 'page');

    const practiceBtn = screen.getByRole('button', { name: /Praticar/i });
    expect(practiceBtn).not.toHaveAttribute('aria-current');
  });

  it('should trigger onNavigate when navigation button is clicked', () => {
    useAuthStore.setState({ user: mockStudent, isAuthenticated: true });
    const handleNavigate = vi.fn();
    render(<BottomNav onOpenDrawer={vi.fn()} activeSection="practice" onNavigate={handleNavigate} />);

    const diagBtn = screen.getByRole('button', { name: /Diagnóstico/i });
    fireEvent.click(diagBtn);

    expect(handleNavigate).toHaveBeenCalledWith('diagnostics');
  });

  it('should trigger onOpenDrawer when "Mais" button is clicked', () => {
    const handleOpenDrawer = vi.fn();
    render(<BottomNav onOpenDrawer={handleOpenDrawer} />);

    const moreBtn = screen.getByRole('button', { name: /Abrir menu de opções/i });
    fireEvent.click(moreBtn);

    expect(handleOpenDrawer).toHaveBeenCalledTimes(1);
  });

  it('should render coordinator action items and NOT student items when activeSection is institutional and user is coordinator', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-coord',
        email: 'coord@escola.gov.br',
        name: 'Coordenador',
        roles: ['ROLE_ADMIN'],
        isEmailVerified: true,
        createdAt: '2026-08-01T10:00:00Z',
      },
      isAuthenticated: true,
    });

    render(<BottomNav onOpenDrawer={vi.fn()} activeSection="institutional" />);

    expect(screen.getByRole('button', { name: /^Turmas$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Radar$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Tópicos$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Distratores$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abrir menu de opções/i })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /^Praticar$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Ranking$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Diagnóstico$/i })).not.toBeInTheDocument();
  });

  it('should render Voltar ao Aluno and Mais in bottom nav when institutional but unauthenticated', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });

    render(<BottomNav onOpenDrawer={vi.fn()} activeSection="institutional" />);

    expect(screen.getByRole('button', { name: /Voltar ao Aluno/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abrir menu de opções/i })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /^Turmas$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Radar$/i })).not.toBeInTheDocument();
  });

  it('should scroll smoothly when clicking coordinator anchor button in bottom nav', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-coord',
        email: 'coord@escola.gov.br',
        name: 'Coordenador',
        roles: ['ROLE_ADMIN'],
        isEmailVerified: true,
        createdAt: '2026-08-01T10:00:00Z',
      },
      isAuthenticated: true,
    });

    const targetElement = document.createElement('div');
    targetElement.id = 'cohort-distractors';
    targetElement.scrollIntoView = vi.fn();
    document.body.appendChild(targetElement);

    render(<BottomNav onOpenDrawer={vi.fn()} activeSection="institutional" />);

    const distractorsBtn = screen.getByRole('button', { name: /^Distratores$/i });
    fireEvent.click(distractorsBtn);

    expect(targetElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(targetElement);
  });
});
