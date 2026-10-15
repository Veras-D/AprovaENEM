import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DistractorBreakdown } from './DistractorBreakdown';
import type { QuestionOptionLetter } from '@/types';

describe('DistractorBreakdown Component', () => {
  const mockDistractorAnalysis: Record<QuestionOptionLetter, string> = {
    A: 'Incorreta: Dividiu incorretamente por 3.',
    B: 'Correta: Cálculo exato de 1,50 kWh.',
    C: 'Incorreta: Esqueceu de multiplicar pelos 30 dias do mês.',
    D: 'Incorreta: Erro de potência de 10 na conversão para kWh.',
    E: 'Incorreta: Multiplicação arbitrária.',
  };

  it('should render all 5 alternatives with their distractor explanations', () => {
    render(
      <DistractorBreakdown
        distractorAnalysis={mockDistractorAnalysis}
        correctOption="B"
        selectedOption="C"
      />
    );

    expect(screen.getByText(/Análise Detalhada dos Distratores/i)).toBeInTheDocument();
    expect(screen.getByText(/Alternativa B \(Gabarito Oficial\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Alternativa C \(Sua Resposta\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Alternativa A/i)).toBeInTheDocument();
    expect(screen.getByText(/Alternativa D/i)).toBeInTheDocument();
    expect(screen.getByText(/Alternativa E/i)).toBeInTheDocument();

    expect(screen.getByText(/Cálculo exato de 1,50 kWh/i)).toBeInTheDocument();
    expect(screen.getByText(/Esqueceu de multiplicar pelos 30 dias/i)).toBeInTheDocument();
  });

  it('should return null when distractorAnalysis is empty', () => {
    const { container } = render(
      <DistractorBreakdown
        distractorAnalysis={{} as Record<QuestionOptionLetter, string>}
        correctOption="A"
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
