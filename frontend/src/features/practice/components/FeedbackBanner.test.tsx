import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackBanner } from './FeedbackBanner';

describe('FeedbackBanner Component', () => {
  it('should render correct feedback when isCorrect is true', () => {
    render(
      <FeedbackBanner
        isCorrect={true}
        selectedOption="B"
        correctOption="B"
        awardedXp={15}
      />
    );

    expect(screen.getByText('Resposta Correta!')).toBeInTheDocument();
    expect(screen.getByText(/15 XP Concedidos/i)).toBeInTheDocument();
    expect(screen.getByText(/Você acertou a questão ao selecionar a alternativa/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Resposta correta! Você selecionou a alternativa B/i)
    ).toHaveClass('sr-only');
  });

  it('should render incorrect feedback when isCorrect is false', () => {
    render(
      <FeedbackBanner
        isCorrect={false}
        selectedOption="C"
        correctOption="B"
        awardedXp={5}
      />
    );

    expect(screen.getByText('Resposta Incorreta!')).toBeInTheDocument();
    expect(screen.getByText(/5 XP Por Esforço/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Você selecionou a alternativa \(C\), mas o gabarito oficial é a letra/i)
    ).toBeInTheDocument();
  });

  it('should render next question button and trigger onNextQuestion when clicked', () => {
    const handleNext = vi.fn();
    render(
      <FeedbackBanner
        isCorrect={true}
        selectedOption="A"
        correctOption="A"
        hasNextQuestion={true}
        onNextQuestion={handleNext}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /avançar para a próxima questão/i });
    expect(nextBtn).toBeInTheDocument();
    fireEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('should not render next question button when hasNextQuestion is false', () => {
    render(
      <FeedbackBanner
        isCorrect={true}
        selectedOption="A"
        correctOption="A"
        hasNextQuestion={false}
      />
    );

    expect(
      screen.queryByRole('button', { name: /avançar para a próxima questão/i })
    ).not.toBeInTheDocument();
  });

  it('should render finalize diagnostic button when hasNextQuestion is false and onFinishDiagnostic is provided', () => {
    const handleFinish = vi.fn();
    render(
      <FeedbackBanner
        isCorrect={true}
        selectedOption="A"
        correctOption="A"
        hasNextQuestion={false}
        onFinishDiagnostic={handleFinish}
      />
    );

    const finishBtn = screen.getByRole('button', { name: /finalizar e ver meu diagnóstico de proficiência/i });
    expect(finishBtn).toBeInTheDocument();
    fireEvent.click(finishBtn);
    expect(handleFinish).toHaveBeenCalledTimes(1);
  });
});
