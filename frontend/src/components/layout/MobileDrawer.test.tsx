import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileDrawer } from './MobileDrawer';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { DEFAULT_TENANT } from '@/tenants/default';

describe('MobileDrawer component', () => {
  beforeEach(() => {
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
    const { container } = render(<MobileDrawer isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render dialog, tenant brand, and navigation items when isOpen is true', () => {
    render(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('AprovaENEM Social')).toBeInTheDocument();
    expect(screen.getByText('Praticar Questões')).toBeInTheDocument();
    expect(screen.getByText('Ranking Semanal')).toBeInTheDocument();
    expect(screen.getByText('Diagnóstico & Desempenho')).toBeInTheDocument();
    expect(screen.getByText('Minha Conta')).toBeInTheDocument();
  });

  it('should call onClose when close button or backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(<MobileDrawer isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /Fechar menu/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should close on Escape key press', () => {
    const handleClose = vi.fn();
    render(<MobileDrawer isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should navigate and close drawer when navigation item is clicked', () => {
    const handleNavigate = vi.fn();
    const handleClose = vi.fn();
    render(
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
    render(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

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

    render(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Carlos Oliveira')).toBeInTheDocument();
    expect(screen.getByText('carlos@escola.gov.br')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('should display LGPD Art. 18 data protection badge', () => {
    render(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/LGPD Art. 18/i)).toBeInTheDocument();
  });
});
