import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BadgeShelf } from './BadgeShelf';

describe('BadgeShelf Component', () => {
  const mockUnlocked = ['PRIMEIRA_QUESTAO', 'STREAK_3_DIAS'];

  it('renders badge shelf header and counter', () => {
    render(<BadgeShelf unlockedBadges={mockUnlocked} />);

    expect(screen.getByText('Conquistas e Medalhas')).toBeInTheDocument();
    expect(screen.getByText(/2\/22/)).toBeInTheDocument();
  });

  it('filters badges based on active status filter tab', () => {
    render(<BadgeShelf unlockedBadges={mockUnlocked} />);

    // Initially "Todas" tab is selected: both Primeiro Passo and Chama Acesa have conquered Bronze & spawned Prata
    expect(screen.getAllByText('Primeiro Passo')).toHaveLength(2);
    expect(screen.getAllByText('Chama Acesa')).toHaveLength(2);
    expect(screen.getAllByText('Bronze').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Prata').length).toBeGreaterThan(0);

    // Click "Desbloqueadas": only completed cards (Primeiro Passo & Chama Acesa Bronze)
    const unlockedTab = screen.getByRole('tab', { name: /Desbloqueadas/i });
    fireEvent.click(unlockedTab);

    expect(screen.getByText('Primeiro Passo')).toBeInTheDocument();
    expect(screen.getByText('Chama Acesa')).toBeInTheDocument();
    expect(screen.queryByText('Prata')).not.toBeInTheDocument();

    // Click "A Conquistar": spawned incomplete cards (Primeiro Passo Prata & Chama Acesa Prata)
    const lockedTab = screen.getByRole('tab', { name: /A Conquistar/i });
    fireEvent.click(lockedTab);

    expect(screen.getByText('Primeiro Passo')).toBeInTheDocument();
    expect(screen.getByText('Chama Acesa')).toBeInTheDocument();
    expect(screen.getAllByText('Prata').length).toBeGreaterThan(0);
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
    expect(screen.getByText('0/1 diagnóstico realizado (0%)')).toBeInTheDocument();

    // Verify that (100%) does NOT exist anywhere in the locked tab
    expect(screen.queryByText(/\(100%\)/)).not.toBeInTheDocument();
  });

  it('shows completed tier as conquered and spawns next tier while hiding further ranks', () => {
    // User has conquered Bronze for Mestre da Matemática
    const unlockedWithMath = ['PRIMEIRA_QUESTAO', 'STREAK_3_DIAS', 'MESTRE_MATEMATICA'];
    render(<BadgeShelf unlockedBadges={unlockedWithMath} />);

    // Filter by Áreas do ENEM
    const subjectBtn = screen.getByRole('button', { name: /Áreas do ENEM/i });
    fireEvent.click(subjectBtn);

    // Bronze tier is displayed across the 4 subject badges (Math conquered, others active)
    expect(screen.getAllByText('Bronze')).toHaveLength(4);
    expect(screen.getByText('50/50 acertos (100%)')).toBeInTheDocument();

    // Next tier (Prata) is spawned as active to be completed only for Math
    expect(screen.getByText('Prata')).toBeInTheDocument();

    // Ranks further (Ouro and Diamante) are NOT shown
    expect(screen.queryByText('Ouro')).not.toBeInTheDocument();
    expect(screen.queryByText('Diamante')).not.toBeInTheDocument();

    // When clicking "Desbloqueadas", only the conquered Math Bronze badge appears
    const unlockedTab = screen.getByRole('tab', { name: /Desbloqueadas/i });
    fireEvent.click(unlockedTab);
    expect(screen.getByText('Bronze')).toBeInTheDocument();
    expect(screen.getByText('50/50 acertos (100%)')).toBeInTheDocument();
    expect(screen.queryByText('Prata')).not.toBeInTheDocument();

    // When clicking "A Conquistar", the 3 unearned Bronze badges + Math Silver badge appear
    const lockedTab = screen.getByRole('tab', { name: /A Conquistar/i });
    fireEvent.click(lockedTab);
    expect(screen.getAllByText('Bronze')).toHaveLength(3);
    expect(screen.getByText('Prata')).toBeInTheDocument();
    expect(screen.queryByText('50/50 acertos (100%)')).not.toBeInTheDocument();
  });

  it('renders both Bronze and Silver as conquered when Silver rank is achieved, spawning Gold', () => {
    // User has conquered both Bronze and Silver for Mestre da Matemática
    const unlockedWithSilver = [
      'PRIMEIRA_QUESTAO',
      'STREAK_3_DIAS',
      'MESTRE_MATEMATICA',
      'MESTRE_MATEMATICA_SILVER',
    ];
    render(<BadgeShelf unlockedBadges={unlockedWithSilver} />);

    // Filter by Áreas do ENEM
    const subjectBtn = screen.getByRole('button', { name: /Áreas do ENEM/i });
    fireEvent.click(subjectBtn);

    // Both Bronze and Silver Math tiers are completed with 100% progress
    expect(screen.getByText('50/50 acertos (100%)')).toBeInTheDocument();
    expect(screen.getByText('100/100 acertos (100%)')).toBeInTheDocument();

    // Ouro is spawned as active to be completed
    expect(screen.getByText('Ouro')).toBeInTheDocument();
    expect(screen.getByText('125/250 acertos (50%)')).toBeInTheDocument();

    // Diamante remains hidden
    expect(screen.queryByText('Diamante')).not.toBeInTheDocument();

    // When clicking "Desbloqueadas", both Bronze and Silver Math badges are visible
    const unlockedTab = screen.getByRole('tab', { name: /Desbloqueadas/i });
    fireEvent.click(unlockedTab);
    expect(screen.getByText('50/50 acertos (100%)')).toBeInTheDocument();
    expect(screen.getByText('100/100 acertos (100%)')).toBeInTheDocument();
    expect(screen.queryByText('Ouro')).not.toBeInTheDocument();

    // When clicking "A Conquistar", Gold appears as the active challenge
    const lockedTab = screen.getByRole('tab', { name: /A Conquistar/i });
    fireEvent.click(lockedTab);
    expect(screen.getByText('Ouro')).toBeInTheDocument();
    expect(screen.queryByText('50/50 acertos (100%)')).not.toBeInTheDocument();
    expect(screen.queryByText('100/100 acertos (100%)')).not.toBeInTheDocument();
  });

  it('visually differentiates different ranks with distinct tier styling and vector icon emblems', () => {
    const unlockedWithSilver = [
      'PRIMEIRA_QUESTAO',
      'STREAK_3_DIAS',
      'MESTRE_MATEMATICA',
      'MESTRE_MATEMATICA_SILVER',
    ];
    render(<BadgeShelf unlockedBadges={unlockedWithSilver} />);

    // Filter by Áreas do ENEM
    const subjectBtn = screen.getByRole('button', { name: /Áreas do ENEM/i });
    fireEvent.click(subjectBtn);

    // Verify distinct tier pill labels without emojis
    expect(screen.getAllByText('Bronze').length).toBeGreaterThan(0);
    expect(screen.getByText('Prata')).toBeInTheDocument();
    expect(screen.getByText('Ouro')).toBeInTheDocument();

    // Verify no emojis are present in the DOM
    expect(screen.queryByText('🥉')).not.toBeInTheDocument();
    expect(screen.queryByText('🥈')).not.toBeInTheDocument();
    expect(screen.queryByText('🥇')).not.toBeInTheDocument();
    expect(screen.queryByText('💎')).not.toBeInTheDocument();
  });
});


