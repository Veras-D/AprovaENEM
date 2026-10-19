import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './Header';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { DEFAULT_TENANT } from '@/tenants/default';

describe('Header component', () => {
  let queryClient: QueryClient;

  const renderWithClient = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    useTenantStore.setState({
      currentTenant: {
        ...DEFAULT_TENANT,
        name: 'AprovaENEM Social',
        tagline: 'Preparatório Popular Acessível para o ENEM',
      },
      isDarkMode: false,
    });
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
    useSessionStore.setState({
      anonymousSessionId: 'anon-test-1234567890',
    });
  });

  it('should render tenant brand identity and Portal do Aluno badge', () => {
    renderWithClient(<Header onOpenDrawer={vi.fn()} />);

    expect(screen.getByText('AprovaENEM Social')).toBeInTheDocument();
    expect(screen.getByText('Portal do Aluno')).toBeInTheDocument();
    expect(screen.getByText('Preparatório Popular Acessível para o ENEM')).toBeInTheDocument();
    expect(screen.getByAltText('AprovaENEM Social Logo')).toBeInTheDocument();
  });

  it('should render desktop navigation links and trigger onNavigate', () => {
    const handleNavigate = vi.fn();
    renderWithClient(
      <Header onOpenDrawer={vi.fn()} activeSection="practice" onNavigate={handleNavigate} />
    );

    const homeBtn = screen.getByRole('button', { name: /Início/i });
    const practiceBtn = screen.getByRole('button', { name: /Praticar/i });
    const rankingBtn = screen.getByRole('button', { name: /Ranking/i });
    const diagnosticsBtn = screen.getByRole('button', { name: /Diagnóstico/i });

    expect(homeBtn).toBeInTheDocument();
    expect(practiceBtn).toBeInTheDocument();
    expect(rankingBtn).toBeInTheDocument();
    expect(diagnosticsBtn).toBeInTheDocument();

    fireEvent.click(rankingBtn);
    expect(handleNavigate).toHaveBeenCalledWith('leaderboard');

    const brandBtn = screen.getByRole('button', { name: /AprovaENEM/i });
    fireEvent.click(brandBtn);
    expect(handleNavigate).toHaveBeenCalledWith('home');
  });

  it('should trigger onOpenDrawer when mobile hamburger button is clicked', () => {
    const handleOpenDrawer = vi.fn();
    renderWithClient(<Header onOpenDrawer={handleOpenDrawer} />);

    const menuBtn = screen.getByRole('button', { name: /Abrir menu de navegação/i });
    expect(menuBtn).toBeInTheDocument();

    fireEvent.click(menuBtn);
    expect(handleOpenDrawer).toHaveBeenCalledTimes(1);
  });

  it('should toggle dark mode on quick toggle click', () => {
    renderWithClient(<Header onOpenDrawer={vi.fn()} />);

    const themeToggle = screen.getByRole('button', { name: /Ativar modo escuro/i });
    expect(themeToggle).toBeInTheDocument();

    fireEvent.click(themeToggle);
    expect(useTenantStore.getState().isDarkMode).toBe(true);
  });

  it('should show login button when unauthenticated without leaking internal session IDs', () => {
    renderWithClient(<Header onOpenDrawer={vi.fn()} />);

    expect(screen.queryByText(/Sessão Anônima:/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('should show user profile name and avatar initial when authenticated', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-1',
        name: 'Maria Silva',
        email: 'maria@example.com',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      isAuthenticated: true,
    });

    renderWithClient(<Header onOpenDrawer={vi.fn()} />);

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sair da conta/i })).toBeInTheDocument();
  });

  it('should call onOpenAuthModal when clicking Entrar', () => {
    const handleOpenAuth = vi.fn();
    renderWithClient(<Header onOpenDrawer={vi.fn()} onOpenAuthModal={handleOpenAuth} />);

    const entrarBtn = screen.getByRole('button', { name: /Entrar/i });
    fireEvent.click(entrarBtn);
    expect(handleOpenAuth).toHaveBeenCalledTimes(1);
  });

  it('should clear authentication, reset session and clear query cache on logout', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-1',
        name: 'Maria Silva',
        email: 'maria@example.com',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      isAuthenticated: true,
    });
    const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');
    const handleLogout = vi.fn();

    renderWithClient(<Header onOpenDrawer={vi.fn()} onLogout={handleLogout} />);

    const sairBtn = screen.getByRole('button', { name: /Sair da conta/i });
    expect(sairBtn).toBeInTheDocument();

    fireEvent.click(sairBtn);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(removeQueriesSpy).toHaveBeenCalledTimes(1);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('should render Painel da Coordenação badge and Portal do Aluno return button when activeSection is institutional and user is coordinator', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-coord',
        email: 'coord@escola.gov.br',
        name: 'Coordenador',
        roles: ['ROLE_INSTITUTIONAL_ADMIN'],
        isEmailVerified: true,
        createdAt: '2026-08-01T10:00:00Z',
      },
      isAuthenticated: true,
    });

    const handleNavigate = vi.fn();
    renderWithClient(
      <Header onOpenDrawer={vi.fn()} activeSection="institutional" onNavigate={handleNavigate} />
    );

    expect(screen.getByText('Painel da Coordenação')).toBeInTheDocument();

    const returnBtn = screen.getByRole('button', { name: /Portal do Aluno/i });
    expect(returnBtn).toBeInTheDocument();

    fireEvent.click(returnBtn);
    expect(handleNavigate).toHaveBeenCalledWith('home');
  });

  it('should NOT render Painel da Coordenação button for unauthenticated users', () => {
    renderWithClient(<Header onOpenDrawer={vi.fn()} activeSection="practice" />);
    expect(screen.queryByText('Painel da Coordenação')).not.toBeInTheDocument();
  });

  it('should NOT render Painel da Coordenação button for regular students', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-student',
        email: 'aluno@escola.gov.br',
        name: 'Aluno',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-08-01T10:00:00Z',
      },
      isAuthenticated: true,
    });

    renderWithClient(<Header onOpenDrawer={vi.fn()} activeSection="practice" />);
    expect(screen.queryByText('Painel da Coordenação')).not.toBeInTheDocument();
  });

  it('should render Painel da Coordenação button when user has coordinator role', () => {
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

    renderWithClient(<Header onOpenDrawer={vi.fn()} activeSection="practice" />);
    expect(screen.getByText('Painel da Coordenação')).toBeInTheDocument();
  });

  it('should render coordinator navigation links and NOT student links when activeSection is institutional', () => {
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

    renderWithClient(<Header onOpenDrawer={vi.fn()} activeSection="institutional" />);

    // Coordinator navigation items MUST be present
    expect(screen.getByRole('button', { name: /Turmas & Métricas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Radar Comparativo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tópicos Críticos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Análise de Distratores/i })).toBeInTheDocument();

    // Student navigation items MUST NOT be present in coordinator mode
    expect(screen.queryByRole('button', { name: /^Praticar$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Ranking$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Diagnóstico$/i })).not.toBeInTheDocument();
  });

  it('should scroll smoothly when clicking coordinator anchor links', () => {
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
    targetElement.id = 'cohort-radar';
    targetElement.scrollIntoView = vi.fn();
    document.body.appendChild(targetElement);

    renderWithClient(<Header onOpenDrawer={vi.fn()} activeSection="institutional" />);

    const radarBtn = screen.getByRole('button', { name: /Radar Comparativo/i });
    fireEvent.click(radarBtn);

    expect(targetElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(targetElement);
  });
});
