import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootLayout } from './RootLayout';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { DEFAULT_TENANT } from '@/tenants/default';

describe('RootLayout component', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

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

  it('should render header, children content, sticky bottom navigation, and footer', () => {
    renderWithProviders(
      <RootLayout>
        <div data-testid="test-content">Conteúdo Principal do Teste</div>
      </RootLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('AprovaENEM Social')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Pular para o conteúdo principal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Menu de ferramentas de acessibilidade/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /Navegação móvel inferior/i })).toBeInTheDocument();
    expect(screen.getByText(/Privacidade LGPD \(Lei nº 13\.709\/2018\)/i)).toBeInTheDocument();
  });

  it('should open and close mobile drawer via Header hamburger trigger and close button', () => {
    renderWithProviders(
      <RootLayout>
        <div>Corpo</div>
      </RootLayout>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const openDrawerBtn = screen.getByRole('button', { name: /Abrir menu de navegação/i });
    fireEvent.click(openDrawerBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Fechar menu/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should open Auth modal when clicking Entrar in header', () => {
    renderWithProviders(
      <RootLayout>
        <div>Corpo</div>
      </RootLayout>
    );

    const entrarBtn = screen.getByRole('button', { name: /Entrar/i });
    fireEvent.click(entrarBtn);

    expect(screen.getByRole('dialog', { name: /Acessar Minha Conta/i })).toBeInTheDocument();
  });

  it('should open Terms and Privacy modal when clicking footer legal link', () => {
    renderWithProviders(
      <RootLayout>
        <div>Corpo</div>
      </RootLayout>
    );

    const legalBtn = screen.getByRole('button', { name: /Termos de Uso e Privacidade/i });
    fireEvent.click(legalBtn);

    expect(screen.getByRole('dialog', { name: /Termos de Uso e Privacidade LGPD/i })).toBeInTheDocument();
  });

  it('should not show account erasure link in footer whether user is authenticated or unauthenticated', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-123',
        name: 'Ana Souza',
        email: 'ana@example.com',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      token: 'jwt-token',
      isAuthenticated: true,
    });

    renderWithProviders(
      <RootLayout>
        <div>Corpo</div>
      </RootLayout>
    );

    expect(screen.queryByRole('button', { name: /Exclusão de Conta \(Art\. 18\)/i })).not.toBeInTheDocument();
  });

  it('should open Account Erasure modal when receiving aprovaenem:open-erasure-modal event', () => {
    renderWithProviders(
      <RootLayout>
        <div>Corpo</div>
      </RootLayout>
    );

    act(() => {
      window.dispatchEvent(new CustomEvent('aprovaenem:open-erasure-modal'));
    });

    expect(screen.getByRole('dialog', { name: /Eliminar Conta Definitivamente/i })).toBeInTheDocument();
  });

  it('should NOT render Acesso da Coordenação in the public footer', () => {
    renderWithProviders(
      <RootLayout>
        <div>Corpo</div>
      </RootLayout>
    );

    expect(screen.queryByRole('button', { name: /Acesso da Coordenação/i })).not.toBeInTheDocument();
  });

  it('should display queued LevelUpModal when user switches away from practice tab', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-level-tab',
        name: 'Carlos Nivel',
        email: 'carlos@example.com',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      token: 'jwt-token',
      isAuthenticated: true,
    });

    localStorage.setItem(
      'aprovaenem_pending_level_up_usr-level-tab',
      JSON.stringify({
        newLevel: 4,
        previousLevel: 3,
        levelTitle: 'Veterano ENEM',
        weeklyLeague: 'PRATA',
      })
    );

    const { rerender } = renderWithProviders(
      <RootLayout activeSection="practice">
        <div>Prática em andamento</div>
      </RootLayout>
    );

    // Should not appear while still on the practice tab
    expect(screen.queryByTestId('level-up-modal')).not.toBeInTheDocument();

    // Switch tab to leaderboard
    rerender(
      <QueryClientProvider client={queryClient}>
        <RootLayout activeSection="leaderboard">
          <div>Ranking</div>
        </RootLayout>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('level-up-modal')).toBeInTheDocument();
    expect(screen.getByText('Nível 4!')).toBeInTheDocument();
    expect(screen.getByText('Veterano ENEM')).toBeInTheDocument();
    expect(localStorage.getItem('aprovaenem_pending_level_up_usr-level-tab')).toBeNull();
  });
});
