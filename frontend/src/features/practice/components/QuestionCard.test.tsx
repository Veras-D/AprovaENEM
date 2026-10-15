import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from './QuestionCard';
import type { Question } from '@/types';
import type { QuestionItemDto } from '@/api/types';

describe('QuestionCard Component', () => {
  const mockDomainQuestion: Question = {
    id: 'q-dom-1',
    externalId: '101',
    knowledgeArea: 'MT',
    discipline: 'Geometria Espacial',
    examYear: 2023,
    difficulty: 'MEDIUM',
    contextText: 'Um reservatório de água em formato de cone circular reto...',
    statement: 'Calcule a capacidade total do reservatório em litros:',
    options: [
      { letter: 'A', text: '1.000 L' },
      { letter: 'B', text: '2.500 L' },
      { letter: 'C', text: '3.140 L' },
      { letter: 'D', text: '5.000 L' },
      { letter: 'E', text: '10.000 L' },
    ],
    imageUrl: 'https://storage.aprovaenem.com.br/figures/cone.webp',
  };

  const mockDtoQuestion: QuestionItemDto = {
    id: 'q-dto-2',
    externalId: '135',
    itemNumber: 135,
    subject: 'CN',
    knowledgeArea: 'CN',
    discipline: 'Física',
    topic: 'Cinemática',
    year: 2022,
    difficulty: 'HARD',
    status: 'ACTIVE',
    statement: 'Um veículo parte do repouso com aceleração constante $a = 2 m/s^2$...',
    options: [
      { id: 'opt-a', optionLetter: 'A', text: '$10 m/s$' },
      { id: 'opt-b', optionLetter: 'B', text: '$20 m/s$' },
      { id: 'opt-c', optionLetter: 'C', text: '$30 m/s$' },
      { id: 'opt-d', optionLetter: 'D', text: '$40 m/s$' },
      { id: 'opt-e', optionLetter: 'E', text: '$50 m/s$' },
    ],
    figureUrl: 'https://storage.aprovaenem.com.br/figures/cinematica.webp',
    figureAltText: 'Gráfico de velocidade em função do tempo',
  };

  it('should render domain Question metadata, statement, and context text', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        question={mockDomainQuestion}
        selectedOption={null}
        onSelectOption={handleSelect}
      />
    );

    expect(screen.getByText(/MT • Geometria Espacial/i)).toBeInTheDocument();
    expect(screen.getByText(/ENEM 2023/i)).toBeInTheDocument();
    expect(screen.getByText(/Média/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Um reservatório de água em formato de cone/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Calcule a capacidade total do reservatório/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /figura explicativa/i })).toBeInTheDocument();
  });

  it('should render DTO Question metadata, topic, and custom figure alt text', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        question={mockDtoQuestion}
        selectedOption={null}
        onSelectOption={handleSelect}
      />
    );

    expect(screen.getByText(/CN • Física/i)).toBeInTheDocument();
    expect(screen.getByText(/Cinemática/i)).toBeInTheDocument();
    expect(screen.getByText(/ENEM 2022/i)).toBeInTheDocument();
    expect(screen.getByText(/Difícil/i)).toBeInTheDocument();
    expect(screen.getByText(/Questão #135/i)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Gráfico de velocidade em função do tempo/i })
    ).toBeInTheDocument();
  });

  it('should call onSelectOption when an option is selected', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        question={mockDomainQuestion}
        selectedOption={null}
        onSelectOption={handleSelect}
      />
    );

    const optionB = screen.getByRole('radio', { name: /B\s+2\.500\s+L/i });
    fireEvent.click(optionB);
    expect(handleSelect).toHaveBeenCalledWith('B');
  });

  it('should toggle flag bookmark when toggle button is clicked', () => {
    const handleToggleFlag = vi.fn();
    const { rerender } = render(
      <QuestionCard
        question={mockDomainQuestion}
        selectedOption="C"
        onSelectOption={vi.fn()}
        isFlagged={false}
        onToggleFlag={handleToggleFlag}
      />
    );

    const flagBtn = screen.getByRole('button', { name: /marcar questão para revisar/i });
    expect(flagBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(flagBtn);
    expect(handleToggleFlag).toHaveBeenCalledTimes(1);

    // Re-render as flagged
    rerender(
      <QuestionCard
        question={mockDomainQuestion}
        selectedOption="C"
        onSelectOption={vi.fn()}
        isFlagged={true}
        onToggleFlag={handleToggleFlag}
      />
    );

    const flaggedBtn = screen.getByRole('button', { name: /remover marcação da questão/i });
    expect(flaggedBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('should handle submit answer button interaction and disable during submission', () => {
    const handleSubmit = vi.fn();
    const { rerender } = render(
      <QuestionCard
        question={mockDomainQuestion}
        selectedOption={null}
        onSelectOption={vi.fn()}
        onSubmitAnswer={handleSubmit}
      />
    );

    // Button should be disabled when no option is selected
    const submitBtn = screen.getByRole('button', { name: /confirmar resposta/i });
    expect(submitBtn).toBeDisabled();

    // Select option
    rerender(
      <QuestionCard
        question={mockDomainQuestion}
        selectedOption="C"
        onSelectOption={vi.fn()}
        onSubmitAnswer={handleSubmit}
      />
    );

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    // Re-render as submitted
    rerender(
      <QuestionCard
        question={mockDomainQuestion}
        selectedOption="C"
        onSelectOption={vi.fn()}
        onSubmitAnswer={handleSubmit}
        isSubmitted={true}
        correctOption="C"
      />
    );

    expect(screen.queryByRole('button', { name: /confirmar resposta/i })).not.toBeInTheDocument();
    expect(screen.getByText(/resposta registrada/i)).toBeInTheDocument();
  });
});
