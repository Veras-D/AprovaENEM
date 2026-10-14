import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RootLayout } from './RootLayout';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { DEFAULT_TENANT } from '@/tenants/default';

describe('RootLayout component', () => {
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
    render(
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
    render(
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
});
