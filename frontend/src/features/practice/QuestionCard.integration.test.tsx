import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from './components/QuestionCard';
import { InstantFeedback } from './components/InstantFeedback';
import { MOCK_QUESTIONS } from '@/api/mocks/mock-data';
import type { QuestionOptionLetter } from '@/types';

describe('QuestionCard & Practice Flow Integration Tests', () => {
  const mockQuestion = MOCK_QUESTIONS[0];
  if (!mockQuestion) {
    throw new Error('MOCK_QUESTIONS[0] is undefined');
  }

  beforeEach(() => {
    vi.clearAllMocks();

    // Stub speech synthesis in jsdom
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
        pitch: 1.0,
        volume: 1.0,
        onstart: null,
        onend: null,
        onerror: null,
      })),
    });
  });

  const InteractivePracticeHarness: React.FC = () => {
    const [selected, setSelected] = useState<QuestionOptionLetter | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [isFlagged, setIsFlagged] = useState<boolean>(false);
    const [tutorOpenCount, setTutorOpenCount] = useState<number>(0);

    const handleSubmit = () => {
      if (selected) {
        setIsSubmitted(true);
      }
    };

    return (
      <div>
        <QuestionCard
          question={mockQuestion}
          selectedOption={selected}
          onSelectOption={setSelected}
          onSubmitAnswer={handleSubmit}
          onOpenSocraticTutor={() => setTutorOpenCount((c) => c + 1)}
          isSubmitted={isSubmitted}
          correctOption="B"
          isSubmitting={false}
          isFlagged={isFlagged}
          onToggleFlag={() => setIsFlagged(!isFlagged)}
        />

        {isSubmitted && selected && (
          <InstantFeedback
            isCorrect={selected === 'B'}
            selectedOption={selected}
            correctOption="B"
            baseExplanation="A energia consumida é $E = P \cdot \Delta t$."
            distractorAnalysis={{
              A: 'Errou o cálculo decimal',
              B: 'Correta: $1{,}50\text{ kWh}$',
              C: 'Inverteu unidades',
              D: 'Multiplicou por 100',
              E: 'Não converteu watts',
            }}
            attribution="INEP Microdados • Gabarito Oficial"
            awardedXp={selected === 'B' ? 15 : 5}
          />
        )}

        <div data-testid="tutor-call-count">{tutorOpenCount}</div>
      </div>
    );
  };

  it('renders question metadata, statement, and all alternatives A to E', () => {
    render(<InteractivePracticeHarness />);

    expect(screen.getByText(/Matemática e suas Tecnologias/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ENEM 2023/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Média/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Um artista plástico esculpe uma escultura a partir de um bloco de madeira/i)).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: /^A / })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^B / })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^C / })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^D / })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^E / })).toBeInTheDocument();
  });

  it('allows alternative selection via keyboard hotkey B and displays active status', () => {
    render(<InteractivePracticeHarness />);

    // Press hotkey 'B'
    fireEvent.keyDown(window, { key: 'B' });

    const radioB = screen.getByRole('radio', { name: /^B / });
    expect(radioB).toHaveAttribute('aria-checked', 'true');
  });

  it('confirms answer with Enter key, revealing instant feedback and XP award badge', () => {
    render(<InteractivePracticeHarness />);

    // Select alternative B
    fireEvent.keyDown(window, { key: 'B' });

    // Submit with Enter
    fireEvent.keyDown(window, { key: 'Enter' });

    // Feedback appears
    expect(screen.getByRole('heading', { name: /^Resposta Correta!$/i })).toBeInTheDocument();
    expect(screen.getByText(/\+15 XP/i)).toBeInTheDocument();
    expect(screen.getAllByText(/INEP Microdados • Gabarito Oficial/i)[0]).toBeInTheDocument();
  });

  it('awards +5 XP effort badge when submitting an incorrect answer', () => {
    render(<InteractivePracticeHarness />);

    // Select alternative A (incorrect)
    fireEvent.keyDown(window, { key: 'A' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(screen.getByRole('heading', { name: /^Resposta Incorreta!$/i })).toBeInTheDocument();
    expect(screen.getByText(/\+5 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/gabarito oficial é a letra/i)).toBeInTheDocument();
  });

  it('toggles question review flag with accessible aria-pressed state', () => {
    render(<InteractivePracticeHarness />);

    const flagButton = screen.getByRole('button', { name: /Marcar questão para revisar/i });
    expect(flagButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(flagButton);
    expect(flagButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('triggers Socratic Tutor callback when pressing Space hotkey', () => {
    render(<InteractivePracticeHarness />);

    // Press Space hotkey
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });

    expect(screen.getByTestId('tutor-call-count')).toHaveTextContent('1');
  });

  it('interacts with embedded QuestionAudioReader TTS controls', () => {
    render(<InteractivePracticeHarness />);

    const playButton = screen.getByRole('button', { name: /Ouvir questão em voz alta/i });
    expect(playButton).toBeInTheDocument();

    fireEvent.click(playButton);
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });
});
