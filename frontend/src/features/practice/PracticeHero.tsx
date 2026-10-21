import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import { useAccessibilityStore } from '@/stores/useAccessibilityStore';
import { useQuestionsQuery, useSubmitAnswerMutation } from '@/api/hooks';
import { MOCK_QUESTIONS, MOCK_RESOLUTIONS } from '@/api/mocks/mock-data';
import {
  ENEM_2023_OFFICIAL_QUESTIONS,
  ENEM_2023_OFFICIAL_RESOLUTIONS,
  ENEM_2022_OFFICIAL_QUESTIONS,
  ENEM_2022_OFFICIAL_RESOLUTIONS,
  getMixedExamQuestions,
} from '@/api/mocks/completed-exams';
import { Button } from '@/components/ui/Button';
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
  BookOpen,
  Bot,
  Trophy,
  Layers,
  BarChart2,
} from 'lucide-react';
import type { QuestionOptionLetter, PracticeSession } from '@/types';
import type { DiagnosticReportDto, QuestionItemDto } from '@/api/types';
import { mapDtoToDomainQuestion } from './practice-mappers';
import { CelebrationOverlay } from '@/features/gamification';
import { DiagnosticResultView } from '@/features/diagnostic/components/DiagnosticResultView';
import {
  generateDiagnosticFromSession,
  selectDiagnosticQuestions,
  getSessionVariantIndex,
} from '@/features/diagnostic/diagnostic-utils';

const ALL_FALLBACK_QUESTIONS: readonly QuestionItemDto[] = [
  ...MOCK_QUESTIONS,
  ...ENEM_2023_OFFICIAL_QUESTIONS,
  ...ENEM_2022_OFFICIAL_QUESTIONS,
];

export interface PracticeHeroProps {
  readonly onOpenGamification?: () => void;
  readonly onOpenDiagnostics?: () => void;
  readonly onOpenAuthModal?: (mode?: 'login' | 'register') => void;
}

export const PracticeHero: React.FC<PracticeHeroProps> = ({
  onOpenGamification,
  onOpenDiagnostics,
  onOpenAuthModal,
}) => {
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
    phase,
    diagnosticReport,
    savedDiagnosticReport,
    isDiagnosticCompleted,
    completeSession,
    resetDiagnostic,
    recordDiagnosticSeenQuestions,
  } = useSessionStore();

  const { timeMode, setTimeMode } = useAccessibilityStore();
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [isAccommodationsOpen, setIsAccommodationsOpen] = useState<boolean>(false);
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState<boolean>(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState<boolean>(false);
  const hasUpgradedToLiveRef = useRef<boolean>(false);

  const questionsQuery = useQuestionsQuery({ size: 100 });
  const submitAnswerMutation = useSubmitAnswerMutation();

  const anonymousSessionId = useSessionStore((state) => state.anonymousSessionId);
  const starterVariant = useMemo(() => {
    return getSessionVariantIndex(anonymousSessionId);
  }, [anonymousSessionId]);

  const questionsPool = useMemo(() => {
    if (questionsQuery.data?.content && questionsQuery.data.content.length > 0) {
      return questionsQuery.data.content;
    }
    return ALL_FALLBACK_QUESTIONS;
  }, [questionsQuery.data?.content]);

  // Initialize session with live backend questions (or fallback pool) if empty and diagnostic not already completed
  useEffect(() => {
    if (questions.length === 0 && !isDiagnosticCompleted) {
      const seenIds = useSessionStore.getState().seenDiagnosticQuestionIds;
      const initialDtos = selectDiagnosticQuestions(questionsPool, seenIds, 5, starterVariant);
      const domainQuestions = initialDtos.map(mapDtoToDomainQuestion);
      recordDiagnosticSeenQuestions(initialDtos.map((q) => q.id));
      const initialSession: PracticeSession = {
        id: `session-enem-${Date.now()}`,
        title: 'Diagnóstico ENEM',
        questionCount: domainQuestions.length,
        status: 'IN_PROGRESS',
        currentQuestionIndex: 0,
        correctCount: 0,
        createdAt: new Date().toISOString(),
      };
      startSession(initialSession, domainQuestions);
    }
  }, [questions.length, isDiagnosticCompleted, startSession, recordDiagnosticSeenQuestions, questionsPool, starterVariant]);

  // Upgrade to live backend questions once when available if student has not interacted yet
  useEffect(() => {
    if (
      !hasUpgradedToLiveRef.current &&
      questionsQuery.isSuccess &&
      questionsQuery.data?.content &&
      questionsQuery.data.content.length > 0 &&
      Object.keys(selectedAnswers).length === 0 &&
      Object.keys(attempts).length === 0 &&
      !isDiagnosticCompleted &&
      questions.length > 0
    ) {
      hasUpgradedToLiveRef.current = true;
      const seenIds = useSessionStore.getState().seenDiagnosticQuestionIds;
      const liveDtos = selectDiagnosticQuestions(questionsQuery.data.content, seenIds, 5, starterVariant);
      const domainQuestions = liveDtos.map(mapDtoToDomainQuestion);
      recordDiagnosticSeenQuestions(liveDtos.map((q) => q.id));
      const liveSession: PracticeSession = {
        id: `session-live-${Date.now()}`,
        title: 'Diagnóstico ENEM',
        questionCount: domainQuestions.length,
        status: 'IN_PROGRESS',
        currentQuestionIndex: 0,
        correctCount: 0,
        createdAt: new Date().toISOString(),
      };
      startSession(liveSession, domainQuestions);
    }
  }, [
    questionsQuery.isSuccess,
    questionsQuery.data?.content,
    selectedAnswers,
    attempts,
    isDiagnosticCompleted,
    questions.length,
    recordDiagnosticSeenQuestions,
    startSession,
    starterVariant,
  ]);

  const currentQuestion = questions[currentQuestionIndex] || null;
  const currentAttempt = currentQuestion ? attempts[currentQuestion.id] : undefined;
  const currentSelectedOption = currentQuestion ? selectedAnswers[currentQuestion.id] || null : null;
  const currentResolution = currentQuestion
    ? MOCK_RESOLUTIONS[currentQuestion.id] ||
      ENEM_2023_OFFICIAL_RESOLUTIONS[currentQuestion.id] ||
      ENEM_2022_OFFICIAL_RESOLUTIONS[currentQuestion.id]
    : undefined;

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
    const resolution =
      MOCK_RESOLUTIONS[currentQuestion.id] ||
      ENEM_2023_OFFICIAL_RESOLUTIONS[currentQuestion.id] ||
      ENEM_2022_OFFICIAL_RESOLUTIONS[currentQuestion.id];
    const isCorrect = resolution ? currentSelectedOption === resolution.correctOption : false;

    // 1. Record attempt synchronously for instant UI grading and responsiveness
    recordAttempt({
      questionId: currentQuestion.id,
      selectedOption: currentSelectedOption,
      correctOption: resolution?.correctOption,
      isCorrect,
      explanation: resolution?.baseExplanation,
      awardedXp: isCorrect ? 15 : 5,
    });

    // 2. Submit to backend if active session is available
    const sessionId = activeSession?.id;
    if (sessionId && !sessionId.startsWith('session-demo')) {
      submitAnswerMutation.mutate(
        {
          sessionId,
          req: {
            questionId: currentQuestion.id,
            selectedOption: currentSelectedOption,
            timeSpentSeconds: 30,
          },
        },
        {
          onSuccess: (result) => {
            recordAttempt({
              questionId: currentQuestion.id,
              selectedOption: currentSelectedOption,
              correctOption: result.correctOption,
              isCorrect: result.isCorrect,
              explanation: result.baseExplanation,
              keyConcepts: result.keyConcepts,
              authorAttribution: 'Equipe Pedagógica AprovaENEM / INEP',
              awardedXp: result.isCorrect ? 15 : 5,
            });
          },
        }
      );
    }
  }, [currentQuestion, currentSelectedOption, activeSession?.id, submitAnswerMutation, recordAttempt]);

  const handleRestart = useCallback(() => {
    setShowCelebration(false);
    setIsTimeUpModalOpen(false);

    // Collect questions to exclude from recalibration to ensure different questions are presented
    const currentIds = questions.map((q) => q.id);
    const seenIds = useSessionStore.getState().seenDiagnosticQuestionIds;
    const excludeIds = Array.from(new Set([...seenIds, ...currentIds]));

    resetDiagnostic();

    // Select novel balanced questions across ENEM areas
    const newDtos = selectDiagnosticQuestions(questionsPool, excludeIds, 5, starterVariant);
    const domainQuestions = newDtos.map(mapDtoToDomainQuestion);
    recordDiagnosticSeenQuestions(newDtos.map((q) => q.id));

    const mockSession: PracticeSession = {
      id: `session-recal-${Date.now()}`,
      title: 'Diagnóstico ENEM',
      questionCount: domainQuestions.length,
      status: 'IN_PROGRESS',
      currentQuestionIndex: 0,
      correctCount: 0,
      createdAt: new Date().toISOString(),
    };
    startSession(mockSession, domainQuestions);
  }, [questions, resetDiagnostic, recordDiagnosticSeenQuestions, startSession, questionsPool, starterVariant]);

  const handlePracticeWeakTopic = useCallback(
    (topic: string) => {
      setShowCelebration(false);
      setIsTimeUpModalOpen(false);
      let filteredDtos: readonly QuestionItemDto[] = questionsPool.filter(
        (q) =>
          q.topic?.toLowerCase().includes(topic.toLowerCase()) ||
          q.discipline?.toLowerCase().includes(topic.toLowerCase()) ||
          q.subject?.toLowerCase() === topic.toLowerCase()
      );
      if (filteredDtos.length === 0) {
        filteredDtos = questionsPool;
      }
      const domainQuestions = filteredDtos.map(mapDtoToDomainQuestion);
      const newSession: PracticeSession = {
        id: `session-topic-${Date.now()}`,
        title: `Treino Focado • ${topic || 'Revisão Recomendada'}`,
        questionCount: domainQuestions.length,
        status: 'IN_PROGRESS',
        currentQuestionIndex: 0,
        correctCount: 0,
        createdAt: new Date().toISOString(),
      };
      startSession(newSession, domainQuestions);
    },
    [questionsPool, startSession]
  );

  const handleStartCustomSimulation = useCallback(
    (config: ExamSimulationConfig) => {
      setShowCelebration(false);
      setIsTimeUpModalOpen(false);

      let filteredDtos: readonly QuestionItemDto[] = [];
      let title = '';
      const dayLabel =
        config.day === 'DAY_1'
          ? 'Dia 1 (Linguagens & Humanas)'
          : 'Dia 2 (Natureza & Matemática)';

      if (config.year === 'MIXED') {
        filteredDtos = getMixedExamQuestions(config.day);
        title = `Simulado Oficial Misto — ${dayLabel}`;
      } else {
        // Determine questions pool for official simulation:
        // Use the complete authentic official question bank for full editions
        let basePool = questionsPool;
        if (config.year === 2023 && ENEM_2023_OFFICIAL_QUESTIONS.length > 0) {
          basePool = ENEM_2023_OFFICIAL_QUESTIONS;
        } else if (config.year === 2022 && ENEM_2022_OFFICIAL_QUESTIONS.length > 0) {
          basePool = ENEM_2022_OFFICIAL_QUESTIONS;
        }

        // Filter by day/subject
        filteredDtos = basePool;
        if (config.day === 'DAY_1') {
          filteredDtos = filteredDtos.filter((q) => q.subject === 'LC' || q.subject === 'CH');
        } else if (config.day === 'DAY_2') {
          filteredDtos = filteredDtos.filter((q) => q.subject === 'CN' || q.subject === 'MT');
        }

        // Filter by year
        const yearFiltered = filteredDtos.filter((q) => q.year === config.year);
        if (yearFiltered.length > 0) {
          filteredDtos = yearFiltered;
        }

        title = `Simulado Oficial ENEM ${config.year} — ${dayLabel}`;
      }

      // Update timing mode
      if (config.timing === 'UNTIMED') {
        setTimeMode('UNTIMED');
      } else if (timeMode === 'UNTIMED') {
        setTimeMode('STANDARD');
      }

      const domainQuestions = filteredDtos.map(mapDtoToDomainQuestion);

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
    [setTimeMode, startSession, timeMode, questionsPool]
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

  const isCompleted =
    phase === 'DIAGNOSTIC' ||
    activeSession?.status === 'COMPLETED' ||
    (isAllAnswered && totalQuestions > 0) ||
    (isDiagnosticCompleted && questions.length === 0);

  const activeReport: DiagnosticReportDto = useMemo(() => {
    if (diagnosticReport && 'radar' in diagnosticReport && diagnosticReport.radar) {
      return diagnosticReport as DiagnosticReportDto;
    }
    if (savedDiagnosticReport) {
      return savedDiagnosticReport;
    }
    return generateDiagnosticFromSession(questions, attempts, activeSession?.id);
  }, [diagnosticReport, savedDiagnosticReport, questions, attempts, activeSession?.id]);

  // Trigger celebratory confetti modal and complete diagnostic upon answering all questions
  useEffect(() => {
    if (isAllAnswered && activeSession?.status !== 'COMPLETED' && phase !== 'DIAGNOSTIC') {
      const report = generateDiagnosticFromSession(questions, attempts, activeSession?.id);
      completeSession(report);
      setShowCelebration(true);
    }
  }, [isAllAnswered, activeSession, phase, questions, attempts, completeSession]);

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
    <>
      <div className="space-y-6">
      {/* Timed Quiz Control Bar / Calibrated Status Header */}
      {isCompleted ? (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-brand border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-brand bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <BarChart2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Diagnóstico ENEM Calibrado</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20">
                  {correctCount}/{totalQuestions} ({activeReport.scorePercentage}% Acertos)
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sua proficiência inicial foi avaliada. Você pode praticar tópicos recomendados ou simular provas oficiais completas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 w-full lg:w-auto justify-start lg:justify-end flex-wrap">
            {onOpenDiagnostics && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenDiagnostics}
                className="h-9 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center shrink-0"
                aria-label="Abrir central de diagnósticos"
              >
                <BarChart2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Painel Diagnóstico
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsSimulationModalOpen(true)}
              className="h-9 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center shrink-0"
            >
              <Layers className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Simular Prova Oficial
            </Button>
            {onOpenGamification && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenGamification}
                className="h-9 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center shrink-0"
              >
                <Trophy className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Ranking
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="h-9 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center shrink-0"
              title="Refazer avaliação diagnóstica para recalibrar"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Refazer Diagnóstico
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            <div className="p-2 rounded-brand bg-brand-primary/10 text-brand-primary shrink-0">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
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

          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-start md:justify-end flex-wrap">
            {/* Custom Exam Simulation Selector (Year and Day 1/2) */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSimulationModalOpen(true)}
              aria-label="Simular Prova Oficial"
              title="Escolha o ano (2023, 2022...) e o caderno de aplicação (Dia 1 ou Dia 2)"
              className="border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10 text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap"
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
                aria-label="Tirar Dúvida (IA)"
                title="Tem dúvida nesta questão? Peça dicas e explicações passo a passo com Inteligência Artificial"
                className="border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10 text-xs sm:text-sm font-medium shrink-0 whitespace-nowrap"
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
              isPaused={
                isTutorOpen ||
                isAccommodationsOpen ||
                isSimulationModalOpen ||
                isTimeUpModalOpen ||
                isCurrentSubmitted
              }
              timeMode={timeMode}
              onOpenAccommodations={() => setIsAccommodationsOpen(true)}
              onTimeUp={() => setIsTimeUpModalOpen(true)}
              className="shrink-0"
            />

            {/* Reset / Restart Quiz */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRestart}
              aria-label="Reiniciar simulado"
              title="Reiniciar simulado"
              className="shrink-0 whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
              <span className="hidden sm:inline">Reiniciar</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content: If completed, render full Diagnostic Result & Understanding Level View; otherwise Question Palette & Active Question Card */}
      {isCompleted ? (
        <DiagnosticResultView
          report={activeReport}
          awardedXp={totalXp}
          flaggedCount={flaggedCount}
          onOpenAuthModal={onOpenAuthModal}
          onPracticeTopic={handlePracticeWeakTopic}
          onStartOfficialSimulation={() => setIsSimulationModalOpen(true)}
          onRetakeDiagnostic={handleRestart}
        />
      ) : (
        <>
          {/* Question Carousel / Palette */}
          {totalQuestions > 0 && (
            <QuestionCarousel
              totalQuestions={totalQuestions}
              currentIndex={currentQuestionIndex}
              onSelectIndex={goToQuestion}
              onNext={nextQuestion}
              onPrevious={previousQuestion}
              isAnswered={(idx) => Boolean(questions[idx] && attempts[questions[idx].id])}
              isCorrect={(idx) => (questions[idx] ? attempts[questions[idx].id]?.isCorrect : undefined)}
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
                key={currentQuestion.id}
                question={currentQuestion}
                selectedOption={currentSelectedOption}
                onSelectOption={handleSelectOption}
                onSubmitAnswer={handleConfirmAnswer}
                onOpenSocraticTutor={() => setIsTutorOpen(true)}
                isSubmitted={isCurrentSubmitted}
                correctOption={correctOption}
                isFlagged={Boolean(flaggedQuestions[currentQuestion.id])}
                onToggleFlag={() => toggleFlagQuestion(currentQuestion.id)}
                className="animate-card-enter"
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
                  attribution={currentAttempt.authorAttribution || currentResolution?.attribution || 'Equipe Pedagógica AprovaENEM / INEP'}
                  awardedXp={currentAttempt.awardedXp}
                  onNextQuestion={nextQuestion}
                  hasNextQuestion={currentQuestionIndex < totalQuestions - 1}
                  onFinishDiagnostic={() => {
                    const report = generateDiagnosticFromSession(questions, attempts, activeSession?.id);
                    completeSession(report);
                    setShowCelebration(true);
                  }}
                  onOpenSocraticTutor={() => setIsTutorOpen(true)}
                />
              )}
            </section>
          )}
        </>
      )}
    </div>

    {/* Modals and Drawers rendered outside space-y-6 to prevent margin-top injection */}
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
        title="Parabéns! Diagnóstico Concluído!"
        subtitle={`Você respondeu a todas as ${totalQuestions} questões e calibrou sua nota TRI!`}
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
    </>
  );
};
