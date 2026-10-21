import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeAccommodationModal } from './TimeAccommodationModal';

describe('TimeAccommodationModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TimeAccommodationModal
        isOpen={false}
        currentMode="STANDARD"
        onSelectMode={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all 3 accommodation modes when isOpen is true', () => {
    render(
      <TimeAccommodationModal
        isOpen={true}
        currentMode="STANDARD"
        onSelectMode={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Acomodações de Tempo de Prova INEP')).toBeInTheDocument();
    expect(screen.getByText('Tempo Padrão ENEM')).toBeInTheDocument();
    expect(screen.getByText('Atendimento Especializado INEP (+60 min)')).toBeInTheDocument();
    expect(screen.getByText('Modo Sem Limite de Tempo (Livre de Ansiedade)')).toBeInTheDocument();
    expect(screen.getByText('Edital INEP')).toBeInTheDocument();
    expect(screen.getByText('Acessibilidade')).toBeInTheDocument();
  });

  it('calls onSelectMode and onClose when an accommodation mode is clicked', () => {
    const onSelectMode = vi.fn();
    const onClose = vi.fn();

    render(
      <TimeAccommodationModal
        isOpen={true}
        currentMode="STANDARD"
        onSelectMode={onSelectMode}
        onClose={onClose}
      />
    );

    const inepButton = screen.getByRole('button', {
      name: /atendimento especializado inep/i,
    });
    fireEvent.click(inepButton);

    expect(onSelectMode).toHaveBeenCalledWith('EXTENDED_INEP');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    const onClose = vi.fn();

    render(
      <TimeAccommodationModal
        isOpen={true}
        currentMode="STANDARD"
        onSelectMode={vi.fn()}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
