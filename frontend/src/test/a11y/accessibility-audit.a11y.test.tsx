import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// UI Primitives
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { ThemeCustomizer } from '@/components/ui/ThemeCustomizer';

// Layout & Shell
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { BandwidthNotice } from '@/components/layout/BandwidthNotice';
import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';
import { SkipToContent } from '@/components/accessibility/SkipToContent';
import { ReadingRuler } from '@/components/accessibility/ReadingRuler';

// Practice Experience
import { QuestionCard } from '@/features/practice/components/QuestionCard';
import { OptionSelector } from '@/features/practice/components/OptionSelector';
import { QuestionAudioReader } from '@/features/practice/components/QuestionAudioReader';
import { QuizTimer } from '@/features/practice/components/QuizTimer';
import { QuestionCarousel } from '@/features/practice/components/QuestionCarousel';
import { ResolutionAccordion } from '@/features/practice/components/ResolutionAccordion';
import { DistractorBreakdown } from '@/features/practice/components/DistractorBreakdown';
import { InstantFeedback } from '@/features/practice/components/InstantFeedback';

// Socratic Tutor
import { SocraticTutorDrawer } from '@/features/practice/components/SocraticTutorDrawer';
import { SocraticQuotaWidget } from '@/features/practice/components/SocraticQuotaWidget';
import { SocraticMessageBubble } from '@/features/practice/components/SocraticMessageBubble';

// Modals
import { TimeAccommodationModal } from '@/features/practice/components/TimeAccommodationModal';
import { TimeUpModal } from '@/features/practice/components/TimeUpModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { TermsAndPrivacyModal, AccountErasureModal } from '@/components/legal';
import { CelebrationOverlay } from '@/features/gamification/components/CelebrationOverlay';

// Gamification & Diagnostic
import { LevelProgressBar } from '@/features/gamification/components/LevelProgressBar';
import { DailyStreakCounter } from '@/features/gamification/components/DailyStreakCounter';
import { BadgeShelf } from '@/features/gamification/components/BadgeShelf';
import { WeeklyLeagueLeaderboard } from '@/features/gamification/components/WeeklyLeagueLeaderboard';
import { StudentDiagnosticRadar } from '@/features/diagnostic/components/StudentDiagnosticRadar';
import { InstitutionalCohortView } from '@/features/diagnostic/components/InstitutionalCohortView';

// Mocks
import { MOCK_QUESTIONS, MOCK_RESOLUTIONS } from '@/api/mocks/mock-data';

describe('Axe-Core WCAG 2.1 Level AA Accessibility Audit Suite', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    // Mock speech synthesis for jsdom
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn(() => [{ lang: 'pt-BR', name: 'Brazilian Portuguese' }]),
        speaking: false,
        paused: false,
      },
    });

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      writable: true,
      value: vi.fn().mockImplementation((text?: string) => ({
        text: text || '',
        lang: 'pt-BR',
        rate: 1.0,
      })),
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <main id="main-content">{ui}</main>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('UI Primitives Accessibility', () => {
    it('has zero accessibility violations on Buttons across variants', async () => {
      const { container } = render(
        <div>
          <Button variant="primary">Continuar Prática</Button>
          <Button variant="secondary">Ver Detalhes</Button>
          <Button variant="outline">Cancelar</Button>
          <Button variant="ghost">Ignorar</Button>
          <Button disabled>Ação Desabilitada</Button>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on Badges across variants', async () => {
      const { container } = render(
        <div>
          <Badge variant="primary">Matemática</Badge>
          <Badge variant="secondary">Fácil</Badge>
          <Badge variant="warning">Atenção</Badge>
          <Badge variant="outline">Oficial</Badge>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on Cards and ThemeCustomizer', async () => {
      const { container } = render(
        <div>
          <Card>
            <CardHeader>
              <h2>Cabeçalho do Card</h2>
            </CardHeader>
            <CardBody>
              <p>Conteúdo textual com alto contraste.</p>
            </CardBody>
            <CardFooter>
              <Button size="sm">Ação do Card</Button>
            </CardFooter>
          </Card>
          <ThemeCustomizer />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Layout & Accessibility Shell Navigation', () => {
    it('has zero accessibility violations on Header and BottomNav', async () => {
      const { container } = renderWithProviders(
        <div>
          <Header
            activeSection="practice"
            onNavigate={() => {}}
            onOpenDrawer={() => {}}
            onOpenAuthModal={() => {}}
          />
          <BottomNav
            activeSection="practice"
            onNavigate={() => {}}
            onOpenDrawer={() => {}}
          />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on MobileDrawer in open state', async () => {
      const { container } = renderWithProviders(
        <MobileDrawer
          isOpen={true}
          onClose={() => {}}
          activeSection="practice"
          onNavigate={() => {}}
          onOpenAuthModal={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on AccessibilityToolbar, SkipToContent and ReadingRuler', async () => {
      const { container } = render(
        <div>
          <SkipToContent />
          <AccessibilityToolbar />
          <ReadingRuler />
          <BandwidthNotice forcedStatus={true} />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Practice Experience & Question Components', () => {
    const mockQ = MOCK_QUESTIONS[0];
    if (!mockQ) throw new Error('mockQ not found');

    it('has zero accessibility violations on QuestionCard with LaTeX and radiogroup', async () => {
      const { container } = render(
        <QuestionCard
          question={mockQ}
          selectedOption="B"
          onSelectOption={() => {}}
          onSubmitAnswer={() => {}}
          isSubmitted={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on OptionSelector standalone fieldset', async () => {
      const { container } = render(
        <OptionSelector
          options={mockQ.options.map((o) => ({ letter: o.optionLetter, text: o.text }))}
          selectedOption="B"
          onSelectOption={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on QuizTimer across standard, extended and untimed modes', async () => {
      const { container } = render(
        <div>
          <QuizTimer
            timeMode="STANDARD"
            initialSeconds={180}
            onOpenAccommodations={() => {}}
          />
          <QuizTimer
            timeMode="EXTENDED_INEP"
            initialSeconds={300}
            onOpenAccommodations={() => {}}
          />
          <QuizTimer
            timeMode="UNTIMED"
            initialSeconds={0}
            onOpenAccommodations={() => {}}
          />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on QuestionCarousel and QuestionAudioReader', async () => {
      const { container } = render(
        <div>
          <QuestionAudioReader question={mockQ} />
          <QuestionCarousel
            totalQuestions={5}
            currentIndex={0}
            onSelectIndex={() => {}}
            isAnswered={(i) => i === 0}
            isFlagged={() => false}
            onNext={() => {}}
            onPrevious={() => {}}
          />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on ResolutionAccordion and DistractorBreakdown', async () => {
      const resolution = MOCK_RESOLUTIONS[mockQ.id];
      if (!resolution) throw new Error('Resolution fixture not found');

      const fallbackDistractors = resolution.distractorAnalysis ?? {
        A: 'Alternativa plausível mas incorreta.',
        B: 'Gabarito correto fundamentado.',
        C: 'Erro conceitual comum.',
        D: 'Premissa equivocada.',
        E: 'Leitura incorreta dos dados.',
      };

      const { container } = render(
        <div>
          <ResolutionAccordion
            baseExplanation={resolution.baseExplanation}
            correctOption="B"
            selectedOption="B"
            distractorAnalysis={fallbackDistractors}
            attribution={resolution.attribution}
            initialExpanded={true}
          />
          <DistractorBreakdown
            distractorAnalysis={fallbackDistractors}
            correctOption="B"
            selectedOption="B"
          />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on InstantFeedback composed card', async () => {
      const resolution = MOCK_RESOLUTIONS[mockQ.id];
      if (!resolution) throw new Error('Resolution fixture not found');

      const { container } = render(
        <InstantFeedback
          isCorrect={true}
          selectedOption="B"
          correctOption="B"
          baseExplanation={resolution.baseExplanation}
          distractorAnalysis={resolution.distractorAnalysis}
          attribution={resolution.attribution}
          awardedXp={15}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Socratic AI Tutor Drawer & Bubbles', () => {
    const mockQ = MOCK_QUESTIONS[0];
    if (!mockQ) throw new Error('mockQ not found');

    it('has zero accessibility violations on SocraticQuotaWidget and SocraticMessageBubble', async () => {
      const { container } = render(
        <div>
          <SocraticQuotaWidget
            remainingTurns={4}
            maxTurns={6}
            dailyQuestionsUnlocked={1}
            dailyQuestionsLimit={1}
            isPro={false}
          />
          <SocraticMessageBubble
            message={{
              id: 'msg-usr-1',
              role: 'user',
              content: 'Como calculo o consumo em quilowatts-hora?',
              timestamp: '2026-10-15T14:32:00Z',
            }}
          />
          <SocraticMessageBubble
            message={{
              id: 'msg-ast-1',
              role: 'assistant',
              content: 'Lembre-se da relação de potência: $P = \\frac{E}{\\Delta t}$.',
              timestamp: '2026-10-15T14:33:00Z',
            }}
          />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on SocraticTutorDrawer in open state', async () => {
      const { container } = renderWithProviders(
        <SocraticTutorDrawer
          isOpen={true}
          onClose={() => {}}
          question={mockQ}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Modal Dialogs & Legal Overlays', () => {
    it('has zero accessibility violations on TimeAccommodationModal in open state', async () => {
      const { container } = render(
        <TimeAccommodationModal
          isOpen={true}
          onClose={() => {}}
          currentMode="STANDARD"
          onSelectMode={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on TimeUpModal in open state', async () => {
      const { container } = render(
        <TimeUpModal
          isOpen={true}
          questionNumber={1}
          hasNextQuestion={true}
          onContinue={() => {}}
          onNextQuestion={() => {}}
          onSwitchUntimed={() => {}}
          onClose={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on RegisterModal in open state', async () => {
      const { container } = renderWithProviders(
        <RegisterModal
          isOpen={true}
          onClose={() => {}}
          initialMode="register"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on TermsAndPrivacyModal in open state', async () => {
      const { container } = renderWithProviders(
        <TermsAndPrivacyModal isOpen={true} onClose={() => {}} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on AccountErasureModal in open state', async () => {
      const { container } = renderWithProviders(
        <AccountErasureModal isOpen={true} onClose={() => {}} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on CelebrationOverlay in open state', async () => {
      const { container } = render(
        <CelebrationOverlay
          isOpen={true}
          onClose={() => {}}
          awardedXp={100}
          level={3}
          levelTitle="Cientista Dedicado"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Gamification & Diagnostic Visualizations', () => {
    it('has zero accessibility violations on LevelProgressBar, DailyStreakCounter, and BadgeShelf', async () => {
      const { container } = render(
        <div>
          <LevelProgressBar currentXp={450} currentLevel={3} />
          <DailyStreakCounter
            currentStreakDays={5}
            longestStreakDays={12}
            streakFreezeAvailable={true}
            onActivateFreeze={() => {}}
          />
          <BadgeShelf
            unlockedBadges={['first_quiz', 'streak_3']}
          />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on WeeklyLeagueLeaderboard', async () => {
      const { container } = renderWithProviders(
        <WeeklyLeagueLeaderboard
          currentUserId="user-lucas-123"
          initialLeague="BRONZE"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has zero accessibility violations on StudentDiagnosticRadar and InstitutionalCohortView', async () => {
      const { container } = renderWithProviders(
        <div>
          <StudentDiagnosticRadar />
          <InstitutionalCohortView cohortId="cohort-turma-3a-2026" />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
