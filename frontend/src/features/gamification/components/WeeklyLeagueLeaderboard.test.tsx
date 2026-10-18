import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WeeklyLeagueLeaderboard } from './WeeklyLeagueLeaderboard';
import { MOCK_LEAGUE_LEADERBOARDS } from '@/api/mocks/mock-data';

describe('WeeklyLeagueLeaderboard Component', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  it('renders default Gold league with countdown timer, minimalist progression track, and ranked students with exact zones', () => {
    renderWithProviders(
      <WeeklyLeagueLeaderboard
        initialLeague="GOLD"
        leaderboardData={MOCK_LEAGUE_LEADERBOARDS.GOLD}
        currentUserId="usr-123"
      />
    );

    // League title and description
    expect(screen.getByText('Liga Ouro')).toBeInTheDocument();
    expect(screen.getByText(/Focado no SISU/i)).toBeInTheDocument();

    // Reset countdown widget
    expect(screen.getByText('Reinício do Ranking')).toBeInTheDocument();

    // Minimalist progression track:
    // Completed leagues (Bronze, Prata)
    expect(screen.getByText('Bronze')).toBeInTheDocument();
    expect(screen.getByText('Prata')).toBeInTheDocument();
    expect(screen.getAllByText('Concluída ✓')).toHaveLength(2);

    // Active league (Ouro)
    expect(screen.getByText('Ouro')).toBeInTheDocument();
    expect(screen.getByText('Sua Liga')).toBeInTheDocument();

    // Next league (Diamante) is strictly HIDDEN as mystery '???'
    expect(screen.getByText('???')).toBeInTheDocument();
    expect(screen.queryByText('Diamante')).not.toBeInTheDocument();

    // Tiers are non-clickable: no tab buttons exist
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();

    // Highlighted current user (Lucas Silva)
    expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
    expect(screen.getByText('(Você)')).toBeInTheDocument();

    // Top students and bottom student
    expect(screen.getByText('Beatriz Costa')).toBeInTheDocument();
    expect(screen.getByText('Vanessa Moreira')).toBeInTheDocument();

    // Exact zone distributions for a 10-student cohort:
    // Top 20% (ranks 1 & 2): Classificado (2 badges)
    const promoBadges = screen.getAllByText('Classificado');
    expect(promoBadges).toHaveLength(2);

    // Middle 70% (ranks 3 to 9): Na Disputa (7 badges in table)
    const permanenceBadges = screen.getAllByText('Na Disputa');
    expect(permanenceBadges).toHaveLength(7);

    // Bottom 10% (rank 10): Reforço (1 badge in table)
    const relegationBadges = screen.getAllByText('Reforço');
    expect(relegationBadges).toHaveLength(1);
  });

  it('hides the next league as a mystery locked tier (???) to stimulate user curiosity and progression', () => {
    renderWithProviders(
      <WeeklyLeagueLeaderboard
        initialLeague="GOLD"
        leaderboardData={MOCK_LEAGUE_LEADERBOARDS.GOLD}
        currentUserId="usr-123"
      />
    );

    // The next league identity is completely hidden
    expect(screen.queryByText('Diamante')).not.toBeInTheDocument();
    expect(screen.getByText('???')).toBeInTheDocument();
    expect(screen.getByText('Bloqueada')).toBeInTheDocument();

    // Explanatory encouragement is present
    expect(
      screen.getByText(/Termine a semana no Top 20% para revelar e desbloquear a próxima liga/i)
    ).toBeInTheDocument();
  });

  it('exclusively renders rankings for the student active division and protects privacy across tiers', () => {
    renderWithProviders(
      <WeeklyLeagueLeaderboard
        initialLeague="GOLD"
        leaderboardData={MOCK_LEAGUE_LEADERBOARDS.GOLD}
        currentUserId="usr-123"
      />
    );

    // Tiers are static and non-clickable (zero tab buttons)
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();

    // Gold active cohort is rendered
    expect(screen.getByText('Beatriz Costa')).toBeInTheDocument();
    expect(screen.getByText('Lucas Silva')).toBeInTheDocument();

    // Students from other leagues are strictly NEVER rendered
    expect(screen.queryByText('Arthur Nogueira')).not.toBeInTheDocument(); // Diamond
    expect(screen.queryByText('Yasmin Vasconcelos')).not.toBeInTheDocument(); // Diamond
    expect(screen.queryByText('Rodrigo Alencar')).not.toBeInTheDocument(); // Silver
    expect(screen.queryByText('Fernanda Neves')).not.toBeInTheDocument(); // Silver
  });

  it('displays user position footer summary with promotion celebration message', () => {
    renderWithProviders(
      <WeeklyLeagueLeaderboard
        initialLeague="GOLD"
        leaderboardData={MOCK_LEAGUE_LEADERBOARDS.GOLD}
        currentUserId="usr-123"
      />
    );

    // User position footer summary
    expect(screen.getByText(/Sua posição nesta semana:/i)).toBeInTheDocument();
    expect(screen.getByText(/Você está na Zona de Classificação!/i)).toBeInTheDocument();
  });
});
