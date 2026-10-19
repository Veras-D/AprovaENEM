import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DiagnosticDashboard } from './DiagnosticDashboard';
import { MOCK_DIAGNOSTIC_REPORT } from '@/api/mocks/mock-data';

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

  it('renders student diagnostic radar exclusively for the student portal', () => {
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
});
