import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InstitutionalDashboard } from './InstitutionalDashboard';
import { MOCK_COHORT_DIAGNOSTICS } from '@/api/mocks/mock-data';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/api/services/auth.service';
import type { UserProfile } from '@/types';

const MOCK_STUDENT_USER: UserProfile = {
  id: 'usr-student-1',
  email: 'aluno@escola.gov.br',
  name: 'Lucas Estudante',
  roles: ['ROLE_STUDENT'],
  isEmailVerified: true,
  createdAt: '2026-09-01T10:00:00Z',
};

const MOCK_COORDINATOR_USER: UserProfile = {
  id: 'usr-coord-1',
  email: 'coordenacao@escola.gov.br',
  name: 'Profª. Helena Ramos',
  roles: ['ROLE_INSTITUTIONAL_ADMIN'],
  isEmailVerified: true,
  createdAt: '2026-08-15T09:00:00Z',
};

describe('InstitutionalDashboard Component - Security & Role Guards', () => {
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
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    vi.clearAllMocks();
  });

  it('renders login gate and hides all cohort data when user is unauthenticated', () => {
    renderWithProviders(
      <InstitutionalDashboard cohortData={MOCK_COHORT_DIAGNOSTICS} />
    );

    // Should display access restriction and institutional login form
    expect(screen.getByText(/Acesso Restrito/i)).toBeInTheDocument();
    
    const emailInput = screen.getByLabelText(/E-mail Institucional/i);
    const passwordInput = screen.getByLabelText(/Senha Institucional/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveValue('');
    expect(emailInput).toHaveAttribute('autoComplete', 'off');

    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveValue('');
    expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');

    expect(screen.getByRole('button', { name: /Acessar Painel da Coordenação/i })).toBeInTheDocument();

    // MUST NOT leak sensitive cohort metrics to unauthenticated visitors
    expect(screen.queryByText('Painel Institucional da Turma')).not.toBeInTheDocument();
    expect(screen.queryByText('42')).not.toBeInTheDocument();
    expect(screen.queryByText('39')).not.toBeInTheDocument();
  });

  it('renders Access Denied (403) and hides cohort data when user is authenticated as a student', () => {
    useAuthStore.setState({
      token: 'mock-student-token',
      user: MOCK_STUDENT_USER,
      isAuthenticated: true,
    });

    renderWithProviders(
      <InstitutionalDashboard cohortData={MOCK_COHORT_DIAGNOSTICS} />
    );

    // Should display 403 Forbidden message
    expect(screen.getByText(/Acesso Negado \(403\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Área Exclusiva da Coordenação Pedagógica/i)).toBeInTheDocument();
    expect(screen.getByText(/Lucas Estudante/i)).toBeInTheDocument();

    // MUST NOT leak cohort metrics to students
    expect(screen.queryByText('Painel Institucional da Turma')).not.toBeInTheDocument();
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('renders full cohort view when user is authenticated with coordinator/admin role', () => {
    useAuthStore.setState({
      token: 'mock-coord-token',
      user: MOCK_COORDINATOR_USER,
      isAuthenticated: true,
    });

    renderWithProviders(
      <InstitutionalDashboard cohortData={MOCK_COHORT_DIAGNOSTICS} />
    );

    // Coordinator view is rendered
    expect(screen.getByText('Painel da Coordenação Pedagógica')).toBeInTheDocument();
    expect(screen.getByText(/Coordenador: Profª. Helena Ramos/i)).toBeInTheDocument();
    expect(screen.getByText('Painel Institucional da Turma')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument(); // Enrolled
    expect(screen.getByText('39')).toBeInTheDocument(); // Active
  });

  it('invokes onNavigate to return to student portal when clicking return button in coordinator view', () => {
    useAuthStore.setState({
      token: 'mock-coord-token',
      user: MOCK_COORDINATOR_USER,
      isAuthenticated: true,
    });

    const onNavigateMock = vi.fn();

    renderWithProviders(
      <InstitutionalDashboard
        cohortData={MOCK_COHORT_DIAGNOSTICS}
        onNavigate={onNavigateMock}
      />
    );

    const backButton = screen.getByRole('button', { name: /Voltar ao Portal do Aluno/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(onNavigateMock).toHaveBeenCalledWith('home');
  });

  it('authenticates coordinator and unlocks dashboard upon form submission', async () => {
    vi.spyOn(authService, 'login').mockResolvedValueOnce({
      token: 'jwt-coord-token',
      expiresInSeconds: 86400,
      user: MOCK_COORDINATOR_USER,
    });

    renderWithProviders(
      <InstitutionalDashboard cohortData={MOCK_COHORT_DIAGNOSTICS} />
    );

    fireEvent.change(screen.getByLabelText(/E-mail Institucional/i), {
      target: { value: 'coordenacao@escola.gov.br' },
    });
    fireEvent.change(screen.getByLabelText(/Senha Institucional/i), {
      target: { value: 'SecretPassword123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Acessar Painel da Coordenação/i }));

    await waitFor(() => {
      expect(screen.getByText('Painel Institucional da Turma')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });
});
