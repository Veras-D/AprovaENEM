import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GamificationDashboard } from './GamificationDashboard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import type { GamificationProfileDto } from '@/api/types';

describe('GamificationDashboard Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    vi.clearAllMocks();
  });

  const mockProfile: GamificationProfileDto = {
    userId: 'user-gamify-1',
    currentXp: 850,
    level: 5,
    levelTitle: 'Focado no SISU',
    currentStreakDays: 7,
    longestStreakDays: 12,
    streakFreezeAvailable: true,
    dailyGoalTarget: 5,
    dailyGoalProgress: 5,
    weeklyLeague: 'GOLD',
    unlockedBadges: ['PRIMEIRA_QUESTAO', 'STREAK_3_DIAS', 'STREAK_7_DIAS'],
  };

  const renderWithProviders = (ui: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  it('renders dashboard with league badge, level progress, and streak counter', () => {
    renderWithProviders(<GamificationDashboard profile={mockProfile} />);

    expect(screen.getByText('Painel de Conquistas & XP')).toBeInTheDocument();
    expect(screen.getByText(/Liga GOLD/i)).toBeInTheDocument();
    expect(screen.getByText('Nível 5')).toBeInTheDocument();
    expect(screen.getByText('Focado no SISU')).toBeInTheDocument();
    expect(screen.getByText('7 Dias Seguidos')).toBeInTheDocument();
    expect(screen.getByText('Concluída!')).toBeInTheDocument();
  });

  it('does not render manual QA "Comemorar Nível" button in header', () => {
    renderWithProviders(<GamificationDashboard profile={mockProfile} />);

    expect(
      screen.queryByRole('button', { name: /Comemorar Nível/i })
    ).not.toBeInTheDocument();
  });

  it('renders celebration overlay when showCelebration is true', () => {
    renderWithProviders(<GamificationDashboard profile={mockProfile} showCelebration={true} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nível 5 Alcançado!')).toBeInTheDocument();
  });

  it('calls onStartPractice when clicking "Praticar Questões" button', () => {
    const handleStartPractice = vi.fn();
    renderWithProviders(
      <GamificationDashboard profile={mockProfile} onStartPractice={handleStartPractice} />
    );

    const practiceBtn = screen.getByRole('button', {
      name: /Ir para o simulado e praticar questões/i,
    });
    expect(practiceBtn).toBeInTheDocument();
    fireEvent.click(practiceBtn);

    expect(handleStartPractice).toHaveBeenCalledTimes(1);
  });

  it('calls onStartPractice and onCelebrationClose when clicking "Continuar Estudando" inside celebration modal', () => {
    const handleStartPractice = vi.fn();
    const handleCelebrationClose = vi.fn();
    renderWithProviders(
      <GamificationDashboard
        profile={mockProfile}
        showCelebration={true}
        onStartPractice={handleStartPractice}
        onCelebrationClose={handleCelebrationClose}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const continueBtn = screen.getByRole('button', { name: /Continuar Estudando/i });
    expect(continueBtn).toBeInTheDocument();
    fireEvent.click(continueBtn);

    expect(handleStartPractice).toHaveBeenCalledTimes(1);
    expect(handleCelebrationClose).toHaveBeenCalledTimes(1);
  });

  it('switches to the leaderboard tab when clicking "Ranking da Liga" tab', () => {
    renderWithProviders(<GamificationDashboard profile={mockProfile} />);

    const leaderboardTab = screen.getByRole('tab', { name: /Ranking da Liga/i });
    expect(leaderboardTab).toBeInTheDocument();
    fireEvent.click(leaderboardTab);

    expect(screen.getByRole('heading', { name: /^Liga Ouro$/i })).toBeInTheDocument();
    expect(screen.getByText(/Reinício do Ranking/i)).toBeInTheDocument();
  });

  it('switches to leaderboard when clicking the header league badge button', () => {
    renderWithProviders(<GamificationDashboard profile={mockProfile} />);

    const leagueBadgeBtn = screen.getByRole('button', {
      name: /Ver classificação da Liga GOLD/i,
    });
    fireEvent.click(leagueBadgeBtn);

    expect(screen.getByRole('heading', { name: /^Liga Ouro$/i })).toBeInTheDocument();
  });

  it('renders leaderboard directly when defaultTab is "leaderboard"', () => {
    renderWithProviders(<GamificationDashboard profile={mockProfile} defaultTab="leaderboard" />);

    expect(screen.getByRole('heading', { name: /^Liga Ouro$/i })).toBeInTheDocument();
  });

  it('renders Student Login Gate and hides gamification metrics when user is unauthenticated', () => {
    renderWithProviders(<GamificationDashboard />);

    expect(screen.getByText('Conquistas, Nível de XP & Ranking da Liga')).toBeInTheDocument();
    expect(screen.getByText(/Acesso Restrito/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail do Aluno/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar na Minha Conta/i })).toBeInTheDocument();

    // Sensitive student metrics must NOT leak
    expect(screen.queryByText('Painel de Conquistas & XP')).not.toBeInTheDocument();
    expect(screen.queryByText('Meta Diária de Estudos')).not.toBeInTheDocument();
  });

  it('invokes onOpenAuthModal and onStartPractice from the Student Login Gate', () => {
    const onOpenAuthModalMock = vi.fn();
    const onStartPracticeMock = vi.fn();

    renderWithProviders(
      <GamificationDashboard
        onOpenAuthModal={onOpenAuthModalMock}
        onStartPractice={onStartPracticeMock}
      />
    );

    const registerBtn = screen.getByText(/Cadastre-se gratuitamente/i);
    fireEvent.click(registerBtn);
    expect(onOpenAuthModalMock).toHaveBeenCalledWith('register');

    const returnBtn = screen.getByText(/Voltar ao Simulado Rápido/i);
    fireEvent.click(returnBtn);
    expect(onStartPracticeMock).toHaveBeenCalledTimes(1);
  });

  it('marks Raio-X Diagnóstico as conquered and updates daily goal when diagnostic was completed', () => {
    useSessionStore.setState({
      isDiagnosticCompleted: true,
      attempts: {
        'q-1': { questionId: 'q-1', selectedOption: 'A', timeSpentSeconds: 30, answeredAt: '2026-10-24' },
      },
    });

    renderWithProviders(
      <GamificationDashboard
        profile={{
          ...mockProfile,
          dailyGoalProgress: 4,
          dailyGoalTarget: 10,
          unlockedBadges: [],
        }}
      />
    );

    // Daily goal must count 5 questions from the completed diagnostic
    expect(screen.getByText('5 de 10 questões resolvidas hoje (50%)')).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();

    // Raio-X Diagnóstico must be Conquistada
    expect(screen.getByText('Raio-X Diagnóstico')).toBeInTheDocument();
    expect(screen.getAllByText('Conquistada ✓').length).toBeGreaterThan(0);
  });

  it('does not open celebration modal when clicking on badge shelf cards', () => {
    renderWithProviders(
      <GamificationDashboard
        profile={{
          ...mockProfile,
          unlockedBadges: ['PRIMEIRA_QUESTAO'],
        }}
      />
    );

    const firstQuestionCard = screen.getByText('Primeiro Passo');
    fireEvent.click(firstQuestionCard);

    // No celebration dialog should pop up on manual click
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Parabéns! Conquista Desbloqueada!')).not.toBeInTheDocument();
  });
});
