import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BadgeShelf } from './BadgeShelf';

describe('BadgeShelf Component', () => {
  const mockUnlocked = ['PRIMEIRA_QUESTAO', 'STREAK_3_DIAS'];

  it('renders badge shelf header and counter', () => {
    render(<BadgeShelf unlockedBadges={mockUnlocked} />);

    expect(screen.getByText('Conquistas e Medalhas')).toBeInTheDocument();
    expect(screen.getByText(/2\/20/)).toBeInTheDocument();
  });

  it('filters badges based on active status filter tab', () => {
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

  it('filters badges by category pills and displays progressive indicators', () => {
    render(<BadgeShelf unlockedBadges={mockUnlocked} />);

    // Click "Áreas do ENEM"
    const subjectBtn = screen.getByRole('button', { name: /Áreas do ENEM/i });
    fireEvent.click(subjectBtn);

    expect(screen.getByText('Mestre da Matemática')).toBeInTheDocument();
    expect(screen.getByText('Cientista da Natureza')).toBeInTheDocument();
    expect(screen.getByText('Pensador Crítico')).toBeInTheDocument();
    expect(screen.getByText('Poliglota do ENEM')).toBeInTheDocument();
    expect(screen.queryByText('Primeiro Passo')).not.toBeInTheDocument();

    // Click "Jornada & Volume"
    const progressionBtn = screen.getByRole('button', { name: /Jornada & Volume/i });
    fireEvent.click(progressionBtn);

    expect(screen.getByText('Maratonista do ENEM')).toBeInTheDocument();
    expect(screen.getByText('Simulado Oficial ENEM')).toBeInTheDocument();
    expect(screen.getAllByText(/Progresso:/i)).toHaveLength(3);
    expect(screen.queryByText('Mestre da Matemática')).not.toBeInTheDocument();
  });

  it('never displays 100% progress on locked badges', () => {
    render(<BadgeShelf unlockedBadges={mockUnlocked} />);

    // Click "A Conquistar" to view only locked badges
    const lockedTab = screen.getByRole('tab', { name: /A Conquistar/i });
    fireEvent.click(lockedTab);

    // Verify that none of the locked badges show 100%
    const allProgressTexts = screen.getAllByText(/Progresso:/i);
    expect(allProgressTexts.length).toBeGreaterThan(0);

    // Check specific badges reported previously
    expect(screen.getByText('4/7 dias (57%)')).toBeInTheDocument();
    expect(screen.getByText('1/2 dias (50%)')).toBeInTheDocument();
    expect(screen.getByText('3/5 acertos seguidos (60%)')).toBeInTheDocument();
    expect(screen.getByText('0/1 recurso utilizado (0%)')).toBeInTheDocument();

    // Verify that (100%) does NOT exist anywhere in the locked tab
    expect(screen.queryByText(/\(100%\)/)).not.toBeInTheDocument();
  });
});

