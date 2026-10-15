import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuestionAudioReader } from './QuestionAudioReader';
import type { UnifiedQuestion } from './QuestionCard';

describe('QuestionAudioReader', () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;
  let mockPause: ReturnType<typeof vi.fn>;
  let mockResume: ReturnType<typeof vi.fn>;

  const mockQuestion: UnifiedQuestion = {
    id: 'q-audio-1',
    externalId: '12',
    examYear: 2024,
    knowledgeArea: 'CH',
    discipline: 'História',
    difficulty: 'MEDIUM',
    statement: 'Em que ano ocorreu a Proclamação da República?',
    options: [
      { letter: 'A', text: '1889' },
      { letter: 'B', text: '1822' },
    ],
  };

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockPause = vi.fn();
    mockResume = vi.fn();

    class MockUtterance {
      public text: string;
      public lang = '';
      public rate = 1.0;
      public onstart: (() => void) | null = null;
      public onend: (() => void) | null = null;
      public onerror: (() => void) | null = null;
      public onpause: (() => void) | null = null;
      public onresume: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        pause: mockPause,
        resume: mockResume,
        getVoices: vi.fn().mockReturnValue([]),
      },
    });

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      writable: true,
      configurable: true,
      value: MockUtterance,
    });
  });

  it('renders Play button with proper accessible label and triggers speech on click', () => {
    render(<QuestionAudioReader question={mockQuestion} />);

    const playButton = screen.getByRole('button', { name: /ouvir questão em voz alta/i });
    expect(playButton).toBeInTheDocument();

    fireEvent.click(playButton);

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeak.mock.calls[0]![0];
    expect(utterance.text).toContain('Proclamação da República');
  });

  it('renders stop and pause controls when speaking is active', () => {
    render(<QuestionAudioReader question={mockQuestion} />);

    const playButton = screen.getByRole('button', { name: /ouvir questão em voz alta/i });
    fireEvent.click(playButton);

    const utterance = mockSpeak.mock.calls[0]![0];
    act(() => {
      utterance.onstart?.();
    });

    expect(screen.getByRole('button', { name: /pausar leitura em voz alta/i })).toBeInTheDocument();
    const stopButton = screen.getByRole('button', { name: /parar leitura em voz alta/i });
    expect(stopButton).toBeInTheDocument();

    fireEvent.click(stopButton);
    expect(mockCancel).toHaveBeenCalled();
  });

  it('cycles speech playback speed rate', () => {
    render(<QuestionAudioReader question={mockQuestion} />);

    const speedButton = screen.getByRole('button', { name: /velocidade de leitura atual: 1x/i });
    expect(speedButton).toBeInTheDocument();

    fireEvent.click(speedButton);
    expect(screen.getByText('1.25x')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /velocidade de leitura atual: 1.25x/i }));
    expect(screen.getByText('0.85x')).toBeInTheDocument();
  });

  it('renders fallback notice if window.speechSynthesis is not supported', () => {
    // Delete window.speechSynthesis
    // @ts-expect-error simulating unsupported browser
    delete window.speechSynthesis;

    render(<QuestionAudioReader question={mockQuestion} />);
    expect(screen.getByText('Voz indisponível')).toBeInTheDocument();
  });
});
