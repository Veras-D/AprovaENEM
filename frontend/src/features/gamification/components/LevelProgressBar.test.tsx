import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LevelProgressBar } from './LevelProgressBar';

describe('LevelProgressBar Component', () => {
  it('renders level badge, title, and formatted XP', () => {
    render(<LevelProgressBar currentXp={550} currentLevel={3} />);

    expect(screen.getByText('Nível 3')).toBeInTheDocument();
    expect(screen.getByText('Calouro Iniciante')).toBeInTheDocument();
    expect(screen.getByText('550 XP')).toBeInTheDocument();
    expect(screen.getByText(/150 \/ 200 XP no nível/i)).toBeInTheDocument();
    expect(screen.getByText(/Faltam/i)).toBeInTheDocument();
    expect(screen.getByText(/para o Nível 4/i)).toBeInTheDocument();
  });

  it('renders progressbar with correct accessibility attributes', () => {
    render(<LevelProgressBar currentXp={500} currentLevel={3} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('displays correct title for advanced levels', () => {
    render(<LevelProgressBar currentXp={4200} currentLevel={21} />);

    expect(screen.getByText('Nível 21')).toBeInTheDocument();
    expect(screen.getByText('Nota 1000')).toBeInTheDocument();
  });
});
