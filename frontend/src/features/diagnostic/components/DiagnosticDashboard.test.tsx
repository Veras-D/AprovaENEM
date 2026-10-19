import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DiagnosticDashboard } from './DiagnosticDashboard';
import { useAuthStore } from '@/stores/useAuthStore';
import { MOCK_DIAGNOSTIC_REPORT } from '@/api/mocks/mock-data';

describe('DiagnosticDashboard Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  it('renders student diagnostic radar exclusively for the student portal when studentReport is passed', () => {
    renderWithProviders(
      <DiagnosticDashboard studentReport={MOCK_DIAGNOSTIC_REPORT} />
    );

    expect(screen.getByText('Raio-X Diagnóstico de Habilidades')).toBeInTheDocument();
    expect(screen.getByText('Matriz INEP ENEM')).toBeInTheDocument();

    // Institutional coordinator tabs should NOT exist in the student area
    expect(screen.queryByText(/Visão Institucional da Turma/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Painel Institucional da Turma/i)).not.toBeInTheDocument();
  });

  it('invokes onPracticeTopic callback when student chooses to train a topic', () => {
    const onPracticeTopicMock = vi.fn();

    renderWithProviders(
      <DiagnosticDashboard
        studentReport={MOCK_DIAGNOSTIC_REPORT}
        onPracticeTopic={onPracticeTopicMock}
      />
    );

    const topicBtn = screen.getByRole('button', { name: /Brasil Colônia/i });
    expect(topicBtn).toBeInTheDocument();

    fireEvent.click(topicBtn);
    expect(onPracticeTopicMock).toHaveBeenCalledWith('Brasil Colônia');
  });

  it('renders Student Login Gate and hides diagnostic radar when user is unauthenticated', () => {
    renderWithProviders(<DiagnosticDashboard />);

    expect(screen.getByText('Diagnóstico Individual & Radar de Proficiência ENEM')).toBeInTheDocument();
    expect(screen.getByText(/Acesso Restrito/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail do Aluno/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar na Minha Conta/i })).toBeInTheDocument();

    // Sensitive diagnostic metrics must NOT leak
    expect(screen.queryByText('Raio-X Diagnóstico de Habilidades')).not.toBeInTheDocument();
  });

  it('invokes onOpenAuthModal and onPracticeTopic from the Student Diagnostic Gate', () => {
    const onOpenAuthModalMock = vi.fn();
    const onPracticeTopicMock = vi.fn();

    renderWithProviders(
      <DiagnosticDashboard
        onOpenAuthModal={onOpenAuthModalMock}
        onPracticeTopic={onPracticeTopicMock}
      />
    );

    const registerBtn = screen.getByText(/Cadastre-se gratuitamente/i);
    fireEvent.click(registerBtn);
    expect(onOpenAuthModalMock).toHaveBeenCalledWith('register');

    const returnBtn = screen.getByText(/Voltar ao Simulado Rápido/i);
    fireEvent.click(returnBtn);
    expect(onPracticeTopicMock).toHaveBeenCalledWith('');
  });
});
