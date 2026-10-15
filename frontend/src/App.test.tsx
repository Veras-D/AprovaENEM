import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from './App';
import { useSessionStore } from '@/stores/useSessionStore';

describe('App Root Integration Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.getState().clearSession();
  });

  it('renders PracticeHero by default and switches to GamificationDashboard via navigation', async () => {
    render(<App />);

    // Default view is PracticeHero
    expect(
      screen.getByText(/Prática Inteligente com Alinhamento INEP e Tutor IA Socrático/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Simulado Rápido ENEM/i)).toBeInTheDocument();

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

    // Should return to PracticeHero
    await waitFor(() => {
      expect(
        screen.getByText(/Prática Inteligente com Alinhamento INEP e Tutor IA Socrático/i)
      ).toBeInTheDocument();
    });
  });
});
