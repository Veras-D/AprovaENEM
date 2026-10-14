import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { DEFAULT_TENANT } from '@/tenants/default';

describe('Header component', () => {
  beforeEach(() => {
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

  it('should render tenant brand identity and White-Label badge', () => {
    render(<Header onOpenDrawer={vi.fn()} />);

    expect(screen.getByText('AprovaENEM Social')).toBeInTheDocument();
    expect(screen.getByText('White-Label')).toBeInTheDocument();
    expect(screen.getByText('Preparatório Popular Acessível para o ENEM')).toBeInTheDocument();
    expect(screen.getByAltText('AprovaENEM Social Logo')).toBeInTheDocument();
  });

  it('should render desktop navigation links and trigger onNavigate', () => {
    const handleNavigate = vi.fn();
    render(<Header onOpenDrawer={vi.fn()} activeSection="practice" onNavigate={handleNavigate} />);

    const practiceBtn = screen.getByRole('button', { name: /Praticar/i });
    const rankingBtn = screen.getByRole('button', { name: /Ranking/i });
    const diagnosticsBtn = screen.getByRole('button', { name: /Diagnóstico/i });

    expect(practiceBtn).toBeInTheDocument();
    expect(rankingBtn).toBeInTheDocument();
    expect(diagnosticsBtn).toBeInTheDocument();

    fireEvent.click(rankingBtn);
    expect(handleNavigate).toHaveBeenCalledWith('leaderboard');
  });

  it('should trigger onOpenDrawer when mobile hamburger button is clicked', () => {
    const handleOpenDrawer = vi.fn();
    render(<Header onOpenDrawer={handleOpenDrawer} />);

    const menuBtn = screen.getByRole('button', { name: /Abrir menu de navegação/i });
    expect(menuBtn).toBeInTheDocument();

    fireEvent.click(menuBtn);
    expect(handleOpenDrawer).toHaveBeenCalledTimes(1);
  });

  it('should toggle dark mode on quick toggle click', () => {
    render(<Header onOpenDrawer={vi.fn()} />);

    const themeToggle = screen.getByRole('button', { name: /Ativar modo escuro/i });
    expect(themeToggle).toBeInTheDocument();

    fireEvent.click(themeToggle);
    expect(useTenantStore.getState().isDarkMode).toBe(true);
  });

  it('should show anonymous session ID when unauthenticated', () => {
    render(<Header onOpenDrawer={vi.fn()} />);

    expect(screen.getByText(/Sessão Anônima:/i)).toBeInTheDocument();
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

    render(<Header onOpenDrawer={vi.fn()} />);

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('should call onOpenAuthModal when clicking Entrar', () => {
    const handleOpenAuth = vi.fn();
    render(<Header onOpenDrawer={vi.fn()} onOpenAuthModal={handleOpenAuth} />);

    const entrarBtn = screen.getByRole('button', { name: /Entrar/i });
    fireEvent.click(entrarBtn);
    expect(handleOpenAuth).toHaveBeenCalledTimes(1);
  });
});
