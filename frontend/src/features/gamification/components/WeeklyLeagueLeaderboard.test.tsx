import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders default Gold league with countdown timer, tier tabs, and ranked students', () => {
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

    // 4 league tabs
    expect(screen.getByRole('tab', { name: /Bronze/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Prata/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ouro/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Diamante/i })).toBeInTheDocument();

    // Highlighted current user (Lucas Silva)
    expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
    expect(screen.getByText('(Você)')).toBeInTheDocument();

    // First place student
    expect(screen.getByText('Beatriz Costa')).toBeInTheDocument();
  });

  it('allows switching between league tiers via tabs', () => {
    renderWithProviders(
      <WeeklyLeagueLeaderboard
        initialLeague="GOLD"
        leaderboardData={MOCK_LEAGUE_LEADERBOARDS.GOLD}
        currentUserId="usr-123"
      />
    );

    // Click Diamante tab
    const diamondTab = screen.getByRole('tab', { name: /Diamante/i });
    fireEvent.click(diamondTab);

    // Header updates to Liga Diamante
    expect(screen.getByText('Liga Diamante')).toBeInTheDocument();
    expect(screen.getByText(/Elite dos vestibulandos/i)).toBeInTheDocument();

    // Diamond students are rendered
    expect(screen.getByText('Arthur Nogueira')).toBeInTheDocument();
    expect(screen.getByText('Yasmin Vasconcelos')).toBeInTheDocument();
  });

  it('displays promotion zone badge for top performers and footer summary for current user', () => {
    renderWithProviders(
      <WeeklyLeagueLeaderboard
        initialLeague="GOLD"
        leaderboardData={MOCK_LEAGUE_LEADERBOARDS.GOLD}
        currentUserId="usr-123"
      />
    );

    // Promotion badges for top 20%
    const promoBadges = screen.getAllByText(/Promoção/i);
    expect(promoBadges.length).toBeGreaterThan(0);

    // User position footer summary
    expect(screen.getByText(/Sua posição nesta semana:/i)).toBeInTheDocument();
    expect(screen.getByText(/Você está na Zona de Promoção!/i)).toBeInTheDocument();
  });
});
