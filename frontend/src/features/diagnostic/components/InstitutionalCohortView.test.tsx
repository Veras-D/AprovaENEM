import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InstitutionalCohortView } from './InstitutionalCohortView';
import { MOCK_COHORT_DIAGNOSTICS } from '@/api/mocks/mock-data';

describe('InstitutionalCohortView Component', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  it('renders institutional cohort header and 4 KPI metric cards', () => {
    renderWithProviders(<InstitutionalCohortView cohortData={MOCK_COHORT_DIAGNOSTICS} />);

    expect(screen.getByText('Painel Institucional da Turma')).toBeInTheDocument();
    expect(screen.getByText('B2B White-Label')).toBeInTheDocument();

    // KPI cards
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('39')).toBeInTheDocument();
    expect(screen.getByText('92.8%')).toBeInTheDocument();
    expect(screen.getByText('74.5%')).toBeInTheDocument();
  });

  it('renders distractor pitfalls panel with pedagogical explanations', () => {
    renderWithProviders(<InstitutionalCohortView cohortData={MOCK_COHORT_DIAGNOSTICS} />);

    expect(
      screen.getByText(/Pegadinhas & Falácias Pedagógicas Mais Frequentes da Turma/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/46.2% da turma/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Confusão frequente entre aceleração centrípeta e aceleração tangencial/i)
    ).toBeInTheDocument();
  });

  it('calls onExportReport when clicking export button', () => {
    const handleExport = vi.fn();
    renderWithProviders(
      <InstitutionalCohortView
        cohortData={MOCK_COHORT_DIAGNOSTICS}
        onExportReport={handleExport}
      />
    );

    const exportBtn = screen.getByRole('button', {
      name: /Exportar relatório da turma em PDF ou CSV/i,
    });
    expect(exportBtn).toBeInTheDocument();
    fireEvent.click(exportBtn);

    expect(handleExport).toHaveBeenCalledTimes(1);
  });

  it('toggles between radar chart and accessible table view', () => {
    renderWithProviders(<InstitutionalCohortView cohortData={MOCK_COHORT_DIAGNOSTICS} />);

    const toggleBtn = screen.getByRole('button', { name: /Ver tabela de médias/i });
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);

    const table = screen.getByRole('table', { name: /Tabela de médias da turma/i });
    expect(table).toBeInTheDocument();
    expect(within(table).getByText('Matemática e suas Tecnologias')).toBeInTheDocument();

    // Toggle back
    const radarBtn = screen.getByRole('button', { name: /Ver radar da turma/i });
    fireEvent.click(radarBtn);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('allows switching cohorts via dropdown selector', () => {
    renderWithProviders(<InstitutionalCohortView cohortData={MOCK_COHORT_DIAGNOSTICS} />);

    const select = screen.getByLabelText(/Selecionar turma/i);
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'cohort-eng-2026' } });
    expect((select as HTMLSelectElement).value).toBe('cohort-eng-2026');
  });
});
