import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfileModal } from './UserProfileModal';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/api/services/auth.service';
import { gamificationService } from '@/api/services/gamification.service';
import { MOCK_GAMIFICATION_PROFILE } from '@/api/mocks/mock-data';

describe('UserProfileModal Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    useAuthStore.setState({
      token: 'mock-jwt-token',
      isAuthenticated: true,
      user: {
        id: 'usr-456',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@escola.gov.br',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        schoolType: 'PUBLIC_SCHOOL',
        targetDegree: 'Medicina',
        createdAt: '2026-09-01T12:00:00Z',
      },
    });

    vi.clearAllMocks();
    vi.spyOn(authService, 'updateProfile').mockResolvedValue({
      id: 'usr-456',
      name: 'Maria Oliveira',
      email: 'maria.oliveira@escola.gov.br',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      createdAt: '2026-09-01T12:00:00Z',
    });
    vi.spyOn(gamificationService, 'getGamificationProfile').mockResolvedValue(MOCK_GAMIFICATION_PROFILE);
    vi.spyOn(gamificationService, 'updateDailyGoal').mockResolvedValue();

    if (typeof window !== 'undefined') {
      window.URL.createObjectURL = vi.fn(() => 'blob:mock');
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  it('renders student profile modal with header, email and initial values when open', () => {
    renderWithProviders(<UserProfileModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Meu Perfil • AprovaENEM/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Maria Oliveira')).toBeInTheDocument();
    expect(screen.getByDisplayValue('maria.oliveira@escola.gov.br')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Medicina')).toBeInTheDocument();
    expect(screen.getByText('Verificado')).toBeInTheDocument();
  });

  it('updates profile data and shows success feedback when form is submitted', async () => {
    const updateProfileSpy = vi.spyOn(authService, 'updateProfile').mockResolvedValueOnce({
      id: 'usr-456',
      name: 'Maria Santos',
      email: 'maria.oliveira@escola.gov.br',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      schoolType: 'PUBLIC_SCHOOL',
      targetDegree: 'Engenharia de Software',
      createdAt: '2026-09-01T12:00:00Z',
    });

    renderWithProviders(<UserProfileModal isOpen={true} onClose={vi.fn()} />);

    const nameInput = screen.getByDisplayValue('Maria Oliveira');
    fireEvent.change(nameInput, { target: { value: 'Maria Santos' } });

    const degreeInput = screen.getByDisplayValue('Medicina');
    fireEvent.change(degreeInput, { target: { value: 'Engenharia de Software' } });

    const submitBtn = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updateProfileSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Maria Santos',
          targetDegree: 'Engenharia de Software',
        })
      );
    });

    expect(screen.getByText(/Perfil e metas de estudo atualizados com sucesso!/i)).toBeInTheDocument();
  });

  it('allows changing daily study goal target questions', async () => {
    const updateDailyGoalSpy = vi.spyOn(gamificationService, 'updateDailyGoal').mockResolvedValueOnce();

    renderWithProviders(<UserProfileModal isOpen={true} onClose={vi.fn()} />);

    // Click 10 questions goal button
    const goalBtn = screen.getByRole('button', { name: /^10\b/i });
    fireEvent.click(goalBtn);

    const submitBtn = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updateDailyGoalSpy).toHaveBeenCalledWith(10);
    });
  });

  it('switches to security tab and validates password change requirements', async () => {
    const updateProfileSpy = vi.spyOn(authService, 'updateProfile').mockResolvedValueOnce({
      id: 'usr-456',
      name: 'Maria Oliveira',
      email: 'maria.oliveira@escola.gov.br',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      createdAt: '2026-09-01T12:00:00Z',
    });

    renderWithProviders(<UserProfileModal isOpen={true} onClose={vi.fn()} />);

    // Switch to Security tab
    fireEvent.click(screen.getByRole('button', { name: /Segurança/i }));

    expect(screen.getByLabelText(/Senha Atual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nova Senha/i)).toBeInTheDocument();

    // Fill password form
    fireEvent.change(screen.getByLabelText(/Senha Atual/i), { target: { value: 'OldPassword@123' } });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), { target: { value: 'NewSecurePassword@2026' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Nova Senha/i), { target: { value: 'NewSecurePassword@2026' } });

    const submitBtn = screen.getByRole('button', { name: /Atualizar Senha/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updateProfileSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          currentPassword: 'OldPassword@123',
          newPassword: 'NewSecurePassword@2026',
        })
      );
    });

    expect(screen.getByText(/Sua senha foi alterada com sucesso!/i)).toBeInTheDocument();
  });

  it('switches to privacy tab and allows data export', async () => {
    const exportSpy = vi.spyOn(authService, 'exportUserData').mockResolvedValueOnce({
      userId: 'usr-456',
      email: 'maria.oliveira@escola.gov.br',
    });

    renderWithProviders(<UserProfileModal isOpen={true} onClose={vi.fn()} />);

    // Switch to Privacy & LGPD tab
    fireEvent.click(screen.getByRole('button', { name: /Privacidade & LGPD/i }));

    expect(screen.getByText(/Portabilidade de Dados \(Art\. 18, V\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Eliminação Definitiva da Conta \(Art\. 18, VI\)/i)).toBeInTheDocument();

    const exportBtn = screen.getByRole('button', { name: /Exportar JSON/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(exportSpy).toHaveBeenCalled();
    });

    expect(screen.getByText(/Download do relatório LGPD concluído com sucesso!/i)).toBeInTheDocument();
  });

  it('opens account erasure modal when clicking delete account in privacy tab', () => {
    const onOpenErasureModalMock = vi.fn();
    const onCloseMock = vi.fn();

    renderWithProviders(
      <UserProfileModal
        isOpen={true}
        onClose={onCloseMock}
        onOpenErasureModal={onOpenErasureModalMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Privacidade & LGPD/i }));

    const deleteAccountBtn = screen.getByRole('button', { name: /Excluir Conta/i });
    fireEvent.click(deleteAccountBtn);

    expect(onCloseMock).toHaveBeenCalled();
    expect(onOpenErasureModalMock).toHaveBeenCalled();
  });

  it('closes modal on close button click and escape key press', () => {
    const onCloseMock = vi.fn();

    renderWithProviders(<UserProfileModal isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByRole('button', { name: /Fechar perfil/i });
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });
});
