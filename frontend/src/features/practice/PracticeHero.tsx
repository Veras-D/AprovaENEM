import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import { useAccessibilityStore } from '@/stores/useAccessibilityStore';
import { MOCK_QUESTIONS, MOCK_RESOLUTIONS } from '@/api/mocks/mock-data';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import {
  QuizTimer,
  QuestionCard,
  QuestionCarousel,
  InstantFeedback,
  SocraticTutorDrawer,
  TimeAccommodationModal,
  TimeUpModal,
  ExamSimulationModal,
  type ExamSimulationConfig,
} from './components';
import {
  RotateCcw,
  Award,
  BookOpen,
  Bot,
  Trophy,
  Layers,
} from 'lucide-react';
import type { QuestionOptionLetter, PracticeSession } from '@/types';
import { mapDtoToDomainQuestion } from './practice-mappers';
import { CelebrationOverlay } from '@/features/gamification';

export interface PracticeHeroProps {
  readonly onOpenGamification?: () => void;
}

export const PracticeHero: React.FC<PracticeHeroProps> = ({ onOpenGamification }) => {
  const {
    questions,
    currentQuestionIndex,
    attempts,
    selectedAnswers,
    flaggedQuestions,
    startSession,
    recordAttempt,
    recordAnswer,
    toggleFlagQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    activeSession,
  } = useSessionStore();

  const { timeMode, setTimeMode } = useAccessibilityStore();
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [isAccommodationsOpen, setIsAccommodationsOpen] = useState<boolean>(false);
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState<boolean>(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState<boolean>(false);

  // Initialize session with authentic mock questions if empty
  useEffect(() => {
    if (questions.length === 0) {
      const domainQuestions = MOCK_QUESTIONS.map(mapDtoToDomainQuestion);
      const mockSession: PracticeSession = {
        id: 'session-demo-enem',
        title: 'Simulado Rápido ENEM',
        questionCount: domainQuestions.length,
        status: 'IN_PROGRESS',
        currentQuestionIndex: 0,
        correctCount: 0,
        createdAt: new Date().toISOString(),
      };
      startSession(mockSession, domainQuestions);
    }
  }, [questions.length, startSession]);

  const currentQuestion = questions[currentQuestionIndex] || null;
  const currentAttempt = currentQuestion ? attempts[currentQuestion.id] : undefined;
  const currentSelectedOption = currentQuestion ? selectedAnswers[currentQuestion.id] || null : null;
  const currentResolution = currentQuestion ? MOCK_RESOLUTIONS[currentQuestion.id] : undefined;

  const isCurrentSubmitted = Boolean(currentAttempt);
  const correctOption = currentAttempt?.correctOption ?? currentResolution?.correctOption ?? null;

  const handleSelectOption = useCallback(
    (letter: QuestionOptionLetter) => {
      if (currentQuestion && !isCurrentSubmitted) {
        recordAnswer(currentQuestion.id, letter);
      }
    },
    [currentQuestion, isCurrentSubmitted, recordAnswer]
  );

  const handleConfirmAnswer = useCallback(() => {
    if (!currentQuestion || !currentSelectedOption) return;
    const resolution = MOCK_RESOLUTIONS[currentQuestion.id];
    const isCorrect = resolution ? currentSelectedOption === resolution.correctOption : false;

    recordAttempt({
      questionId: currentQuestion.id,
      selectedOption: currentSelectedOption,
      correctOption: resolution?.correctOption,
      isCorrect,
      explanation: resolution?.baseExplanation,
      awardedXp: isCorrect ? 15 : 5,
    });
  }, [currentQuestion, currentSelectedOption, recordAttempt]);

  const handleRestart = useCallback(() => {
    setShowCelebration(false);
    setIsTimeUpModalOpen(false);
    const domainQuestions = MOCK_QUESTIONS.map(mapDtoToDomainQuestion);
    const mockSession: PracticeSession = {
      id: `session-${Date.now()}`,
      title: 'Simulado Rápido ENEM',
      questionCount: domainQuestions.length,
      status: 'IN_PROGRESS',
      currentQuestionIndex: 0,
      correctCount: 0,
      createdAt: new Date().toISOString(),
    };
    startSession(mockSession, domainQuestions);
  }, [startSession]);

  const handleStartCustomSimulation = useCallback(
    (config: ExamSimulationConfig) => {
      setShowCelebration(false);
      setIsTimeUpModalOpen(false);

      // Filter by day/subject
      let filteredDtos = MOCK_QUESTIONS;
      if (config.day === 'DAY_1') {
        filteredDtos = filteredDtos.filter((q) => q.subject === 'LC' || q.subject === 'CH');
      } else if (config.day === 'DAY_2') {
        filteredDtos = filteredDtos.filter((q) => q.subject === 'CN' || q.subject === 'MT');
      }

      // Filter by year
      const yearFiltered = filteredDtos.filter((q) => q.year === config.year);
      // Graceful fallback if specific year has limited items in mock bank
      if (yearFiltered.length > 0) {
        filteredDtos = yearFiltered;
      }

      // Update timing mode
      if (config.timing === 'UNTIMED') {
        setTimeMode('UNTIMED');
      } else if (timeMode === 'UNTIMED') {
        setTimeMode('STANDARD');
      }

      const domainQuestions = filteredDtos.map(mapDtoToDomainQuestion);
      const dayLabel =
        config.day === 'DAY_1'
          ? 'Dia 1 (Linguagens & Humanas)'
          : 'Dia 2 (Natureza & Matemática)';

      const title = `Simulado Oficial ENEM ${config.year} — ${dayLabel}`;

      const customSession: PracticeSession = {
        id: `session-sim-${Date.now()}`,
        title,
        questionCount: domainQuestions.length,
        status: 'IN_PROGRESS',
        currentQuestionIndex: 0,
        correctCount: 0,
        createdAt: new Date().toISOString(),
      };

      startSession(customSession, domainQuestions);
    },
    [setTimeMode, startSession, timeMode]
  );

  // Session summary calculations
  const totalQuestions = questions.length;
  const totalAnswered = useMemo(() => Object.keys(attempts).length, [attempts]);
  const correctCount = activeSession?.correctCount ?? 0;
  const isAllAnswered = totalQuestions > 0 && totalAnswered === totalQuestions;
  const totalXp = useMemo(() => {
    return Object.values(attempts).reduce((acc, att) => acc + (att.awardedXp ?? 0), 0);
  }, [attempts]);

  const flaggedCount = useMemo(() => {
    return Object.values(flaggedQuestions).filter(Boolean).length;
  }, [flaggedQuestions]);

  // Trigger celebratory confetti modal upon answering all questions
  useEffect(() => {
    if (isAllAnswered) {
      setShowCelebration(true);
    }
  }, [isAllAnswered]);

  // Keyboard navigation shortcuts: ArrowLeft / ArrowRight, PageUp / PageDown, [ / ]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      // Don't navigate questions if any modal or drawer is open
      if (
        isTutorOpen ||
        isAccommodationsOpen ||
        isTimeUpModalOpen ||
        showCelebration ||
        isSimulationModalOpen
      ) {
        return;
      }

      // Previous Question: ArrowLeft, PageUp, [
      if (
        (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) ||
        e.key === 'PageUp' ||
        e.key === '['
      ) {
        if (currentQuestionIndex > 0) {
          e.preventDefault();
          previousQuestion();
        }
        return;
      }

      // Next Question: ArrowRight, PageDown, ]
      if (
        (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) ||
        e.key === 'PageDown' ||
        e.key === ']'
      ) {
        if (currentQuestionIndex < totalQuestions - 1) {
          e.preventDefault();
          nextQuestion();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentQuestionIndex,
    totalQuestions,
    previousQuestion,
    nextQuestion,
    isTutorOpen,
    isAccommodationsOpen,
    isTimeUpModalOpen,
    showCelebration,
    isSimulationModalOpen,
  ]);

  return (
    <div className="space-y-6">
      {/* Timed Quiz Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-brand bg-brand-primary/10 text-brand-primary">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {activeSession?.title || 'Simulado Rápido ENEM'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{totalAnswered} de {totalQuestions} respondidas</span>
              {flaggedCount > 0 && (
                <>
                  <span>&bull;</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    {flaggedCount} marcada(s) para revisão
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
          {/* Custom Exam Simulation Selector (Year and Day 1/2) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSimulationModalOpen(true)}
            aria-label="Simular edição oficial do ENEM por ano e dia"
            title="Escolha o ano (2023, 2022...) e o caderno de aplicação (Dia 1 ou Dia 2)"
            className="border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10 text-xs sm:text-sm font-semibold"
          >
            <Layers className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
            <span className="hidden sm:inline">Simular Prova Oficial</span>
          </Button>

          {/* Socratic AI Tutor Quick Action */}
          {currentQuestion && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTutorOpen(true)}
              aria-label="Tirar dúvida com o Tutor IA"
              title="Tem dúvida nesta questão? Peça dicas e explicações passo a passo com Inteligência Artificial"
              className="border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10 text-xs sm:text-sm font-medium"
            >
              <Bot className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
              <span className="hidden sm:inline">Tirar Dúvida (IA)</span>
            </Button>
          )}

          {/* Quiz Timer with INEP Exam Accommodations (3 min per question benchmark) */}
          <QuizTimer
            key={currentQuestionIndex}
            initialSeconds={180}
            isCountdown={timeMode !== 'UNTIMED'}
            timeMode={timeMode}
            onOpenAccommodations={() => setIsAccommodationsOpen(true)}
            onTimeUp={() => setIsTimeUpModalOpen(true)}
          />

          {/* Reset / Restart Quiz */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRestart}
            aria-label="Reiniciar simulado"
            title="Reiniciar simulado"
          >
            <RotateCcw className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
            <span className="hidden sm:inline">Reiniciar</span>
          </Button>
        </div>
      </div>

      {/* Question Carousel / Palette */}
      {totalQuestions > 0 && (
        <QuestionCarousel
          totalQuestions={totalQuestions}
          currentIndex={currentQuestionIndex}
          onSelectIndex={goToQuestion}
          onNext={nextQuestion}
          onPrevious={previousQuestion}
          isAnswered={(idx) => Boolean(questions[idx] && attempts[questions[idx].id])}
          isFlagged={(idx) => Boolean(questions[idx] && flaggedQuestions[questions[idx].id])}
        />
      )}

      {/* Main Interactive Question Card */}
      {currentQuestion && (
        <section aria-labelledby="active-question-section">
          <h2 id="active-question-section" className="sr-only">
            Questão ativa do simulado
          </h2>

          <QuestionCard
            question={currentQuestion}
            selectedOption={currentSelectedOption}
            onSelectOption={handleSelectOption}
            onSubmitAnswer={handleConfirmAnswer}
            onOpenSocraticTutor={() => setIsTutorOpen(true)}
            isSubmitted={isCurrentSubmitted}
            correctOption={correctOption}
            isFlagged={Boolean(flaggedQuestions[currentQuestion.id])}
            onToggleFlag={() => toggleFlagQuestion(currentQuestion.id)}
          />

          {/* Instant Grading Resolution & Distractor Breakdown Accordion */}
          {isCurrentSubmitted && currentAttempt && (
            <InstantFeedback
              className="mt-4"
              isCorrect={Boolean(currentAttempt.isCorrect)}
              selectedOption={currentAttempt.selectedOption}
              correctOption={correctOption ?? 'A'}
              baseExplanation={currentAttempt.explanation || currentResolution?.baseExplanation || ''}
              distractorAnalysis={currentResolution?.distractorAnalysis}
              attribution={currentResolution?.attribution}
              awardedXp={currentAttempt.awardedXp}
              onNextQuestion={nextQuestion}
              hasNextQuestion={currentQuestionIndex < totalQuestions - 1}
              onOpenSocraticTutor={() => setIsTutorOpen(true)}
            />
          )}
        </section>
      )}

      {/* Session Completed Celebratory Card */}
      {isAllAnswered && (
        <Card className="border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="p-2.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
              <Award className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                Simulado Rápido Concluído!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Você respondeu a todas as {totalQuestions} questões com sucesso.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-brand bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 text-center">
                <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {correctCount}/{totalQuestions}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Acertos ({Math.round((correctCount / totalQuestions) * 100)}%)</span>
              </div>
              <div className="p-3 rounded-brand bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 text-center">
                <span className="block text-2xl font-black text-amber-500">
                  +{totalXp}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Pontos de XP</span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-brand bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 text-center">
                <span className="block text-2xl font-black text-slate-700 dark:text-slate-300">
                  {flaggedCount}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Marcadas para Revisão</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              {onOpenGamification && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={onOpenGamification}
                  className="w-full sm:w-auto"
                >
                  <Trophy className="h-4 w-4 mr-2" aria-hidden="true" />
                  Ver Conquistas & Ranking
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleRestart}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
                Refazer Simulado
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Socratic AI Tutor Drawer bound to current question */}
      {currentQuestion && (
        <SocraticTutorDrawer
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          question={currentQuestion}
        />
      )}

      {/* Level-up & Exam Completion Celebration Modal Overlay */}
      <CelebrationOverlay
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title="Parabéns! Simulado Concluído!"
        subtitle={`Você respondeu a todas as ${totalQuestions} questões com ${correctCount} acertos!`}
        xpAwarded={totalXp}
      />

      {/* INEP Exam Time Accommodation Settings Modal */}
      <TimeAccommodationModal
        isOpen={isAccommodationsOpen}
        currentMode={timeMode}
        onSelectMode={setTimeMode}
        onClose={() => setIsAccommodationsOpen(false)}
      />

      {/* Question Pacing Alert Popup (Never interrupts or blocks candidate studies) */}
      <TimeUpModal
        isOpen={isTimeUpModalOpen}
        questionNumber={currentQuestionIndex + 1}
        hasNextQuestion={currentQuestionIndex < totalQuestions - 1}
        onContinue={() => setIsTimeUpModalOpen(false)}
        onNextQuestion={() => {
          setIsTimeUpModalOpen(false);
          nextQuestion();
        }}
        onSwitchUntimed={() => {
          setTimeMode('UNTIMED');
          setIsTimeUpModalOpen(false);
        }}
        onClose={() => setIsTimeUpModalOpen(false)}
      />

      {/* Official ENEM Exam Simulation Configurator Modal (Year & Day 1/2) */}
      <ExamSimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        onStartSimulation={handleStartCustomSimulation}
      />
    </div>
  );
};
