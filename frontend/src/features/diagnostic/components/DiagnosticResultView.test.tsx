import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiagnosticResultView } from './DiagnosticResultView';
import { useAuthStore } from '@/stores/useAuthStore';
import type { DiagnosticReportDto } from '@/api/types';

const mockReport: DiagnosticReportDto = {
  id: 'report-test-123',
  sessionId: 'session-test-123',
  scorePercentage: 80,
  radar: [
    {
      knowledgeArea: 'MT',
      areaName: 'Matemática e suas Tecnologias',
      scorePercentage: 100,
      totalQuestions: 1,
      correctQuestions: 1,
      masteryLevel: 'MASTERED',
    },
    {
      knowledgeArea: 'CN',
      areaName: 'Ciências da Natureza e suas Tecnologias',
      scorePercentage: 50,
      totalQuestions: 2,
      correctQuestions: 1,
      masteryLevel: 'ATTENTION_NEEDED',
      topWeakTopic: 'Cinemática',
    },
    {
      knowledgeArea: 'CH',
      areaName: 'Ciências Humanas e suas Tecnologias',
      scorePercentage: 100,
      totalQuestions: 1,
      correctQuestions: 1,
      masteryLevel: 'MASTERED',
    },
    {
      knowledgeArea: 'LC',
      areaName: 'Linguagens, Códigos e suas Tecnologias',
      scorePercentage: 100,
      totalQuestions: 1,
      correctQuestions: 1,
      masteryLevel: 'MASTERED',
    },
  ],
  recommendedTopics: ['Cinemática'],
  generatedAt: '2026-10-20T00:00:00.000Z',
};

describe('DiagnosticResultView Component', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  });

  it('renders accomplishment title, estimated TRI score, overall accuracy, and XP', () => {
    render(<DiagnosticResultView report={mockReport} awardedXp={65} />);

    expect(screen.getByText('Seu Diagnóstico ENEM & Nível de Compreensão')).toBeInTheDocument();
    expect(screen.getByText('Nota TRI Estimada')).toBeInTheDocument();
    // 360 + (80/100)*500 = 760
    expect(screen.getByText('~760')).toBeInTheDocument();
    expect(screen.getAllByText('Nível Avançado').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+65')).toBeInTheDocument();
    expect(screen.getByText('Parecer Pedagógico de Entrada')).toBeInTheDocument();
  });

  it('renders unauthenticated guest registration prompt when not logged in', () => {
    const onOpenAuthModal = vi.fn();
    render(
      <DiagnosticResultView
        report={mockReport}
        onOpenAuthModal={onOpenAuthModal}
      />
    );

    expect(screen.getByText(/Deseja salvar sua nota TRI e acompanhar sua evolução semanal\?/i)).toBeInTheDocument();
    const registerBtn = screen.getByRole('button', { name: /Cadastre-se Gratuitamente/i });
    fireEvent.click(registerBtn);
    expect(onOpenAuthModal).toHaveBeenCalledWith('register');

    const loginBtn = screen.getByRole('button', { name: /^Entrar$/i });
    fireEvent.click(loginBtn);
    expect(onOpenAuthModal).toHaveBeenCalledWith('login');
  });

  it('hides unauthenticated guest banner when user is logged in', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'usr-1',
        email: 'student@example.com',
        name: 'Aluno Teste',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01',
      },
      token: 'jwt-token',
    });

    render(<DiagnosticResultView report={mockReport} />);
    expect(screen.queryByText(/Deseja salvar sua nota TRI e acompanhar sua evolução semanal\?/i)).not.toBeInTheDocument();
  });

  it('invokes onStartOfficialSimulation and onRetakeDiagnostic callbacks', () => {
    const onStartSimulation = vi.fn();
    const onRetake = vi.fn();

    render(
      <DiagnosticResultView
        report={mockReport}
        onStartOfficialSimulation={onStartSimulation}
        onRetakeDiagnostic={onRetake}
      />
    );

    const simBtn = screen.getByRole('button', { name: /Simular Prova Oficial/i });
    fireEvent.click(simBtn);
    expect(onStartSimulation).toHaveBeenCalledTimes(1);

    const retakeBtn = screen.getByRole('button', { name: /Refazer Diagnóstico/i });
    fireEvent.click(retakeBtn);
    expect(onRetake).toHaveBeenCalledTimes(1);
  });

  it('hides "Refazer Diagnóstico" and renders "Iniciar Treino Diário" when authenticated', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'usr-456',
        email: 'authenticated@example.com',
        name: 'Aluno Autenticado',
        roles: ['ROLE_STUDENT'],
        isEmailVerified: true,
        createdAt: '2026-01-01',
      },
      token: 'jwt-token',
    });

    const handleStartDaily = vi.fn();
    const handleRetake = vi.fn();

    render(
      <DiagnosticResultView
        report={mockReport}
        onStartDailyPractice={handleStartDaily}
        onRetakeDiagnostic={handleRetake}
      />
    );

    // Refazer Diagnóstico must NOT appear for logged in students
    expect(screen.queryByRole('button', { name: /Refazer Diagnóstico/i })).not.toBeInTheDocument();

    // Iniciar Treino Diário must be present and clickable
    const dailyBtn = screen.getByRole('button', { name: /treino diário/i });
    expect(dailyBtn).toBeInTheDocument();
    fireEvent.click(dailyBtn);
    expect(handleStartDaily).toHaveBeenCalledTimes(1);
  });
});
