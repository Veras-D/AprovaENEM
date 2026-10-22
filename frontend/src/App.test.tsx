import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from './App';
import { useSessionStore } from '@/stores/useSessionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { MOCK_DIAGNOSTIC_REPORT } from '@/api/mocks/mock-data';

describe('App Root Integration Component', () => {
  const mockStudent = {
    id: 'usr-student-1',
    email: 'aluno@enem.com',
    name: 'Estudante ENEM',
    roles: ['ROLE_STUDENT'],
    isEmailVerified: true,
    createdAt: '2026-10-14T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.getState().clearSession();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.clear();
    window.history.pushState({}, '', '/');
    window.location.hash = '';
  });

  it('renders LandingPage by default, navigates to PracticeHero via CTA, and switches to GamificationDashboard when authenticated', async () => {
    localStorage.setItem('aprovaenem_auth_token', 'mock-student-token');
    localStorage.setItem('aprovaenem_auth_user', JSON.stringify(mockStudent));
    useAuthStore.getState().syncAuthFromStorage();

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
      expect(screen.getByText(/Diagnóstico ENEM|Simulado Rápido ENEM/i)).toBeInTheDocument();
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
      expect(screen.getByText(/Diagnóstico ENEM|Simulado Rápido ENEM/i)).toBeInTheDocument();
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

  it('shows the diagnostic empty state (no sample data) for an authenticated student without a diagnostic', async () => {
    localStorage.setItem('aprovaenem_auth_token', 'mock-student-token');
    localStorage.setItem('aprovaenem_auth_user', JSON.stringify(mockStudent));
    useAuthStore.getState().syncAuthFromStorage();

    render(<App />);

    const diagNavButtons = screen.getAllByRole('button', { name: /diagnóstico/i });
    expect(diagNavButtons.length).toBeGreaterThan(0);
    fireEvent.click(diagNavButtons[0]!);

    await waitFor(() => {
      expect(screen.getByTestId('diagnostic-empty-state')).toBeInTheDocument();
    });
    expect(screen.queryByText('Raio-X Diagnóstico de Habilidades')).not.toBeInTheDocument();
  });

  it('switches to DiagnosticDashboard via navigation when authenticated with a saved diagnostic report', async () => {
    localStorage.setItem('aprovaenem_auth_token', 'mock-student-token');
    localStorage.setItem('aprovaenem_auth_user', JSON.stringify(mockStudent));
    useAuthStore.getState().syncAuthFromStorage();
    useSessionStore.setState({ savedDiagnosticReport: MOCK_DIAGNOSTIC_REPORT });

    render(<App />);

    const diagNavButtons = screen.getAllByRole('button', { name: /diagnóstico/i });
    expect(diagNavButtons.length).toBeGreaterThan(0);
    fireEvent.click(diagNavButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText('Raio-X Diagnóstico de Habilidades')).toBeInTheDocument();
    });
    expect(screen.getByText('Matriz INEP ENEM')).toBeInTheDocument();
  });

  it('renders Student Login Gate when unauthenticated visitor navigates directly to ?section=leaderboard', async () => {
    window.history.pushState({}, '', '/?section=leaderboard');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Conquistas, Nível de XP & Ranking da Liga')).toBeInTheDocument();
    });
    expect(screen.getByText(/Acesso Restrito • Área do Aluno/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail do Aluno/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar na Minha Conta/i })).toBeInTheDocument();

    // Sensitive gamification metrics must NOT be rendered
    expect(screen.queryByText('Painel de Conquistas & XP')).not.toBeInTheDocument();
  });

  it('renders Student Login Gate when unauthenticated visitor navigates directly to ?section=diagnostics', async () => {
    window.history.pushState({}, '', '/?section=diagnostics');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Diagnóstico Individual & Radar de Proficiência ENEM')).toBeInTheDocument();
    });
    expect(screen.getByText(/Acesso Restrito • Área do Aluno/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail do Aluno/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar na Minha Conta/i })).toBeInTheDocument();

    // Sensitive diagnostic metrics must NOT be rendered
    expect(screen.queryByText('Raio-X Diagnóstico de Habilidades')).not.toBeInTheDocument();
  });
});
