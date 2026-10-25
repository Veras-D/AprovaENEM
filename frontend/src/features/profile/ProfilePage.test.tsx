import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfilePage } from './ProfilePage';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/api/services/auth.service';
import { gamificationService } from '@/api/services/gamification.service';
import type { UserProfile } from '@/types';

vi.mock('@/api/services/auth.service', () => ({
  authService: {
    updateProfile: vi.fn(),
    exportUserData: vi.fn(),
  },
}));

vi.mock('@/api/services/gamification.service', () => ({
  gamificationService: {
    getGamificationProfile: vi.fn(),
    updateDailyGoal: vi.fn(),
  },
}));

const mockUser: UserProfile = {
  id: 'user-12345',
  email: 'estudante@enem.org.br',
  name: 'Maria Clara Silva',
  roles: ['ROLE_STUDENT'],
  isEmailVerified: true,
  createdAt: '2026-01-15T10:00:00Z',
  schoolType: 'PUBLIC_SCHOOL',
  targetDegree: 'Medicina (USP)',
};

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('ProfilePage Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: true,
      user: mockUser,
      token: 'valid-jwt-token',
    });

    vi.mocked(gamificationService.getGamificationProfile).mockResolvedValue({
      userId: 'user-12345',
      currentXp: 450,
      level: 3,
      levelTitle: 'Calouro Iniciante',
      currentStreakDays: 7,
      longestStreakDays: 14,
      streakFreezeAvailable: true,
      dailyGoalTarget: 5,
      dailyGoalProgress: 3,
      weeklyLeague: 'SILVER',
      unlockedBadges: ['PRIMEIRO_PASSO'],
    });

    vi.mocked(authService.updateProfile).mockResolvedValue({
      ...mockUser,
      name: 'Maria Clara Souza',
    });

    vi.mocked(gamificationService.updateDailyGoal).mockResolvedValue(undefined as never);

    vi.mocked(authService.exportUserData).mockResolvedValue({
      userId: 'user-12345',
      email: 'estudante@enem.org.br',
      fullName: 'Maria Clara Silva',
      role: 'ROLE_STUDENT',
      schoolType: 'PUBLIC_SCHOOL',
      targetDegree: 'Medicina (USP)',
      exportedAt: '2026-10-24T20:00:00Z',
    });
  });

  it('renders guest message when user is not authenticated', () => {
    useAuthStore.setState({ isAuthenticated: false, user: null });
    renderWithClient(<ProfilePage onNavigate={vi.fn()} />);

    expect(screen.getByText(/acesse seu perfil de estudante/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fazer login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta grátis/i })).toBeInTheDocument();
  });

  it('renders full student profile page with identity card and stats', () => {
    renderWithClient(<ProfilePage onNavigate={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 1, name: /meu perfil & configurações/i })).toBeInTheDocument();
    expect(screen.getByText('Maria Clara Silva')).toBeInTheDocument();
    expect(screen.getByText('estudante@enem.org.br')).toBeInTheDocument();
    expect(screen.getByText(/objetivo sisu: medicina \(usp\)/i)).toBeInTheDocument();
    expect(screen.getByText('Escola Pública')).toBeInTheDocument();
  });

  it('contains NO password change form or security tab', () => {
    renderWithClient(<ProfilePage onNavigate={vi.fn()} />);

    expect(screen.queryByText(/segurança/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/senha atual/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nova senha/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/atualizar senha/i)).not.toBeInTheDocument();
  });

  it('allows customizing and saving avatar configuration', () => {
    renderWithClient(<ProfilePage onNavigate={vi.fn()} />);

    expect(screen.getByText(/criador de avatar estilo duolingo/i)).toBeInTheDocument();
    const saveAvatarBtn = screen.getByRole('button', { name: /salvar meu avatar/i });
    fireEvent.click(saveAvatarBtn);

    expect(screen.getByText(/avatar salvo com sucesso!/i)).toBeInTheDocument();
  });

  it('updates personal data and school type via form submission', async () => {
    renderWithClient(<ProfilePage onNavigate={vi.fn()} />);

    const nameInput = screen.getByLabelText(/nome completo/i);
    fireEvent.change(nameInput, { target: { value: 'Maria Clara Souza' } });

    // Open school type custom Select dropdown
    const schoolSelectTrigger = screen.getByRole('combobox');
    fireEvent.click(schoolSelectTrigger);

    // Select private school option from custom accessible listbox
    const privateOption = screen.getByRole('option', { name: /escola privada/i });
    fireEvent.click(privateOption);

    const submitBtn = screen.getByRole('button', { name: /salvar alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Maria Clara Souza',
          schoolType: 'PRIVATE_SCHOOL',
        })
      );
    });
  });

  it('updates daily study goal target when clicking a target pill', async () => {
    renderWithClient(<ProfilePage onNavigate={vi.fn()} />);

    // Click 10 questions goal pill
    const goal10Btn = screen.getByRole('button', { name: /10 questões/i });
    fireEvent.click(goal10Btn);

    await waitFor(() => {
      expect(gamificationService.updateDailyGoal).toHaveBeenCalledWith(10);
    });
  });

  it('updates daily study goal target when clicking explicit save daily goal button', async () => {
    renderWithClient(<ProfilePage onNavigate={vi.fn()} />);

    const saveGoalBtn = screen.getByRole('button', { name: /salvar meta diária/i });
    expect(saveGoalBtn).toBeInTheDocument();
    fireEvent.click(saveGoalBtn);

    await waitFor(() => {
      expect(gamificationService.updateDailyGoal).toHaveBeenCalledWith(5);
    });
  });

  it('triggers account erasure modal when clicking delete account button', () => {
    const onOpenErasureModal = vi.fn();
    renderWithClient(<ProfilePage onOpenErasureModal={onOpenErasureModal} />);

    const deleteBtn = screen.getByRole('button', { name: /excluir minha conta permanentemente/i });
    fireEvent.click(deleteBtn);

    expect(onOpenErasureModal).toHaveBeenCalledTimes(1);
  });

  it('navigates back to practice when clicking return button', () => {
    const onNavigate = vi.fn();
    renderWithClient(<ProfilePage onNavigate={onNavigate} />);

    const backBtn = screen.getByRole('button', { name: /voltar aos estudos/i });
    fireEvent.click(backBtn);

    expect(onNavigate).toHaveBeenCalledWith('practice');
  });

  it('displays verified email badge when user email is verified', () => {
    renderWithClient(<ProfilePage onNavigate={vi.fn()} />);

    expect(screen.getByText(/E-mail Verificado/i)).toBeInTheDocument();
    expect(screen.getByText(/^Verificado$/i)).toBeInTheDocument();
  });

  it('displays pending email verification badge and confirm button when unverified', () => {
    useAuthStore.setState({
      user: { ...mockUser, isEmailVerified: false },
    });

    renderWithClient(<ProfilePage onNavigate={vi.fn()} />);

    expect(screen.getByText(/Confirmação Pendente/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar Agora/i })).toBeInTheDocument();
  });
});
