import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('should not show account erasure link in footer when user is unauthenticated', () => {
    renderWithProviders(
      <RootLayout>
        <div>Corpo</div>
      </RootLayout>
    );

    expect(screen.queryByRole('button', { name: /Exclusão de Conta \(Art\. 18\)/i })).not.toBeInTheDocument();
  });

  it('should open Account Erasure modal when clicking footer erasure link as authenticated user', () => {
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

    const erasureBtn = screen.getByRole('button', { name: /Exclusão de Conta \(Art\. 18\)/i });
    fireEvent.click(erasureBtn);

    expect(screen.getByRole('dialog', { name: /Eliminar Conta Definitivamente/i })).toBeInTheDocument();
  });
});
