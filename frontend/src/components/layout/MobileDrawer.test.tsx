import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MobileDrawer } from './MobileDrawer';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { DEFAULT_TENANT } from '@/tenants/default';

describe('MobileDrawer component', () => {
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
      isHighContrast: false,
    });
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  it('should not render anything when isOpen is false', () => {
    const { container } = renderWithClient(<MobileDrawer isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render dialog, tenant brand, and public navigation items when isOpen is true and unauthenticated', () => {
    renderWithClient(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('AprovaENEM Social')).toBeInTheDocument();
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Praticar Questões')).toBeInTheDocument();
    expect(screen.getByText('Minha Conta')).toBeInTheDocument();

    // Personalized student items must NOT be rendered for guests
    expect(screen.queryByText('Ranking Semanal')).not.toBeInTheDocument();
    expect(screen.queryByText('Diagnóstico & Desempenho')).not.toBeInTheDocument();
  });

  it('should render personalized student items (Ranking, Diagnóstico) when authenticated', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-student-1',
        name: 'Aluno ENEM',
        email: 'aluno@enem.com',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-10-14T10:00:00Z',
      },
      token: 'mock-token',
      isAuthenticated: true,
    });

    renderWithClient(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Praticar Questões')).toBeInTheDocument();
    expect(screen.getByText('Ranking Semanal')).toBeInTheDocument();
    expect(screen.getByText('Diagnóstico & Desempenho')).toBeInTheDocument();
    expect(screen.getByText('Minha Conta')).toBeInTheDocument();
  });

  it('should call onClose when close button or backdrop is clicked', () => {
    const handleClose = vi.fn();
    renderWithClient(<MobileDrawer isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /Fechar menu/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should close on Escape key press', () => {
    const handleClose = vi.fn();
    renderWithClient(<MobileDrawer isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should navigate and close drawer when navigation item is clicked', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-student-1',
        name: 'Aluno ENEM',
        email: 'aluno@enem.com',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-10-14T10:00:00Z',
      },
      token: 'mock-token',
      isAuthenticated: true,
    });
    const handleNavigate = vi.fn();
    const handleClose = vi.fn();
    renderWithClient(
      <MobileDrawer
        isOpen={true}
        onClose={handleClose}
        activeSection="practice"
        onNavigate={handleNavigate}
      />
    );

    const rankingBtn = screen.getByText('Ranking Semanal');
    fireEvent.click(rankingBtn);

    expect(handleNavigate).toHaveBeenCalledWith('leaderboard');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should toggle dark mode and high contrast accessibility options', () => {
    renderWithClient(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    const darkModeBtn = screen.getByRole('button', { name: /Modo Escuro/i });
    fireEvent.click(darkModeBtn);
    expect(useTenantStore.getState().isDarkMode).toBe(true);

    const highContrastBtn = screen.getByRole('button', { name: /Alto Contraste/i });
    fireEvent.click(highContrastBtn);
    expect(useTenantStore.getState().isHighContrast).toBe(true);
  });

  it('should render user information when authenticated', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-99',
        name: 'Carlos Oliveira',
        email: 'carlos@escola.gov.br',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      isAuthenticated: true,
    });

    renderWithClient(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Carlos Oliveira')).toBeInTheDocument();
    expect(screen.getByText('carlos@escola.gov.br')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sair da conta/i })).toBeInTheDocument();
  });

  it('should display LGPD Art. 18 data protection badge', () => {
    renderWithClient(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/LGPD Art. 18/i)).toBeInTheDocument();
  });

  it('should call onOpenAuthModal and onClose when clicking Criar Conta ou Entrar', () => {
    const handleClose = vi.fn();
    const handleOpenAuth = vi.fn();
    renderWithClient(
      <MobileDrawer
        isOpen={true}
        onClose={handleClose}
        onOpenAuthModal={handleOpenAuth}
      />
    );

    const authBtn = screen.getByRole('button', { name: /Criar Conta ou Entrar/i });
    fireEvent.click(authBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleOpenAuth).toHaveBeenCalledTimes(1);
  });

  it('should call onOpenLegalModal and onClose when clicking LGPD footer', () => {
    const handleClose = vi.fn();
    const handleOpenLegal = vi.fn();
    renderWithClient(
      <MobileDrawer
        isOpen={true}
        onClose={handleClose}
        onOpenLegalModal={handleOpenLegal}
      />
    );

    const legalBtn = screen.getByRole('button', { name: /LGPD Art\. 18/i });
    fireEvent.click(legalBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleOpenLegal).toHaveBeenCalledTimes(1);
  });

  it('should call clearAuth, clearSession, close drawer, and clear query cache on logout', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-99',
        name: 'Carlos Oliveira',
        email: 'carlos@escola.gov.br',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      isAuthenticated: true,
    });
    const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');
    const handleClose = vi.fn();
    const handleLogout = vi.fn();

    renderWithClient(
      <MobileDrawer
        isOpen={true}
        onClose={handleClose}
        onLogout={handleLogout}
      />
    );

    const sairBtn = screen.getByRole('button', { name: /Sair da conta/i });
    expect(sairBtn).toBeInTheDocument();

    fireEvent.click(sairBtn);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(removeQueriesSpy).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('should NOT render Painel da Coordenação item in drawer for unauthenticated users', () => {
    renderWithClient(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.queryByText(/Painel da Coordenação/i)).not.toBeInTheDocument();
  });

  it('should NOT render Painel da Coordenação item in drawer for regular students', () => {
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

    renderWithClient(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.queryByText(/Painel da Coordenação/i)).not.toBeInTheDocument();
  });

  it('should render Painel da Coordenação item in drawer when user has coordinator role', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-coord',
        email: 'coord@escola.gov.br',
        name: 'Coordenadora Helena',
        roles: ['ROLE_INSTITUTIONAL_ADMIN'],
        isEmailVerified: true,
        createdAt: '2026-08-01T10:00:00Z',
      },
      isAuthenticated: true,
    });

    renderWithClient(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Painel da Coordenação/i)).toBeInTheDocument();
  });

  it('should render coordinator navigation items and NOT student items when activeSection is institutional', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-coord',
        email: 'coord@escola.gov.br',
        name: 'Coordenadora Helena',
        roles: ['ROLE_INSTITUTIONAL_ADMIN'],
        isEmailVerified: true,
        createdAt: '2026-08-01T10:00:00Z',
      },
      isAuthenticated: true,
    });

    renderWithClient(<MobileDrawer isOpen={true} onClose={vi.fn()} activeSection="institutional" />);

    expect(screen.getByText('Menu da Coordenação')).toBeInTheDocument();
    expect(screen.getByText('Visão Geral da Turma')).toBeInTheDocument();
    expect(screen.getByText('Radar Comparativo')).toBeInTheDocument();
    expect(screen.getByText('Tópicos Críticos por Área')).toBeInTheDocument();
    expect(screen.getByText('Análise de Distratores')).toBeInTheDocument();
    expect(screen.getByText('Ir para Portal do Aluno')).toBeInTheDocument();
    expect(screen.getByText('Coordenador')).toBeInTheDocument();

    expect(screen.queryByText('Praticar Questões')).not.toBeInTheDocument();
    expect(screen.queryByText('Ranking Semanal')).not.toBeInTheDocument();
    expect(screen.queryByText('Diagnóstico & Desempenho')).not.toBeInTheDocument();
  });

  it('should scroll smoothly and close drawer when clicking a coordinator section anchor', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-coord',
        email: 'coord@escola.gov.br',
        name: 'Coordenadora Helena',
        roles: ['ROLE_ADMIN'],
        isEmailVerified: true,
        createdAt: '2026-08-01T10:00:00Z',
      },
      isAuthenticated: true,
    });

    const targetElement = document.createElement('div');
    targetElement.id = 'cohort-areas';
    targetElement.scrollIntoView = vi.fn();
    document.body.appendChild(targetElement);

    const handleClose = vi.fn();
    renderWithClient(
      <MobileDrawer isOpen={true} onClose={handleClose} activeSection="institutional" />
    );

    const areasBtn = screen.getByText('Tópicos Críticos por Área');
    fireEvent.click(areasBtn);

    expect(targetElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    document.body.removeChild(targetElement);
  });

  it('should render Acesso da Coordenação and Voltar ao Portal do Aluno in drawer when institutional but unauthenticated', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });

    renderWithClient(<MobileDrawer isOpen={true} onClose={vi.fn()} activeSection="institutional" />);

    expect(screen.getByText('Acesso da Coordenação')).toBeInTheDocument();
    expect(screen.getByText('Voltar ao Portal do Aluno')).toBeInTheDocument();

    expect(screen.queryByText('Visão Geral da Turma')).not.toBeInTheDocument();
    expect(screen.queryByText('Radar Comparativo')).not.toBeInTheDocument();
    expect(screen.queryByText('Praticar Questões')).not.toBeInTheDocument();
  });
});
