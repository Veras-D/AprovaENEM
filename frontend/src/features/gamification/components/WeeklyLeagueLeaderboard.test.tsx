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

  it('renders default Gold league with countdown timer, tier tabs, and ranked students with exact zones', () => {
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

    // 4 league tabs with appropriate status indicators
    expect(screen.getByRole('tab', { name: /Bronze/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Prata/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ouro/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Diamante/i })).toBeInTheDocument();

    // Active league badge on Ouro
    expect(screen.getByText('Sua Divisão')).toBeInTheDocument();

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

    // Middle 70% (ranks 3 to 9): Na Disputa (7 badges in table + 1 in legend = 8 total)
    const permanenceBadges = screen.getAllByText('Na Disputa');
    expect(permanenceBadges).toHaveLength(8);

    // Bottom 10% (rank 10): Reforço (1 badge in table; legend is "Zona de Reforço (Últimos 10%)")
    const relegationBadges = screen.getAllByText('Reforço');
    expect(relegationBadges).toHaveLength(1);
  });

  it('restricts visibility of higher leagues (locked) and does not leak participant names or XP', () => {
    renderWithProviders(
      <WeeklyLeagueLeaderboard
        initialLeague="GOLD"
        leaderboardData={MOCK_LEAGUE_LEADERBOARDS.GOLD}
        currentUserId="usr-123"
      />
    );

    // Click Diamante tab (which is locked for a Gold user)
    const diamondTab = screen.getByRole('tab', { name: /Diamante/i });
    fireEvent.click(diamondTab);

    // Header updates to Liga Diamante with Divisão Bloqueada badge
    expect(screen.getByRole('heading', { level: 2, name: 'Liga Diamante' })).toBeInTheDocument();
    expect(screen.getByText('Divisão Bloqueada')).toBeInTheDocument();

    // Locked explanation is displayed
    expect(screen.getByRole('heading', { level: 3, name: 'Classificação Bloqueada' })).toBeInTheDocument();
    expect(screen.getByText(/Os participantes da/i)).toBeInTheDocument();

    // Diamond students are STRICTLY NOT rendered
    expect(screen.queryByText('Arthur Nogueira')).not.toBeInTheDocument();
    expect(screen.queryByText('Yasmin Vasconcelos')).not.toBeInTheDocument();

    // Click "Voltar para Minha Liga"
    const returnButton = screen.getByRole('button', { name: /Voltar para Minha Liga/i });
    fireEvent.click(returnButton);

    // Restores Gold league and shows active participants again
    expect(screen.getByRole('heading', { level: 2, name: 'Liga Ouro' })).toBeInTheDocument();
    expect(screen.getByText('Beatriz Costa')).toBeInTheDocument();
    expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
  });

  it('restricts visibility of lower leagues (completed) and does not leak participant names or XP', () => {
    renderWithProviders(
      <WeeklyLeagueLeaderboard
        initialLeague="GOLD"
        leaderboardData={MOCK_LEAGUE_LEADERBOARDS.GOLD}
        currentUserId="usr-123"
      />
    );

    // Click Prata tab (which is completed for a Gold user)
    const silverTab = screen.getByRole('tab', { name: /Prata/i });
    fireEvent.click(silverTab);

    // Header updates to Liga Prata with Divisão Concluída badge
    expect(screen.getByRole('heading', { level: 2, name: 'Liga Prata' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Divisão Concluída' })).toBeInTheDocument();

    // Completed explanation is displayed
    expect(screen.getByText(/Você já superou esta divisão e atualmente compete na/i)).toBeInTheDocument();

    // Silver students are STRICTLY NOT rendered
    expect(screen.queryByText('Rodrigo Alencar')).not.toBeInTheDocument();
    expect(screen.queryByText('Fernanda Neves')).not.toBeInTheDocument();

    // Click "Voltar para Minha Liga"
    const returnButton = screen.getByRole('button', { name: /Voltar para Minha Liga/i });
    fireEvent.click(returnButton);

    // Restores Gold league
    expect(screen.getByRole('heading', { level: 2, name: 'Liga Ouro' })).toBeInTheDocument();
    expect(screen.getByText('Beatriz Costa')).toBeInTheDocument();
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
