import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuestionReader } from './useQuestionReader';
import type { UnifiedQuestion } from './components/QuestionCard';

describe('useQuestionReader', () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;
  let mockPause: ReturnType<typeof vi.fn>;
  let mockResume: ReturnType<typeof vi.fn>;
  let mockGetVoices: ReturnType<typeof vi.fn>;

  const mockQuestion: UnifiedQuestion = {
    id: 'q-test-101',
    externalId: '99',
    examYear: 2024,
    knowledgeArea: 'MT',
    discipline: 'Matemática',
    difficulty: 'EASY',
    statement: 'Qual o valor de 1 + 1?',
    options: [
      { letter: 'A', text: '2' },
      { letter: 'B', text: '3' },
    ],
  };

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockPause = vi.fn();
    mockResume = vi.fn();
    mockGetVoices = vi.fn().mockReturnValue([
      { name: 'Luciana', lang: 'pt-BR', default: true },
      { name: 'Alex', lang: 'en-US', default: false },
    ]);

    // Mock window.speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        pause: mockPause,
        resume: mockResume,
        getVoices: mockGetVoices,
      },
    });

    // Mock SpeechSynthesisUtterance
    class MockUtterance {
      public text: string;
      public lang = '';
      public rate = 1.0;
      public voice: unknown = null;
      public onstart: (() => void) | null = null;
      public onend: (() => void) | null = null;
      public onerror: (() => void) | null = null;
      public onpause: (() => void) | null = null;
      public onresume: (() => void) | null = null;

      constructor(text: string) {
        this.text = text;
      }
    }

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      writable: true,
      configurable: true,
      value: MockUtterance,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('reports isSupported as true when speechSynthesis is available', () => {
    const { result } = renderHook(() => useQuestionReader({ question: mockQuestion }));
    expect(result.current.isSupported).toBe(true);
    expect(result.current.speechText).toContain('Questão número 99');
    expect(result.current.speechText).toContain('Qual o valor de 1 + 1?');
  });

  it('speaks the prepared question text and updates isSpeaking state on utterance start', () => {
    const { result } = renderHook(() => useQuestionReader({ question: mockQuestion }));

    act(() => {
      result.current.speak();
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledTimes(1);

    const utterance = mockSpeak.mock.calls[0]![0];
    expect(utterance.text).toContain('Qual o valor de 1 + 1?');
    expect(utterance.lang).toBe('pt-BR');
    expect(utterance.voice).toEqual({ name: 'Luciana', lang: 'pt-BR', default: true });

    // Trigger onstart
    act(() => {
      utterance.onstart?.();
    });
    expect(result.current.isSpeaking).toBe(true);
    expect(result.current.isPaused).toBe(false);

    // Trigger onend
    act(() => {
      utterance.onend?.();
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it('pauses and resumes speech correctly', () => {
    const { result } = renderHook(() => useQuestionReader({ question: mockQuestion }));

    act(() => {
      result.current.speak();
    });
    const utterance = mockSpeak.mock.calls[0]![0];
    act(() => {
      utterance.onstart?.();
    });

    act(() => {
      result.current.pause();
    });
    expect(mockPause).toHaveBeenCalledTimes(1);
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.resume();
    });
    expect(mockResume).toHaveBeenCalledTimes(1);
    expect(result.current.isPaused).toBe(false);
  });

  it('stops and cancels current speech', () => {
    const { result } = renderHook(() => useQuestionReader({ question: mockQuestion }));

    act(() => {
      result.current.speak();
    });
    const utterance = mockSpeak.mock.calls[0]![0];
    act(() => {
      utterance.onstart?.();
    });

    act(() => {
      result.current.stop();
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it('toggles playback states through togglePlay', () => {
    const { result } = renderHook(() => useQuestionReader({ question: mockQuestion }));

    // 1. Idle -> speak
    act(() => {
      result.current.togglePlay();
    });
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeak.mock.calls[0]![0];
    act(() => {
      utterance.onstart?.();
    });

    // 2. Speaking -> pause
    act(() => {
      result.current.togglePlay();
    });
    expect(mockPause).toHaveBeenCalledTimes(1);
    expect(result.current.isPaused).toBe(true);

    // 3. Paused -> resume
    act(() => {
      result.current.togglePlay();
    });
    expect(mockResume).toHaveBeenCalledTimes(1);
    expect(result.current.isPaused).toBe(false);
  });

  it('cycles speech rate between 1.0x, 1.25x, and 0.85x', () => {
    const { result } = renderHook(() => useQuestionReader({ question: mockQuestion }));
    expect(result.current.rate).toBe(1.0);

    act(() => {
      result.current.cycleRate();
    });
    expect(result.current.rate).toBe(1.25);

    act(() => {
      result.current.cycleRate();
    });
    expect(result.current.rate).toBe(0.85);

    act(() => {
      result.current.cycleRate();
    });
    expect(result.current.rate).toBe(1.0);
  });

  it('automatically cancels speech when question changes', () => {
    let question = mockQuestion;
    const { rerender } = renderHook(() => useQuestionReader({ question }));

    expect(mockCancel).toHaveBeenCalled();
    mockCancel.mockClear();

    question = { ...mockQuestion, id: 'q-test-102' };
    rerender();

    expect(mockCancel).toHaveBeenCalled();
  });
});
