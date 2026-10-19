import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamSimulationModal } from './ExamSimulationModal';

describe('ExamSimulationModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onStartSimulation: vi.fn(),
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ExamSimulationModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title, 5 specific years, exactly 2 official exam days, and timing modes', () => {
    render(<ExamSimulationModal {...defaultProps} />);

    expect(screen.getByText('Simular Edição Oficial do ENEM')).toBeInTheDocument();
    expect(screen.getByText(/Ano da Prova/i)).toBeInTheDocument();
    expect(screen.getByText(/Dia de Prova & Áreas do Conhecimento/i)).toBeInTheDocument();
    expect(screen.getByText(/Modo de Tempo & Cronômetro/i)).toBeInTheDocument();

    // Verify all 5 specific years are present and 'Todas' is excluded
    [2023, 2022, 2021, 2020, 2019].forEach((year) => {
      expect(screen.getByRole('radio', { name: String(year) })).toBeInTheDocument();
    });
    expect(screen.queryByText('Todas')).not.toBeInTheDocument();

    // Verify exactly Dia 1 and Dia 2 are present and Multidisciplinar is excluded
    expect(screen.getByText(/Dia 1 — Linguagens & Ciências Humanas/i)).toBeInTheDocument();
    expect(screen.getByText(/Dia 2 — Ciências da Natureza & Matemática/i)).toBeInTheDocument();
    expect(screen.queryByText(/Simulado Multidisciplinar/i)).not.toBeInTheDocument();

    // Verify unnecessary callout is omitted
    expect(screen.queryByText(/contabiliza progresso na conquista/i)).not.toBeInTheDocument();
  });

  it('allows selecting year, day, and timing mode, then calls onStartSimulation', () => {
    const onStartSimulation = vi.fn();
    const onClose = vi.fn();

    render(
      <ExamSimulationModal
        {...defaultProps}
        onStartSimulation={onStartSimulation}
        onClose={onClose}
      />
    );

    // Select year 2022
    const year2022Btn = screen.getByRole('radio', { name: '2022' });
    fireEvent.click(year2022Btn);
    expect(year2022Btn).toHaveAttribute('aria-checked', 'true');

    // Select Dia 1
    const day1Btn = screen.getByText(/Dia 1 — Linguagens & Ciências Humanas/i).closest('button');
    expect(day1Btn).toBeTruthy();
    if (day1Btn) fireEvent.click(day1Btn);

    // Select Untimed
    const untimedBtn = screen.getByText(/Treino Livre \(Sem Pressão\)/i).closest('button');
    expect(untimedBtn).toBeTruthy();
    if (untimedBtn) fireEvent.click(untimedBtn);

    // Click "Iniciar Simulado"
    const startBtn = screen.getByRole('button', { name: /Iniciar Simulado/i });
    fireEvent.click(startBtn);

    expect(onStartSimulation).toHaveBeenCalledTimes(1);
    expect(onStartSimulation).toHaveBeenCalledWith({
      year: 2022,
      day: 'DAY_1',
      timing: 'UNTIMED',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key press or Cancel button click', () => {
    const onClose = vi.fn();
    render(<ExamSimulationModal {...defaultProps} onClose={onClose} />);

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    // Click Cancelar
    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
