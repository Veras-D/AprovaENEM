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
    const tutorTopBtn = screen.getByRole('button', {
      name: /Abrir Tutor IA Socrático para esta questão/i,
    });
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
      name: /Abrir conversa com o Tutor IA Socrático/i,
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
});
