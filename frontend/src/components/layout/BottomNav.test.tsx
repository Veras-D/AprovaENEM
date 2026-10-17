import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav } from './BottomNav';

describe('BottomNav component', () => {
  it('should render all 4 primary action items and the "Mais" drawer trigger', () => {
    render(<BottomNav onOpenDrawer={vi.fn()} activeSection="practice" />);

    expect(screen.getByRole('button', { name: /Início/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Praticar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ranking/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Diagnóstico/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abrir menu de opções/i })).toBeInTheDocument();
  });

  it('should mark the active section with aria-current="page"', () => {
    render(<BottomNav onOpenDrawer={vi.fn()} activeSection="leaderboard" />);

    const leaderboardBtn = screen.getByRole('button', { name: /Ranking/i });
    expect(leaderboardBtn).toHaveAttribute('aria-current', 'page');

    const practiceBtn = screen.getByRole('button', { name: /Praticar/i });
    expect(practiceBtn).not.toHaveAttribute('aria-current');
  });

  it('should trigger onNavigate when navigation button is clicked', () => {
    const handleNavigate = vi.fn();
    render(<BottomNav onOpenDrawer={vi.fn()} activeSection="practice" onNavigate={handleNavigate} />);

    const diagBtn = screen.getByRole('button', { name: /Diagnóstico/i });
    fireEvent.click(diagBtn);

    expect(handleNavigate).toHaveBeenCalledWith('diagnostics');
  });

  it('should trigger onOpenDrawer when "Mais" button is clicked', () => {
    const handleOpenDrawer = vi.fn();
    render(<BottomNav onOpenDrawer={handleOpenDrawer} />);

    const moreBtn = screen.getByRole('button', { name: /Abrir menu de opções/i });
    fireEvent.click(moreBtn);

    expect(handleOpenDrawer).toHaveBeenCalledTimes(1);
  });
});
