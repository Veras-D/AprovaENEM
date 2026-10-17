import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountErasureModal } from './AccountErasureModal';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { authService } from '@/api/services/auth.service';

vi.mock('@/api/services/auth.service', () => ({
  authService: {
    deleteAccount: vi.fn(),
  },
}));

describe('AccountErasureModal Component', () => {
  const handleClose = vi.fn();
  const handleSuccess = vi.fn();
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
    useAuthStore.setState({
      user: {
        id: 'user-lgpd-test',
        email: 'aluno@enem.br',
        name: 'Carlos Oliveira',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      token: 'mock-jwt-token',
      isAuthenticated: true,
    });
    useSessionStore.setState({
      anonymousSessionId: 'anon-test',
      attempts: {
        'q-1': {
          questionId: 'q-1',
          selectedOption: 'B',
          isCorrect: true,
          timeSpentSeconds: 30,
          answeredAt: '2026-10-16T12:00:00Z',
        },
      },
    });
  });

  it('should not render anything when isOpen is false', () => {
    const { container } = renderWithProviders(
      <AccountErasureModal isOpen={false} onClose={handleClose} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render dialog with accessible attributes when isOpen is true', () => {
    renderWithProviders(<AccountErasureModal isOpen={true} onClose={handleClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'erasure-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'erasure-modal-description');
    expect(screen.getByRole('heading', { name: 'Eliminar Conta Definitivamente' })).toBeInTheDocument();
    expect(screen.getByText(/Direito de Eliminação • LGPD Art\. 18, inciso VI/i)).toBeInTheDocument();
    expect(screen.getByText(/Carlos Oliveira/i)).toBeInTheDocument();
  });

  it('should have delete button disabled until both checkboxes are checked and EXCLUIR is typed', () => {
    renderWithProviders(<AccountErasureModal isOpen={true} onClose={handleClose} />);

    const deleteBtn = screen.getByRole('button', { name: /Eliminar Conta Definitivamente/i });
    expect(deleteBtn).toBeDisabled();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    const [firstBox, secondBox] = checkboxes;
    if (!firstBox || !secondBox) throw new Error('Checkboxes not found');

    // Check first checkbox only
    fireEvent.click(firstBox);
    expect(deleteBtn).toBeDisabled();

    // Check second checkbox
    fireEvent.click(secondBox);
    expect(deleteBtn).toBeDisabled();

    // Type incorrect challenge string
    const input = screen.getByLabelText(/Para confirmar, digite/i);
    fireEvent.change(input, { target: { value: 'DELETE' } });
    expect(deleteBtn).toBeDisabled();

    // Type "excluir" (lowercase, should accept case-insensitively)
    fireEvent.change(input, { target: { value: 'excluir' } });
    expect(deleteBtn).not.toBeDisabled();
  });

  it('should execute deletion mutation, clear store states, and display success banner', async () => {
    vi.mocked(authService.deleteAccount).mockResolvedValue(undefined);

    renderWithProviders(
      <AccountErasureModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    const [firstBox, secondBox] = checkboxes;
    if (!firstBox || !secondBox) throw new Error('Checkboxes not found');
    fireEvent.click(firstBox);
    fireEvent.click(secondBox);

    const input = screen.getByLabelText(/Para confirmar, digite/i);
    fireEvent.change(input, { target: { value: 'EXCLUIR' } });

    const deleteBtn = screen.getByRole('button', { name: /Eliminar Conta Definitivamente/i });
    expect(deleteBtn).not.toBeDisabled();
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(authService.deleteAccount).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Conta e Dados Eliminados com Sucesso/i)).toBeInTheDocument();
      // Verify auth and session store were cleared
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useSessionStore.getState().attempts).toEqual({});
    });
  });

  it('should display error message if account deletion fails', async () => {
    vi.mocked(authService.deleteAccount).mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<AccountErasureModal isOpen={true} onClose={handleClose} />);

    const checkboxes = screen.getAllByRole('checkbox');
    const [firstBox, secondBox] = checkboxes;
    if (!firstBox || !secondBox) throw new Error('Checkboxes not found');
    fireEvent.click(firstBox);
    fireEvent.click(secondBox);

    const input = screen.getByLabelText(/Para confirmar, digite/i);
    fireEvent.change(input, { target: { value: 'EXCLUIR' } });

    const deleteBtn = screen.getByRole('button', { name: /Eliminar Conta Definitivamente/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Falha ao eliminar a conta\. Verifique sua conexão com a internet e tente novamente\./i)
      ).toBeInTheDocument();
    });
  });

  it('should close on Escape key and Cancel button', () => {
    renderWithProviders(<AccountErasureModal isOpen={true} onClose={handleClose} />);

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should render unauthenticated fallback when user is not logged in', () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    renderWithProviders(<AccountErasureModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Nenhuma Conta Conectada')).toBeInTheDocument();
    expect(
      screen.getByText(/A solicitação de exclusão definitiva de conta e dados cadastrais .* só pode ser realizada quando você estiver conectado/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar Conta Definitivamente/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Para confirmar, digite/i)).not.toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Fechar' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
