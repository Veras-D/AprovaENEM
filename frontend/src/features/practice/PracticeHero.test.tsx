import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PracticeHero } from './PracticeHero';
import { useSessionStore } from '@/stores/useSessionStore';

describe('PracticeHero Component', () => {
  beforeEach(() => {
    // Reset session store state before each test
    useSessionStore.getState().clearSession();
  });

  it('should initialize and render the interactive quiz mode with authentic questions', () => {
    render(<PracticeHero />);

    // Platform header & white-label badge
    expect(
      screen.getByText(/Prática Inteligente com Alinhamento INEP e Tutor IA Socrático/i)
    ).toBeInTheDocument();

    // Quiz control bar
    expect(screen.getByText(/Simulado Rápido ENEM/i)).toBeInTheDocument();
    expect(screen.getByText(/0 de 5 respondidas/i)).toBeInTheDocument();

    // Timer
    expect(screen.getByRole('timer')).toBeInTheDocument();

    // Question 1 metadata & statement
    expect(screen.getByText(/MT • Matemática/i)).toBeInTheDocument();
    expect(screen.getByText(/ENEM 2023/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Um estudante do ensino médio deseja calcular a economia gerada/i)
    ).toBeInTheDocument();

    // 5 questions in carousel
    expect(screen.getByRole('button', { name: /Ir para a questão 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ir para a questão 5/i })).toBeInTheDocument();
  });

  it('should allow selecting an option and submitting an answer with instant grading', () => {
    render(<PracticeHero />);

    // Initially "Confirmar Resposta" is disabled
    const submitBtn = screen.getByRole('button', { name: /confirmar resposta/i });
    expect(submitBtn).toBeDisabled();

    // Select option B
    const optionB = screen.getByRole('radio', { name: /B.*1{,}50/i });
    fireEvent.click(optionB);

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // After submit, should show correct feedback
    expect(screen.getByText('Resposta Correta!')).toBeInTheDocument();
    expect(screen.getByText(/Resolução Comentada Oficial/i)).toBeInTheDocument();
    expect(screen.getByText(/1 de 5 respondidas/i)).toBeInTheDocument();
  });

  it('should navigate between questions using next button and carousel pills', () => {
    render(<PracticeHero />);

    // Question 1 is active
    expect(screen.getByText(/MT • Matemática/i)).toBeInTheDocument();

    // Navigate to question 2 via carousel
    const q2Btn = screen.getByRole('button', { name: /Ir para a questão 2/i });
    fireEvent.click(q2Btn);

    // Question 2 (CN • Física) should now be displayed
    expect(screen.getByText(/CN • Física/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Dois veículos partem simultaneamente de cidades separadas/i)
    ).toBeInTheDocument();

    // Navigate back via Previous button
    const prevBtn = screen.getByRole('button', { name: /Questão anterior/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText(/MT • Matemática/i)).toBeInTheDocument();
  });

  it('should toggle question flag for review', () => {
    render(<PracticeHero />);

    const flagBtn = screen.getByRole('button', { name: /Marcar questão para revisar/i });
    expect(flagBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(flagBtn);

    // Now flagged
    expect(screen.getByText(/1 marcada\(s\) para revisão/i)).toBeInTheDocument();
    const unflagBtn = screen.getByRole('button', { name: /Remover marcação da questão/i });
    expect(unflagBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('should allow restarting the quiz', () => {
    render(<PracticeHero />);

    // Select and submit option
    const optionB = screen.getByRole('radio', { name: /B.*1{,}50/i });
    fireEvent.click(optionB);
    const submitBtn = screen.getByRole('button', { name: /confirmar resposta/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/1 de 5 respondidas/i)).toBeInTheDocument();

    // Restart quiz
    const restartBtn = screen.getByRole('button', { name: /reiniciar simulado/i });
    fireEvent.click(restartBtn);

    expect(screen.getByText(/0 de 5 respondidas/i)).toBeInTheDocument();
  });
});
