import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InstitutionalDashboard } from './InstitutionalDashboard';
import { MOCK_COHORT_DIAGNOSTICS } from '@/api/mocks/mock-data';

describe('InstitutionalDashboard Component', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  it('renders institutional coordinator header, white-label badge, and cohort metrics', () => {
    renderWithProviders(
      <InstitutionalDashboard cohortData={MOCK_COHORT_DIAGNOSTICS} />
    );

    expect(screen.getByText('Painel da Coordenação Pedagógica')).toBeInTheDocument();
    expect(screen.getAllByText('B2B White-Label').length).toBeGreaterThan(0);
    expect(screen.getByText('Painel Institucional da Turma')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument(); // Enrolled
    expect(screen.getByText('39')).toBeInTheDocument(); // Active
  });

  it('invokes onNavigate to return to student portal when clicking return button', () => {
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
});
