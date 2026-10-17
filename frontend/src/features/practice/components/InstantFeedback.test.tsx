import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstantFeedback } from './InstantFeedback';
import type { QuestionOptionLetter } from '@/types';

describe('InstantFeedback Component', () => {
  const mockDistractorAnalysis: Record<QuestionOptionLetter, string> = {
    A: 'Incorreta: Dividiu incorretamente por 3.',
    B: 'Correta: Cálculo exato de 1,50 kWh.',
    C: 'Incorreta: Esqueceu de multiplicar pelos 30 dias do mês.',
    D: 'Incorreta: Erro de potência de 10 na conversão para kWh.',
    E: 'Incorreta: Multiplicação arbitrária.',
  };

  it('should render composed banner, resolution, and socratic tutor invitation', () => {
    const handleNext = vi.fn();
    const handleOpenTutor = vi.fn();

    render(
      <InstantFeedback
        isCorrect={true}
        selectedOption="B"
        correctOption="B"
        baseExplanation="Consumo = 1,50 kWh. Alternativa B."
        distractorAnalysis={mockDistractorAnalysis}
        attribution="INEP Microdados 2023"
        awardedXp={15}
        hasNextQuestion={true}
        onNextQuestion={handleNext}
        onOpenSocraticTutor={handleOpenTutor}
      />
    );

    // Feedback banner
    expect(screen.getByText('Resposta Correta!')).toBeInTheDocument();
    expect(screen.getByText(/15 XP Concedidos/i)).toBeInTheDocument();

    // Next button
    const nextBtn = screen.getByRole('button', { name: /avançar para a próxima questão/i });
    fireEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalledTimes(1);

    // Resolution Accordion
    expect(screen.getByText(/Resolução Comentada Oficial/i)).toBeInTheDocument();
    expect(screen.getByText(/Consumo = 1,50 kWh. Alternativa B./i)).toBeInTheDocument();

    // Socratic tutor button
    const tutorBtn = screen.getByRole('button', { name: /tirar dúvida com o tutor ia/i });
    expect(tutorBtn).toBeInTheDocument();
    fireEvent.click(tutorBtn);
    expect(handleOpenTutor).toHaveBeenCalledTimes(1);
  });

  it('should render incorrect state with appropriate styling', () => {
    render(
      <InstantFeedback
        isCorrect={false}
        selectedOption="D"
        correctOption="B"
        baseExplanation="Consumo = 1,50 kWh."
        awardedXp={5}
      />
    );

    expect(screen.getByText('Resposta Incorreta!')).toBeInTheDocument();
    expect(screen.getByText(/5 XP Por Esforço/i)).toBeInTheDocument();
    expect(screen.getByText(/gabarito oficial é a letra/i)).toBeInTheDocument();
  });
});
