import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PracticeHero } from './PracticeHero';
import { useSessionStore } from '@/stores/useSessionStore';

describe('PracticeHero Component', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (ui: React.ReactElement = <PracticeHero />) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.getState().clearSession();
  });

  it('should initialize and render the interactive quiz mode with authentic questions', () => {
    renderWithProviders();

    // Quiz control bar
    expect(screen.getByText(/Simulado Rápido ENEM/i)).toBeInTheDocument();
    expect(screen.getByText(/0 de 5 respondidas/i)).toBeInTheDocument();

    // Timer
    expect(screen.getByRole('timer')).toBeInTheDocument();

    // Question 1 metadata & statement
    expect(screen.getByText(/MT • Matemática/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ENEM 2023/i)[0]).toBeInTheDocument();
    expect(
      screen.getByText(/Um estudante do ensino médio deseja calcular a economia gerada/i)
    ).toBeInTheDocument();

    // 5 questions in carousel
    expect(screen.getByRole('button', { name: /Ir para a questão 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ir para a questão 5/i })).toBeInTheDocument();
  });

  it('should allow selecting an option and submitting an answer with instant grading', () => {
    renderWithProviders();

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

  it('should visually mark carousel pill as incorrect when answer is wrong', () => {
    renderWithProviders();

    // Select option A (incorrect; correct is B)
    const optionA = screen.getByRole('radio', { name: /A.*0{,}50/i });
    fireEvent.click(optionA);

    const submitBtn = screen.getByRole('button', { name: /confirmar resposta/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Resposta Incorreta!')).toBeInTheDocument();

    // Navigate to question 2 so question 1 is no longer active
    const q2Btn = screen.getByRole('button', { name: /Ir para a questão 2/i });
    fireEvent.click(q2Btn);

    // Question 1 pill should be marked as incorrect with rose border
    const q1Btn = screen.getByRole('button', { name: /Ir para a questão 1 \(Incorreta\)/i });
    expect(q1Btn).toHaveClass('border-rose-500/60');
    expect(screen.getByTestId('carousel-incorrect-badge')).toBeInTheDocument();
  });

  it('should navigate between questions using next button and carousel pills', () => {
    renderWithProviders();

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
    renderWithProviders();

    const flagBtn = screen.getByRole('button', { name: /Marcar questão para revisar/i });
    expect(flagBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(flagBtn);

    // Now flagged
    expect(screen.getByText(/1 marcada\(s\) para revisão/i)).toBeInTheDocument();
    const unflagBtn = screen.getByRole('button', { name: /Remover marcação da questão/i });
    expect(unflagBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('should allow restarting the quiz', () => {
    renderWithProviders();

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

  it('should open Socratic Tutor drawer when clicking the tutor button in control bar and in feedback', async () => {
    renderWithProviders();

    // Tutor button in top control bar
    const tutorTopBtn = screen.getAllByRole('button', {
      name: /Tirar dúvida com o Tutor IA/i,
    })[0]!;
    expect(tutorTopBtn).toBeInTheDocument();

    fireEvent.click(tutorTopBtn);

    // Drawer should open
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Tutor IA Socrático/i })).toBeInTheDocument();
    });

    // Close drawer
    const closeBtn = screen.getByRole('button', { name: /Fechar Tutor Socrático/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Now submit answer and open from instant feedback banner
    const optionB = screen.getByRole('radio', { name: /B.*1{,}50/i });
    fireEvent.click(optionB);
    const submitBtn = screen.getByRole('button', { name: /confirmar resposta/i });
    fireEvent.click(submitBtn);

    const feedbackTutorBtn = screen.getByRole('button', {
      name: /Tirar dúvida com o Tutor IA sobre esta questão/i,
    });
    fireEvent.click(feedbackTutorBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Tutor IA Socrático/i })).toBeInTheDocument();
    });
  });

  it('triggers celebration overlay upon answering all questions and calls onOpenGamification', async () => {
    const handleOpenGamification = vi.fn();
    renderWithProviders(<PracticeHero onOpenGamification={handleOpenGamification} />);

    // Complete all 5 questions by recording attempts in the session store
    act(() => {
      const qs = useSessionStore.getState().questions;
      qs.forEach((q) => {
        useSessionStore.getState().recordAttempt({
          questionId: q.id,
          selectedOption: 'A',
          correctOption: 'A',
          isCorrect: true,
          awardedXp: 15,
        });
      });
    });

    // Celebration modal overlay should now be open with celebratory title
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Parabéns! Simulado Concluído!/i })).toBeInTheDocument();
    });

    // Close the celebration modal
    const closeCelebrationBtn = screen.getByRole('button', { name: /Continuar Estudando/i });
    fireEvent.click(closeCelebrationBtn);

    // Completed summary card should be visible
    expect(screen.getByText('Simulado Rápido Concluído!')).toBeInTheDocument();

    // Click "Ver Conquistas & Ranking"
    const gamificationBtn = screen.getByRole('button', { name: /Ver Conquistas & Ranking/i });
    expect(gamificationBtn).toBeInTheDocument();
    fireEvent.click(gamificationBtn);

    expect(handleOpenGamification).toHaveBeenCalledTimes(1);
  });

  it('allows opening and configuring INEP Exam Time Accommodations', async () => {
    renderWithProviders();

    // Click accommodations button on QuizTimer
    const configBtn = screen.getByRole('button', {
      name: /configurar acomodações de tempo inep/i,
    });
    expect(configBtn).toBeInTheDocument();
    fireEvent.click(configBtn);

    // Modal should be visible
    expect(screen.getByText('Acomodações de Tempo de Prova INEP')).toBeInTheDocument();

    // Select Extended INEP time (+60 min)
    const inepBtn = screen.getByRole('button', {
      name: /atendimento especializado inep/i,
    });
    fireEvent.click(inepBtn);

    // Timer should reflect the +60m INEP mode
    expect(screen.getByText('+60m INEP')).toBeInTheDocument();
  });

  it('navigates to next and previous questions via keyboard shortcuts (ArrowRight/ArrowLeft, PageDown/PageUp, [/])', () => {
    renderWithProviders();

    // Starts on Question 1 (MT • Matemática)
    expect(screen.getByText(/MT • Matemática/i)).toBeInTheDocument();

    // Press ArrowLeft on first question (boundary check - should stay on Q1)
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(/MT • Matemática/i)).toBeInTheDocument();

    // Press ArrowRight to advance to Question 2 (CN • Física)
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText(/CN • Física/i)).toBeInTheDocument();

    // Press PageDown to advance to Question 3 (CN • Química)
    fireEvent.keyDown(window, { key: 'PageDown' });
    expect(screen.getByText(/CN • Química/i)).toBeInTheDocument();

    // Press ']' bracket shortcut to advance to Question 4 (CH • História)
    fireEvent.keyDown(window, { key: ']' });
    expect(screen.getByText(/CH • História/i)).toBeInTheDocument();

    // Press PageUp to go back to Question 3
    fireEvent.keyDown(window, { key: 'PageUp' });
    expect(screen.getByText(/CN • Química/i)).toBeInTheDocument();

    // Press '[' bracket shortcut to go back to Question 2
    fireEvent.keyDown(window, { key: '[' });
    expect(screen.getByText(/CN • Física/i)).toBeInTheDocument();

    // Press ArrowLeft to go back to Question 1
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(/MT • Matemática/i)).toBeInTheDocument();
  });

  it('does not trigger question navigation when user is typing in an input or textarea', () => {
    renderWithProviders();

    expect(screen.getByText(/MT • Matemática/i)).toBeInTheDocument();

    // Create a mock input and focus it
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: 'ArrowRight' });

    // Should still be on Question 1
    expect(screen.getByText(/MT • Matemática/i)).toBeInTheDocument();

    document.body.removeChild(input);
  });

  it('opens ExamSimulationModal and starts a customized official exam session', () => {
    renderWithProviders();

    // Click "Simular Prova Oficial" button
    const openSimBtn = screen.getByRole('button', {
      name: /Simular Prova Oficial/i,
    });
    fireEvent.click(openSimBtn);

    // Modal should be open
    expect(screen.getByText('Simular Edição Oficial do ENEM')).toBeInTheDocument();

    // Select Dia 1 (LC + CH)
    const day1Btn = screen.getByText(/Dia 1 — Linguagens & Ciências Humanas/i).closest('button');
    expect(day1Btn).toBeTruthy();
    if (day1Btn) fireEvent.click(day1Btn);

    // Select Year 2023
    const year2023 = screen.getByRole('radio', { name: '2023' });
    fireEvent.click(year2023);

    // Click "Iniciar Simulado" (exact name to avoid matching Reiniciar)
    const startBtn = screen.getByRole('button', { name: /^Iniciar Simulado$/i });
    fireEvent.click(startBtn);

    // Modal should close and session title should update
    expect(screen.queryByText('Simular Edição Oficial do ENEM')).not.toBeInTheDocument();
    expect(screen.getByText(/Simulado Oficial ENEM 2023 — Dia 1/i)).toBeInTheDocument();
  });
});

