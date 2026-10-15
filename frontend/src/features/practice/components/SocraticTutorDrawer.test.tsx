import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocraticTutorDrawer } from './SocraticTutorDrawer';
import { tutorService } from '@/api/services/tutor.service';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UnifiedQuestion } from './QuestionCard';
import type { SocraticThreadDto, SocraticChatResponse } from '@/api/types';

describe('SocraticTutorDrawer Component', () => {
  const handleClose = vi.fn();
  let queryClient: QueryClient;

  const mockQuestion: UnifiedQuestion = {
    id: 'test-q-1234',
    externalId: 'ENEM-2023-FIS-01',
    discipline: 'Física',
    examYear: 2023,
    knowledgeArea: 'CN',
    difficulty: 'MEDIUM',
    statement: 'Um circuito elétrico possui resistor com resistência $R = 10\\ \\Omega$. Calcule a potência.',
    options: [
      { letter: 'A', text: '$10\\text{ W}$' },
      { letter: 'B', text: '$20\\text{ W}$' },
    ],
  };

  const renderWithProviders = (ui: React.ReactElement) => {
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
  });

  it('should not render anything when isOpen is false', () => {
    const { container } = renderWithProviders(
      <SocraticTutorDrawer isOpen={false} onClose={handleClose} question={mockQuestion} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render dialog, header, and quota widget when isOpen is true', () => {
    renderWithProviders(
      <SocraticTutorDrawer isOpen={true} onClose={handleClose} question={mockQuestion} />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Tutor IA Socrático')).toBeInTheDocument();
    expect(screen.getByText('ENEM 2023')).toBeInTheDocument();
    expect(screen.getByText(/Física • Guia pedagógico/i)).toBeInTheDocument();
  });

  it('should call onClose when clicking the close button or backdrop', () => {
    renderWithProviders(
      <SocraticTutorDrawer isOpen={true} onClose={handleClose} question={mockQuestion} />
    );

    const closeBtn = screen.getByRole('button', { name: /Fechar Tutor Socrático/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const backdrop = screen.getByTestId('socratic-drawer-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should dismiss on Escape key press', () => {
    renderWithProviders(
      <SocraticTutorDrawer isOpen={true} onClose={handleClose} question={mockQuestion} />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should toggle question statement snippet expansion', () => {
    renderWithProviders(
      <SocraticTutorDrawer isOpen={true} onClose={handleClose} question={mockQuestion} />
    );

    const toggleBtn = screen.getByRole('button', { name: /Ver enunciado da questão/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Um circuito elétrico possui resistor/i)).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('should display guest banner and open register modal in unauthenticated mode', async () => {
    renderWithProviders(
      <SocraticTutorDrawer isOpen={true} onClose={handleClose} question={mockQuestion} />
    );

    expect(screen.getByText(/Crie uma conta gratuita/i)).toBeInTheDocument();

    const openRegisterBtn = screen.getByRole('button', { name: /Cadastrar Grátis ou Entrar/i });
    fireEvent.click(openRegisterBtn);

    await waitFor(() => {
      expect(screen.getByText('Criar Conta de Estudante')).toBeInTheDocument();
    });
  });

  it('should render message history and send new message when authenticated', async () => {
    useAuthStore.getState().setAuth('mock-token', {
      id: 'student-1',
      name: 'Maria Aluna',
      email: 'maria@example.com',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      createdAt: '2026-01-01',
    });

    const mockThread: SocraticThreadDto = {
      threadId: 't-1',
      questionId: mockQuestion.id,
      remainingTurns: 5,
      maxTurns: 6,
      messages: [
        {
          id: 'm-1',
          role: 'user',
          content: 'Qual lei da termodinâmica devo lembrar?',
          timestamp: '2026-10-15T12:00:00Z',
        },
        {
          id: 'm-2',
          role: 'assistant',
          content: 'Pense no fluxo espontâneo de calor: ele flui do corpo quente para o frio.',
          timestamp: '2026-10-15T12:00:03Z',
        },
      ],
    };

    vi.spyOn(tutorService, 'getSocraticThread').mockResolvedValue(mockThread);

    const mockResponse: SocraticChatResponse = {
      threadId: 't-1',
      questionId: mockQuestion.id,
      turnNumber: 2,
      maxTurnsPerThread: 6,
      remainingTurnsInThread: 4,
      socraticResponse: 'Exato! E qual é a consequência disso para o rendimento térmico?',
      modelUsed: 'gemini-1.5-flash',
      isFallback: false,
    };
    const askSpy = vi.spyOn(tutorService, 'askSocraticTutor').mockResolvedValue(mockResponse);

    renderWithProviders(
      <SocraticTutorDrawer isOpen={true} onClose={handleClose} question={mockQuestion} />
    );

    // Initial message history
    await waitFor(() => {
      expect(screen.getByText('Qual lei da termodinâmica devo lembrar?')).toBeInTheDocument();
      expect(screen.getByText(/Pense no fluxo espontâneo de calor/i)).toBeInTheDocument();
    });

    // Send a new query
    const textarea = screen.getByPlaceholderText(/Digite sua dúvida sobre o conceito/i);
    fireEvent.change(textarea, { target: { value: 'Isso se relaciona com entropia?' } });

    const sendBtn = screen.getByRole('button', { name: /Enviar pergunta ao Tutor Socrático/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(askSpy).toHaveBeenCalledWith(mockQuestion.id, {
        message: 'Isso se relaciona com entropia?',
      });
      expect(textarea).toHaveValue('');
    });
  });

  it('should prompt confirmation and invoke resetSocraticThread on confirm', async () => {
    useAuthStore.getState().setAuth('mock-token', {
      id: 'student-1',
      name: 'Maria Aluna',
      email: 'maria@example.com',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      createdAt: '2026-01-01',
    });

    const mockThread: SocraticThreadDto = {
      threadId: 't-1',
      questionId: mockQuestion.id,
      remainingTurns: 2,
      maxTurns: 6,
      messages: [
        {
          id: 'm-1',
          role: 'user',
          content: 'Dúvida antiga',
          timestamp: '2026-10-15T12:00:00Z',
        },
      ],
    };

    vi.spyOn(tutorService, 'getSocraticThread').mockResolvedValue(mockThread);
    const resetSpy = vi.spyOn(tutorService, 'resetSocraticThread').mockResolvedValue(undefined);

    renderWithProviders(
      <SocraticTutorDrawer isOpen={true} onClose={handleClose} question={mockQuestion} />
    );

    await waitFor(() => {
      expect(screen.getByText('Dúvida antiga')).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /Reiniciar conversa desta questão/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Deseja reiniciar esta conversa\?/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Confirmar/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledWith(mockQuestion.id);
      expect(screen.queryByText(/Deseja reiniciar esta conversa\?/i)).not.toBeInTheDocument();
    });
  });

  it('should disable input when remaining turns is zero', async () => {
    useAuthStore.getState().setAuth('mock-token', {
      id: 'student-1',
      name: 'Maria Aluna',
      email: 'maria@example.com',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      createdAt: '2026-01-01',
    });

    const exhaustedThread: SocraticThreadDto = {
      threadId: 't-1',
      questionId: mockQuestion.id,
      remainingTurns: 0,
      maxTurns: 6,
      messages: [
        {
          id: 'm-1',
          role: 'user',
          content: 'Última pergunta',
          timestamp: '2026-10-15T12:00:00Z',
        },
      ],
    };

    vi.spyOn(tutorService, 'getSocraticThread').mockResolvedValue(exhaustedThread);

    renderWithProviders(
      <SocraticTutorDrawer isOpen={true} onClose={handleClose} question={mockQuestion} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Limite de 6 turnos atingido para esta questão/i)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/Digite sua dúvida/i)).not.toBeInTheDocument();
    });
  });
});
