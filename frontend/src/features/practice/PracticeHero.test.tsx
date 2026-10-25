import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PracticeHero } from './PracticeHero';
import { useSessionStore } from '@/stores/useSessionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { queryKeys } from '@/api/query-keys';
import type { DiagnosticReportDto } from '@/api/types';
import {
  MOCK_RESOLUTIONS,
  ENEM_2023_OFFICIAL_RESOLUTIONS,
  ENEM_2022_OFFICIAL_RESOLUTIONS,
} from '@/api/mocks/mock-data';

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
    useAuthStore.getState().clearAuth();
    useSessionStore.getState().clearSession();
  });

  it('should initialize and render the interactive quiz mode with authentic questions', () => {
    renderWithProviders();

    // Quiz control bar
    expect(screen.getByText(/Diagnóstico ENEM|Simulado Rápido ENEM/i)).toBeInTheDocument();
    expect(screen.getByText(/0 de 5 respondidas/i)).toBeInTheDocument();

    // Timer
    expect(screen.getByRole('timer')).toBeInTheDocument();

    // Question 1 metadata & statement
    const qs = useSessionStore.getState().questions;
    expect(qs).toHaveLength(5);
    const q0 = qs[0]!;
    expect(screen.getByText(new RegExp(`^Questão #${q0.externalId}$`))).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(q0.knowledgeArea, 'i')).length).toBeGreaterThan(0);

    // 5 questions in carousel
    expect(screen.getByRole('button', { name: /Ir para a questão 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ir para a questão 5/i })).toBeInTheDocument();
  });

  it('should allow selecting an option and submitting an answer with instant grading', () => {
    renderWithProviders();

    // Initially "Confirmar Resposta" is disabled
    const submitBtn = screen.getByRole('button', { name: /confirmar resposta/i });
    expect(submitBtn).toBeDisabled();

    // Select the correct option for Question 1
    const q1 = useSessionStore.getState().questions[0]!;
    const resolution =
      MOCK_RESOLUTIONS[q1.id] ||
      ENEM_2023_OFFICIAL_RESOLUTIONS[q1.id] ||
      ENEM_2022_OFFICIAL_RESOLUTIONS[q1.id];
    const correctLetter = resolution?.correctOption || 'A';
    const correctRadio = screen.getByRole('radio', { name: new RegExp(`^${correctLetter} `) });
    fireEvent.click(correctRadio);

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // After submit, should show correct feedback
    expect(screen.getByText('Resposta Correta!')).toBeInTheDocument();
    expect(screen.getByText(/Resolução Comentada Oficial/i)).toBeInTheDocument();
    expect(screen.getByText(/1 de 5 respondidas/i)).toBeInTheDocument();
  });

  it('should visually mark carousel pill as incorrect when answer is wrong', () => {
    renderWithProviders();

    // Select incorrect option
    const q1 = useSessionStore.getState().questions[0]!;
    const resolution =
      MOCK_RESOLUTIONS[q1.id] ||
      ENEM_2023_OFFICIAL_RESOLUTIONS[q1.id] ||
      ENEM_2022_OFFICIAL_RESOLUTIONS[q1.id];
    const correctLetter = resolution?.correctOption || 'A';
    const wrongLetter = correctLetter === 'A' ? 'B' : 'A';
    const wrongRadio = screen.getByRole('radio', { name: new RegExp(`^${wrongLetter} `) });
    fireEvent.click(wrongRadio);

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

    const qs = useSessionStore.getState().questions;
    expect(screen.getByText(new RegExp(`^Questão #${qs[0]!.externalId}$`))).toBeInTheDocument();

    // Navigate to question 2 via carousel
    const q2Btn = screen.getByRole('button', { name: /Ir para a questão 2/i });
    fireEvent.click(q2Btn);

    // Question 2 should now be displayed
    expect(screen.getByText(new RegExp(`^Questão #${qs[1]!.externalId}$`))).toBeInTheDocument();

    // Navigate back via Previous button
    const prevBtn = screen.getByRole('button', { name: /Questão anterior/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText(new RegExp(`^Questão #${qs[0]!.externalId}$`))).toBeInTheDocument();
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
    const optionB = screen.getByRole('radio', { name: /^B / });
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
    const optionB = screen.getByRole('radio', { name: /^B / });
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

  it('triggers celebration overlay upon answering all questions and calls onOpenGamification for authenticated students', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'student-auth-123',
        email: 'student@example.com',
        name: 'Aluno ENEM',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01',
      },
      token: 'jwt-token',
    });
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
      expect(screen.getByRole('dialog', { name: /Parabéns! Diagnóstico Concluído!/i })).toBeInTheDocument();
    });

    // Close the celebration modal
    const closeCelebrationBtn = screen.getByRole('button', { name: /Continuar Estudando/i });
    fireEvent.click(closeCelebrationBtn);

    // Completed diagnostic view should be visible, displaying Level of Understanding and radar
    expect(screen.getByText('Seu Diagnóstico ENEM & Nível de Compreensão')).toBeInTheDocument();
    expect(screen.getByText('Diagnóstico ENEM Calibrado')).toBeInTheDocument();

    // Click "Ranking" action
    const gamificationBtn = screen.getByRole('button', { name: /^Ranking$/i });
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

    const qs = useSessionStore.getState().questions;

    // Starts on Question 1
    expect(screen.getByText(new RegExp(`^Questão #${qs[0]!.externalId}$`))).toBeInTheDocument();

    // Press ArrowLeft on first question (boundary check - should stay on Q1)
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(new RegExp(`^Questão #${qs[0]!.externalId}$`))).toBeInTheDocument();

    // Press ArrowRight to advance to Question 2
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText(new RegExp(`^Questão #${qs[1]!.externalId}$`))).toBeInTheDocument();

    // Press PageDown to advance to Question 3
    fireEvent.keyDown(window, { key: 'PageDown' });
    expect(screen.getByText(new RegExp(`^Questão #${qs[2]!.externalId}$`))).toBeInTheDocument();

    // Press ']' bracket shortcut to advance to Question 4
    fireEvent.keyDown(window, { key: ']' });
    expect(screen.getByText(new RegExp(`^Questão #${qs[3]!.externalId}$`))).toBeInTheDocument();

    // Press PageUp to go back to Question 3
    fireEvent.keyDown(window, { key: 'PageUp' });
    expect(screen.getByText(new RegExp(`^Questão #${qs[2]!.externalId}$`))).toBeInTheDocument();

    // Press '[' bracket shortcut to go back to Question 2
    fireEvent.keyDown(window, { key: '[' });
    expect(screen.getByText(new RegExp(`^Questão #${qs[1]!.externalId}$`))).toBeInTheDocument();

    // Press ArrowLeft to go back to Question 1
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(new RegExp(`^Questão #${qs[0]!.externalId}$`))).toBeInTheDocument();
  });

  it('does not trigger question navigation when user is typing in an input or textarea', () => {
    renderWithProviders();

    const qs = useSessionStore.getState().questions;
    expect(screen.getByText(new RegExp(`^Questão #${qs[0]!.externalId}$`))).toBeInTheDocument();

    // Create a mock input and focus it
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: 'ArrowRight' });

    // Should still be on Question 1
    expect(screen.getByText(new RegExp(`^Questão #${qs[0]!.externalId}$`))).toBeInTheDocument();

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
    const year2023 = screen.getByRole('radio', { name: /2023/i });
    fireEvent.click(year2023);

    // Click "Iniciar Simulado Oficial"
    const startBtn = screen.getByRole('button', { name: /Iniciar Simulado Oficial/i });
    fireEvent.click(startBtn);

    // Modal should close and session title should update
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/Simulado Oficial ENEM 2023 — Dia 1/i)).toBeInTheDocument();
  });

  it('opens ExamSimulationModal, selects Misto, and launches a 90-question mixed official exam session', () => {
    renderWithProviders();

    // Click "Simular Prova Oficial" button
    const openSimBtn = screen.getByRole('button', {
      name: /Simular Prova Oficial/i,
    });
    fireEvent.click(openSimBtn);

    // Select "Misto"
    const mistoBtn = screen.getByRole('radio', { name: /misto/i });
    fireEvent.click(mistoBtn);

    // Click "Iniciar Simulado Misto (90 questões)"
    const startBtn = screen.getByRole('button', { name: /Iniciar Simulado Misto/i });
    fireEvent.click(startBtn);

    // Modal closes and session title reflects Simulado Oficial Misto
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/Simulado Oficial Misto — Dia 1/i)).toBeInTheDocument();

    // Verify exactly 90 questions loaded in session store
    const sessionQuestions = useSessionStore.getState().questions;
    expect(sessionQuestions).toHaveLength(90);

    // Verify 45 LC and 45 CH
    const lcCount = sessionQuestions.filter((q) => q.knowledgeArea === 'LC').length;
    const chCount = sessionQuestions.filter((q) => q.knowledgeArea === 'CH').length;
    expect(lcCount).toBe(45);
    expect(chCount).toBe(45);

    // Verify questions come from different years
    const years = new Set(sessionQuestions.map((q) => q.examYear));
    expect(years.has(2022)).toBe(true);
    expect(years.has(2023)).toBe(true);
  });

  it('presents different, novel questions when clicking "Refazer Diagnóstico" after completing diagnostic', async () => {
    renderWithProviders();

    // Verify initial Question 1 statement and progressive difficulty (starts with EASY, ends with HARD)
    const initialQuestions = useSessionStore.getState().questions;
    expect(initialQuestions).toHaveLength(5);
    expect(initialQuestions[0]?.difficulty).toBe('EASY');
    expect(initialQuestions[4]?.difficulty).toBe('HARD');

    const initialExternalId = initialQuestions[0]!.externalId;
    const initialIdPattern = new RegExp(`^Questão #${initialExternalId}$`);
    expect(screen.getByText(initialIdPattern)).toBeInTheDocument();

    const initialQuestionIds = initialQuestions.map((q) => q.id);
    expect(initialQuestionIds).toHaveLength(5);

    // Complete all 5 initial questions
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

    // For unauthenticated users, celebration modal and top control bar should NOT appear
    expect(screen.queryByRole('dialog', { name: /Parabéns! Diagnóstico Concluído!/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Diagnóstico ENEM Calibrado')).not.toBeInTheDocument();

    // Verify diagnostic result view is displayed directly with "Refazer Diagnóstico" button
    expect(screen.getByText('Seu Diagnóstico ENEM & Nível de Compreensão')).toBeInTheDocument();
    const retakeButton = screen.getByRole('button', { name: /Refazer Diagnóstico/i });
    expect(retakeButton).toBeInTheDocument();

    // Click "Refazer Diagnóstico"
    fireEvent.click(retakeButton);

    // Session should be restarted in active mode with 0 answered
    expect(screen.getByText(/0 de 5 respondidas/i)).toBeInTheDocument();

    // Verify new questions are loaded and distinct from the initial set
    const recalQuestions = useSessionStore.getState().questions;
    const recalQuestionIds = recalQuestions.map((q) => q.id);
    expect(recalQuestionIds).toHaveLength(5);
    expect(recalQuestions[0]?.difficulty).toBe('EASY');
    expect(recalQuestions[4]?.difficulty).toBe('HARD');

    // Initial question 1 should NOT be in the active recalibration session
    expect(screen.queryByText(initialIdPattern)).not.toBeInTheDocument();

    // Every question ID in the recalibration session should be different from the initial question IDs
    initialQuestionIds.forEach((initialId) => {
      expect(recalQuestionIds).not.toContain(initialId);
    });

    // The new Question 1 should be rendered
    const currentQ1 = recalQuestions[0];
    expect(currentQ1).toBeDefined();
    expect(screen.getByText(new RegExp(`^Questão #${currentQ1!.externalId}$`))).toBeInTheDocument();
  });

  it('pauses the quiz timer when the Socratic AI Tutor drawer is opened', () => {
    renderWithProviders();

    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute('aria-label', expect.not.stringContaining('Pausado'));

    const openTutorButtons = screen.getAllByRole('button', { name: /Tirar Dúvida/i });
    fireEvent.click(openTutorButtons[0]!);

    expect(timer).toHaveAttribute('aria-label', expect.stringContaining('Pausado'));
  });

  it('initializes Daily Practice questions ("Questões Diárias do ENEM") when student has already completed diagnostic', () => {
    // Set authenticated state and diagnostic completed in store
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'student-123',
        email: 'student@example.com',
        name: 'Estudante ENEM',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01',
      },
      token: 'jwt-token',
    });
    const mockReport: DiagnosticReportDto = {
      id: 'diag-1',
      sessionId: 'session-1',
      scorePercentage: 70,
      radar: [
        { knowledgeArea: 'MT', areaName: 'Matemática', scorePercentage: 75, correctQuestions: 3, totalQuestions: 4, masteryLevel: 'MASTERED' },
      ],
      generatedAt: new Date().toISOString(),
      recommendedTopics: ['Geometria'],
    };
    useSessionStore.setState({
      isDiagnosticCompleted: true,
      savedDiagnosticReport: mockReport,
      questions: [],
      activeSession: null,
      phase: 'IDLE',
    });

    renderWithProviders();

    // Verify session initialized as Questões Diárias do ENEM, NOT Diagnóstico ENEM
    expect(screen.getByText('Questões Diárias do ENEM')).toBeInTheDocument();
    expect(screen.queryByText('Diagnóstico ENEM Calibrado')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Refazer Diagnóstico/i })).not.toBeInTheDocument();

    const questions = useSessionStore.getState().questions;
    expect(questions).toHaveLength(5);
    expect(useSessionStore.getState().activeSession?.title).toBe('Questões Diárias do ENEM');
  });

  it('initializes Daily Practice with question count matching student daily goal target (e.g. 15 questions)', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'student-123',
        email: 'student@example.com',
        name: 'Estudante ENEM',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01',
      },
      token: 'jwt-token',
    });
    const mockReport: DiagnosticReportDto = {
      id: 'diag-1',
      sessionId: 'session-1',
      scorePercentage: 70,
      radar: [
        { knowledgeArea: 'MT', areaName: 'Matemática', scorePercentage: 75, correctQuestions: 3, totalQuestions: 4, masteryLevel: 'MASTERED' },
      ],
      generatedAt: new Date().toISOString(),
      recommendedTopics: ['Geometria'],
    };
    useSessionStore.setState({
      isDiagnosticCompleted: true,
      savedDiagnosticReport: mockReport,
      questions: [],
      activeSession: null,
      phase: 'IDLE',
    });

    const customClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    customClient.setQueryData(queryKeys.gamification.profile, {
      userId: 'student-123',
      currentXp: 100,
      level: 2,
      levelTitle: 'Estudante Focado',
      currentStreakDays: 3,
      longestStreakDays: 5,
      streakFreezeAvailable: true,
      dailyGoalTarget: 15,
      dailyGoalProgress: 5,
      weeklyLeague: 'SILVER',
      unlockedBadges: [],
    });

    render(
      <QueryClientProvider client={customClient}>
        <PracticeHero />
      </QueryClientProvider>
    );

    expect(screen.getByText('Questões Diárias do ENEM')).toBeInTheDocument();
    expect(screen.getByText(/0 de 15 respondidas/i)).toBeInTheDocument();
    expect(useSessionStore.getState().questions).toHaveLength(15);
    expect(screen.getByRole('button', { name: /Ir para a questão 15/i })).toBeInTheDocument();
  });

  it('hides "Refazer Diagnóstico" for authenticated students and provides "Começar Treino Diário"', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'student-123',
        email: 'student@example.com',
        name: 'Estudante ENEM',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01',
      },
      token: 'jwt-token',
    });
    useSessionStore.setState({
      isDiagnosticCompleted: false,
      savedDiagnosticReport: null,
      diagnosticReport: null,
      questions: [],
      activeSession: null,
      phase: 'IDLE',
    });

    renderWithProviders();

    // Verify initially Diagnostic session for first-time student
    expect(screen.getByText('Diagnóstico ENEM')).toBeInTheDocument();

    // Answer all 5 questions
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

    // Wait for celebration and dismiss
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Parabéns! Diagnóstico Concluído!/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar Estudando/i }));

    // Verify diagnostic calibrated view is shown, but NEVER "Refazer Diagnóstico" for logged-in user
    expect(screen.getByText('Diagnóstico ENEM Calibrado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Refazer Diagnóstico/i })).not.toBeInTheDocument();

    // Verify "Começar Treino Diário" is available
    const startDailyBtns = screen.getAllByRole('button', { name: /Começar Treino Diário/i });
    expect(startDailyBtns.length).toBeGreaterThan(0);

    // Clicking "Começar Treino Diário" should launch Daily Practice
    fireEvent.click(startDailyBtns[0]!);
    expect(screen.getByText('Questões Diárias do ENEM')).toBeInTheDocument();
    expect(useSessionStore.getState().activeSession?.title).toBe('Questões Diárias do ENEM');
  });

  it('does NOT display celebration modal or top action bar for unauthenticated guests, showing only diagnostic report with signup banner', async () => {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    useSessionStore.setState({
      isDiagnosticCompleted: false,
      savedDiagnosticReport: null,
      diagnosticReport: null,
      questions: [],
      activeSession: null,
      phase: 'IDLE',
    });

    renderWithProviders();

    // Complete all 5 diagnostic questions as an unauthenticated guest
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

    // Verify celebration achievement modal does NOT render
    expect(screen.queryByRole('dialog', { name: /Parabéns! Diagnóstico Concluído!/i })).not.toBeInTheDocument();

    // Verify top green control bar does NOT render
    expect(screen.queryByText('Diagnóstico ENEM Calibrado')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Começar Treino Diário/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Iniciar Treino Diário/i })).not.toBeInTheDocument();

    // Verify the diagnostic report and signup banner ARE rendered cleanly
    expect(screen.getByText('Seu Diagnóstico ENEM & Nível de Compreensão')).toBeInTheDocument();
    expect(screen.getByText('Deseja salvar sua nota TRI e acompanhar sua evolução semanal?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cadastre-se Gratuitamente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refazer Diagnóstico/i })).toBeInTheDocument();
  });

  it('renders DailyPracticeSummaryView upon completing Daily Practice questions and preserves diagnostic radar', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'student-123',
        email: 'student@example.com',
        name: 'Estudante ENEM',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01',
      },
      token: 'jwt-token',
    });
    const savedRadar: DiagnosticReportDto = {
      id: 'diag-2',
      sessionId: 'session-2',
      scorePercentage: 80,
      radar: [
        { knowledgeArea: 'LC', areaName: 'Linguagens', scorePercentage: 85, correctQuestions: 4, totalQuestions: 5, masteryLevel: 'MASTERED' },
      ],
      generatedAt: new Date().toISOString(),
      recommendedTopics: ['Interpretação Textual'],
    };
    useSessionStore.setState({
      isDiagnosticCompleted: true,
      savedDiagnosticReport: savedRadar,
      diagnosticReport: savedRadar,
      questions: [],
      activeSession: null,
      phase: 'IDLE',
    });

    renderWithProviders();

    // Verify Daily Practice active
    expect(screen.getByText('Questões Diárias do ENEM')).toBeInTheDocument();

    // Answer all daily practice questions
    act(() => {
      const qs = useSessionStore.getState().questions;
      qs.forEach((q) => {
        useSessionStore.getState().recordAttempt({
          questionId: q.id,
          selectedOption: 'B',
          correctOption: 'B',
          isCorrect: true,
          awardedXp: 15,
        });
      });
    });

    // Dismiss celebration modal
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Treino Diário Concluído! 🎉/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar Estudando/i }));

    // Verify DailyPracticeSummaryView is rendered
    expect(screen.getByTestId('daily-practice-summary-view')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Treino Diário Concluído! 🎉/i })).toBeInTheDocument();
    expect(screen.queryByText('Diagnóstico ENEM Calibrado')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Refazer Diagnóstico/i })).not.toBeInTheDocument();

    // Diagnostic report is dynamically updated in store with cumulative daily practice progress
    const updatedReport = useSessionStore.getState().savedDiagnosticReport;
    expect(updatedReport).not.toBeNull();
    expect(updatedReport?.radar?.length).toBe(4);
    expect(updatedReport?.scorePercentage).toBeGreaterThanOrEqual(80);

    // Clicking "Continuar Praticando" starts another daily batch
    const continueButtons = screen.getAllByRole('button', { name: /Continuar Praticando/i });
    fireEvent.click(continueButtons[0]!);

    expect(screen.getByText('Questões Diárias do ENEM')).toBeInTheDocument();
    expect(screen.getByText(/0 de 5 respondidas/i)).toBeInTheDocument();
  });
});

