import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyPracticeSummaryView } from './DailyPracticeSummaryView';

describe('DailyPracticeSummaryView Component', () => {
  it('renders summary heading, accuracy, score, and XP awarded correctly', () => {
    const handleContinue = vi.fn();

    render(
      <DailyPracticeSummaryView
        questionsCount={5}
        correctCount={4}
        awardedXp={60}
        dailyGoalTarget={5}
        dailyGoalProgress={4}
        onContinuePractice={handleContinue}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: /Treino Diário Concluído! 🎉/i })).toBeInTheDocument();
    expect(screen.getAllByText('4/5').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/80% de acertos/i)).toBeInTheDocument();
    expect(screen.getByText('+60 XP')).toBeInTheDocument();
    expect(screen.getByText(/Faltam 1 questões para bater a meta/i)).toBeInTheDocument();
  });

  it('displays badge and congratulations when daily goal is reached', () => {
    render(
      <DailyPracticeSummaryView
        questionsCount={5}
        correctCount={5}
        awardedXp={75}
        dailyGoalTarget={5}
        dailyGoalProgress={5}
        onContinuePractice={vi.fn()}
      />
    );

    expect(screen.getByText(/Meta Diária Atingida!/i)).toBeInTheDocument();
    expect(screen.getByText(/Parabéns! Meta do dia cumprida!/i)).toBeInTheDocument();
  });

  it('invokes callbacks when clicking action buttons', () => {
    const handleContinue = vi.fn();
    const handleSimulate = vi.fn();
    const handleDiagnostics = vi.fn();
    const handleGamification = vi.fn();

    render(
      <DailyPracticeSummaryView
        questionsCount={5}
        correctCount={3}
        awardedXp={45}
        dailyGoalTarget={5}
        dailyGoalProgress={3}
        onContinuePractice={handleContinue}
        onStartOfficialSimulation={handleSimulate}
        onOpenDiagnostics={handleDiagnostics}
        onOpenGamification={handleGamification}
      />
    );

    const continueButtons = screen.getAllByRole('button', { name: /Continuar Praticando|Praticar Mais 5 Questões/i });
    expect(continueButtons.length).toBeGreaterThan(0);
    fireEvent.click(continueButtons[0]!);
    expect(handleContinue).toHaveBeenCalledTimes(1);

    const simBtn = screen.getByRole('button', { name: /Simular Prova Oficial/i });
    fireEvent.click(simBtn);
    expect(handleSimulate).toHaveBeenCalledTimes(1);

    const diagBtn = screen.getByRole('button', { name: /Painel Diagnóstico/i });
    fireEvent.click(diagBtn);
    expect(handleDiagnostics).toHaveBeenCalledTimes(1);

    const rankBtn = screen.getByRole('button', { name: /Ranking da Liga/i });
    fireEvent.click(rankBtn);
    expect(handleGamification).toHaveBeenCalledTimes(1);
  });

  it('dynamically adapts "Praticar Mais N Questões" button and next steps to customized daily goal (e.g. 3 questions)', () => {
    const handleContinue = vi.fn();

    render(
      <DailyPracticeSummaryView
        questionsCount={3}
        correctCount={1}
        awardedXp={25}
        dailyGoalTarget={3}
        dailyGoalProgress={3}
        onContinuePractice={handleContinue}
      />
    );

    expect(screen.getByText(/Continue praticando com mais 3 questões/i)).toBeInTheDocument();
    const continueBtn = screen.getByRole('button', { name: /Praticar Mais 3 Questões/i });
    expect(continueBtn).toBeInTheDocument();
    fireEvent.click(continueBtn);
    expect(handleContinue).toHaveBeenCalledTimes(1);
  });
});
