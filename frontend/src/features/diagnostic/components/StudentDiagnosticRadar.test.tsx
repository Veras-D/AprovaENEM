import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { StudentDiagnosticRadar } from './StudentDiagnosticRadar';
import { MOCK_DIAGNOSTIC_REPORT } from '@/api/mocks/mock-data';

describe('StudentDiagnosticRadar Component', () => {
  it('renders student diagnostic radar header, summary, and 4 knowledge areas', () => {
    render(<StudentDiagnosticRadar report={MOCK_DIAGNOSTIC_REPORT} />);

    expect(screen.getByText('Raio-X Diagnóstico de Habilidades')).toBeInTheDocument();
    expect(screen.getByText('Matriz INEP ENEM')).toBeInTheDocument();
    expect(screen.getByText(/Média Geral: 79%/i)).toBeInTheDocument();

    // Check presence of areas
    expect(screen.getByText('MT')).toBeInTheDocument();
    expect(screen.getByText('CN')).toBeInTheDocument();
    expect(screen.getByText('CH')).toBeInTheDocument();
    expect(screen.getByText('LC')).toBeInTheDocument();
  });

  it('renders strongest and weakest area highlights', () => {
    render(<StudentDiagnosticRadar report={MOCK_DIAGNOSTIC_REPORT} />);

    expect(screen.getByText('Maior Domínio Consolidado')).toBeInTheDocument();
    expect(screen.getByText('Oportunidade de Evolução')).toBeInTheDocument();
  });

  it('toggles to accessible table view and back to radar view', () => {
    render(<StudentDiagnosticRadar report={MOCK_DIAGNOSTIC_REPORT} />);

    const toggleButton = screen.getByRole('button', { name: /Ver em Tabela/i });
    expect(toggleButton).toBeInTheDocument();

    // Switch to table view
    fireEvent.click(toggleButton);

    const table = screen.getByRole('table', { name: /Tabela de desempenho por área/i });
    expect(table).toBeInTheDocument();
    expect(within(table).getByText('Matemática e suas Tecnologias')).toBeInTheDocument();

    // Switch back to radar view
    const radarButton = screen.getByRole('button', { name: /Ver Gráfico Radar/i });
    fireEvent.click(radarButton);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('triggers onPracticeTopic callback when clicking a recommended topic button', () => {
    const handlePracticeTopic = vi.fn();
    render(
      <StudentDiagnosticRadar
        report={MOCK_DIAGNOSTIC_REPORT}
        onPracticeTopic={handlePracticeTopic}
      />
    );

    const topicBtn = screen.getByRole('button', { name: /Brasil Colônia/i });
    expect(topicBtn).toBeInTheDocument();

    fireEvent.click(topicBtn);
    expect(handlePracticeTopic).toHaveBeenCalledWith('Brasil Colônia');
  });
});
