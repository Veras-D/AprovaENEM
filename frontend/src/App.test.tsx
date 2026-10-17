import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from './App';
import { useSessionStore } from '@/stores/useSessionStore';

describe('App Root Integration Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.getState().clearSession();
  });

  it('renders LandingPage by default, navigates to PracticeHero via CTA, and switches to GamificationDashboard', async () => {
    render(<App />);

    // Default view is LandingPage
    expect(
      screen.getByRole('heading', {
        name: /Preparação Completa, Inteligente e Acessível para o ENEM/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Começar Simulado Agora/i })).toBeInTheDocument();

    // Click "Começar Simulado Agora" to enter Practice mode
    const startSimBtn = screen.getByRole('button', { name: /Começar Simulado Agora/i });
    fireEvent.click(startSimBtn);

    // Practice view should now be rendered
    await waitFor(() => {
      expect(screen.getByText(/Simulado Rápido ENEM/i)).toBeInTheDocument();
    });

    // Switch to Leaderboard / Gamification via Desktop Header "Ranking"
    const rankingNavButtons = screen.getAllByRole('button', { name: /ranking/i });
    expect(rankingNavButtons.length).toBeGreaterThan(0);
    fireEvent.click(rankingNavButtons[0]!);

    // Now GamificationDashboard should be rendered
    await waitFor(() => {
      expect(screen.getByText('Painel de Conquistas & XP')).toBeInTheDocument();
    });
    expect(screen.getByText('Meta Diária de Estudos')).toBeInTheDocument();
    expect(screen.getByText('Conquistas e Medalhas')).toBeInTheDocument();

    // Click "Praticar Questões" in GamificationDashboard header
    const startPracticeBtn = screen.getByRole('button', {
      name: /Ir para o simulado e praticar questões/i,
    });
    fireEvent.click(startPracticeBtn);

    // Should return to Practice mode
    await waitFor(() => {
      expect(screen.getByText(/Simulado Rápido ENEM/i)).toBeInTheDocument();
    });

    // Return to LandingPage via "Início"
    const homeNavButtons = screen.getAllByRole('button', { name: /início/i });
    expect(homeNavButtons.length).toBeGreaterThan(0);
    fireEvent.click(homeNavButtons[0]!);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /Preparação Completa, Inteligente e Acessível para o ENEM/i,
        })
      ).toBeInTheDocument();
    });
  });

  it('switches to DiagnosticDashboard via navigation', async () => {
    render(<App />);

    const diagNavButtons = screen.getAllByRole('button', { name: /diagnóstico/i });
    expect(diagNavButtons.length).toBeGreaterThan(0);
    fireEvent.click(diagNavButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText('Raio-X Diagnóstico de Habilidades')).toBeInTheDocument();
    });
    expect(screen.getByText('Matriz INEP ENEM')).toBeInTheDocument();
  });
});
