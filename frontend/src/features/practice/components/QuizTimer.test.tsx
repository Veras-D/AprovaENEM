import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuizTimer } from './QuizTimer';

describe('QuizTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render initial formatted time in minutes and seconds', () => {
    render(<QuizTimer initialSeconds={300} />);
    expect(screen.getByText('05:00')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', 'Tempo do simulado: 05:00');
  });

  it('should tick down every second in countdown mode and call onTick', () => {
    const handleTick = vi.fn();
    render(<QuizTimer initialSeconds={65} onTick={handleTick} />);

    expect(screen.getByText('01:05')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('01:03')).toBeInTheDocument();
    expect(handleTick).toHaveBeenCalledWith(64);
    expect(handleTick).toHaveBeenCalledWith(63);
  });

  it('should pause and resume when pause button is clicked', () => {
    render(<QuizTimer initialSeconds={60} />);

    const pauseBtn = screen.getByRole('button', { name: 'Pausar cronômetro' });
    fireEvent.click(pauseBtn);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Time must not change while paused
    expect(screen.getByText('01:00')).toBeInTheDocument();

    const resumeBtn = screen.getByRole('button', { name: 'Retomar cronômetro' });
    fireEvent.click(resumeBtn);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('00:58')).toBeInTheDocument();
  });

  it('should trigger onTimeUp when countdown reaches zero', () => {
    const handleTimeUp = vi.fn();
    render(<QuizTimer initialSeconds={2} onTimeUp={handleTimeUp} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(handleTimeUp).toHaveBeenCalledTimes(1);
  });

  it('should apply warning styles when remaining time is 60 seconds or less', () => {
    const { container } = render(<QuizTimer initialSeconds={45} />);
    const timerElem = container.querySelector('[role="timer"]');
    expect(timerElem?.className).toContain('animate-pulse');
  });

  it('should count up when isCountdown is false', () => {
    render(<QuizTimer isCountdown={false} />);
    expect(screen.getByText('00:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('00:03')).toBeInTheDocument();
  });
});
