import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InstitutionalCohortView } from './InstitutionalCohortView';
import { MOCK_COHORT_DIAGNOSTICS } from '@/api/mocks/mock-data';
import type { MasteryLevel } from '@/api/types';

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

    expect(screen.getByText('Painel Institucional — Diagnóstico Geral da Escola')).toBeInTheDocument();
    expect(screen.getByText('3º Ano EM — Visão Geral')).toBeInTheDocument();
    expect(screen.queryByText('B2B White-Label')).not.toBeInTheDocument();

    // KPI cards
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('39')).toBeInTheDocument();
    expect(screen.getByText('92.8%')).toBeInTheDocument();
    expect(screen.getByText('74.5%')).toBeInTheDocument();
  });

  it('renders dynamic pedagogical priorities derived from cohort data', () => {
    renderWithProviders(<InstitutionalCohortView cohortData={MOCK_COHORT_DIAGNOSTICS} />);

    expect(screen.getByText('Prioridades Pedagógicas da Coordenação')).toBeInTheDocument();
    expect(screen.getByText(/Reforço em Matemática e suas Tecnologias:/i)).toBeInTheDocument();
    expect(screen.getByText(/Destaque em Ciências Humanas e suas Tecnologias:/i)).toBeInTheDocument();
    expect(screen.getByText(/92.8% dos matriculados já concluíram simulados oficiais/i)).toBeInTheDocument();
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

  it('renders unified school view without cohort dropdown selector', () => {
    renderWithProviders(<InstitutionalCohortView cohortData={MOCK_COHORT_DIAGNOSTICS} />);

    expect(screen.queryByLabelText(/Selecionar turma/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('safely renders when status is unknown or DEVELOPING without crashing', () => {
    const customData = {
      ...MOCK_COHORT_DIAGNOSTICS,
      areasBreakdown: [
        {
          subjectArea: 'MATHEMATICS',
          areaName: 'Matemática e suas Tecnologias',
          averageScorePercentage: 45.0,
          status: 'DEVELOPING' as unknown as MasteryLevel,
          topWeakTopic: 'Probabilidade',
        },
      ],
    };

    expect(() => renderWithProviders(<InstitutionalCohortView cohortData={customData} />)).not.toThrow();
    expect(screen.getByText('Prioridade Crítica')).toBeInTheDocument();
  });
});
