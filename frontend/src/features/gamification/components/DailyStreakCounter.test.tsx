import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyStreakCounter } from './DailyStreakCounter';

describe('DailyStreakCounter Component', () => {
  it('renders streak days, badge, and longest record', () => {
    render(
      <DailyStreakCounter
        currentStreakDays={5}
        longestStreakDays={14}
        streakFreezeAvailable={true}
      />
    );

    expect(screen.getByText('5 Dias Seguidos')).toBeInTheDocument();
    expect(screen.getByText(/Em Chamas!/i)).toBeInTheDocument();
    expect(screen.getByText(/Recorde:/i)).toBeInTheDocument();
    expect(screen.getByText(/14 dias/i)).toBeInTheDocument();
  });

  it('renders available freeze shield status and calls callback if provided', () => {
    const handleFreeze = vi.fn();
    render(
      <DailyStreakCounter
        currentStreakDays={3}
        longestStreakDays={10}
        streakFreezeAvailable={true}
        onActivateFreeze={handleFreeze}
      />
    );

    expect(screen.getByText(/Escudo de Congelamento Disponível \(1\/1\)/i)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Ver detalhes da proteção/i });
    fireEvent.click(btn);
    expect(handleFreeze).toHaveBeenCalledTimes(1);
  });

  it('renders used freeze shield state when freeze is unavailable', () => {
    render(
      <DailyStreakCounter
        currentStreakDays={0}
        longestStreakDays={5}
        streakFreezeAvailable={false}
      />
    );

    expect(screen.getByText('0 Dias Seguidos')).toBeInTheDocument();
    expect(screen.queryByText(/Em Chamas!/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Escudo Utilizado este Mês \(0\/1\)/i)).toBeInTheDocument();
  });
});
