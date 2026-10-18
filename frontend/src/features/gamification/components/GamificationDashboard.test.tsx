import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GamificationDashboard } from './GamificationDashboard';
import type { GamificationProfileDto } from '@/api/types';

describe('GamificationDashboard Component', () => {
  let queryClient: QueryClient;

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

  it('opens celebration overlay when clicking "Comemorar Nível" button', () => {
    renderWithProviders(<GamificationDashboard profile={mockProfile} />);

    const celebrateBtn = screen.getByRole('button', {
      name: /Ver comemoração de subida de nível/i,
    });
    fireEvent.click(celebrateBtn);

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

  it('calls onStartPractice when clicking "Continuar Estudando" inside celebration modal', () => {
    const handleStartPractice = vi.fn();
    renderWithProviders(
      <GamificationDashboard profile={mockProfile} onStartPractice={handleStartPractice} />
    );

    const celebrateBtn = screen.getByRole('button', {
      name: /Ver comemoração de subida de nível/i,
    });
    fireEvent.click(celebrateBtn);

    const continueBtn = screen.getByRole('button', { name: /Continuar Estudando/i });
    expect(continueBtn).toBeInTheDocument();
    fireEvent.click(continueBtn);

    expect(handleStartPractice).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
});
