import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BadgeShelf } from './BadgeShelf';

describe('BadgeShelf Component', () => {
  const mockUnlocked = ['PRIMEIRA_QUESTAO', 'STREAK_3_DIAS'];

  it('renders badge shelf header and counter', () => {
    render(<BadgeShelf unlockedBadges={mockUnlocked} />);

    expect(screen.getByText('Conquistas e Medalhas')).toBeInTheDocument();
    expect(screen.getByText(/2\/9/)).toBeInTheDocument();
  });

  it('filters badges based on active filter tab', () => {
    render(<BadgeShelf unlockedBadges={mockUnlocked} />);

    // Initially "Todas" tab is selected
    expect(screen.getByText('Primeiro Passo')).toBeInTheDocument();
    expect(screen.getByText('Chama Acesa')).toBeInTheDocument();
    expect(screen.getByText('Semana de Ouro')).toBeInTheDocument(); // locked

    // Click "Desbloqueadas"
    const unlockedTab = screen.getByRole('tab', { name: /Desbloqueadas/i });
    fireEvent.click(unlockedTab);

    expect(screen.getByText('Primeiro Passo')).toBeInTheDocument();
    expect(screen.getByText('Chama Acesa')).toBeInTheDocument();
    expect(screen.queryByText('Semana de Ouro')).not.toBeInTheDocument();

    // Click "A Conquistar"
    const lockedTab = screen.getByRole('tab', { name: /A Conquistar/i });
    fireEvent.click(lockedTab);

    expect(screen.queryByText('Primeiro Passo')).not.toBeInTheDocument();
    expect(screen.getByText('Semana de Ouro')).toBeInTheDocument();
  });
});
