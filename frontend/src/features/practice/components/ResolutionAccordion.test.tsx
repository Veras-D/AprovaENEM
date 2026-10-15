import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResolutionAccordion } from './ResolutionAccordion';
import type { QuestionOptionLetter } from '@/types';

describe('ResolutionAccordion Component', () => {
  const mockDistractorAnalysis: Record<QuestionOptionLetter, string> = {
    A: 'Incorreta: Dividiu incorretamente por 3.',
    B: 'Correta: Cálculo exato de 1,50 kWh.',
    C: 'Incorreta: Esqueceu de multiplicar pelos 30 dias do mês.',
    D: 'Incorreta: Erro de potência de 10 na conversão para kWh.',
    E: 'Incorreta: Multiplicação arbitrária.',
  };

  it('should render expanded by default with base explanation and attribution', () => {
    render(
      <ResolutionAccordion
        baseExplanation="Consumo = 10 W x 5 h x 30 = 1500 Wh = 1,50 kWh."
        correctOption="B"
        attribution="INEP Microdados 2023"
        initialExpanded={true}
      />
    );

    expect(screen.getByText(/Resolução Comentada Oficial/i)).toBeInTheDocument();
    expect(screen.getAllByText(/INEP Microdados 2023/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Consumo = 10 W x 5 h x 30/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Resolução Comentada Oficial/i })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('should toggle collapse and expansion when accordion header is clicked', () => {
    render(
      <ResolutionAccordion
        baseExplanation="Passo a passo detalhado..."
        correctOption="A"
        initialExpanded={true}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /Resolução Comentada Oficial/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Passo a passo detalhado/i)).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Passo a passo detalhado/i)).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Passo a passo detalhado/i)).toBeInTheDocument();
  });

  it('should toggle distractor analysis sub-accordion when present', () => {
    render(
      <ResolutionAccordion
        baseExplanation="Passo a passo detalhado..."
        correctOption="B"
        selectedOption="C"
        distractorAnalysis={mockDistractorAnalysis}
        initialExpanded={true}
      />
    );

    const distractorsToggleBtn = screen.getByRole('button', {
      name: /Ver análise de cada alternativa/i,
    });
    expect(distractorsToggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Análise Detalhada dos Distratores/i)).not.toBeInTheDocument();

    // Open distractors
    fireEvent.click(distractorsToggleBtn);
    expect(distractorsToggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Análise Detalhada dos Distratores/i)).toBeInTheDocument();
    expect(screen.getByText(/Dividiu incorretamente por 3/i)).toBeInTheDocument();

    // Close distractors
    fireEvent.click(distractorsToggleBtn);
    expect(distractorsToggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Análise Detalhada dos Distratores/i)).not.toBeInTheDocument();
  });
});
