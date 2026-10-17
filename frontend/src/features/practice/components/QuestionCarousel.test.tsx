import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCarousel } from './QuestionCarousel';

describe('QuestionCarousel Component', () => {
  it('should render all question index buttons and highlight current index', () => {
    render(
      <QuestionCarousel
        totalQuestions={5}
        currentIndex={2}
        onSelectIndex={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole('button', { name: /Ir para a questão/i });
    expect(buttons).toHaveLength(5);

    expect(buttons[2]).toHaveAttribute('aria-current', 'step');
    expect(buttons[0]).not.toHaveAttribute('aria-current');
  });

  it('should call onSelectIndex when clicking a question pill', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCarousel
        totalQuestions={4}
        currentIndex={0}
        onSelectIndex={handleSelect}
      />
    );

    const question4Btn = screen.getByRole('button', { name: /Ir para a questão 4/i });
    fireEvent.click(question4Btn);

    expect(handleSelect).toHaveBeenCalledWith(3);
  });

  it('should disable Previous on first question and Next on last question', () => {
    const { rerender } = render(
      <QuestionCarousel
        totalQuestions={3}
        currentIndex={0}
        onSelectIndex={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Questão anterior' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Próxima questão' })[0]).not.toBeDisabled();

    rerender(
      <QuestionCarousel
        totalQuestions={3}
        currentIndex={2}
        onSelectIndex={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Questão anterior' })).not.toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Próxima questão' })[0]).toBeDisabled();
  });

  it('should trigger onNext and onPrevious when buttons are clicked', () => {
    const handleNext = vi.fn();
    const handlePrevious = vi.fn();

    render(
      <QuestionCarousel
        totalQuestions={5}
        currentIndex={2}
        onSelectIndex={vi.fn()}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Questão anterior' }));
    expect(handlePrevious).toHaveBeenCalledTimes(1);

    const nextBtn = screen.getAllByRole('button', { name: 'Próxima questão' })[0];
    expect(nextBtn).toBeDefined();
    fireEvent.click(nextBtn!);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('should display status indicators for answered and flagged questions', () => {
    render(
      <QuestionCarousel
        totalQuestions={4}
        currentIndex={0}
        onSelectIndex={vi.fn()}
        isAnswered={(i) => i === 1}
        isFlagged={(i) => i === 2}
      />
    );

    expect(screen.getByRole('button', { name: /Ir para a questão 2 \(Respondida\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ir para a questão 3 \(Marcada para revisão\)/i })).toBeInTheDocument();
  });

  it('should render active button with proper aria-current attribute', () => {
    render(
      <QuestionCarousel
        totalQuestions={3}
        currentIndex={1}
        onSelectIndex={vi.fn()}
      />
    );

    const activeBtn = screen.getByRole('button', { name: /Ir para a questão 2/i });
    expect(activeBtn).toHaveAttribute('aria-current', 'step');
  });
});
