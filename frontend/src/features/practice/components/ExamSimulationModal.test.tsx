import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamSimulationModal } from './ExamSimulationModal';
import type { OfficialExamEdition } from '@/api/mocks/completed-exams';

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

  it('only lists completed official exam editions as available and excludes editions with small question amounts', () => {
    render(<ExamSimulationModal {...defaultProps} />);

    expect(screen.getByText('Simular Edição Oficial do ENEM')).toBeInTheDocument();
    expect(screen.getByText(/1\. Ano da Prova \(Edição do ENEM\)/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Dia de Prova & Áreas do Conhecimento/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Modo de Tempo & Cronômetro/i)).toBeInTheDocument();

    // Verify completed editions (2023, 2022) and Misto are available
    const year2023Radio = screen.getByRole('radio', { name: '2023' });
    const year2022Radio = screen.getByRole('radio', { name: '2022' });
    const mistoRadio = screen.getByRole('radio', { name: /misto/i });

    expect(year2023Radio).toBeInTheDocument();
    expect(year2022Radio).toBeInTheDocument();
    expect(mistoRadio).toBeInTheDocument();
    expect(year2023Radio).toHaveAttribute('aria-checked', 'true');

    // Verify incomplete editions (2021, 2020, 2019) are rendered in the DOM as unselectable (disabled)
    expect(screen.queryByRole('radio', { name: '2021' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: '2020' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: '2019' })).not.toBeInTheDocument();

    expect(screen.getByText('2021')).toBeDisabled();
    expect(screen.getByText('2020')).toBeDisabled();
    expect(screen.getByText('2019')).toBeDisabled();

    // Verify both Dia 1 and Dia 2 show the full 90-question count
    expect(screen.getByText(/Dia 1 — Linguagens & Ciências Humanas/i)).toBeInTheDocument();
    expect(screen.getAllByText(/90 questões/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Dia 2 — Ciências da Natureza & Matemática/i)).toBeInTheDocument();
  });

  it('allows selecting day and timing mode, then calls onStartSimulation with complete configuration', () => {
    const onStartSimulation = vi.fn();
    const onClose = vi.fn();

    render(
      <ExamSimulationModal
        {...defaultProps}
        onStartSimulation={onStartSimulation}
        onClose={onClose}
      />
    );

    // Select Dia 2 (90 questões)
    const day2Btn = screen.getByText(/Dia 2 — Ciências da Natureza & Matemática/i).closest('button');
    expect(day2Btn).toBeTruthy();
    if (day2Btn) fireEvent.click(day2Btn);

    // Select Untimed
    const untimedBtn = screen.getByText(/Treino Livre \(Sem Pressão\)/i).closest('button');
    expect(untimedBtn).toBeTruthy();
    if (untimedBtn) fireEvent.click(untimedBtn);

    // Verify start button dynamic label with question count
    expect(screen.getByRole('button', { name: /Iniciar Simulado Oficial \(90 questões\)/i })).toBeInTheDocument();

    // Click "Iniciar Simulado Oficial"
    const startBtn = screen.getByRole('button', { name: /Iniciar Simulado Oficial/i });
    fireEvent.click(startBtn);

    expect(onStartSimulation).toHaveBeenCalledTimes(1);
    expect(onStartSimulation).toHaveBeenCalledWith({
      year: 2023,
      day: 'DAY_2',
      timing: 'UNTIMED',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('allows selecting Misto and starts mixed simulation session with 90 questions', () => {
    const onStartSimulation = vi.fn();
    const onClose = vi.fn();

    render(
      <ExamSimulationModal
        {...defaultProps}
        onStartSimulation={onStartSimulation}
        onClose={onClose}
      />
    );

    // Select "Misto"
    const mistoRadio = screen.getByRole('radio', { name: /misto/i });
    fireEvent.click(mistoRadio);
    expect(mistoRadio).toHaveAttribute('aria-checked', 'true');

    // Explanatory text should appear
    expect(
      screen.getByText(/O Simulado Misto mescla questões de múltiplos anos/i)
    ).toBeInTheDocument();

    // Verify button label
    expect(
      screen.getByRole('button', { name: /Iniciar Simulado Misto \(90 questões\)/i })
    ).toBeInTheDocument();

    // Click confirm
    const startBtn = screen.getByRole('button', { name: /Iniciar Simulado Misto/i });
    fireEvent.click(startBtn);

    expect(onStartSimulation).toHaveBeenCalledWith({
      year: 'MIXED',
      day: 'DAY_1',
      timing: 'TIMED',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles custom availableEditions correctly', () => {
    const customEditions: readonly OfficialExamEdition[] = [
      {
        year: 2022,
        title: 'ENEM 2022 Completo',
        isComplete: true,
        day1QuestionCount: 90,
        day2QuestionCount: 90,
        totalQuestions: 180,
        status: 'AVAILABLE',
        statusLabel: 'Oficial Completo',
      },
      {
        year: 2021,
        title: 'ENEM 2021 Incompleto',
        isComplete: false,
        day1QuestionCount: 3,
        day2QuestionCount: 2,
        totalQuestions: 5,
        status: 'IN_CATALOGING',
        statusLabel: 'Amostra (5 questões)',
      },
    ];

    render(
      <ExamSimulationModal
        {...defaultProps}
        availableEditions={customEditions}
      />
    );

    // 2022 is complete -> must be in radio options
    expect(screen.getByRole('radio', { name: '2022' })).toBeInTheDocument();

    // 2021 is incomplete -> must NOT be in radio options, but must be rendered as disabled
    expect(screen.queryByRole('radio', { name: '2021' })).not.toBeInTheDocument();
    expect(screen.getByText('2021')).toBeDisabled();
  });

  it('displays empty state and disables start button when no editions are complete', () => {
    const noCompleteEditions: readonly OfficialExamEdition[] = [
      {
        year: 2021,
        title: 'ENEM 2021 Amostra',
        isComplete: false,
        day1QuestionCount: 2,
        day2QuestionCount: 3,
        totalQuestions: 5,
        status: 'IN_CATALOGING',
        statusLabel: 'Amostra',
      },
    ];

    render(
      <ExamSimulationModal
        {...defaultProps}
        availableEditions={noCompleteEditions}
      />
    );

    expect(screen.getByText(/Nenhuma edição completa disponível para simulação no momento/i)).toBeInTheDocument();
    const startBtn = screen.getByRole('button', { name: /Iniciar Simulado/i });
    expect(startBtn).toBeDisabled();
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
