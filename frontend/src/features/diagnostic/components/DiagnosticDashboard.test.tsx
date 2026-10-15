import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DiagnosticDashboard } from './DiagnosticDashboard';
import { MOCK_DIAGNOSTIC_REPORT, MOCK_COHORT_DIAGNOSTICS } from '@/api/mocks/mock-data';

describe('DiagnosticDashboard Component', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  it('renders student diagnostic radar by default', () => {
    renderWithProviders(
      <DiagnosticDashboard
        studentReport={MOCK_DIAGNOSTIC_REPORT}
        cohortData={MOCK_COHORT_DIAGNOSTICS}
      />
    );

    const studentTab = screen.getByRole('tab', { name: /Diagnóstico do Aluno/i });
    expect(studentTab).toBeInTheDocument();
    expect(studentTab).toHaveAttribute('aria-selected', 'true');

    expect(screen.getByText('Raio-X Diagnóstico de Habilidades')).toBeInTheDocument();
  });

  it('switches to institutional cohort view when clicking institutional tab', () => {
    renderWithProviders(
      <DiagnosticDashboard
        studentReport={MOCK_DIAGNOSTIC_REPORT}
        cohortData={MOCK_COHORT_DIAGNOSTICS}
      />
    );

    const institutionalTab = screen.getByRole('tab', { name: /Visão Institucional da Turma/i });
    expect(institutionalTab).toBeInTheDocument();

    fireEvent.click(institutionalTab);

    expect(screen.getByText('Painel Institucional da Turma')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('39')).toBeInTheDocument();
  });

  it('renders institutional cohort view directly when initialMode is institutional', () => {
    renderWithProviders(
      <DiagnosticDashboard
        initialMode="institutional"
        studentReport={MOCK_DIAGNOSTIC_REPORT}
        cohortData={MOCK_COHORT_DIAGNOSTICS}
      />
    );

    const institutionalTab = screen.getByRole('tab', { name: /Visão Institucional da Turma/i });
    expect(institutionalTab).toHaveAttribute('aria-selected', 'true');

    expect(screen.getByText('Painel Institucional da Turma')).toBeInTheDocument();
  });
});
