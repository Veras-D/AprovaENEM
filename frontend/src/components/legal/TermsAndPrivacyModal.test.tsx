import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TermsAndPrivacyModal } from './TermsAndPrivacyModal';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { authService } from '@/api/services/auth.service';

vi.mock('@/api/services/auth.service', () => ({
  authService: {
    exportUserData: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

describe('TermsAndPrivacyModal Component', () => {
  const handleClose = vi.fn();
  const handleOpenErasure = vi.fn();
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
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false });
    useSessionStore.setState({
      anonymousSessionId: 'anon-test-123',
      attempts: {
        'q-1': {
          questionId: 'q-1',
          selectedOption: 'A',
          isCorrect: true,
          timeSpentSeconds: 45,
          answeredAt: '2026-10-16T12:00:00Z',
        },
      },
      activeSession: null,
    });

    // Mock URL.createObjectURL and revokeObjectURL for JSDOM
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-export-url');
    window.URL.revokeObjectURL = vi.fn();
  });

  it('should not render anything when isOpen is false', () => {
    const { container } = renderWithProviders(
      <TermsAndPrivacyModal isOpen={false} onClose={handleClose} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render dialog with accessible attributes when isOpen is true', () => {
    renderWithProviders(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'legal-modal-title');
    expect(screen.getByText('Termos de Uso e Privacidade LGPD')).toBeInTheDocument();
  });

  it('should display Terms of Use content by default and allow switching to Privacy & LGPD', () => {
    renderWithProviders(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} />);

    // By default, Terms of Use tab is active
    expect(screen.getByRole('tab', { name: /Termos de Uso/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/1\. Finalidade Educacional e Princípio da Equidade/i)).toBeInTheDocument();

    // Click Privacy & LGPD tab
    const privacyTab = screen.getByRole('tab', { name: /Política de Privacidade & LGPD/i });
    fireEvent.click(privacyTab);

    expect(privacyTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Minimização Extrema de Dados \(LGPD Art\. 6º, III\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Proteção Integral do Adolescente \(Art\. 14 da LGPD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Portabilidade \(Art\. 18, V\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Eliminação Definitiva \(Art\. 18, VI\)/i)).toBeInTheDocument();
  });

  it('should support initialTab="privacy" on open', () => {
    renderWithProviders(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} initialTab="privacy" />);

    expect(screen.getByRole('tab', { name: /Política de Privacidade & LGPD/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Compromisso de Não-Comercialização/i)).toBeInTheDocument();
  });

  it('should call onClose when close button or "Entendido e Fechar" is clicked', () => {
    renderWithProviders(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Fechar termos e privacidade' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const entendidoBtn = screen.getByRole('button', { name: 'Entendido e Fechar' });
    fireEvent.click(entendidoBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should call onClose when Escape key is pressed', () => {
    renderWithProviders(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard Tab focus cycling inside modal', () => {
    renderWithProviders(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Fechar termos e privacidade' });
    const entendidoBtn = screen.getByRole('button', { name: 'Entendido e Fechar' });

    entendidoBtn.focus();
    expect(document.activeElement).toBe(entendidoBtn);

    // Tab on last element should cycle to first
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(closeBtn);

    // Shift+Tab on first element should cycle to last
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(entendidoBtn);
  });

  it('should display unauthenticated notice instead of export button when visitor is logged out', () => {
    renderWithProviders(
      <TermsAndPrivacyModal
        isOpen={true}
        onClose={handleClose}
        initialTab="privacy"
      />
    );

    expect(screen.queryByRole('button', { name: /Exportar Meus Dados \(JSON\)/i })).not.toBeInTheDocument();
    expect(
      screen.getByText(/A exportação de dados cadastrais e histórico completo fica disponível após você entrar na sua conta/i)
    ).toBeInTheDocument();
  });

  it('should call backend export and trigger download when student is authenticated', async () => {
    useAuthStore.setState({
      user: {
        id: 'user-lgpd-1',
        email: 'estudante@enem.br',
        name: 'Maria Silva',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      isAuthenticated: true,
    });

    vi.mocked(authService.exportUserData).mockResolvedValueOnce({
      legalBasis: 'LGPD Artigo 18, V',
      exportedAt: '2026-10-16T12:00:00Z',
      user: { id: 'user-lgpd-1', name: 'Maria Silva' },
    });

    renderWithProviders(
      <TermsAndPrivacyModal
        isOpen={true}
        onClose={handleClose}
        initialTab="privacy"
      />
    );

    const exportBtn = screen.getByRole('button', { name: /Exportar Meus Dados \(JSON\)/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(authService.exportUserData).toHaveBeenCalledTimes(1);
      expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Download Concluído!/i)).toBeInTheDocument();
    });
  });

  it('should display unauthenticated notice instead of erasure button when user is logged out', () => {
    renderWithProviders(
      <TermsAndPrivacyModal
        isOpen={true}
        onClose={handleClose}
        onOpenErasureModal={handleOpenErasure}
        initialTab="privacy"
      />
    );

    expect(screen.queryByRole('button', { name: /Solicitar Exclusão de Conta/i })).not.toBeInTheDocument();
    expect(
      screen.getByText(/A solicitação de exclusão de dados cadastrais fica disponível após você entrar na sua conta/i)
    ).toBeInTheDocument();
  });

  it('should trigger onOpenErasureModal and onClose when clicking Solicitar Exclusão de Conta as authenticated user', () => {
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
      <TermsAndPrivacyModal
        isOpen={true}
        onClose={handleClose}
        onOpenErasureModal={handleOpenErasure}
        initialTab="privacy"
      />
    );

    const erasureBtn = screen.getByRole('button', { name: /Solicitar Exclusão de Conta/i });
    fireEvent.click(erasureBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleOpenErasure).toHaveBeenCalledTimes(1);
  });
});
