import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OptionSelector, type OptionItem } from './OptionSelector';

describe('OptionSelector Component', () => {
  const sampleOptions: readonly OptionItem[] = [
    { letter: 'A', text: '$10\\text{ m/s}$' },
    { letter: 'B', text: '$20\\text{ m/s}$' },
    { letter: 'C', text: '$30\\text{ m/s}$' },
    { letter: 'D', text: '$40\\text{ m/s}$' },
    { letter: 'E', text: '$50\\text{ m/s}$' },
  ];

  it('should render all options in a radiogroup with accessible attributes', () => {
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption="B"
        onSelectOption={vi.fn()}
      />
    );

    const radiogroup = screen.getByRole('radiogroup', { name: 'Alternativas da questão' });
    expect(radiogroup).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);

    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
  });

  it('should trigger onSelectOption when clicking an option', () => {
    const handleSelect = vi.fn();
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption={null}
        onSelectOption={handleSelect}
      />
    );

    const optionC = screen.getAllByRole('radio')[2];
    expect(optionC).toBeDefined();
    fireEvent.click(optionC!);

    expect(handleSelect).toHaveBeenCalledWith('C');
  });

  it('should not trigger onSelectOption when disabled', () => {
    const handleSelect = vi.fn();
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption="A"
        onSelectOption={handleSelect}
        disabled={true}
      />
    );

    const optionD = screen.getAllByRole('radio')[3];
    expect(optionD).toBeDefined();
    fireEvent.click(optionD!);

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('should select option via keyboard hotkeys (A-E and 1-5)', () => {
    const handleSelect = vi.fn();
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption={null}
        onSelectOption={handleSelect}
      />
    );

    // Press 'D'
    fireEvent.keyDown(window, { key: 'd' });
    expect(handleSelect).toHaveBeenCalledWith('D');

    // Press '2' (corresponds to B)
    fireEvent.keyDown(window, { key: '2' });
    expect(handleSelect).toHaveBeenCalledWith('B');
  });

  it('should display correctness indicators when submitted in review mode', () => {
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption="C"
        correctOption="B"
        isSubmitted={true}
        onSelectOption={vi.fn()}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(5);
    // Option B is correct
    expect(radios[1]?.className).toContain('border-emerald-500');
    // Option C was selected but is wrong
    expect(radios[2]?.className).toContain('border-rose-500');
  });
});
