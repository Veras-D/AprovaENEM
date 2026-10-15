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
});
